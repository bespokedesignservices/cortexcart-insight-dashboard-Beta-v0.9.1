'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// A reusable component for each editable text field
const EditableField = ({ fieldKey, label, value, onSave, type = 'text' }) => {
    const [currentValue, setCurrentValue] = useState(value);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(fieldKey, currentValue);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000); // Hide checkmark after 2s
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const InputComponent = type === 'textarea' ? 'textarea' : 'input';

    return (
        <div>
            <label htmlFor={fieldKey} className="block text-sm font-medium leading-6 text-gray-900">{label}</label>
            <div className="mt-2 flex rounded-md shadow-sm">
                <div className="relative flex flex-grow items-stretch focus-within:z-10">
                    <InputComponent
                        type={type}
                        name={fieldKey}
                        id={fieldKey}
                        rows={type === 'textarea' ? 4 : undefined}
                        className="block w-full rounded-none rounded-l-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        value={currentValue || ''}
                        onChange={(e) => setCurrentValue(e.target.value)}
                    />
                </div>
                <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSave}
                    className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300"
                >
                    {isSaving ? 'Saving...' : (saved ? <CheckCircleIcon className="h-5 w-5"/> : 'Save')}
                </button>
            </div>
        </div>
    );
};

export default function CmsManagementPage() {
    const [content, setContent] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchContent() {
            setIsLoading(true);
            try {
                const res = await fetch('/api/admin/cms');
                if (!res.ok) throw new Error('Failed to fetch CMS content.');
                const data = await res.json();
                setContent(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchContent();
    }, []);

    const handleSaveField = async (key, value) => {
        const res = await fetch('/api/admin/cms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value }),
        });
        if (!res.ok) {
            const result = await res.json();
            throw new Error(result.message || 'Failed to update content');
        }
    };
    
    if (isLoading) return <p>Loading content editor...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Homepage Content Management</h1>
            <p className="text-sm text-gray-600 mb-8">Edit the content for your public-facing homepage.</p>

            <div className="space-y-8 max-w-4xl">
                {/* Hero Section */}
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Hero Section</h2>
                    <div className="space-y-4">
                        <EditableField fieldKey="hero_title" label="Main Title" value={content.hero_title} onSave={handleSaveField} />
                        <EditableField fieldKey="hero_subtitle" label="Subtitle" value={content.hero_subtitle} onSave={handleSaveField} type="textarea" />
                    </div>
                </div>

                 {/* Features Section */}
                 <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Features Section</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-medium text-center">Feature 1</h3>
                             <EditableField fieldKey="feature_1_title" label="Title" value={content.feature_1_title} onSave={handleSaveField} />
                             <EditableField fieldKey="feature_1_description" label="Description" value={content.feature_1_description} onSave={handleSaveField} type="textarea" />
                        </div>
                         <div className="space-y-4">
                            <h3 className="font-medium text-center">Feature 2</h3>
                             <EditableField fieldKey="feature_2_title" label="Title" value={content.feature_2_title} onSave={handleSaveField} />
                             <EditableField fieldKey="feature_2_description" label="Description" value={content.feature_2_description} onSave={handleSaveField} type="textarea" />
                        </div>
                         <div className="space-y-4">
                            <h3 className="font-medium text-center">Feature 3</h3>
                             <EditableField fieldKey="feature_3_title" label="Title" value={content.feature_3_title} onSave={handleSaveField} />
                             <EditableField fieldKey="feature_3_description" label="Description" value={content.feature_3_description} onSave={handleSaveField} type="textarea" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
