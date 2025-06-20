'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/app/components/Layout';
import { SparklesIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/solid';

// Corrected: PLATFORMS constant is now included
const PLATFORMS = {
    x: {
        name: 'X (Twitter)', maxLength: 280, type: 'character',
        icon: (props) => (<svg {...props} viewBox="0 0 1200 1227"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor"/></svg>),
        placeholder: 'What\'s happening?!'
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

  // --- All State Hooks ---
  const [selectedPlatform, setSelectedPlatform] = useState('x');
  const [postContent, setPostContent] = useState('');
  const [topic, setTopic] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  
  // Scheduling State
  const [isScheduling, setIsScheduling] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [scheduledPosts, setScheduledPosts] = useState([]);


  const fetchScheduledPosts = useCallback(async () => {
    try {
        const res = await fetch('/api/social/schedule');
        if (!res.ok) throw new Error('Failed to fetch schedule.');
        const data = await res.json();
        setScheduledPosts(data);
    } catch (err) {
        setError(err.message);
    }
  }, []);
  
  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/'); }
    if (status === 'authenticated') {
        fetchScheduledPosts();
    }
  }, [status, router, fetchScheduledPosts]); // Corrected: Added fetchScheduledPosts to dependency array

  const handleGeneratePost = async () => {
    if (!topic) {
        setError('Please enter a topic for your post.');
        return;
    }
    setIsGenerating(true);
    setError('');
    // ... AI generation logic will go here ...
    alert("AI Generation is coming soon!");
    setIsGenerating(false);
  };

  const handleSchedulePost = async () => {
      setIsScheduling(true);
      setError('');
      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
      
      try {
          const res = await fetch('/api/social/schedule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  platform: selectedPlatform,
                  content: postContent,
                  hashtags,
                  scheduledAt
              })
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message);

          setPostContent('');
          setHashtags([]);
          setIsScheduleModalOpen(false);
          await fetchScheduledPosts(); // Refresh the list
      } catch (err) {
          setError(err.message);
      } finally {
          setIsScheduling(false);
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
        <p className="mt-1 text-sm text-gray-500">Design, schedule, and analyze your social media content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center border-b pb-4">
                {platformKeys.map(key => {
                    const PlatformIcon = PLATFORMS[key].icon;
                    return (
                        <button 
                            key={key}
                            onClick={() => setSelectedPlatform(key)}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md mr-2 ${selectedPlatform === key ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <PlatformIcon className="h-5 w-5 mr-2" />
                            {PLATFORMS[key].name}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4">
                <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder={currentPlatform.placeholder} className="w-full h-64 p-4 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 text-lg"/>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
                <span className={`text-sm font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>{currentLength.toLocaleString()} / {maxLength.toLocaleString()}</span>
                <button
                    onClick={() => setIsScheduleModalOpen(true)}
                    disabled={postContent.length === 0 || isOverLimit}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:bg-gray-400"
                >
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Schedule Post
                </button>
            </div>
        </div>
        
        <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md border space-y-4">
                <h3 className="font-semibold text-lg">AI Assistant</h3>
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Post Topic</label>
                    <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., 'New Summer T-Shirt Sale'" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm" />
                </div>
                <button
                    onClick={handleGeneratePost}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-400"
                >
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                </button>
                 {error && <p className="text-xs text-center text-red-600">{error}</p>}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="font-semibold text-lg mb-4">Scheduled Posts</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {scheduledPosts.length > 0 ? scheduledPosts.map(post => (
                        <div key={post.id} className="p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-800 truncate">{post.content}</p>
                            <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                                <span>For: {PLATFORMS[post.platform]?.name || post.platform}</span>
                                <span className="flex items-center"><ClockIcon className="h-4 w-4 mr-1"/>{new Date(post.scheduled_at).toLocaleString()}</span>
                            </div>
                        </div>
                    )) : <p className="text-sm text-gray-500 text-center py-4">No posts scheduled.</p>}
                </div>
            </div>
        </div>
      </div>

      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Schedule Post</h3>
                <div>
                    <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" id="scheduleDate" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-700">Time</label>
                    <input type="time" id="scheduleTime" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end space-x-3">
                    <button onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSchedulePost} disabled={isScheduling} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isScheduling ? 'Scheduling...' : 'Confirm Schedule'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </Layout>
  );
}
