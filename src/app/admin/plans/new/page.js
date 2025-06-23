'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPlanPage() {
    const router = useRouter();
    const [plan, setPlan] = useState({
        name: '',
        description: '',
        price_monthly: '',
        visitor_limit: '',
        features: '', // Will be a comma-separated string
        is_popular: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPlan(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Convert the comma-separated features string into a JSON array
            const featuresArray = plan.features.split(',').map(f => f.trim()).filter(f => f);
            const submissionData = { ...plan, features: featuresArray };

            const res = await fetch('/api/admin/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || 'Failed to create plan.');
            }
            router.push('/admin/plans');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Subscription Plan</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900">Plan Name</label>
                    <input type="text" name="name" id="name" value={plan.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-900">Description</label>
                    <textarea name="description" id="description" rows="3" value={plan.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="price_monthly" className="block text-sm font-medium text-gray-900">Monthly Price (£)</label>
                        <input type="number" name="price_monthly" id="price_monthly" value={plan.price_monthly} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                    </div>
                    <div>
                        <label htmlFor="visitor_limit" className="block text-sm font-medium text-gray-900">Visitor Limit</label>
                        <input type="number" name="visitor_limit" id="visitor_limit" value={plan.visitor_limit} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                    </div>
                </div>
                <div>
                    <label htmlFor="features" className="block text-sm font-medium text-gray-900">Features</label>
                    <textarea name="features" id="features" rows="4" value={plan.features} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Enter features separated by commas"></textarea>
                </div>
                <div className="flex items-center">
                    <input id="is_popular" name="is_popular" type="checkbox" checked={plan.is_popular} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                    <label htmlFor="is_popular" className="ml-2 block text-sm text-gray-900">Mark as Most Popular</label>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex justify-end gap-x-4 pt-4">
                    <button type="button" onClick={() => router.push('/admin/plans')} className="text-sm font-semibold text-gray-900">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300">
                        {isSubmitting ? 'Creating Plan...' : 'Create Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
}
