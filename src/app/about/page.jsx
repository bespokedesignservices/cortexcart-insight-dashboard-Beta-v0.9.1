'use client';

import Layout from '@/app/components/Layout';
import Placeholder from '@/app/components/Placeholder';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function AboutPage() {
    return (
        <Layout>
            <div className="text-center py-16">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">About CortexCart</h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">Our mission is to empower e-commerce businesses with actionable insights.</p>
            </div>
            <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed border-gray-300">
               <Placeholder 
                    title="About Us Page"
                    description="More details about our company and vision will be here soon."
                    icon={InformationCircleIcon}
               />
            </div>
        </Layout>
    );
}
