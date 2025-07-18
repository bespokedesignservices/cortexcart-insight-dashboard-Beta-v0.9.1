'use client';

import { useState, useEffect } from 'react';
import { UsersIcon, UserPlusIcon, BoltIcon } from '@heroicons/react/24/outline';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
        <Icon className="h-8 w-8" />
      </div>
    </div>
);

export default function UserStatsPage() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchStats() {
            setIsLoading(true);
            try {
                const res = await fetch('/api/admin/stats');
                if (!res.ok) throw new Error('Failed to fetch user statistics.');
                const data = await res.json();
                setStats(data);
            } catch (err) {
                if (err instanceof Error) setError(err.message);
                else setError('An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);
    
    const chartData = {
        labels: stats?.signupsByDay.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
        datasets: [{
            label: 'New Users per Day',
            data: stats?.signupsByDay.map(d => d.count) || [],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
    };
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    };

    if (isLoading) return <p>Loading user stats...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">User & Platform Stats</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Registered Users" value={stats?.totalUsers.toLocaleString() || '0'} icon={UsersIcon} />
                <StatCard title="New Users (Last 30 Days)" value={stats?.newUsersLast30Days.toLocaleString() || '0'} icon={UserPlusIcon} />
                <StatCard title="Total Events Tracked" value={stats?.totalEventsTracked.toLocaleString() || '0'} icon={BoltIcon} />
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">New User Sign-ups (Last 30 Days)</h2>
                <div className="h-96">
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
}
