'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditBlogPostPage() {
    const router = useRouter();
    const { id } = useParams(); // Get the post ID from the URL

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('draft');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            async function fetchPost() {
                try {
                    const res = await fetch(`/api/admin/blog/${id}`);
                    if (!res.ok) throw new Error('Failed to fetch post data.');
                    const data = await res.json();
                    setTitle(data.title);
                    setContent(data.content);
                    setStatus(data.status);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            }
            fetchPost();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch(`/api/admin/blog/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, status }),
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || 'Failed to update post.');
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
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Blog Post</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                 <div>
                    <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">Post Title</label>
                    <div className="mt-2">
                        <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium leading-6 text-gray-900">Content</label>
                    <div className="mt-2">
                        <textarea id="content" name="content" rows={12} value={content} onChange={(e) => setContent(e.target.value)} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"/>
                    </div>
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
                    <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
                </div>
            </form>
        </div>
    );
}
