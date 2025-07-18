'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { marked } from 'marked';
import Link from 'next/link';
import Image from 'next/image';

const PublicLayout = ({ children }) => (
    <div className="bg-white">
        <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <Link href="/"><div className="text-2xl font-bold text-gray-900 cursor-pointer">CortexCart</div></Link>
                <ul className="flex items-center space-x-6">
                    <li><Link href="/#features"><span className="hover:text-blue-600 cursor-pointer">Features</span></Link></li>
                    <li><Link href="/blog"><span className="text-blue-600 font-semibold cursor-pointer">Blog</span></Link></li>
                    <li>
                        <Link href="/dashboard">
                            <div className="px-6 py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors cursor-pointer">
                                Start Free Trial
                            </div>
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-gray-800 text-white py-8">
            <div className="container mx-auto px-6 text-center">
                <p>&copy; {new Date().getFullYear()} CortexCart. All rights reserved.</p>
            </div>
        </footer>
    </div>
);


export default function BlogPostPage() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            async function fetchPost() {
                try {
                    const res = await fetch(`/api/blog/${slug}`);
                    if (!res.ok) throw new Error('Post not found');
                    const data = await res.json();
                    setPost(data);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            }
            fetchPost();
        }
    }, [slug]);

    if (isLoading) {
        return <PublicLayout><p className="text-center p-12">Loading post...</p></PublicLayout>;
    }
    
    if (!post) {
        return <PublicLayout><p className="text-center p-12">404 - Post Not Found</p></PublicLayout>;
    }

    const getMarkdownText = () => {
        const rawMarkup = marked(post.content || '');
        return { __html: rawMarkup };
    };

    return (
        <PublicLayout>
            <div className="bg-white px-6 py-12 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <p className="text-base font-semibold leading-7 text-blue-600">
                        Published on {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{post.title}</h1>
                    {post.featured_image_url && (
                        <div className="mt-8 relative aspect-video w-full">
                           <Image src={post.featured_image_url} alt={post.title} layout="fill" className="rounded-xl object-cover" />
                        </div>
                    )}
                    <div 
                        className="prose lg:prose-xl mt-8 mx-auto"
                        dangerouslySetInnerHTML={getMarkdownText()}
                    />
                </div>
            </div>
        </PublicLayout>
    );
}
