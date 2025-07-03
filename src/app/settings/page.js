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

// --- General Settings Tab Component ---
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

// --- Integrations Tab Component ---
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
<img src="https://upload.wikimedia.org/wikipedia/commons/6/64/Google-analytics.png"/>
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

// --- Widget Settings Tab Component ---
const WidgetSettingsTabContent = ({ siteId }) => {
    const [mainSnippet, setMainSnippet] = useState('');
    
    useEffect(() => {
        if (siteId) {
            const newSnippet = `
<script>
  (function() {
    const SITE_ID = '${siteId}';
    const API_ENDPOINT = 'https://cortexcart.com/api/track';
    const EXP_API_ENDPOINT = 'https://cortexcart.com/api/experiments/active';
    let abTestInfo = null;

    function getCookie(name) {
        const value = \`; \${document.cookie}\`;
        const parts = value.split(\`; \${name}=\`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    }

    function sendEvent(eventName, data = {}) {
      const eventData = {
        siteId: SITE_ID,
        eventName: eventName,
        data: { 
            ...data, 
            path: window.location.pathname, 
            referrer: document.referrer,
            abTest: abTestInfo // Include A/B test info if present
        }
      };
      try { navigator.sendBeacon(API_ENDPOINT, JSON.stringify(eventData)); } 
      catch(e) { fetch(API_ENDPOINT, { method: 'POST', body: JSON.stringify(eventData), keepalive: true }); }
    }

    async function runAbTest() {
        try {
            const res = await fetch(\`\${EXP_API_ENDPOINT}?url=\${encodeURIComponent(window.location.href)}&siteId=\${SITE_ID}\`);
            const experiment = await res.json();

            if (!experiment) return;

            abTestInfo = { experimentId: experiment.id, variantId: null };
            const cookieName = \`cortex-exp-\${experiment.id}\`;
            let assignedVariantId = getCookie(cookieName);

            if (assignedVariantId) {
                abTestInfo.variantId = parseInt(assignedVariantId, 10);
            } else {
                const randomIndex = Math.floor(Math.random() * experiment.variants.length);
                const assignedVariant = experiment.variants[randomIndex];
                abTestInfo.variantId = assignedVariant.id;
                setCookie(cookieName, assignedVariant.id, 30); // Remember assignment for 30 days
            }
            
            const variantToApply = experiment.variants.find(v => v.id === abTestInfo.variantId);
            if (variantToApply) {
                const element = document.querySelector(experiment.target_selector);
                if (element) {
                    element.innerText = variantToApply.content;
                }
            }
        } catch(e) {
            console.error('CortexCart A/B Test Error:', e);
        }
    }

    async function initializeTracker() {
        await runAbTest();
        sendEvent('pageview');
    }

    window.cortexcart = { track: sendEvent };
    initializeTracker();
  })();
<\/script>`.trim();

            setMainSnippet(newSnippet);
        }
    }, [siteId]);

    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Main Tracker Script</h3>
                <p className="mt-1 text-sm text-gray-600">This script is required on every page of your website. Place it just before the closing `&lt;/head&gt;` tag.</p>
                <div className="mt-4 h-64"><SnippetBox snippet={mainSnippet} /></div>
            </div>
        </div>
    );
};

const SnippetBox = ({ snippet }) => {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(snippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="p-4 bg-gray-900 rounded-md text-white font-mono text-sm overflow-x-auto relative h-full flex flex-col justify-between">
            <div><pre><code>{snippet}</code></pre></div>
            <button onClick={copyToClipboard} className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 text-xs rounded-md transition-colors">
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    );
};


// --- Billing Tab Component ---
const BillingTabContent = () => {
    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <div className="flex items-center gap-x-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Current Plan</h3>
                </div>
                <div className="mt-4 p-6 bg-white rounded-lg shadow-sm border flex justify-between items-center">
                    <div>
                        <p className="text-base font-semibold text-blue-600">Beta Plan</p>
                        <p className="text-sm text-gray-500">You are currently on the free Beta plan. Enjoy full access!</p>
                    </div>
                    <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed">
                        Manage Subscription
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Danger Zone Tab Component ---
const DangerZoneTabContent = () => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formMessage, setFormMessage] = useState({ text: '', isError: false });

    const handleAccountDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch('/api/account/delete', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to delete account.');
            await signOut({ callbackUrl: '/' });
        } catch (error) {
            setFormMessage({ text: error.message, isError: true });
            setIsDeleting(false);
        }
    };
    
    return (
        <>
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Are you sure?</h3>
                        <div className="mt-2"><p className="text-sm text-gray-500">This will permanently delete your account and all tracked data. This action cannot be undone.</p></div>
                        {formMessage.text && <p className="mt-2 text-sm text-red-600">{formMessage.text}</p>}
                        <div className="mt-5 sm:mt-6 flex flex-row-reverse gap-3">
                            <button type="button" disabled={isDeleting} onClick={handleAccountDelete} className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:bg-red-300">{isDeleting ? 'Deleting...' : 'Confirm Deletion'}</button>
                            <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
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
                        <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed border-gray-300">
                            <Placeholder 
                                title="Connect Social Accounts"
                                description="This feature is coming soon. You'll be able to connect your accounts and manage credentials here."
                                icon={ShareIcon}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
