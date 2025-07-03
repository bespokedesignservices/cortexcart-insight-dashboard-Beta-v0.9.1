'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/app/components/Layout';
import SettingsTabs from '@/app/components/SettingsTabs';
import Placeholder from '@/app/components/Placeholder';
import { ShareIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const tabs = [
    { name: 'General', href: '#' },
    { name: 'Integrations', href: '#' },
    { name: 'Widget Settings', href: '#' },
    { name: 'Billing', href: '#' },
    { name: 'Danger Zone', href: '#' },
];

// --- Sub-component for General Settings ---
const GeneralTabContent = () => {
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

// --- Sub-component for Integrations Settings ---
const IntegrationsTabContent = () => {
    const [ga4PropertyId, setGa4PropertyId] = useState('');
    const [formMessage, setFormMessage] = useState({ text: '', isError: false });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function fetchGA4Settings() {
            const res = await fetch('/api/ga4-connections');
            if (res.ok) {
                const data = await res.json();
                setGa4PropertyId(data.ga4_property_id || '');
            }
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
        <div className="max-w-3xl">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Google Analytics Integration</h3>
            <form onSubmit={handleSaveGA4Settings} className="mt-6 space-y-6">
                <div>
                    <label htmlFor="ga4PropertyId" className="block text-sm font-medium text-gray-700">GA4 Property ID</label>
                    <input type="text" id="ga4PropertyId" value={ga4PropertyId} onChange={(e) => setGa4PropertyId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., 123456789" />
                </div>
                <div className="flex items-center justify-between">
                    <button type="submit" disabled={isSaving} className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                        {isSaving ? 'Saving...' : 'Save GA4 Settings'}
                    </button>
                    {formMessage.text && <p className={`text-sm ${formMessage.isError ? 'text-red-600' : 'text-green-600'}`}>{formMessage.text}</p>}
                </div>
            </form>
        </div>
    );
};

const WidgetSettingsTabContent = ({ siteId }) => {
    const [mainSnippet, setMainSnippet] = useState('');
    useEffect(() => {
        if (siteId) {
            const snippet = `
<script>
  (function() {
    const SITE_ID = '${siteId}';
    const API_ENDPOINT = 'https://tracker.cortexcart.com/api/track';
    const EXP_API_ENDPOINT = 'https://tracker.cortexcart.com/api/experiments/active';
    let abTestInfo = null;

    function sendEvent(eventName, data = {}) {
      const eventData = { siteId: SITE_ID, eventName: eventName, data: { ...data, path: window.location.pathname, referrer: document.referrer, abTest: abTestInfo }};
      try { navigator.sendBeacon(API_ENDPOINT, JSON.stringify(eventData)); } catch(e) { fetch(API_ENDPOINT, { method: 'POST', body: JSON.stringify(eventData), keepalive: true }); }
    }

    document.addEventListener('click', function(e) {
        sendEvent('click', { x: e.pageX, y: e.pageY, screenWidth: window.innerWidth });
    }, true);

    async function runAbTest() {
        try {
            const res = await fetch(\`\${EXP_API_ENDPOINT}?path=\${encodeURIComponent(window.location.pathname)}&siteId=\${SITE_ID}\`);
            if (!res.ok) return; // Fail silently if API returns an error
            const experiment = await res.json();
            if (!experiment) return;
            
            // ... rest of A/B test logic ...
        } catch (e) { console.error('CortexCart A/B Test Error:', e); }
    }

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
            <p className="mt-1 text-sm text-gray-600">Place this script just before the closing \`&lt;/head&gt;\` tag on every page of your website.</p>
            <div className="p-4 bg-gray-900 rounded-md text-white font-mono text-sm overflow-x-auto relative mt-4 h-96">
                <pre><code>{mainSnippet}</code></pre>
            </div>
        </div>
    );
};

// --- Sub-component for Billing ---
const BillingTabContent = () => (
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

// --- Sub-component for Danger Zone ---
const DangerZoneTabContent = () => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAccountDelete = async () => {
        setIsDeleting(true);
        try {
            await signOut({ callbackUrl: '/api/account/delete' });
        } catch (error) {
            console.error(error);
            setIsDeleting(false);
        }
    };
    
    return (
        <>
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium">Are you sure?</h3>
                        <p className="mt-2 text-sm text-gray-500">This will permanently delete your account and all data. This action cannot be undone.</p>
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
                        <p className="mt-1 text-sm text-red-700">Permanently remove your account and all of your data.</p>
                    </div>
                    <button onClick={() => setIsDeleteModalOpen(true)} className="ml-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">
                        Delete Account
                    </button>
                </div>
            </div>
        </>
    );
};

// --- Main Settings Page Component ---
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
                {activeTab === 'Widget Settings' && <WidgetSettingsTabContent siteId={session?.user?.email} />}
                {activeTab === 'Billing' && <BillingTabContent />}
                {activeTab === 'Danger Zone' && <DangerZoneTabContent />}
                {activeTab === 'Social Connections' && (
                    <div className="max-w-3xl">
                        <Placeholder 
                            title="Connect Social Accounts"
                            description="This feature is coming soon."
                            icon={ShareIcon}
                        />
                    </div>
                )}
            </div>
        </Layout>
    );
}
