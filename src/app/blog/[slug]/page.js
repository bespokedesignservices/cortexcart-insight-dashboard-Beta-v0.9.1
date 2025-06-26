'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { marked } from 'marked';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import DisqusComments from '../../components/DisqusComments'; // Import the new component

const PublicLayout = ({ children }) => (
    <div className="bg-gray-50">
        <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
 {/* This is the new logo image, wrapped in a link to the homepage */}
                    <Link href="/" passHref>
                      <Image
                        src="/cortexcart-com-logo-home.png" // This points to /public/logo.png
                        alt="CortexCart Logo"
                        width={150} // Adjust this to your logo's width
                        height={40}  // Adjust this to your logo's height
                        priority // Helps load the logo faster on the homepage
                      />
                    </Link>
                <ul className="flex items-center space-x-6">
                    <li><Link href="/#features"><span className="hover:text-blue-600 cursor-pointer">Features</span></Link></li>
		   <li><Link href="/#pricing"><span className="hover:texxt-blue-600 cursor-pointer">Pricing</span></Link></li>
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

const SidebarPostCard = ({ post }) => (
    <Link href={`/blog/${post.slug}`}>
        <div className="flex space-x-4 group cursor-pointer">
            <div className="flex-shrink-0">
                <Image src={post.featured_image_url || 'https://placehold.co/100x100/E2E8F0/4A5568?text=Cortex'} alt={post.title} width={64} height={64} className="rounded-lg object-cover" />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{post.title}</h4>
                <div className="mt-1 flex items-center text-xs text-gray-500">
                    {post.author_name && <span>{post.author_name}</span>}
                    {post.author_name && post.published_at && <span className="mx-1.5">&middot;</span>}
                    {post.published_at && (
                        <time dateTime={post.published_at}>
                            {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </time>
                    )}
                </div>
            </div>
        </div>
    </Link>
);

const BlogCategoryNav = () => {
    const categories = [
        'E-commerce Strategy', 
        'Data & Analytics', 
        'AI for E-commerce', 
        'Generative AI', 
        'Conversion Optimization', 
        'Product Updates'
    ];
    
    // Corrected: This function now creates URL-friendly slugs
    // that match the API's logic.
    const toSlug = (name) => name.toLowerCase().replace(/ & /g, '-and-').replace(/ /g, '-');

    return (
        <div className="border-b border-gray-200 bg-white">
            <nav className="container mx-auto -mb-px flex space-x-8 overflow-x-auto px-6" aria-label="Categories">
                {categories.map((category) => (
                <Link key={category} href={`/blog/category/${toSlug(category)}`}>
                    <div className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium cursor-pointer">
                        {category}
                    </div>
                </Link>
                ))}
            </nav>
        </div>
    );
};

export default function BlogPostPage() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [sidebarPosts, setSidebarPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            async function fetchPostData() {
                try {
                    const res = await fetch(`/api/blog/${slug}`);
                    if (!res.ok) throw new Error('Post not found');
                    const data = await res.json();
                    setPost(data.mainPost);
                    setSidebarPosts(data.sidebarPosts);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            }
            fetchPostData();
        }
    }, [slug]);

    if (isLoading) {
        return <PublicLayout><div className="text-center p-24">Loading post...</div></PublicLayout>;
    }
    
    if (!post) {
        return <PublicLayout><div className="text-center p-24">404 - Post Not Found</div></PublicLayout>;
    }

    const getMarkdownText = () => {
        const rawMarkup = marked.parse(post.content || '', { breaks: true });
        return { __html: rawMarkup };
    };

    const recentPosts = sidebarPosts.slice(0, 2);
    const relatedPosts = sidebarPosts.slice(2, 4);

    return (
        <PublicLayout>
            <BlogCategoryNav />
            <div className="container mx-auto px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8">

                    {/* Left Sidebar: Recent Articles */}
                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24 space-y-8">
                            {recentPosts.length > 0 && (
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Articles</h3>
                                    <div className="space-y-4">
                                        {recentPosts.map(p => <SidebarPostCard key={p.id} post={p} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Content Column */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                             <p className="text-base font-semibold leading-7 text-blue-600">
                                {post.category || 'General'}
                            </p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{post.title}</h1>
                            
                            <div className="mt-6 flex items-center space-x-4 text-sm text-gray-500">
                                {post.author_name && (<div className="flex items-center"><UserCircleIcon className="h-5 w-5 mr-1.5" /><span>{post.author_name}</span></div>)}
                                {post.read_time_minutes && (<div className="flex items-center"><ClockIcon className="h-5 w-5 mr-1.5" /><span>{post.read_time_minutes} min read</span></div>)}
                            </div>

                            {post.featured_image_url && (
                                <figure className="mt-8">
                                    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                                       <Image src={post.featured_image_url} alt={post.title} fill className="rounded-xl object-cover" priority />
                                    </div>
                                    {post.featured_image_attribution_text && (
                                        <figcaption className="mt-2 text-xs text-center text-gray-400">
                                            Image credit: <a href={post.featured_image_attribution_link || '#'} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">{post.featured_image_attribution_text}</a>
                                        </figcaption>
                                    )}
                                </figure>
                            )}
                            
                            <div className="blog-content mt-8" dangerouslySetInnerHTML={getMarkdownText()} />
                            
                            {/* Disqus Comment Section */}
                            <div className="border-t mt-12 pt-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Comments</h2>
                                <DisqusComments post={post} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Sidebar: Related Articles */}
                    <aside className="lg:col-span-1 mt-12 lg:mt-0">
                         <div className="sticky top-24 space-y-8">
                             {relatedPosts.length > 0 && (
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Related Articles</h3>
                                    <div className="space-y-4">
                                        {relatedPosts.map(p => <SidebarPostCard key={p.id} post={p} />)}
                                    </div>
                                 </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>

            <style jsx global>{`
                .blog-content {
                    color: #374151;
                }
                .blog-content h1, .blog-content h2, .blog-content h3 {
                    font-weight: 700;
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                    color: #111827;
                }
                .blog-content h1 { font-size: 2.25rem; }
                .blog-content h2 { font-size: 1.875rem; }
                .blog-content h3 { font-size: 1.5rem; }
                .blog-content p {
                    line-height: 1.75;
                    margin-bottom: 1.25em;
                }
                .blog-content a {
                    color: #2563eb;
                    text-decoration: underline;
                }
                .blog-content ul, .blog-content ol {
                    padding-left: 2em;
                    margin-bottom: 1.25em;
                }
                .blog-content li {
                    margin-bottom: 0.5em;
                }
                .blog-content blockquote {
                    border-left: 4px solid #d1d5db;
                    padding-left: 1em;
                    margin-left: 0;
                    font-style: italic;
                    color: #4b5563;
                }
                .blog-content code {
                    background-color: #f3f4f6;
                    padding: 0.2em 0.4em;
                    margin: 0 0.2em;
                    border-radius: 0.25rem;
                    font-size: 0.9em;
                }
                .blog-content pre {
                    background-color: #1f2937;
                    color: #f9fafb;
                    padding: 1em;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                    white-space: pre;
                }
                .blog-content pre code {
                    background-color: transparent;
                    padding: 0;
                    margin: 0;
                }
/* --- ADD THIS NEW RULE FOR IMAGES --- */
    .blog-content img {
        max-width: 100%;
        height: auto;
        border-radius: 0.75rem; /* 12px */
        margin-top: 2em;
        margin-bottom: 2em;
    }
            `}</style>
        </PublicLayout>
    );
}
