'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/app/components/Layout';
import { CheckCircleIcon, ClockIcon, SparklesIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

// --- Roadmap Data ---
const completedFeatures = [
    { name: 'Core Analytics Dashboard', description: 'View key metrics like revenue, sales, and page views.' },
    { name: 'User Authentication', description: 'Secure sign-up and login with Google.' },
    { name: 'Date Range Filtering', description: 'Filter all dashboard data by specific time periods.' },
    { name: 'Top Pages & Referrers', description: 'Identify your most popular content and traffic sources.' },
    { name: 'Device Chart', description: 'Visualize what devices they use.' },
    { name: 'AI Homepage Analysis', description: 'Get AI-powered recommendations on your homepage\'s layout, copy, and performance, with a full history.' },
    { name: 'Platform Installation Guides', description: 'Interactive, platform-specific instructions for installing the tracker on Shopify, WooCommerce, etc.'},
    { name: 'Notifications', description: 'Add a user notifications area and top navigation dropdown to show important updates and tasks to be completed'},
    { name: 'FAQ Section', description: 'Add a full FAQ section to provide help to understand how software works and to provide tips'},
    { name: 'AI Product Analysis', description: 'Receive suggestions for improving underperforming product titles and descriptions.'},
];

const inProgressFeatures = [
       { name: 'Social Media Post Designer', description: 'Design social media posts with an intuitive editor. Use AI to generate post copy and images based on your product details.'},
       { name: 'Social Media Analytics', description: 'Connect your social accounts to track post views, interactions, mentions, and shares directly within the dashboard.'},
];

const futureFeatures = [
    { 
        name: 'A/B Testing Framework', 
        description: 'Test different versions of your product titles, prices, or descriptions to see what converts best.',
        icon: null
    },
    { 
        name: 'Real-time Heatmaps', 
        description: 'Visualize where users are clicking and scrolling on your most important pages.',
        icon: null
    },
	{
	name: 'Support Ticket System',
	description: 'Add a user support ticket system, allow users to submit tickets and get help and support with features',
	icon: QuestionMarkCircleIcon
	},
];


export default function RoadmapPage() {
    const { status } = useSession();
    const router = useRouter();

    // Protect the route
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    if (status === 'loading') {
        return <Layout><p className="p-6">Loading Roadmap...</p></Layout>;
    }

    return (
        <Layout>
            <div className="mb-8">
                <h2 className="text-3xl font-bold">Product Roadmap</h2>
                <p className="mt-1 text-sm text-gray-500">Follow our progress as we build new features and improve the app.</p>
            </div>

            <div className="space-y-12">
                {/* --- Completed Features --- */}
                <section>
                    <div className="flex items-center gap-3">
                        <CheckCircleIcon className="h-8 w-8 text-green-500" />
                        <h3 className="text-2xl font-semibold text-gray-900">Completed</h3>
                    </div>
                    <ul className="mt-4 space-y-4">
                        {completedFeatures.map(feature => (
                            <li key={feature.name} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p className="font-semibold text-gray-800">{feature.name}</p>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                            </li>
                        ))}
                    </ul>
                </section>
                
                {/* --- In Progress Features --- */}
                <section>
                    <div className="flex items-center gap-3">
                        <ClockIcon className="h-8 w-8 text-blue-500" />
                        <h3 className="text-2xl font-semibold text-gray-900">In Progress</h3>
                    </div>
                    <ul className="mt-4 space-y-4">
                        {inProgressFeatures.map(feature => (
                            <li key={feature.name} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p className="font-semibold text-gray-800">{feature.name}</p>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* --- Future Features --- */}
                <section>
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="h-8 w-8 text-purple-500" />
                        <h3 className="text-2xl font-semibold text-gray-900">Future Plans</h3>
                    </div>
                    <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {futureFeatures.map(feature => (
                            <li key={feature.name} className="p-4 bg-white border border-dashed border-gray-300 rounded-lg">
                                <div className="flex items-start gap-3">
                                    {feature.icon && <feature.icon className="h-6 w-6 text-gray-400 mt-1" />}
                                    <div>
                                        <p className="font-semibold text-gray-800">{feature.name}</p>
                                        <p className="text-sm text-gray-600">{feature.description}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </Layout>
    );
}
