'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Import all components
import Layout from '@/app/components/Layout'; 
import StatCard from '@/app/components/StatCard';
import ChartContainer from '@/app/components/ChartContainer';
import SalesBarChart from '@/app/components/SalesBarChart';
import RecentEventsTable from '@/app/components/RecentEventsTable';
import DateFilter from '@/app/components/DataFilter';
import TopPagesList from '@/app/components/TopPagesList';
import TopReferrersList from '@/app/components/TopReferrersList';
import DeviceChart from '@/app/components/DeviceChart';
import LiveVisitorCount from '@/app/components/LiveVisitorCount';
import RealTimeClock from '@/app/components/RealTimeClock';
import SkeletonCard from '@/app/components/SkeletonCard';
import CountryViewsList from '@/app/components/CountryViewsList'; // <-- 1. Import the new component

const currencySymbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: '$', AUD: '$' };

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for all dashboard data
  const [stats, setStats] = useState(null);
  const [chartApiData, setChartApiData] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    return { startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] };
  });
  
  const [siteSettings, setSiteSettings] = useState({ currency: 'USD' });
  const siteId = session?.user?.email;

  useEffect(() => {
    if (status === 'loading' || !siteId) return;
    if (!session) { router.push('/'); return; }

    async function fetchData(startDate, endDate) {
      setIsLoading(true);
      setError('');
      
      let statsUrl = `/api/stats?siteId=${siteId}`;
      let chartUrl = `/api/charts/sales-by-day?siteId=${siteId}`;
      let eventsUrl = `/api/events?siteId=${siteId}`;
      let topPagesUrl = `/api/stats/top-pages?siteId=${siteId}`;
      let topReferrersUrl = `/api/stats/top-referrers?siteId=${siteId}`;
      let locationsUrl = `/api/stats/locations?siteId=${siteId}`;
      let deviceTypesUrl = `/api/stats/device-types?siteId=${siteId}`;
      let settingsUrl = '/api/site-settings';

      if (startDate && endDate) {
          statsUrl += `&startDate=${startDate}&endDate=${endDate}`;
          chartUrl += `&startDate=${startDate}&endDate=${endDate}`;
          eventsUrl += `&startDate=${startDate}&endDate=${endDate}`;
          topPagesUrl += `&startDate=${startDate}&endDate=${endDate}`;
          topReferrersUrl += `&startDate=${startDate}&endDate=${endDate}`;
          locationsUrl += `&startDate=${startDate}&endDate=${endDate}`;
          deviceTypesUrl += `&startDate=${startDate}&endDate=${endDate}`;
      }

      try {
        const responses = await Promise.all([
          fetch(statsUrl), fetch(chartUrl), fetch(eventsUrl), fetch(topPagesUrl),
          fetch(topReferrersUrl), fetch(locationsUrl), fetch(settingsUrl), fetch(deviceTypesUrl)
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

      } catch (err) { 
        setError(err.message);
      } finally { 
        setIsLoading(false); 
      }
    }
    
    fetchData(dateRange.startDate, dateRange.endDate);
  }, [dateRange, siteId, session, status, router]);

  useEffect(() => {
    if (status === 'loading' || !siteId) return;
    if (!session) { return; }
    const interval = setInterval(() => {
      fetch(`/api/stats/live-visitors?siteId=${siteId}`)
        .then(res => res.json())
        .then(data => setLiveVisitors(data.liveVisitors))
        .catch(console.error);
    }, 10000); 
    return () => clearInterval(interval);
  }, [siteId, session, status]);
  
  const handleDateFilterChange = (startDate, endDate) => { setDateRange({ startDate, endDate }); };

  if (status === 'loading' || (isLoading && !stats)) {
    return (
        <Layout>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <div className="h-9 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-96 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="mt-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartContainer title="Visitors by Country"><SkeletonCard /></ChartContainer>
              <ChartContainer title="Recent Events"><SkeletonCard /></ChartContainer>
            </div>
          </div>
        </Layout>
      );
  }
  
  if (error) {
    return <Layout><p className="p-6 text-red-600">Error: {error}</p></Layout>;
  }

  const currencySymbol = siteSettings?.currency ? (currencySymbols[siteSettings.currency] || '$') : '$';
  const formattedRevenue = `${currencySymbol}${stats?.totalRevenue ? parseFloat(stats.totalRevenue).toFixed(2) : '0.00'}`;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <LiveVisitorCount count={liveVisitors} />
        </div>
        <div className="flex items-center gap-4">
            <RealTimeClock />
            <DateFilter onFilterChange={handleDateFilterChange} />
        </div>
      </div>
      
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Revenue" value={formattedRevenue} icon="💰" />
          <StatCard title="Total Sales" value={stats?.sales || 0} icon="🛒" />
          <StatCard title="Page Views" value={stats?.pageviews || 0} icon="👁️" />
        </div>
        
        <div className="mt-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="Visitors by Country">
                   <div className="h-full w-full"> 
                       <CountryViewsList locationData={locationData} />
                   </div>
                </ChartContainer>
                <ChartContainer title="Recent Events">
                    <RecentEventsTable events={recentEvents} />
                </ChartContainer>
            </div>
            
            <ChartContainer title="Sales by Day">
                <SalesBarChart apiData={chartApiData} currencySymbol={currencySymbol} />
            </ChartContainer>

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
        </div>
      </div>
    </Layout>
  );
}
