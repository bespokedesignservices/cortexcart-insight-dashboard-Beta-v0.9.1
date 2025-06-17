'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/app/components/Layout';
import Placeholder from '@/app/components/Placeholder';
import { LifebuoyIcon } from '@heroicons/react/24/outline';


export default function SupportPage() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    if (status === 'loading') {
        return <Layout><p className="p-6">Loading...</p></Layout>;
    }

    return (
        <Layout>
            <div className="mb-8">
                <h2 className="text-3xl font-bold">Support Tickets</h2>
            </div>
            <div className="flex items-center justify-center h-96 rounded-lg border-2 border-dashed border-gray-300">
               <Placeholder 
                    title="Customer Support"
                    description="Create and manage your support tickets here to get help from our team."
                    icon={LifebuoyIcon}
               />
            </div>
        </Layout>
    );
}
