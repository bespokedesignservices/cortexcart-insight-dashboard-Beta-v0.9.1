'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/app/components/Layout';
import Placeholder from '@/app/components/Placeholder';
import { ShareIcon } from '@heroicons/react/24/outline';


export default function SocialPage() {
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
                <h2 className="text-3xl font-bold">Social Media Manager</h2>
            </div>
            <div className="flex items-center justify-center h-96 rounded-lg border-2 border-dashed border-gray-300">
               <Placeholder 
                    title="Social Media Tools"
                    description="Design posts, generate copy with AI, and track your social analytics all in one place."
                    icon={ShareIcon}
               />
            </div>
        </Layout>
    );
}
