'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import Layout from '@/app/components/Layout';
import SettingsTabs from '@/app/components/SettingsTabs';
import ChartContainer from '@/app/components/ChartContainer';
import Placeholder from '@/app/components/Placeholder';
import { ShareIcon } from '@heroicons/react/24/outline';

const currencyOptions = [
    { code: 'USD', symbol: '$', name: 'United States Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound Sterling' },
];

const tabs = [
    { name: 'General', href: '#' },
    { name: 'Widget Settings', href: '#' },
    { name: 'Social Connections', href: '#' },
    { name: 'Recommendations', href: '#' },
    { name: 'Billing', href: '#' },
    { name: 'Danger Zone', href: '#' },
];

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState(tabs[0].name);
    const [siteName, setSiteName] = useState('');
    const [siteUrl, setSiteUrl] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [formMessage, setFormMessage] = useState({ text: '', isError: false });
    const [isSaving, setIsSaving] = useState(false);
    const [snippet, setSnippet] = useState('');
    const [copied, setCopied] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [analysisError, setAnalysisError] = useState('');
    
    const siteId = session?.user?.email;

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }
        if (siteId) {
            const trackerSnippet = `
<!-- CortexCart Analytics Tracker -->
<!-- Paste this code just before the closing </head> tag on every page of your site. -->
<script async defer>
  (function() {
    const SITE_ID = '${siteId}'; 
    const API_ENDPOINT = 'https://tracker.cortexcart.com/api/track';

    function sendEvent(eventName, data = {}) {
      const eventData = { siteId: SITE_ID, eventName: eventName, data: { ...data, path: window.location.pathname, referrer: document.referrer } };
      navigator.sendBeacon(API_ENDPOINT, JSON.stringify(eventData));
    }
    sendEvent('pageview');
    window.cortexcart = {
      track: function(eventName, data) {
        if (!eventName) { console.error('CortexCart Tracker: Event name is required.'); return; }
        sendEvent(eventName, data);
      }
    };
  })();
<\/script>
      `.trim();
            setSnippet(trackerSnippet);
            
            async function fetchSettings() {
                try {
                    const res = await fetch('/api/site-settings');
                    if (res.ok) {
                        const data = await res.json();
                        setSiteName(data.site_name || '');
                        setSiteUrl(data.site_url || '');
                        setCurrency(data.currency || 'USD');
                    }
                } catch (error) {
                    console.error("Failed to fetch settings", error);
                    setFormMessage({ text: 'Failed to load your settings.', isError: true });
                }
            }
            fetchSettings();
        }
    }, [status, router, siteId]);

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setFormMessage({ text: '', isError: false });
        try {
            const res = await fetch('/api/site-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ siteName, siteUrl, currency })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Failed to save settings');
            setFormMessage({ text: 'Settings saved successfully!', isError: false });
        } catch (error) {
            setFormMessage({ text: error.message, isError: true });
        } finally {
            setIsSaving(false);
            setTimeout(() => setFormMessage({ text: '', isError: false }), 3000);
        }
    };

    const handleAccountDelete = async () => {
        setIsDeleting(true);
        setFormMessage({ text: '', isError: false });
        try {
            const res = await fetch('/api/account/delete', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to delete account.');
            await signOut({ callbackUrl: '/' });
        } catch (error) {
            setFormMessage({ text: error.message, isError: true });
            setIsDeleting(false);
        }
    };

    const copyToClipboard = () => {
        const textarea = document.createElement('textarea');
        textarea.value = snippet;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAnalyzeHomepage = async () => {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        setAnalysisError('');
        try {
            const res = await fetch('/api/ai/analyze-homepage', { method: 'POST' });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Failed to analyze homepage.');
            setAnalysisResult(result);
        } catch (error) {
            setAnalysisError(error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    if (status === 'loading') { return <Layout><p>Loading...</p></Layout>; }

    return (
        <>
            <Layout>
                <div className="mb-8">
                    <h2 className="text-3xl font-bold">Settings</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage your site settings and social connections.</p>
                </div>

                <SettingsTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                
                <div className="py-8">
                    {activeTab === 'General' && (
                        <div className="max-w-3xl">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">General Information</h3>
                            <p className="mt-1 text-sm text-gray-600">Update your site&apos;s publicly displayed information.</p>
                            <form onSubmit={handleSaveSettings} className="mt-6 space-y-6">
                                <div>
                                    <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">Site Name</label>
                                    <input type="text" id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="My Awesome Shop" />
                                </div>
                                <div>
                                    <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700">Site URL</label>
                                    <input type="url" id="siteUrl" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="https://www.example.com" />
                                </div>
                                <div>
                                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
                                    <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                        {currencyOptions.map(opt => (
                                            <option key={opt.code} value={opt.code}>{opt.name} ({opt.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <button type="submit" disabled={isSaving} className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                                        {isSaving ? 'Saving...' : 'Save Settings'}
                                    </button>
                                    {formMessage.text && <p className={`text-sm ${formMessage.isError ? 'text-red-600' : 'text-green-600'}`}>{formMessage.text}</p>}
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'Widget Settings' && (
                       <div className="max-w-3xl">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Tracker Installation</h3>
                            <p className="mt-1 text-sm text-gray-600">Place this snippet on every page of your site, just before the closing `&lt;/head&gt;` tag.</p>
                            <div className="mt-6">
                                <ChartContainer title="Your Tracker Snippet">
                                    <div className="p-4 bg-gray-900 rounded-md text-white font-mono text-sm overflow-x-auto relative h-full flex flex-col justify-between">
                                        <div>
                                            <pre><code>{snippet}</code></pre>
                                        </div>
                                        <button
                                            onClick={copyToClipboard}
                                            className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 text-xs rounded-md transition-colors"
                                        >
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                </ChartContainer>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Social Connections' && (
                        <div className="max-w-3xl">
                           <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed border-gray-300">
                               <Placeholder 
                                    title="Connect Social Accounts"
                                    description="This feature is coming soon. You'll be able to connect your accounts and manage credentials here."
                                    icon={ShareIcon}
                               />
                            </div>
                        </div>
                    )}

                    {activeTab === 'Recommendations' && (
                         <div className="max-w-4xl">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">AI-Powered Analysis</h3>
                            <p className="mt-1 text-sm text-gray-600">Generate reports and recommendations to improve your site&apos;s performance.</p>
                            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Analyze Homepage</h4>
                                        <p className="mt-1 text-sm text-gray-600">Get AI recommendations on your homepage&apos;s layout, copy, and performance.</p>
                                    </div>
                                    <button
                                        onClick={handleAnalyzeHomepage}
                                        disabled={isAnalyzing}
                                        className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                                    >
                                        {isAnalyzing ? 'Analyzing...' : 'Generate Report'}
                                    </button>
                                </div>
                                <div className="mt-4">
                                    {analysisError && <p className="text-sm text-red-600">{analysisError}</p>}
                                    {analysisResult && (
                                        <div className="p-4 bg-gray-50 rounded-md border">
                                            <h5 className="font-semibold mb-4 text-gray-800">Analysis Complete:</h5>
                                            <div className="space-y-6">
                                                {Object.entries(analysisResult).map(([category, recommendations]) => (
                                                    <div key={category}>
                                                        <h6 className="font-semibold text-gray-700 capitalize">{category}</h6>
                                                        <ul className="mt-2 list-disc list-inside space-y-2 text-sm text-gray-600">
                                                            {Array.isArray(recommendations) && recommendations.map((rec, index) => (
                                                                <li key={index}>{rec.recommendation} <span className="text-gray-400">(Confidence: {Math.round(rec.confidence * 100)}%)</span></li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Billing' && (
                         <div>
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Billing & Invoices</h3>
                            <p className="mt-1 text-sm text-gray-600">Manage your subscription and view payment history. (Coming soon!)</p>
                        </div>
                    )}

                    {activeTab === 'Danger Zone' && (
                         <div className="max-w-3xl">
                            <h3 className="text-lg font-medium leading-6 text-red-700">Danger Zone</h3>
                            <div className="mt-4 p-4 border border-red-300 bg-red-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold text-red-800">Delete Your Account</h4>
                                        <p className="mt-1 text-sm text-red-700">Once you delete your account, all of your data will be permanently removed. This action cannot be undone.</p>
                                    </div>
                                    <button onClick={() => setIsDeleteModalOpen(true)} className="ml-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Layout>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Are you sure?</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                This will permanently delete your account and all of your tracked data. This action cannot be undone.
                            </p>
                        </div>
                        {formMessage.isError && <p className="mt-2 text-sm text-red-600">{formMessage.text}</p>}
                        <div className="mt-5 sm:mt-6 flex flex-row-reverse gap-3">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleAccountDelete}
                                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm disabled:bg-red-300"
                            >
                                {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
