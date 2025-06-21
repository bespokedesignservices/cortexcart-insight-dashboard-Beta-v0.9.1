import { ChartBarIcon, UsersIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

// A reusable component for displaying key stats
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

export default function AdminDashboardPage() {
    // In the future, you would fetch these stats from your database.
    const stats = {
        totalUsers: '1,234',
        activeUsers: '890',
        blogPosts: '56',
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Users" value={stats.totalUsers} icon={UsersIcon} />
                <StatCard title="Monthly Active Users" value={stats.activeUsers} icon={ChartBarIcon} />
                <StatCard title="Published Blog Posts" value={stats.blogPosts} icon={DocumentTextIcon} />
            </div>

            {/* Placeholder for future charts or activity logs */}
            <div className="mt-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <p className="text-gray-600">User sign-ups, subscription changes, and other important system events will be displayed here.</p>
                </div>
            </div>
        </div>
    );
}
