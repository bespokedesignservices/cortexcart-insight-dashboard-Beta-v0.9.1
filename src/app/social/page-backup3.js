'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/app/components/Layout';
import { SparklesIcon } from '@heroicons/react/24/solid';

// --- Expanded Platform Configurations ---
const PLATFORMS = {
    x: {
        name: 'X (Twitter)', maxLength: 280, type: 'character',
        icon: (props) => (<svg {...props} viewBox="0 0 1200 1227"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor"/></svg>),
        placeholder: 'What\'s happening?!'
    },
    facebook: {
        name: 'Facebook', maxLength: 63206, type: 'character',
        icon: (props) => (<svg {...props} viewBox="0 0 24 24"><path fill="#1877F2" d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>),
        placeholder: 'What\'s on your mind?'
    },
    linkedin: {
        name: 'LinkedIn', maxLength: 3000, type: 'character',
        icon: (props) => (<svg {...props} viewBox="0 0 24 24"><path fill="#0A66C2" d="M19 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h14a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5zM8 19H5V8h3v11zM6.5 6.73c-.966 0-1.75-.79-1.75-1.76s.784-1.76 1.75-1.76 1.75.79 1.75 1.76-.784 1.76-1.75 1.76zM20 19h-3v-5.6c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94V19h-3V8h3v1.3h.04c.4-.76 1.38-1.55 2.76-1.55 2.95 0 3.5 1.94 3.5 4.46V19z"/></svg>),
        placeholder: 'Share a professional update or article...'
    },
    instagram: {
        name: 'Instagram', maxLength: 2200, type: 'character',
        icon: (props) => (<svg {...props} aria-label="Instagram" role="img" viewBox="0 0 512 512"><rect height="512" rx="15%" ry="15%" width="512" fill="#fff"/><g stroke="#000" stroke-width="30"><rect height="302" rx="23%" ry="23%" width="302" x="105" y="105"/><circle cx="256" cy="256" r="72"/><circle cx="347" cy="165" r="18"/></g></svg>),
        placeholder: 'Share a photo, video, or idea...'
    },
};
const platformKeys = Object.keys(PLATFORMS);

export default function SocialMediaManagerPage() {
  const { status } = useSession();
  const router = useRouter();

  const [selectedPlatform, setSelectedPlatform] = useState(platformKeys[0]);
  const [postContent, setPostContent] = useState('');
  const [topic, setTopic] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [canPost, setCanPost] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  // --- Cooldown Logic ---
  useEffect(() => {
    const lastPostTimestamp = localStorage.getItem('lastAiPostTimestamp');
    if (lastPostTimestamp) {
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const timeDiff = Date.now() - parseInt(lastPostTimestamp, 10);
        if (timeDiff < twentyFourHours) {
            setCanPost(false);
            let remaining = twentyFourHours - timeDiff;
            const interval = setInterval(() => {
                remaining -= 1000;
                if (remaining <= 0) {
                    clearInterval(interval); setCanPost(true); setTimeLeft(''); return;
                }
                const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((remaining / 1000 / 60) % 60);
                setTimeLeft(`${hours}h ${minutes}m`);
            }, 1000);
            return () => clearInterval(interval);
        }
    }
  }, [canPost]);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/'); }
  }, [status, router]);

  const handleGeneratePost = async () => {
    if (!canPost || !topic) {
        setError('Please enter a topic for your post.');
        return;
    }
    setIsGenerating(true);
    setError('');
    setHashtags([]);

    try {
        const res = await fetch('/api/ai/generate-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, platform: selectedPlatform, maxLength: PLATFORMS[selectedPlatform].maxLength })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Failed to generate post.');
        
        setPostContent(result.postContent);
        setHashtags(result.hashtags || []);
        localStorage.setItem('lastAiPostTimestamp', Date.now().toString());
        setCanPost(false);

    } catch (err) {
        setError(err.message);
    } finally {
        setIsGenerating(false);
    }
  };

  const currentPlatform = PLATFORMS[selectedPlatform];
  const currentLength = postContent.length;
  const maxLength = currentPlatform.maxLength;
  const isOverLimit = currentLength > maxLength;

  if (status === 'loading') { return <Layout><p>Loading...</p></Layout>; }

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Social Media Manager</h2>
        <p className="mt-1 text-sm text-gray-500">Design posts, generate copy with AI, and track your social analytics.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center border-b pb-4 overflow-x-auto">
                {platformKeys.map(key => {
                    const PlatformIcon = PLATFORMS[key].icon;
                    return (
                        <button key={key} onClick={() => setSelectedPlatform(key)} className={`flex-shrink-0 flex items-center px-4 py-2 text-sm font-medium rounded-md mr-2 ${selectedPlatform === key ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <PlatformIcon className="h-5 w-5 mr-2" />
                            {PLATFORMS[key].name}
                        </button>
                    );
                })}
            </div>
            <div className="mt-4">
                <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder={currentPlatform.placeholder} className="w-full h-64 p-4 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 text-lg"/>
            </div>
            <div className="mt-4 flex justify-end items-center">
                <span className={`text-sm font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>{currentLength.toLocaleString()} / {maxLength.toLocaleString()}</span>
            </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md border space-y-4">
            <h3 className="font-semibold text-lg">AI Assistant</h3>
            <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Post Topic</label>
                <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., 'New Summer T-Shirt Sale'" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm" />
            </div>
            <button onClick={handleGeneratePost} disabled={!canPost || isGenerating} className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-400">
                <SparklesIcon className="h-5 w-5 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate with AI'}
            </button>
            {!canPost && (<p className="text-xs text-center text-gray-500">You can generate another post in {timeLeft}.</p>)}
            {error && <p className="text-xs text-center text-red-600">{error}</p>}

            {hashtags.length > 0 && (
                <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-800">Suggested Hashtags:</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {hashtags.map(tag => <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{tag}</span>)}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
