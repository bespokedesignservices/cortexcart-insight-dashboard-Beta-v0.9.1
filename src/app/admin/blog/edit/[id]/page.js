'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image'; // Import the Image component

// In a real app, you would fetch these from your 'blog_categories' table
const blogCategories = [
    { id: 0, name: 'General' },
    { id: 1, name: 'E-commerce Strategy' },
    { id: 2, name: 'Data & Analytics' },
    { id: 3, name: 'AI for E-commerce' },
    { id: 4, name: 'Generative AI' },
    { id: 5, name: 'Conversion Optimization' },
    { id: 6, name: 'Product Updates' },
];

const IdeaGeneratorModal = ({ isOpen, onClose, onIdeaSelect }) => {
    // This component is self-contained and correct
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
            setError(err.message instanceof Error ? err.message : 'An unknown error occurred');
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


export default function BlogEditorPage() {
    const router = useRouter();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [postData, setPostData] = useState({
        title: '', content: '', status: 'draft', category_id: 1,
        meta_title: '', meta_description: '', featured_image_url: '',
        author_name: '', read_time_minutes: '',
        featured_image_attribution_text: '', featured_image_attribution_link: ''
    });

    const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
    const [scheduleTime, setScheduleTime] = useState('09:00');
    const [isLoading, setIsLoading] = useState(isEditing);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState({ content: false, meta: false });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditing) {
            const fetchPost = async () => {
                try {
                    const res = await fetch(`/api/admin/blog/${id}`);
                    if (!res.ok) throw new Error('Failed to fetch post data.');
                    const data = await res.json();
                    setPostData(data);
                    if (data.published_at) {
                        const d = new Date(data.published_at);
                        setScheduleDate(d.toISOString().split('T')[0]);
                        const hours = String(d.getHours()).padStart(2, '0');
                        const minutes = String(d.getMinutes()).padStart(2, '0');
                        setScheduleTime(`${hours}:${minutes}`);
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPost();
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPostData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateText = async (type) => {
        if (!postData.title) {
            setError('Please enter a title first to generate content.');
            return;
        }
        const genType = type === 'meta_description' ? 'meta' : 'content';
        setIsGenerating(prev => ({ ...prev, [genType]: true }));
        setError('');
        try {
            const res = await fetch('/api/admin/ai/generate-blog-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: postData.title, type }),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            const key = type === 'meta_description' ? 'meta_description' : 'content';
            setPostData(prev => ({ ...prev, [key]: data.generatedText }));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsGenerating(prev => ({ ...prev, [genType]: false }));
        }
    };

    const handleIdeaSelect = (ideaTitle) => {
        setPostData(prev => ({ ...prev, title: ideaTitle, meta_title: ideaTitle }));
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            let submissionData = { ...postData };
            if (postData.status === 'scheduled' && scheduleDate && scheduleTime) {
                submissionData.published_at = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
            }
            const apiUrl = isEditing ? `/api/admin/blog/${id}` : '/api/admin/blog';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(apiUrl, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || `Failed to ${isEditing ? 'update' : 'create'} post.`);
            }
            router.push('/admin/blog');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <p>Loading editor...</p>;

    return (
        <>
            <IdeaGeneratorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onIdeaSelect={handleIdeaSelect} />
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
                <button type="button" onClick={() => setIsModalOpen(true)} className="inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500">
                    <SparklesIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                    Generate Ideas
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-900">Post Title</label>
                    <input type="text" name="title" id="title" value={postData.title || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                </div>

                {/* --- Author & Read Time --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <div>
                        <label htmlFor="author_name" className="block text-sm font-medium text-gray-700">Author Name</label>
                        <input type="text" name="author_name" id="author_name" value={postData.author_name || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                     <div>
                        <label htmlFor="read_time_minutes" className="block text-sm font-medium text-gray-700">Read Time (minutes)</label>
                        <input type="number" name="read_time_minutes" id="read_time_minutes" value={postData.read_time_minutes || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                </div>

                {/* --- Featured Image --- */}
                <div className="space-y-2 rounded-md border border-gray-200 p-4">
                    <h3 className="text-base font-semibold text-gray-800">Featured Image</h3>
                    {postData.featured_image_url && <Image src={postData.featured_image_url} alt="Featured image preview" width={600} height={400} className="w-full h-auto rounded-md object-cover" />}
                    <label htmlFor="featured_image_url" className="block text-sm font-medium text-gray-700 pt-2">Image URL</label>
                    <input id="featured_image_url" name="featured_image_url" type="text" value={postData.featured_image_url || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm" placeholder="https://example.com/image.jpg"/>
                    <label htmlFor="featured_image_attribution_text" className="block text-sm font-medium text-gray-700 pt-2">Attribution Text</label>
                    <input type="text" name="featured_image_attribution_text" id="featured_image_attribution_text" value={postData.featured_image_attribution_text || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g., Photo by John Doe" />
                    <label htmlFor="featured_image_attribution_link" className="block text-sm font-medium text-gray-700 pt-2">Attribution Link</label>
                    <input type="text" name="featured_image_attribution_link" id="featured_image_attribution_link" value={postData.featured_image_attribution_link || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g., https://unsplash.com/photos/..." />
                </div>

                {/* --- SEO Meta Fields --- */}
                <div className="space-y-4 rounded-md border border-gray-200 p-4">
                     <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold text-gray-800">SEO & Meta</h3>
                        <button type="button" onClick={() => handleGenerateText('meta_description')} disabled={isGenerating.meta} className="text-xs inline-flex items-center rounded-full bg-purple-100 px-2 py-1 font-semibold text-purple-700 hover:bg-purple-200 disabled:opacity-50">
                            <SparklesIcon className="h-4 w-4 mr-1" />{isGenerating.meta ? 'Generating...' : 'Generate Meta Description'}
                        </button>
                     </div>
                     <div>
                        <label htmlFor="meta_title" className="block text-sm font-medium leading-6 text-gray-900">Meta Title</label>
                        <input type="text" name="meta_title" id="meta_title" value={postData.meta_title || ''} onChange={handleChange} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"/>
                    </div>
                     <div>
                        <label htmlFor="meta_description" className="block text-sm font-medium leading-6 text-gray-900">Meta Description</label>
                        <textarea id="meta_description" name="meta_description" rows={3} value={postData.meta_description || ''} onChange={handleChange} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"/>
                    </div>
                </div>
                
                {/* --- Content with AI Button --- */}
                <div>
                    <div className="flex justify-between items-center">
                        <label htmlFor="content" className="block text-sm font-medium leading-6 text-gray-900">Content</label>
                        <button type="button" onClick={() => handleGenerateText('content')} disabled={!postData.title || isGenerating.content} className="text-xs inline-flex items-center rounded-full bg-purple-100 px-2 py-1 font-semibold text-purple-700 hover:bg-purple-200 disabled:opacity-50">
                           <SparklesIcon className="h-4 w-4 mr-1" />{isGenerating.content ? 'Generating...' : 'Generate Post Content'}
                        </button>
                    </div>
                    <textarea id="content" name="content" rows={18} value={postData.content || ''} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300" />
                </div>

                {/* --- Status, Category, and Scheduling --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category</label>
                        <select id="category_id" name="category_id" value={postData.category_id || 1} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                           {blogCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select id="status" name="status" value={postData.status || 'draft'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                           <option value="draft">Draft</option>
                           <option value="published">Publish Immediately</option>
                           <option value="scheduled">Schedule for Later</option>
                        </select>
                    </div>
                </div>

                {postData.status === 'scheduled' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800">Publication Date</h4>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700">Date</label>
                                <input type="date" id="scheduleDate" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required={postData.status === 'scheduled'} />
                            </div>
                            <div>
                                <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-700">Time</label>
                                <input type="time" id="scheduleTime" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required={postData.status === 'scheduled'} />
                            </div>
                        </div>
                    </div>
                )}
                
                {error && <p className="text-sm text-red-600 text-center py-2">{error}</p>}
                
                <div className="flex justify-end gap-x-4 pt-4 border-t">
                    <button type="button" className="text-sm font-semibold leading-6 text-gray-900" onClick={() => router.push('/admin/blog')}>Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300">
                        {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Save Post')}
                    </button>
                </div>
            </form>
        </>
    );
}
