'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
//import Image from 'next/image';

// The list of categories for the blog
const blogCategories = [
    'General', 'E-commerce Strategy', 'Data & Analytics', 'AI for E-commerce', 
    'Generative AI', 'Conversion Optimization', 'Product Updates'
];

export default function EditBlogPostPage() {
    const router = useRouter();
    const { id } = useParams();

    const [postData, setPostData] = useState({
        title: '',
        content: '',
        status: 'draft',
        category: 'General',
        meta_title: '',
        meta_description: '',
        featured_image_url: '',
        author_name: '',
        read_time_minutes: '',
        featured_image_attribution_text: '',
        featured_image_attribution_link: ''
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            const fetchPost = async () => {
                setIsLoading(true);
                try {
                    const res = await fetch(`/api/admin/blog/${id}`);
                    if (!res.ok) throw new Error('Failed to fetch post data.');
                    const data = await res.json();
                    setPostData({
                        title: data.title || '',
                        content: data.content || '',
                        status: data.status || 'draft',
                        category: data.category || 'General',
                        meta_title: data.meta_title || '',
                        meta_description: data.meta_description || '',
                        featured_image_url: data.featured_image_url || '',
                        author_name: data.author_name || '',
                        read_time_minutes: data.read_time_minutes || '',
                        featured_image_attribution_text: data.featured_image_attribution_text || '',
                        featured_image_attribution_link: data.featured_image_attribution_link || ''
                    });
                } catch (err) {
                    if(err instanceof Error) setError(err.message);
                    else setError('An unknown error occurred.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPost();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPostData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const res = await fetch(`/api/admin/blog/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            });
            if (!res.ok) {
                 const result = await res.json();
                 throw new Error(result.message || 'Failed to update post.');
            }
            router.push('/admin/blog');
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError('An unknown error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <p>Loading editor...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Blog Post</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                 <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-900">Post Title</label>
                    <input type="text" name="title" id="title" value={postData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                </div>
                 <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select id="category" name="category" value={postData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        {blogCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="content" className="block text-sm font-medium leading-6 text-gray-900">Content</label>
                    <div className="mt-2">
                        <textarea id="content" name="content" rows={18} value={postData.content} onChange={handleChange} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300" />
                    </div>
                </div>
                 {/* ... all other fields ... */}
                <div className="flex justify-end gap-x-4 pt-4">
                    <button type="button" onClick={() => router.push('/admin/blog')} className="text-sm font-semibold text-gray-900">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
