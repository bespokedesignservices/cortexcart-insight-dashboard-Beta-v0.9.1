'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/app/components/Layout';
import { SparklesIcon } from '@heroicons/react/24/solid';

// --- Platform Configurations ---
const PLATFORMS = {
    x: {
        name: 'X (Twitter)',
        maxLength: 280,
        type: 'character',
        icon: (props) => (
            <svg {...props} viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor"/>
            </svg>
        ),
        placeholder: 'What\'s happening?!'
    },
    instagram: {
        name: 'Instagram',
        maxLength: 2200,
        type: 'character',
        icon: (props) => (
            <svg {...props} aria-label="Instagram" role="img" viewBox="0 0 512 512">
                <rect height="512" rx="15%" ry="15%" width="512" fill="#fff"/><g stroke="#000" stroke-width="30"><rect height="302" rx="23%" ry="23%" width="302" x="105" y="105"/><circle cx="256" cy="256" r="72"/><circle cx="347" cy="165" r="18"/></g>
            </svg>
        ),
        placeholder: 'Share a photo, video, or idea...'
    },
};
const platformKeys = Object.keys(PLATFORMS);

export default function SocialMediaManagerPage() {
  const { status } = useSession();
  const router = useRouter();

  const [selectedPlatform, setSelectedPlatform] = useState(platformKeys[0]);
  const [postContent, setPostContent] = useState('');
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
            // Update the countdown every second
            const interval = setInterval(() => {
                remaining -= 1000;
                if (remaining <= 0) {
                    clearInterval(interval);
                    setCanPost(true);
                    setTimeLeft('');
                    return;
                }
                const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((remaining / 1000 / 60) % 60);
                setTimeLeft(`${hours}h ${minutes}m remaining`);
            }, 1000);
            return () => clearInterval(interval);
        }
    }
  }, [canPost]);


  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/'); }
  }, [status, router]);

  const handleGeneratePost = () => {
    if (!canPost) return;
    // In the next step, this will call the AI API.
    // For now, we just set the cooldown.
    alert("AI generation would happen here!");
    localStorage.setItem('lastAiPostTimestamp', Date.now().toString());
    setCanPost(false);
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
        
        {/* Left Side: Composer */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border">
            {/* Platform Selector */}
            <div className="flex items-center border-b pb-4">
                {platformKeys.map(key => {
                    const PlatformIcon = PLATFORMS[key].icon; // Get the icon component for the current key
                    return (
                        <button 
                            key={key}
                            onClick={() => setSelectedPlatform(key)}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md mr-2 ${selectedPlatform === key ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {/* Corrected: Render the specific icon for this button */}
                            <PlatformIcon className="h-5 w-5 mr-2" />
                            {PLATFORMS[key].name}
                        </button>
                    );
                })}
            </div>

            {/* Text Area */}
            <div className="mt-4">
                <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={currentPlatform.placeholder}
                    className="w-full h-64 p-4 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
            </div>
            
            {/* Character Count & AI Button */}
            <div className="mt-4 flex justify-end items-center">
                <span className={`text-sm font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
                    {currentLength} / {maxLength}
                </span>
            </div>
        </div>

        {/* Right Side: AI Tools */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md border space-y-4">
            <h3 className="font-semibold text-lg">AI Assistant</h3>
            <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Post Topic</label>
                <input type="text" id="topic" placeholder="e.g., 'New Summer T-Shirt Sale'" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm" />
            </div>
            <button
                onClick={handleGeneratePost}
                disabled={!canPost}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-400"
            >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Generate with AI
            </button>
            {!canPost && (
                <p className="text-xs text-center text-gray-500">
                    You can generate another post in {timeLeft}.
                </p>
            )}
            <button
                disabled={postContent.length === 0}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
            >
                Generate Alternatives
            </button>
          </div>
        </div>

      </div>
    </Layout>
  );
}
