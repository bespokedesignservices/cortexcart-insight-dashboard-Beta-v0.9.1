'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '@/app/components/Layout';
import StatCard from '@/app/components/StatCard';
import AnalyticsChart from '@/app/components/AnalyticsChart';
import { SparklesIcon, CalendarIcon, ClipboardDocumentIcon, ChartBarIcon, PencilSquareIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/solid';

const PLATFORMS = {
    x: {
        name: 'X (Twitter)', maxLength: 280, type: 'character',
        icon: (props) => (<svg {...props} viewBox="0 0 1200 1227"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor"/></svg>),
        placeholder: 'What\'s happening?!'
    },
    instagram: {
        name: 'Instagram', maxLength: 2200, type: 'character',
        icon: (props) => (<svg {...props} aria-label="Instagram" role="img" viewBox="0 0 512 512"><rect height="512" rx="15%" ry="15%" width="512" fill="#fff"/><g stroke="#000" strokeWidth="30"><rect height="302" rx="23%" ry="23%" width="302" x="105" y="105"/><circle cx="256" cy="256" r="72"/><circle cx="347" cy="165" r="18"/></g></svg>),
        placeholder: 'Share a photo, video, or idea...'
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
    const [scheduledPosts] = useState([]); 
    const [isCopied, setIsCopied] = useState(false);

    const handleGeneratePost = async () => {
        if (!topic) return;
        try {
            const res = await fetch('/api/ai/generate-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, platform: selectedPlatform, maxLength: PLATFORMS[selectedPlatform].maxLength })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Failed to generate post.');
            setPostContent(result.postContent);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(postContent).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }, (err) => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text.');
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
                        const PlatformIcon = PLATFORMS[key].icon;
                        return <button key={key} onClick={() => setSelectedPlatform(key)} className={`flex-shrink-0 flex items-center px-4 py-2 text-sm font-medium rounded-md mr-2 ${selectedPlatform === key ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}><PlatformIcon className="h-5 w-5 mr-2" />{PLATFORMS[key].name}</button>;
                    })}
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                    <p className="text-sm text-yellow-700">
                        Direct posting is currently under development. For now, you can generate post content and copy and paste it to your platform.
                    </p>
                </div>
                <div className="mt-4"><textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder={currentPlatform.placeholder} className="w-full h-64 p-4 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 text-lg"/></div>
                <div className="mt-4 flex justify-between items-center">
                    <span className={`text-sm font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>{currentLength.toLocaleString()} / {maxLength.toLocaleString()}</span>
                    <div className="flex items-center gap-x-2">
                        <button onClick={handleCopy} disabled={postContent.length === 0} className={`flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none transition-colors duration-200 ${isCopied ? 'bg-green-600 text-white border-transparent' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'}`}>
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
                        {scheduledPosts.length > 0 ? scheduledPosts.map(post => (<div key={post.id} className="p-3 bg-gray-50 rounded-md"><p className="text-sm text-gray-800 truncate">{post.content}</p><div className="text-xs text-gray-500 mt-2 flex items-center justify-between"><span>For: {PLATFORMS[post.platform]?.name || post.platform}</span><span className="flex items-center"><ClockIcon className="h-4 w-4 mr-1"/>{new Date(post.scheduled_at).toLocaleString()}</span></div></div>)) : <p className="text-sm text-gray-500 text-center py-4">No posts scheduled.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function SocialMediaManagerPage() {
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState('Composer');

  const chartData = {
    labels: ['Posts', 'Interactions'],
    datasets: [{
        label: 'Count',
        data: [0, 0], 
        backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 159, 64, 0.7)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 159, 64, 1)'],
        borderWidth: 1,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  if (status === 'loading') return <Layout><p>Loading...</p></Layout>;

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Social Media Manager</h2>
        <p className="mt-1 text-sm text-gray-500">Design, schedule, and analyze your social media content.</p>
      </div>

      <SocialNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'Composer' && <ComposerTabContent />}

      {activeTab === 'Analytics' && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Posts" value="0" icon={<ClipboardDocumentIcon className="h-8 w-8 text-blue-600" />} />
                <StatCard title="Total Interactions" value="0" icon={<SparklesIcon className="h-8 w-8 text-blue-600" />} />
                <StatCard title="Engagement Rate" value="0%" icon={<ChartBarIcon className="h-8 w-8 text-blue-600" />} />
            </div>
            <div className="mt-8">
              <AnalyticsChart data={chartData} options={chartOptions} />
            </div>
        </>
      )}

      {activeTab === 'Schedule' && (
        <p>Schedule content will go here...</p>
      )}
    </Layout>
  );
}
