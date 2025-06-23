'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

// The list of categories for the blog
const blogCategories = [
    'General', 'E-commerce Strategy', 'Data & Analytics', 'AI for E-commerce', 
    'Generative AI', 'Conversion Optimization', 'Product Updates'
];

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
    // Add state for all fields, including the new category field
    const [postData, setPostData] = useState({
        title: '',
        content: '',
        status: 'draft',
        category: 'General', // Default category
        metaTitle: '',
        metaDescription: '',
        featuredImageUrl: '',
        author_name: '',
        read_time_minutes: '',
        featured_image_attribution_text: '',
        featured_image_attribution_link: ''
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState({ content: false, meta: false });
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPostData(prev => ({ ...prev, [name]: value }));
    };

    const handleIdeaSelect = (ideaTitle) => {
        setPostData(prev => ({ ...prev, title: ideaTitle, metaTitle: ideaTitle }));
        setIsModalOpen(false);
    };

    const handleGenerateText = async (type) => {
        if (!postData.title) {
            setError('Please enter a title first to generate content.');
            return;
        }
        setIsGenerating(prev => ({ ...prev, [type]: true }));
        setError('');
        try {
            const res = await fetch('/api/admin/ai/generate-blog-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: postData.title, type }),
            });
            if (!res.ok) throw new Error('Failed to generate text.');
            const data = await res.json();
            
            if (type === 'content') {
                setPostData(prev => ({ ...prev, content: data.generatedText }));
            } else if (type === 'meta_description') {
                setPostData(prev => ({ ...prev, metaDescription: data.generatedText }));
            }
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        } finally {
            setIsGenerating(prev => ({ ...prev, [type]: false }));
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const submissionData = { 
                ...postData,
                meta_title: postData.metaTitle,
                meta_description: postData.metaDescription,
                featured_image_url: postData.featuredImageUrl
             };

            const res = await fetch('/api/admin/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || 'Failed to create post.');
            }
            router.push('/admin/blog');
        } catch (err) {
             if (err instanceof Error) setError(err.message);
             else setError('An unknown error occurred.');
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
                    Generate Ideas
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">Post Title</label>
                    <input type="text" name="title" id="title" value={postData.title} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <div>
                        <label htmlFor="author_name" className="block text-sm font-medium text-gray-700">Author Name</label>
                        <input type="text" name="author_name" id="author_name" value={postData.author_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                     <div>
                        <label htmlFor="read_time_minutes" className="block text-sm font-medium text-gray-700">Read Time (minutes)</label>
                        <input type="number" name="read_time_minutes" id="read_time_minutes" value={postData.read_time_minutes} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select id="category" name="category" value={postData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        {blogCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                 <div className="space-y-2 rounded-md border border-gray-200 p-4">
                    <h3 className="text-base font-semibold text-gray-800">Featured Image</h3>
                    {postData.featuredImageUrl && <Image src={postData.featuredImageUrl} alt="Featured image preview" width={600} height={400} className="w-full h-auto rounded-md object-cover" />}
                    
                    <label htmlFor="featuredImageUrl" className="block text-sm font-medium text-gray-700 pt-2">Image URL</label>
                    <input id="featuredImageUrl" name="featuredImageUrl" type="text" value={postData.featuredImageUrl} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm" placeholder="https://example.com/image.jpg"/>
                    
                    <label htmlFor="featured_image_attribution_text" className="block text-sm font-medium text-gray-700 pt-2">Attribution Text</label>
                    <input type="text" name="featured_image_attribution_text" id="featured_image_attribution_text" value={postData.featured_image_attribution_text} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g., Photo by John Doe" />

                    <label htmlFor="featured_image_attribution_link" className="block text-sm font-medium text-gray-700 pt-2">Attribution Link</label>
                    <input type="text" name="featured_image_attribution_link" id="featured_image_attribution_link" value={postData.featured_image_attribution_link} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g., https://unsplash.com/photos/..." />
                </div>
                
                <div className="space-y-4 rounded-md border border-gray-200 p-4">
                     <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold text-gray-800">SEO Settings</h3>
                        <button type="button" onClick={() => handleGenerateText('meta_description')} disabled={isGenerating.meta} className="text-xs inline-flex items-center rounded-full bg-purple-100 px-2 py-1 font-semibold text-purple-700 hover:bg-purple-200 disabled:opacity-50">
                            <SparklesIcon className="h-4 w-4 mr-1" />{isGenerating.meta ? 'Generating...' : 'Generate Meta Description'}
                        </button>
                     </div>
                     <div>
                        <label htmlFor="metaTitle" className="block text-sm font-medium leading-6 text-gray-900">Meta Title</label>
                        <input type="text" name="metaTitle" id="metaTitle" value={postData.metaTitle} onChange={handleChange} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300" placeholder="A concise title for search engines (50-60 characters)"/>
                    </div>
                     <div>
                        <label htmlFor="metaDescription" className="block text-sm font-medium leading-6 text-gray-900">Meta Description</label>
                        <textarea id="metaDescription" name="metaDescription" rows={3} value={postData.metaDescription} onChange={handleChange} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300" placeholder="A brief summary for search results (150-160 characters)"/>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center">
                        <label htmlFor="content" className="block text-sm font-medium leading-6 text-gray-900">Content</label>
                        <button type="button" onClick={() => handleGenerateText('content')} disabled={isGenerating.content} className="text-xs inline-flex items-center rounded-full bg-purple-100 px-2 py-1 font-semibold text-purple-700 hover:bg-purple-200 disabled:opacity-50">
                           <SparklesIcon className="h-4 w-4 mr-1" />{isGenerating.content ? 'Generating...' : 'Generate Post Content'}
                        </button>
                    </div>
                    <div className="mt-2">
                        <textarea id="content" name="content" rows={18} value={postData.content} onChange={handleChange} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300" />
                    </div>
                </div>
                
                <div>
                    <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">Status</label>
                    <select id="status" name="status" value={postData.status} onChange={handleChange} className="mt-2 block w-full max-w-xs rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300">
                       <option value="draft">Draft</option>
                       <option value="published">Published</option>
                    </select>
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
