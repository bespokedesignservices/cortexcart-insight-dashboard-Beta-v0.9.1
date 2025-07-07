'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '@/app/components/Layout';
import StatCard from '@/app/components/StatCard';
import { SparklesIcon, CalendarIcon, ClipboardDocumentIcon, ChartBarIcon, PencilSquareIcon, CheckIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

// --- PLATFORMS CONFIGURATION ---
const PLATFORMS = {
    x: {
        name: 'X (Twitter)', maxLength: 280, type: 'character',
        icon: (props) => (<svg {...props} viewBox="0 0 1200 1227"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor"/></svg>),
        placeholder: 'What&apos;s happening?!',
        disabled: false,
    },
    instagram: {
        name: 'Instagram', maxLength: 2200, type: 'character',
        icon: (props) => (<svg {...props} aria-label="Instagram" role="img" viewBox="0 0 512 512"><rect height="512" rx="15%" ry="15%" width="512" fill="#fff" stroke="#000" strokeWidth="30"/><g stroke="#000" strokeWidth="30"><rect height="302" rx="23%" ry="23%" width="302" x="105" y="105"/><circle cx="256" cy="256" r="72"/><circle cx="347" cy="165" r="18"/></g></svg>),
        placeholder: 'Share a photo, video, or idea...',
        disabled: false,
    },
    facebook: {
        name: 'Facebook', maxLength: 63206, type: 'character',
        icon: (props) => (<svg {...props} viewBox="0 0 24 24"><path fill="#1877F2" d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>),
        placeholder: 'What&apos;s on your mind?',
        disabled: true,
    },
    linkedin: {
        name: 'LinkedIn', maxLength: 3000, type: 'character',
        icon: (props) => (<svg {...props} viewBox="0 0 24 24"><path fill="#0A66C2" d="M19 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h14a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5zM8 19H5V8h3v11zM6.5 6.73c-.966 0-1.75-.79-1.75-1.76s.784-1.76 1.75-1.76 1.75.79 1.75 1.76-.784 1.76-1.75 1.76zM20 19h-3v-5.6c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94V19h-3V8h3v1.3h.04c.4-.76 1.38-1.55 2.76-1.55 2.95 0 3.5 1.94 3.5 4.46V19z"/></svg>),
        placeholder: 'Share a professional update or article...',
        disabled: true,
    },
    pinterest: {
        name: 'Pinterest', maxLength: 500, type: 'character',
        icon: (props) => (<svg {...props} viewBox="0 0 24 24"><path fill="#E60023" d="M12 2C6.477 2 2 6.477 2 12c0 4.14 2.686 7.66 6.357 8.94.02-.19.03-.4.05-.61l.33-1.4a.12.12 0 0 1 .1-.1c.36-.18 1.15-.56 1.15-.56s-.3-.91-.25-1.79c.06-.9.65-2.12 1.46-2.12.68 0 1.2.51 1.2 1.12 0 .68-.43 1.7-.65 2.64-.18.78.38 1.42.92 1.42 1.58 0 2.63-2.1 2.63-4.22 0-1.8-.95-3.26-2.7-3.26-2.12 0-3.32 1.58-3.32 3.16 0 .6.22 1.25.5 1.62.03.04.04.05.02.13l-.15.65c-.05.2-.14.24-.32.08-1.05-.9-1.5-2.3-1.5-3.82 0-2.78 2.04-5.38 5.8-5.38 3.1 0 5.2 2.25 5.2 4.67 0 3.1-1.95 5.42-4.62 5.42-.9 0-1.75-.46-2.05-1l-.52 2.1c-.24 1-.92 2.25-.92 2.25s-.28.1-.32.08c-.46-.38-.68-1.2-.55-1.88l.38-1.68c.12-.55-.03-1.2-.5-1.52-1.32-.9-1.9-2.6-1.9-4.22 0-2.28 1.6-4.3 4.6-4.3 2.5 0 4.2 1.8 4.2 4.15 0 2.5-1.55 4.5-3.8 4.5-.75 0-1.45-.38-1.7-.82l-.28-.9c-.1-.4-.2-.8-.2-1.22 0-.9.42-1.68 1.12-1.68.9 0 1.5.8 1.5 1.88 0 .8-.25 1.88-.58 2.8-.25.7-.5 1.4-.5 1.4s-.3.12-.35.1c-.2-.1-.3-.2-.3-.4l.02-1.12z"/></svg>),
        placeholder: 'Add a Pin description...',
        disabled: true,
    },
};
const platformKeys = Object.keys(PLATFORMS);

const SocialNav = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { name: 'Composer', icon: PencilSquareIcon },
        { name: 'Analytics', icon: ChartBarIcon },
        { name: 'Schedule', icon: CalendarIcon },
    ];
    return (
        <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.name
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <tab.icon className="mr-2 h-5 w-5" />
                        {tab.name}
                    </button>
                ))}
            </nav>
        </div>
    );
};

const ComposerTabContent = () => {
    const [selectedPlatform, setSelectedPlatform] = useState('x');
    const [postContent, setPostContent] = useState('');
    const [topic, setTopic] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const handleGeneratePost = async () => { /* AI generation logic... */ };

    const handleCopy = () => {
        navigator.clipboard.writeText(postContent).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const currentPlatform = PLATFORMS[selectedPlatform];
    const currentLength = postContent.length;
    const maxLength = currentPlatform.maxLength;
    const isOverLimit = currentLength > maxLength;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border">
                <div className="flex items-center border-b pb-4 overflow-x-auto">
                    {platformKeys.map(key => {
                        const platform = PLATFORMS[key];
                        const PlatformIcon = platform.icon;
                        return (
                            <button 
                                key={key} 
                                onClick={() => !platform.disabled && setSelectedPlatform(key)} 
                                disabled={platform.disabled}
                                className={`flex-shrink-0 flex items-center px-4 py-2 text-sm font-medium rounded-md mr-2 transition-colors ${
                                    selectedPlatform === key 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                } ${
                                    platform.disabled ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <PlatformIcon className="h-5 w-5 mr-2" />
                                {platform.name}
                            </button>
                        );
                    })}
                </div>
                <div className="mt-4"><textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder={currentPlatform.placeholder} className="w-full h-64 p-4 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 text-lg"/></div>
                <div className="mt-4 flex justify-between items-center">
                    <span className={`text-sm font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>{currentLength.toLocaleString()} / {maxLength.toLocaleString()}</span>
                    <div className="flex items-center gap-x-2">
                        <button 
                            onClick={handleCopy} 
                            disabled={postContent.length === 0}
                            className={`flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none transition-colors duration-200 ${
                                isCopied 
                                    ? 'bg-green-600 text-white border-transparent' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
                            }`}
                        >
                            {isCopied ? <CheckIcon className="h-5 w-5 mr-2" /> : <ClipboardDocumentIcon className="h-5 w-5 mr-2" />}
                            {isCopied ? 'Copied!' : 'Copy'}
                        </button>
                        <button disabled className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed">Post Now</button>
                        <button disabled className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"><CalendarIcon className="h-5 w-5 mr-2" />Schedule</button>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-md border space-y-4">
                    <h3 className="font-semibold text-lg">AI Assistant</h3>
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Post Topic</label>
                        <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., 'New Summer T-Shirt Sale'" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm" />
                    </div>
                    <button onClick={handleGeneratePost} className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-400">
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        Generate with AI
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="font-semibold text-lg mb-4">Scheduled Posts</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                       <p className="text-sm text-gray-500 text-center py-4">No posts scheduled.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AnalyticsTabContent = () => {
    const [stats] = useState({
        totalFollowers: '12.4k',
        totalPosts: 156,
        engagementRate: '2.3%',
    });
    const [engagementData] = useState({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Likes',
            data: [120, 150, 180, 130, 200, 210],
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
        }, {
            label: 'Shares/Retweets',
            data: [30, 45, 40, 50, 60, 55],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    });
    const [platformData] = useState({
        labels: ['X (Twitter)', 'Instagram'],
        datasets: [{
            data: [102, 54],
            backgroundColor: ['rgba(29, 161, 242, 0.7)', 'rgba(225, 48, 108, 0.7)'],
        }]
    });
    const [topPosts] = useState([
        { id: 1, content: 'Our biggest summer sale is now live! Get 50% off all t-shirts.', likes: 125, impressions: 15200, platform: 'x' },
        { id: 2, content: 'Behind the scenes look at our new product photoshoot!', likes: 98, impressions: 12300, platform: 'instagram' },
        { id: 3, content: 'Did you know? Our analytics dashboard can help you track real-time visitors.', likes: 76, impressions: 9800, platform: 'x' }
    ]);
    
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Followers" value={stats.totalFollowers} icon={<UserGroupIcon className="h-8 w-8 text-blue-600" />} />
                <StatCard title="Total Posts" value={stats.totalPosts.toLocaleString()} icon={<ClipboardDocumentIcon className="h-8 w-8 text-blue-600" />} />
                <StatCard title="Engagement Rate" value={stats.engagementRate} icon={<SparklesIcon className="h-8 w-8 text-blue-600" />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Engagement Over Time</h3>
                    <div className="h-80"><Line data={engagementData} /></div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Post Distribution</h3>
                    <div className="h-80"><Doughnut data={platformData} options={{ maintainAspectRatio: false }} /></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Posts</h3>
                <div className="space-y-4">
                    {topPosts.map(post => {
                        const PlatformIcon = PLATFORMS[post.platform]?.icon;
                        return (
                            <div key={post.id} className="p-4 border rounded-md grid grid-cols-6 gap-4 items-center">
                                <div className="col-span-3 text-sm text-gray-700 truncate">{post.content}</div>
                                <div className="text-center"><p className="font-bold">{post.likes}</p><p className="text-xs text-gray-500">Likes</p></div>
                                <div className="text-center"><p className="font-bold">{post.impressions.toLocaleString()}</p><p className="text-xs text-gray-500">Impressions</p></div>
                                <div className="flex justify-center">{PlatformIcon && <PlatformIcon className="h-6 w-6" />}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default function SocialMediaManagerPage() {
    const { status } = useSession();
    const [activeTab, setActiveTab] = useState('Composer');

    if (status === 'loading') return <Layout><p>Loading...</p></Layout>;

    return (
        <Layout>
            <div className="mb-8">
                <h2 className="text-3xl font-bold">Social Media Manager</h2>
                <p className="mt-1 text-sm text-gray-500">Design, schedule, and analyze your social media content.</p>
            </div>
            <SocialNav activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab === 'Composer' && <ComposerTabContent />}
            {activeTab === 'Analytics' && <AnalyticsTabContent />}
            {activeTab === 'Schedule' && (
                <div className="text-center p-12 bg-white rounded-lg border shadow-md">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Content Scheduler</h3>
                    <p className="mt-1 text-sm text-gray-500">This feature is coming soon. You&apos;ll be able to schedule your posts to go live at the perfect time.</p>
                </div>
            )}
        </Layout>
    );
}
