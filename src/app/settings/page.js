'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/app/components/Layout';
import SettingsTabs from '@/app/components/SettingsTabs';
import Placeholder from '@/app/components/Placeholder';
import { ShareIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const currencyOptions = [
    { code: 'USD', symbol: '$', name: 'United States Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound Sterling' },
];

const tabs = [
    { name: 'General', href: '#' },
    { name: 'Widget Settings', href: '#' },
    { name: 'Social Connections', href: '#' },
    { name: 'Billing', href: '#' },
    { name: 'Danger Zone', href: '#' },
];

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

const BillingTabContent = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await fetch('/api/billing/history');
                if (!res.ok) throw new Error("Failed to load billing history.");
                const data = await res.json();
                setHistory(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchHistory();
    }, []);

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
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Payment History</h3>
                <div className="mt-4 flow-root">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3.5 pl-6 text-left text-sm font-semibold text-gray-900">Date</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Invoice ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {isLoading ? (
                                    <tr><td colSpan="4" className="py-4 text-center text-gray-500">Loading history...</td></tr>
                                ) : history.length > 0 ? (
                                    history.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-4 pl-6 text-sm text-gray-700">{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td className="px-3 py-4 text-sm text-gray-700">£{(item.amount_paid / 100).toFixed(2)}</td>
                                            <td className="px-3 py-4 text-sm">
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${item.status === 'succeeded' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-500 font-mono">{item.stripe_invoice_id}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="py-4 text-center text-gray-500">No payment history found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState(tabs[0].name);
    const [siteName, setSiteName] = useState('');
    const [siteUrl, setSiteUrl] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [formMessage, setFormMessage] = useState({ text: '', isError: false });
    const [isSaving, setIsSaving] = useState(false);
    const [mainSnippet, setMainSnippet] = useState('');
    const [enhancedSnippet, setEnhancedSnippet] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const siteId = session?.user?.email;

    useEffect(() => {
        if (status === 'unauthenticated') { router.push('/'); return; }
        if (siteId) {
            const baseSnippet = `
<script async defer>
  (function() {
    const SITE_ID = '${siteId}'; 
    const API_ENDPOINT = 'https://tracker.cortexcart.com/api/track';

    function sendEvent(eventName, data = {}) {
      const eventData = { siteId: SITE_ID, eventName: eventName, data: { ...data, path: window.location.pathname, referrer: document.referrer } };
      try {
        navigator.sendBeacon(API_ENDPOINT, JSON.stringify(eventData));
      } catch(e) {
        fetch(API_ENDPOINT, { method: 'POST', body: JSON.stringify(eventData), keepalive: true });
      }
    }

    sendEvent('pageview');

    window.cortexcart = {
      track: function(eventName, data) {
        if (!eventName) { console.error('CortexCart Tracker: Event name is required.'); return; }
        sendEvent(eventName, data);
      }
    };
  })();
<\/script>`.trim();
            setMainSnippet(baseSnippet);

            const eCommerceSnippet = `
/* [IMPORTANT] Add these calls on the relevant pages in addition to the main tracker script. */

/* 1. ON PRODUCT PAGES - Track a detailed product view */
window.cortexcart.track('pageview', {
  type: 'product',
  productId: 'YOUR_DYNAMIC_PRODUCT_ID',
  productName: 'YOUR_DYNAMIC_PRODUCT_NAME',
  price: 19.99
});

/* 2. ON SALE CONFIRMATION / THANK YOU PAGE - Track a sale */
window.cortexcart.track('sale', {
  orderId: 'YOUR_ORDER_ID',
  amount: 29.99,
  currency: '${currency}',
  items: [
    { productId: 'YOUR_PRODUCT_ID_1', quantity: 1, price: 19.99 },
    { productId: 'YOUR_PRODUCT_ID_2', quantity: 1, price: 10.00 }
  ]
});`.trim();
            setEnhancedSnippet(eCommerceSnippet);
            
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
    }, [status, router, siteId, currency]);

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
            setFormMessage({ text: error.message instanceof Error ? error.message : 'An unknown error occurred.', isError: true });
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
            setFormMessage({ text: error.message instanceof Error ? error.message : 'An unknown error occurred.', isError: true });
            setIsDeleting(false);
        }
    };
    
    if (status === 'loading') { return <Layout><p>Loading...</p></Layout>; }

    return (
        <>
            <Layout>
                <div className="mb-8">
                    <h2 className="text-3xl font-bold">Settings</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage your site settings and tracking installation.</p>
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
                       <div className="max-w-3xl space-y-8">
                            <div>
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Main Tracker Script</h3>
                                <p className="mt-1 text-sm text-gray-600">This script is required on <span className="font-bold">every page</span> of your website to enable general analytics tracking. Place it just before the closing `&lt;/head&gt;` tag.</p>
                                <div className="mt-4 h-64"><SnippetBox snippet={mainSnippet} /></div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Enhanced E-commerce Tracking (Optional)</h3>
                                <p className="mt-1 text-sm text-gray-600">To unlock powerful features like product-specific AI analysis and revenue tracking, add the following function calls to the relevant pages of your site.</p>
                                <div className="mt-4 h-96"><SnippetBox snippet={enhancedSnippet} /></div>
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

                    {activeTab === 'Billing' && (
                         <BillingTabContent />
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
                        <div className="mt-2"><p className="text-sm text-gray-500">This will permanently delete your account and all of your tracked data. This action cannot be undone.</p></div>
                        {formMessage.isError && <p className="mt-2 text-sm text-red-600">{formMessage.text}</p>}
                        <div className="mt-5 sm:mt-6 flex flex-row-reverse gap-3">
                            <button type="button" disabled={isDeleting} onClick={handleAccountDelete} className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:bg-red-300">{isDeleting ? 'Deleting...' : 'Confirm Deletion'}</button>
                            <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
