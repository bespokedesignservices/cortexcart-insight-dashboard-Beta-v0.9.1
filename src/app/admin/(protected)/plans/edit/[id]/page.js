'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function PlanEditorPage() {
    const router = useRouter();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [plan, setPlan] = useState({
        name: '',
        description: '',
        price_monthly: '',
        stripe_price_id: '', // Stripe ID field
        visitor_limit: '',
        features: [],
        is_popular: false,
    });
    const [featureInput, setFeatureInput] = useState('');
    const [isLoading, setIsLoading] = useState(isEditing);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditing) {
            const fetchPlan = async () => {
                setIsLoading(true);
                try {
                    const res = await fetch(`/api/admin/plans/${id}`);
                    if (!res.ok) throw new Error('Failed to fetch plan data.');
                    const data = await res.json();
                    setPlan(data);
                } catch (err) {
                    setError(err.message instanceof Error ? err.message : 'An unknown error occurred.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPlan();
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPlan(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleAddFeature = () => {
        if (featureInput && !plan.features.includes(featureInput)) {
            setPlan(prev => ({ ...prev, features: [...prev.features, featureInput] }));
            setFeatureInput('');
        }
    };

    const handleRemoveFeature = (indexToRemove) => {
        setPlan(prev => ({
            ...prev,
            features: prev.features.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const apiUrl = isEditing ? `/api/admin/plans/${id}` : '/api/admin/plans';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(apiUrl, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(plan),
            });
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || `Failed to ${isEditing ? 'update' : 'create'} plan.`);
            }
            router.push('/admin/plans');
        } catch (err) {
            setError(err.message instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <p>Loading plan editor...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{isEditing ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900">Plan Name</label>
                    <input type="text" name="name" id="name" value={plan.name || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-900">Description</label>
                    <textarea name="description" id="description" rows="3" value={plan.description || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="price_monthly" className="block text-sm font-medium text-gray-900">Monthly Price (£)</label>
                        <input type="number" step="0.01" name="price_monthly" id="price_monthly" value={plan.price_monthly || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                    </div>
                    <div>
                        <label htmlFor="stripe_price_id" className="block text-sm font-medium text-gray-900">Stripe Price ID</label>
                        <input type="text" name="stripe_price_id" id="stripe_price_id" value={plan.stripe_price_id || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g., price_1P..." />
                    </div>
                </div>
                <div>
                    <label htmlFor="visitor_limit" className="block text-sm font-medium text-gray-900">Visitor Limit</label>
                    <input type="number" name="visitor_limit" id="visitor_limit" value={plan.visitor_limit || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-900">Features</label>
                    <div className="mt-1 space-y-2">
                        {plan.features?.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <p className="flex-grow p-2 bg-gray-100 rounded-md text-sm">{feature}</p>
                                <button type="button" onClick={() => handleRemoveFeature(index)} className="p-1 text-red-500 hover:text-red-700">
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="Add a new feature" className="block w-full rounded-md border-gray-300 shadow-sm" />
                            <button type="button" onClick={handleAddFeature} className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500">Add</button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center">
                    <input id="is_popular" name="is_popular" type="checkbox" checked={plan.is_popular} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                    <label htmlFor="is_popular" className="ml-2 block text-sm text-gray-900">Mark as Most Popular</label>
                </div>

                {error && <p className="text-sm text-red-600 text-center py-2">{error}</p>}

                <div className="flex justify-end gap-x-4 pt-4 border-t">
                    <button type="button" onClick={() => router.push('/admin/plans')} className="text-sm font-semibold text-gray-900">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300">
                        {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Plan')}
                    </button>
                </div>
            </form>
        </div>
    );
}
