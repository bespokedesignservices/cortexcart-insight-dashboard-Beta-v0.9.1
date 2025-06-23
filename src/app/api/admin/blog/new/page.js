'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Modal component for generating ideas
const IdeaGeneratorModal = ({ isOpen, onClose, onIdeaSelect }) => {
    const [topic, setTopic] = useState('');
    const [ideas, setIdeas] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');
        setIdeas([]);
        try {
            const res = await fetch('/api/admin/ai/generate-blog-ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic }),
            });
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || 'Failed to generate ideas.');
            }
            const data = await res.json();
            setIdeas(data.ideas || []);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Generate Blog Post Ideas</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Enter a topic:</label>
                        <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g., 'A/B testing for product pages'"/>
                    </div>
                    <button onClick={handleGenerate} disabled={isGenerating} className="w-full inline-flex justify-center items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300">
                        {isGenerating ? 'Generating...' : 'Generate Ideas'}
                    </button>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {ideas.length > 0 && (
                        <div className="border-t pt-4 mt-4">
                            <h4 className="font-semibold mb-2">Suggested Titles:</h4>
                            <ul className="space-y-2">
                                {ideas.map((idea, index) => (
                                    <li key={index} onClick={() => onIdeaSelect(idea)} className="p-2 text-sm rounded-md hover:bg-gray-100 cursor-pointer">{idea}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default function NewBlogPostPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('draft');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleIdeaSelect = (ideaTitle) => {
        setTitle(ideaTitle);
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/admin/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, status }),
            });
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || 'Failed to create post.');
            }
            router.push('/admin/blog');
        } catch (err) {
             if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <IdeaGeneratorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onIdeaSelect={handleIdeaSelect} />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
                <button type="button" onClick={() => setIsModalOpen(true)} className="inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500">
                    <SparklesIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                    Generate Ideas with AI
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">Post Title</label>
                    <div className="mt-2">
                        <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300" required />
                    </div>
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium leading-6 text-gray-900">Content</label>
                    <div className="mt-2">
                        <textarea id="content" name="content" rows={12} value={content} onChange={(e) => setContent(e.target.value)} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Markdown is supported for formatting.</p>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">Status</label>
                    <div className="mt-2">
                       <select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)} className="block w-full max-w-xs rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300">
                           <option value="draft">Draft</option>
                           <option value="published">Published</option>
                       </select>
                    </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end gap-x-4">
                    <button type="button" className="text-sm font-semibold leading-6 text-gray-900" onClick={() => router.push('/admin/blog')}>Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300">
                        {isSubmitting ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </form>
        </>
    );
}
