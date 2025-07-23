'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react'; // FIX: Removed unused 'signIn'
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/app/components/Layout';
import SettingsTabs from '@/app/components/SettingsTabs';
import { CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/react/24/solid';
import AlertBanner from '@/app/components/AlertBanner';


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

const SocialConnectionsTabContent = () => {
    const [connectionStatus, setConnectionStatus] = useState({ x: false, facebook: false, pinterest: false });
    const [facebookPages, setFacebookPages] = useState([]);
    const [instagramAccounts, setInstagramAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
    const searchParams = useSearchParams();
    const [activePageId, setActivePageId] = useState(null); 

 const fetchConnections = useCallback(async () => {
    setIsLoading(true);
    try {
        // First, get the main connection statuses
        const statusRes = await fetch('/api/social/connections/status');
        if (!statusRes.ok) throw new Error('Could not fetch connection statuses.');
        
        const statuses = await statusRes.json();
        setConnectionStatus(statuses);

        // If Facebook is connected, fetch all related Facebook data
        if (statuses.facebook) {
            const [pagesRes, igRes, activePageRes] = await Promise.all([
                fetch('/api/social/facebook/pages'),
                fetch('/api/social/instagram/accounts'),
                fetch('/api/social/facebook/active-page')
            ]);

            // Process each response ONCE
            if (pagesRes.ok) {
                const pagesData = await pagesRes.json();
                setFacebookPages(pagesData);
            }
            if (igRes.ok) {
                const igData = await igRes.json();
                setInstagramAccounts(igData);
            }
            if (activePageRes.ok) {
                const activePageData = await activePageRes.json();
                setActivePageId(activePageData.active_facebook_page_id);
            }
        }
    } catch (err) {
        console.error("Failed to fetch connection data:", err);
        setAlert({ show: true, message: err.message, type: 'danger' });
    } finally {
        setIsLoading(false);
    }
}, []);

    useEffect(() => {
        fetchConnections();

        const connectStatus = searchParams.get('connect_status');
        if (connectStatus) {
            const message = connectStatus === 'success' 
                ? 'Account connected successfully!' 
                : searchParams.get('message')?.replace(/_/g, ' ') || 'An unknown error occurred.';
            setAlert({ show: true, message, type: connectStatus === 'success' ? 'success' : 'danger' });
            setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 5000);
        }
    }, [searchParams, fetchConnections]);

const handleDisconnect = async (platform) => {
    if (!confirm(`Are you sure you want to disconnect your ${platform} account?`)) return;
    try {
        await fetch('/api/social/connections/status', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform }),
        });
    } catch (err) { // FIX: Use the 'err' variable for logging
        console.error(`Could not disconnect ${platform}:`, err);
        alert(`Could not disconnect ${platform}. Please try again.`);
    }
};
const handleConnectPage = async (pageId) => {
    setAlert({ show: false, message: '', type: 'info' }); // Clears old alerts
    try {
        const res = await fetch('/api/social/facebook/connect-page', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageId })
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to connect page.');

        // This is the crucial line for instant UI update
        setActivePageId(pageId);
        
        // Show the success message
        setAlert({ show: true, message: `Page connected successfully!`, type: 'success' });

    } catch (error) {
        setAlert({ show: true, message: error.message, type: 'danger' });
    }
};
    if (isLoading) return <p>Loading connection status...</p>;

    return (
        <div className="max-w-3xl space-y-4">
            {alert.show && <AlertBanner title={alert.type === 'success' ? 'Success' : 'Error'} message={alert.message} type={alert.type} />}
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Social Connections</h3>
                <p className="mt-1 text-sm text-gray-500">Connect your social media accounts to enable posting and analytics.</p>
                
                <div className="mt-6 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                         <div>
                            <p className="font-semibold">Facebook / Instagram</p>
                            <p className="text-sm text-gray-500">Connect your Facebook/Instagram account to manage your pages and posts.</p>
                        </div>
                        {connectionStatus.facebook ? (
                             <div className="flex items-center gap-x-4">
                                <span className="flex items-center text-sm font-medium text-green-600"><CheckCircleIcon className="h-5 w-5 mr-1.5" />Connected</span>
                                <button onClick={() => handleDisconnect('facebook')} className="text-sm font-medium text-red-600 hover:text-red-800">Disconnect</button>
                            </div>
                        ) : (
                       <button onClick={() => signIn('facebook')} className="px-3 py-1 text-sm bg-blue-600 border border-blue-300 rounded-md hover:bg-blue-100 text-white hover:text-black">Connect to Facebook</button>
                           
                        )}
                    </div>
                    {connectionStatus.facebook && (
                        <>
                            <div className="mt-4 pt-4 border-t">
                                <h4 className="text-base font-medium text-gray-800">Your Facebook Pages</h4>
                                {facebookPages.length > 0 ? (
    <ul className="mt-2 space-y-2">
        {facebookPages.map(page => (
            <li key={page.page_id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                {/* Left side: Page Info */}
                <div className="flex items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={page.picture?.data?.url} alt={page.name} className="h-8 w-8 rounded-full mr-3" />
                    <span className="text-sm font-medium text-gray-700">{page.name}</span>
                </div>

                {/* Right side: Connection Status/Button */}
              
          {page.page_id === activePageId ? (
            <span className="flex items-center text-sm font-medium text-green-600">
                <CheckCircleIcon className="h-5 w-5 mr-1.5" />
                Active
            </span>
        ) : (
            <button 
                onClick={() => handleConnectPage(page.page_id)} 
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-100"
            >
                Connect
            </button>
        )}
               
            </li>
        ))}
    </ul>
) : (
    <p className="text-sm text-gray-500 mt-2">No pages found.</p>
)}
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <h4 className="text-base font-medium text-gray-800">Your Instagram Accounts</h4>
                                {instagramAccounts.length > 0 ? (
                                    <ul className="mt-2 space-y-2">
                                        {instagramAccounts.map(acc => (
                                            <li key={acc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                                <div className="flex items-center">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={acc.profile_picture_url} alt={acc.username} className="h-8 w-8 rounded-full mr-3" />
                                                    <span className="text-sm font-medium text-gray-700">@{acc.username}</span>
                                                </div>
                                                <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50">Connect</button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-gray-500 mt-2">No Instagram Business accounts found.</p>}
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-4 p-4 border rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-semibold">X (Twitter)</p>
                        <p className="text-sm text-gray-500">Connect your X account to allow posting and scheduling.</p>
                    </div>
                    {connectionStatus.x ? (
                        <div className="flex items-center gap-x-4">
                            <span className="flex items-center text-sm font-medium text-green-600"><CheckCircleIcon className="h-5 w-5 mr-1.5" />Connected</span>
                            <button onClick={() => handleDisconnect('x')} className="text-sm font-medium text-red-600 hover:text-red-800">Disconnect</button>
                        </div>
                    ) : (
                    <a href="/api/connect/twitter" className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700">Connect X/Twitter</a>
                      )}
                </div>

                <div className="mt-4 p-4 border rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-semibold">Pinterest</p>
                        <p className="text-sm text-gray-500">Connect your Pinterest account to pin content and view analytics.</p>
                    </div>
                    {connectionStatus.pinterest ? (
                        <div className="flex items-center gap-x-4">
                            <span className="flex items-center text-sm font-medium text-green-600"><CheckCircleIcon className="h-5 w-5 mr-1.5" />Connected</span>
                            <button onClick={() => handleDisconnect('pinterest')} className="text-sm font-medium text-red-600 hover:text-red-800">Disconnect</button>
                        </div>
                    ) : (
                        <a href="/api/connect/pinterest" className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">Connect to Pinterest</a>
                    )}
                </div>

            </div>
        </div>
    );
};

// --- Widget Settings Component ---
const WidgetSettingsTabContent = ({ siteId }) => {
    const [mainSnippet, setMainSnippet] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (siteId) {
            const snippet = `<script>
(function() {
    const SITE_ID = '${siteId}';
    const API_ENDPOINT = 'https://tracker.cortexcart.com/api/track';
    function sendEvent(eventName, data = {}) {
        const eventData = { siteId: SITE_ID, eventName: eventName, data: { ...data, path: window.location.pathname, referrer: document.referrer }};
        try { navigator.sendBeacon(API_ENDPOINT, JSON.stringify(eventData)); } 
        catch(e) { fetch(API_ENDPOINT, { method: 'POST', body: JSON.stringify(eventData), keepalive: true }); }
    }
    document.addEventListener('click', function(e) {
        sendEvent('click', { x: e.pageX, y: e.pageY, screenWidth: window.innerWidth });
    }, true);
    sendEvent('pageview');
    window.cortexcart = { track: sendEvent };
})();
<\/script>`.trim();
            setMainSnippet(snippet);
        }
    }, [siteId]);

    const handleCopy = () => {
        navigator.clipboard.writeText(mainSnippet).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="max-w-3xl space-y-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Main Tracker Script</h3>
            <p className="mt-1 text-sm text-gray-600">Place this script just before the closing `&lt;/head&gt;` tag on every page.</p>
            <div className="p-4 bg-gray-900 rounded-md text-white font-mono text-sm overflow-x-auto relative mt-4 h-96">
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 flex items-center gap-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md text-xs"
                >
                    {isCopied ? <CheckCircleIcon className="h-4 w-4 text-green-400"/> : <ClipboardDocumentIcon className="h-4 w-4" />}
                    {isCopied ? 'Copied!' : 'Copy Code'}
                </button>
                <pre><code>{mainSnippet}</code></pre>
            </div>
        </div>
    );
};

// --- Billing Component ---
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

// --- Danger Zone Component ---
const DangerZoneTabContent = () => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const handleAccountDelete = async () => {
        setIsDeleting(true);
        try { await signOut({ callbackUrl: '/api/account/delete' }); } 
        catch { setIsDeleting(false); } // FIX: Removed unused 'error' variable
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
