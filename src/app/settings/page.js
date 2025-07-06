'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/app/components/Layout';
import SettingsTabs from '@/app/components/SettingsTabs';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const tabs = [
    { name: 'General', href: '#' },
    { name: 'Integrations', href: '#' },
    { name: 'Social Connections', href: '#' },
    { name: 'Widget Settings', href: '#' },
    { name: 'Billing', href: '#' },
    { name: 'Danger Zone', href: '#' },
];

// --- General Settings Component ---
const GeneralTabContent = () => {
    // ... (This component remains unchanged)
    const [siteName, setSiteName] = useState('');
    const [siteUrl, setSiteUrl] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [formMessage, setFormMessage] = useState({ text: '', isError: false });
    const [isSaving, setIsSaving] = useState(false);
    const currencyOptions = [
        { code: 'USD', symbol: '$', name: 'United States Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound Sterling' },
    ];

    useEffect(() => {
        async function fetchSettings() {
            const res = await fetch('/api/site-settings');
            if (res.ok) {
                const data = await res.json();
                setSiteName(data.site_name || '');
                setSiteUrl(data.site_url || '');
                setCurrency(data.currency || 'USD');
            }
        }
        fetchSettings();
    }, []);

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
            if (!res.ok) throw new Error((await res.json()).message);
            setFormMessage({ text: 'Settings saved successfully!', isError: false });
        } catch (error) {
            setFormMessage({ text: error.message, isError: true });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <h3 className="text-lg font-medium leading-6 text-gray-900">General Information</h3>
            <form onSubmit={handleSaveSettings} className="mt-6 space-y-6">
                <div>
                    <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">Site Name</label>
                    <input type="text" id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700">Site URL</label>
                    <input type="url" id="siteUrl" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
                    <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        {currencyOptions.map(opt => <option key={opt.code} value={opt.code}>{opt.name} ({opt.code})</option>)}
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
    );
};

// --- Integrations Settings Component ---
const IntegrationsTabContent = () => {
    // ... (This component remains unchanged)
    const [ga4PropertyId, setGa4PropertyId] = useState('');
    const [formMessage, setFormMessage] = useState({ text: '', isError: false });
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        async function fetchGA4Settings() {
            const res = await fetch('/api/ga4-connections');
            if (res.ok) setGa4PropertyId((await res.json()).ga4_property_id || '');
        }
        fetchGA4Settings();
    }, []);

    const handleSaveGA4Settings = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setFormMessage({ text: '', isError: false });
        try {
            const res = await fetch('/api/ga4-connections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ga4PropertyId })
            });
            if (!res.ok) throw new Error((await res.json()).message);
            setFormMessage({ text: 'GA4 settings saved successfully!', isError: false });
        } catch (error) {
            setFormMessage({ text: error.message, isError: true });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Google Analytics Integration</h3>
                <form onSubmit={handleSaveGA4Settings} className="mt-6 space-y-6">
                    <div>
                        <label htmlFor="ga4PropertyId" className="block text-sm font-medium text-gray-700">GA4 Property ID</label>
                        <input type="text" id="ga4PropertyId" value={ga4PropertyId} onChange={(e) => setGa4PropertyId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., 123456789" />
                    </div>
                    <div className="flex items-center justify-between">
                        <button type="submit" disabled={isSaving} className="inline-flex justify-center py-2 px-4 border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">{isSaving ? 'Saving...' : 'Save GA4 Settings'}</button>
                        {formMessage.text && <p className={`text-sm ${formMessage.isError ? 'text-red-600' : 'text-green-600'}`}>{formMessage.text}</p>}
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- UPDATED Social Connections Component ---
const SocialConnectionsTabContent = () => {
    // --- THIS IS THE CHANGE ---
    // Set a flag to disable the feature. Change this to 'true' when ready to re-enable.
    const isSocialEnabled = false;

    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Social Connections</h3>
                <p className="mt-1 text-sm text-gray-500">Connect your social media accounts to enable posting and analytics.</p>
                
                {!isSocialEnabled && (
                    <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                        <p className="text-sm text-yellow-700">This feature is currently under development and is temporarily disabled. It will be available in a future update.</p>
                    </div>
                )}
                
                {/* X (Twitter) Connection */}
                <div className="mt-6 p-4 border rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-semibold">X (Twitter)</p>
                        <p className="text-sm text-gray-500">Connect your X account to allow posting and scheduling.</p>
                    </div>
                    <button 
                        onClick={() => signIn('twitter')} 
                        // --- THIS IS THE CHANGE ---
                        disabled={!isSocialEnabled}
                        className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Connect to X
                    </button>
                </div>

                {/* Facebook & Instagram Connection */}
                <div className="mt-4 p-4 border rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-semibold">Facebook & Instagram</p>
                        <p className="text-sm text-gray-500">Connect your accounts to allow posting and scheduling.</p>
                    </div>
                    <button 
                        onClick={() => signIn('facebook')} 
                        // --- THIS IS THE CHANGE ---
                        disabled={!isSocialEnabled}
                        className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Connect with Facebook
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Other components remain the same ---
const WidgetSettingsTabContent = ({ siteId }) => {
    // ... (This component remains unchanged)
    const [mainSnippet, setMainSnippet] = useState('');
    useEffect(() => {
        if (siteId) {
            const snippet = `
<script>
  (function() {
    const SITE_ID = '${siteId}';
    const API_ENDPOINT = 'https://tracker.cortexcart.com/api/track';
    const EXP_API_ENDPOINT = 'https://cortexcart.com/api/experiments/active';
    let abTestInfo = null;

    function sendEvent(eventName, data = {}) {
      const eventData = { siteId: SITE_ID, eventName: eventName, data: { ...data, path: window.location.pathname, referrer: document.referrer, abTest: abTestInfo }};
      try { navigator.sendBeacon(API_ENDPOINT, JSON.stringify(eventData)); } 
      catch(e) { fetch(API_ENDPOINT, { method: 'POST', body: JSON.stringify(eventData), keepalive: true }); }
    }

    document.addEventListener('click', function(e) {
        sendEvent('click', { x: e.pageX, y: e.pageY, screenWidth: window.innerWidth });
    }, true);

    async function runAbTest() { /* ... */ }
    
    async function initializeTracker() {
        await runAbTest();
        sendEvent('pageview');
    }
    window.cortexcart = { track: sendEvent };
    initializeTracker();
  })();
<\/script>`.trim();
            setMainSnippet(snippet);
        }
    }, [siteId]);

    return (
        <div className="max-w-3xl space-y-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Main Tracker Script</h3>
            <p className="mt-1 text-sm text-gray-600">Place this script just before the closing \`&lt;/head&gt;\` tag on every page.</p>
            <div className="p-4 bg-gray-900 rounded-md text-white font-mono text-sm overflow-x-auto relative mt-4 h-96">
                <pre><code>{mainSnippet}</code></pre>
            </div>
        </div>
    );
};
const BillingTabContent = () => (
    // ... (This component remains unchanged)
    <div className="max-w-3xl">
        <div className="flex items-center gap-x-3">
            <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
            <h3 className="text-lg font-medium leading-6 text-gray-900">Current Plan</h3>
        </div>
        <div className="mt-4 p-6 bg-white rounded-lg shadow-sm border flex justify-between items-center">
            <div>
                <p className="text-base font-semibold text-blue-600">Beta Plan</p>
                <p className="text-sm text-gray-500">You are currently on the free Beta plan.</p>
            </div>
        </div>
    </div>
);
const DangerZoneTabContent = () => {
    // ... (This component remains unchanged)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const handleAccountDelete = async () => {
        setIsDeleting(true);
        try { await signOut({ callbackUrl: '/api/account/delete' }); } 
        catch (error) { console.error(error); setIsDeleting(false); }
    };
    return (
        <>
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium">Are you sure?</h3>
                        <p className="mt-2 text-sm text-gray-500">This action cannot be undone.</p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md text-sm">Cancel</button>
                            <button onClick={handleAccountDelete} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm disabled:bg-red-300">
                                {isDeleting ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="max-w-3xl">
                <h3 className="text-lg font-medium leading-6 text-red-700">Danger Zone</h3>
                <div className="mt-4 p-4 border border-red-300 bg-red-50 rounded-lg flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold text-red-800">Delete Your Account</h4>
                        <p className="mt-1 text-sm text-red-700">Permanently remove your account and all associated data.</p>
                    </div>
                    <button onClick={() => setIsDeleteModalOpen(true)} className="ml-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">
                        Delete Account
                    </button>
                </div>
            </div>
        </>
    );
};

// --- Main Settings Page ---
export default function SettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(tabs[0].name);

    useEffect(() => {
        if (status === 'unauthenticated') { router.push('/'); }
    }, [status, router]);

    if (status === 'loading') { return <Layout><p>Loading...</p></Layout>; }

    return (
        <Layout>
            <div className="mb-8">
                <h2 className="text-3xl font-bold">Settings</h2>
                <p className="mt-1 text-sm text-gray-500">Manage your site settings, integrations, and tracking.</p>
            </div>
            <SettingsTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="mt-8 bg-white p-8 rounded-lg shadow-md">
                {activeTab === 'General' && <GeneralTabContent />}
                {activeTab === 'Integrations' && <IntegrationsTabContent />}
                {activeTab === 'Social Connections' && <SocialConnectionsTabContent />}
                {activeTab === 'Widget Settings' && <WidgetSettingsTabContent siteId={session?.user?.email} />}
                {activeTab === 'Billing' && <BillingTabContent />}
                {activeTab === 'Danger Zone' && <DangerZoneTabContent />}
            </div>
        </Layout>
    );
}
