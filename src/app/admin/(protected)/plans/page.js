'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const PricingCard = ({ plan }) => (
    <div className={`border rounded-lg p-8 flex flex-col ${plan.is_popular ? 'border-blue-600 border-2 relative' : 'border-gray-200'}`}>
         {plan.is_popular && <span className="absolute top-0 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full self-center">Most Popular</span>}
        <h3 className="text-2xl font-bold text-center">{plan.name}</h3>
        <p className="mt-2 text-gray-600 text-center h-10">{plan.description}</p>
        <div className="mt-6 text-center text-gray-900">
            <span className="text-4xl font-extrabold">£{plan.price_monthly}</span>
            <span className="text-base font-medium text-gray-500">/ month</span>
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">Up to {plan.visitor_limit.toLocaleString()} visitors</p>
        <ul className="mt-6 space-y-4 text-gray-600 flex-grow">
            {plan.features.map(feature => (
                <li key={feature} className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <div className="mt-8">
             <Link href={`/admin/plans/edit/${plan.id}`}>
                <div className="w-full text-center px-6 py-3 font-semibold rounded-lg transition-colors bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer">
                    Edit Plan
                </div>
             </Link>
        </div>
    </div>
);


export default function SubscriptionPlansPage() {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

     useEffect(() => {
        async function fetchPlans() {
            setIsLoading(true);
            try {
                const res = await fetch('/api/admin/plans');
                if (!res.ok) throw new Error('Failed to fetch subscription plans.');
                let data = await res.json();
                
                data = data.map(plan => ({
                    ...plan,
                    features: typeof plan.features === 'string' ? JSON.parse(plan.features) : [],
                }));

                setPlans(data);
            } catch (err) {
                if (err instanceof Error) setError(err.message);
                else setError('An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        }
        fetchPlans();
    }, []);

    return (
        <div>
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
                    <p className="mt-1 text-sm text-gray-600">Manage pricing, features, and availability for user subscription plans.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Link href="/admin/plans/new">
                        <div className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                            Create New Plan
                        </div>
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <p>Loading plans...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {plans.map(plan => (
                        <PricingCard key={plan.id} plan={plan} />
                    ))}
                </div>
            )}
        </div>
    );
}
