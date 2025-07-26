'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Import all components
import Layout from '@/app/components/Layout';
import AlertBanner from '@/app/components/AlertBanner';
import StatCard from '@/app/components/StatCard';
import ChartContainer from '@/app/components/ChartContainer';
import SalesBarChart from '@/app/components/SalesBarChart';
import RecentEventsTable from '@/app/components/RecentEventsTable';
import DateFilter from '@/app/components/DataFilter';
import TopPagesList from '@/app/components/TopPagesList';
import TopReferrersList from '@/app/components/TopReferrersList';
import DeviceChart from '@/app/components/DeviceChart';
import LiveVisitorCount from '@/app/components/LiveVisitorCount';
import SkeletonCard from '@/app/components/SkeletonCard';
import CountryViewsList from '@/app/components/CountryViewsList';
import Ga4LineChart from '@/app/components/Ga4LineChart';
import PerformanceScore from '@/app/components/PerformanceScore';


const currencySymbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: '$', AUD: '$' };

const DataSourceToggle = ({ dataSource, setDataSource }) => (
  <div className="flex items-center p-1 bg-gray-200 rounded-lg">
    <button onClick={() => setDataSource('cortexcart')} className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${dataSource === 'cortexcart' ? 'bg-white shadow' : 'text-gray-600'}`}>CortexCart</button>
    <button onClick={() => setDataSource('ga4')} className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${dataSource === 'ga4' ? 'bg-white shadow' : 'text-gray-600'}`}>Google Analytics</button>
  </div>
);

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for CortexCart data
  const [stats, setStats] = useState(null);
  const [chartApiData, setChartApiData] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [performanceError, setPerformanceError] = useState('');
  const [alerts, setAlerts] = useState([]);
  
  // State for GA4 data
  const [ga4Stats, setGa4Stats] = useState(null);
  const [ga4ChartData, setGa4ChartData] = useState([]);

  // General state
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState('cortexcart');
  const [siteSettings, setSiteSettings] = useState({ currency: 'USD' });
  
  const [dateRange, setDateRange] = useState(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    return { startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] };
  });

  const siteId = session?.user?.email;

  useEffect(() => {
    if (status === 'loading' || !siteId) return;
    if (!session) { router.push('/'); return; }

    async function fetchData() {
      setIsLoading(true);
      setError('');
      
      const sd = dateRange.startDate ? `&startDate=${dateRange.startDate}` : '';
      const ed = dateRange.endDate ? `&endDate=${dateRange.endDate}` : '';
      const dateParams = `${sd}${ed}`;
      
      try {
        const alertsRes = await fetch('/api/alerts/active');
        if (alertsRes.ok) setAlerts(await alertsRes.json());
      } catch (e) { console.error("Could not fetch alerts", e); }

      if (dataSource === 'cortexcart') {
        try {
          const responses = await Promise.all([
            fetch(`/api/stats?siteId=${siteId}${dateParams}`),
            fetch(`/api/charts/sales-by-day?siteId=${siteId}${dateParams}`),
            fetch(`/api/events?siteId=${siteId}${dateParams}`),
            fetch(`/api/stats/top-pages?siteId=${siteId}${dateParams}`),
            fetch(`/api/stats/top-referrers?siteId=${siteId}${dateParams}`),
            fetch(`/api/stats/locations?siteId=${siteId}${dateParams}`),
            fetch(`/api/site-settings?siteId=${siteId}`),
            fetch(`/api/stats/device-types?siteId=${siteId}${dateParams}`),
          ]);

          for (const res of responses) {
            if (!res.ok) throw new Error(`A data fetch failed: ${res.statusText}`);
          }
          
          const [statsData, chartData, eventsData, topPagesData, topReferrersData, locationsData, settingsData, deviceTypesData] = await Promise.all(responses.map(res => res.json()));
          
          setStats(statsData);
          setChartApiData(chartData);
          setRecentEvents(eventsData);
          setTopPages(topPagesData);
          setTopReferrers(topReferrersData);
          setLocationData(locationsData);
          setSiteSettings(settingsData);
          setDeviceData(deviceTypesData);

        } catch (err) { setError(err.message); }
      } else { // Fetch from GA4
        try {
          const [statsRes, chartRes] = await Promise.all([
              fetch(`/api/ga4-stats?siteId=${siteId}${dateParams}`),
              fetch(`/api/ga4-charts?siteId=${siteId}${dateParams}`)
          ]);
          if (!statsRes.ok || !chartRes.ok) throw new Error('Failed to fetch GA4 data.');
          const statsData = await statsRes.json();
          const chartData = await chartRes.json();
          setGa4Stats(statsData);
          setGa4ChartData(chartData);
        } catch (err) { setError(err.message); }
      }
      setIsLoading(false);
    }
    
    fetchData();
  }, [dateRange.startDate, dateRange.endDate, siteId, session, status, router, dataSource]);
  
  useEffect(() => {
    if (status === 'loading' || !siteId) return;
    if (!session) { return; }

    async function fetchPerformanceData() {
        setPerformanceError('');
        try {
            const res = await fetch('/api/performance/get-speed');
            const data = await res.json();
            
            if (!res.ok) {
                if (res.status === 429) {
                    setPerformanceError(data.message || "You've reached the daily limit. Showing last available score.");
                    if (data.score) {
                      setPerformanceData(data);
                    }
                } else {
                    throw new Error(data.message || `Failed to fetch score: ${res.statusText}`);
                }
            } else {
                setPerformanceData(data);
            }
        } catch (err) {
            setPerformanceError(err.message);
        }
    }
    
    fetchPerformanceData();

    const interval = setInterval(() => {
      fetch(`/api/stats/live-visitors?siteId=${siteId}`)
        .then(res => res.json())
        .then(data => setLiveVisitors(data.liveVisitors))
        .catch(console.error);
    }, 10000); 
    return () => clearInterval(interval);
  }, [siteId, session, status]);
  
  const handleDateFilterChange = (startDate, endDate) => { setDateRange({ startDate, endDate }); };

  if (status === 'loading') return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p className="p-6 text-red-600">Error: {error}</p></Layout>;
  
  const currencySymbol = siteSettings?.currency ? (currencySymbols[siteSettings.currency] || '$') : '$';
  const formattedRevenue = `${currencySymbol}${stats?.totalRevenue ? parseFloat(stats.totalRevenue).toFixed(2) : '0.00'}`;

  return (
    <Layout>
      <div className="space-y-4 mb-6">
        {alerts.map((alert) => (
            <AlertBanner key={alert.id} title={alert.title} message={alert.message} type={alert.type} />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <LiveVisitorCount count={liveVisitors} />
        </div>
        <div className="flex items-center gap-4">
            <DataSourceToggle dataSource={dataSource} setDataSource={setDataSource} />
            <DateFilter onFilterChange={handleDateFilterChange} />

        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
      ) : (
        <div className={`transition-opacity duration-300`}>
          {dataSource === 'cortexcart' ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Revenue" value={formattedRevenue} icon="💰" />
                <StatCard title="Total Sales" value={stats?.sales?.toLocaleString() || 0} icon="🛒" />
                <StatCard title="Page Views" value={stats?.pageviews?.toLocaleString() || 0} icon="👁️" />
              </div>
              <ChartContainer title="Sales by Day">
                <SalesBarChart apiData={chartApiData} currencySymbol={currencySymbol} />
              </ChartContainer>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="Visitors by Country">
                  <CountryViewsList locationData={locationData} />
                </ChartContainer>
                <ChartContainer title="Recent Events">
                  <RecentEventsTable events={recentEvents} />
                </ChartContainer>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <ChartContainer title="Top Pages">
                    <TopPagesList pages={topPages} />
                </ChartContainer>
                <ChartContainer title="Device Breakdown">
                  <div className="h-64 flex items-center justify-center">
                    <DeviceChart deviceData={deviceData} />
                  </div>
                </ChartContainer>
                <ChartContainer title="Top Referrers">
                  <TopReferrersList referrers={topReferrers} />
                </ChartContainer>
              </div>
              <ChartContainer title="Page Speed Score (Mobile)">
                {performanceError && <p className="text-center text-sm text-yellow-600 mb-2">{performanceError}</p>}
                
                {performanceData ? (
                    <div className="h-64 flex items-center justify-center">
                        <PerformanceScore {...performanceData} />
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center">
                        <p className="text-center text-gray-500">
                          {performanceError ? 'No cached score available.' : 'Loading score...'}
                        </p>
                    </div>
                )}
              </ChartContainer>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={ga4Stats?.users?.toLocaleString() || 0} icon="👥" />
                <StatCard title="Sessions" value={ga4Stats?.sessions?.toLocaleString() || 0} icon="💻" />
                <StatCard title="Page Views" value={ga4Stats?.pageviews?.toLocaleString() || 0} icon="👁️" />
                <StatCard title="Conversions" value={ga4Stats?.conversions?.toLocaleString() || 0} icon="🎯" />
              </div>
              <ChartContainer title="Page Views & Conversions Over Time">
                <Ga4LineChart data={ga4ChartData} />
              </ChartContainer>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Avg. Engagement Time" value={ga4Stats?.averageEngagementDuration ? `${(ga4Stats.averageEngagementDuration / 60).toFixed(2)} min` : '0 min'} icon="⏱️" />
                {/* Placeholder for a potential line chart for engagement time if GA4 API supports historical engagement data */}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
