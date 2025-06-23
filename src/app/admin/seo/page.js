'use client';

import { } from '@heroicons/react/24/outline';

export default function SeoDashboardPage() {
    
    // In the future, we will fetch data here.
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">SEO Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Placeholder Cards */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="font-semibold text-gray-800">Top Performing Pages</h2>
                    <p className="text-sm text-gray-500 mt-2">A list of your most viewed blog posts will appear here.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="font-semibold text-gray-800">Keyword Rankings</h2>
                    <p className="text-sm text-gray-500 mt-2">A tool to track your search engine ranking for specific keywords will be available here.</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="font-semibold text-gray-800">On-Page SEO Audit</h2>
                    <p className="text-sm text-gray-500 mt-2">An AI-powered tool to audit the SEO of specific pages will be available here.</p>
                </div>
            </div>
        </div>
    );
}
