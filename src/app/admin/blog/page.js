'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function BlogManagementPage() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchPosts() {
            setIsLoading(true);
            try {
                const res = await fetch('/api/admin/blog');
                if (!res.ok) throw new Error('Failed to fetch blog posts.');
                const data = await res.json();
                setPosts(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred.');
                }
            } finally {
                setIsLoading(false);
            }
        }
        fetchPosts();
    }, []);

    const StatusBadge = ({ status }) => {
        const baseClasses = "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset";
        const statusClasses = {
            published: "bg-green-50 text-green-700 ring-green-600/20",
            draft: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
        };
        return <span className={`${baseClasses} ${statusClasses[status] || ''}`}>{status}</span>;
    };

    return (
        <div>
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
                    <p className="mt-1 text-sm text-gray-600">Create, edit, and manage all your blog posts.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Link href="/admin/blog/new">
                        <div className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                            Create New Post
                        </div>
                    </Link>
                </div>
            </div>

            {/* Posts Table */}
            <div className="mt-6 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Title</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Updated</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {isLoading ? (
                                        <tr><td colSpan="4" className="py-4 text-center text-gray-500">Loading posts...</td></tr>
                                    ) : error ? (
                                         <tr><td colSpan="4" className="py-4 text-center text-red-500">{error}</td></tr>
                                    ) : posts.length > 0 ? (
                                        posts.map((post) => (
                                            <tr key={post.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{post.title}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <StatusBadge status={post.status} />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(post.updated_at).toLocaleDateString()}</td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <div className="flex justify-end space-x-4">
                                                        <button className="text-blue-600 hover:text-blue-900"><PencilSquareIcon className="h-5 w-5" /></button>
                                                        <button className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                       <tr><td colSpan="4" className="py-4 text-center text-gray-500">No posts found. Create one to get started.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
