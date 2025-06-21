'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewBlogPostPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('draft'); // 'draft' or 'published'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

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

            // Redirect to the main blog management page on success
            router.push('/admin/blog');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Blog Post</h1>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                        Post Title
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="title"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400"
                            placeholder="Enter a title for your post"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium leading-6 text-gray-900">
                        Content
                    </label>
                    <div className="mt-2">
                        <textarea
                            id="content"
                            name="content"
                            rows={12}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400"
                            placeholder="Write your blog post content here. You can use Markdown."
                        />
                    </div>
                     <p className="mt-2 text-xs text-gray-500">Markdown is supported for formatting.</p>
                </div>
                
                 <div>
                    <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
                        Status
                    </label>
                    <div className="mt-2">
                       <select 
                           id="status"
                           name="status"
                           value={status}
                           onChange={(e) => setStatus(e.target.value)}
                           className="block w-full max-w-xs rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300"
                        >
                           <option value="draft">Draft</option>
                           <option value="published">Published</option>
                       </select>
                    </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex justify-end gap-x-4">
                    <button type="button" className="text-sm font-semibold leading-6 text-gray-900" onClick={() => router.push('/admin/blog')}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}
