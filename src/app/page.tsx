'use client';

import { useState, useEffect, ElementType } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// The 'Metadata' type is no longer needed here since we removed the function
import { 
    ShieldCheckIcon, ChartBarIcon, SparklesIcon, ArrowRightIcon, 
    PuzzlePieceIcon, TableCellsIcon, BeakerIcon 
} from '@heroicons/react/24/outline';

const featureIcons = {
    feature_1: ChartBarIcon,
    feature_2: SparklesIcon,
    feature_3: ShieldCheckIcon,
    feature_4: PuzzlePieceIcon,
    feature_5: TableCellsIcon,
    feature_6: BeakerIcon,
};

interface CmsContent {
    hero_title: string;
    hero_subtitle: string;
    feature_1_title: string;
    feature_1_description: string;
    feature_2_title: string;
    feature_2_description: string;
    feature_3_title: string;
    feature_3_description: string;
    feature_4_title: string;
    feature_4_description: string;
    feature_5_title: string;
    feature_5_description: string;
    feature_6_title: string;
    feature_6_description: string;
}

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    meta_description: string;
    featured_image_url: string;
    published_at: string;
}

interface Plan {
    name: string;
    description: string;
    price_monthly: string;
    features: string[];
    is_popular: boolean;
}

interface FeatureCardProps {
    icon: ElementType;
    title?: string;
    description?: string;
}

interface PricingCardProps {
    plan: Plan;
}

export default function HomePage() {
    const [content, setContent] = useState<Partial<CmsContent>>({});
    const [plans, setPlans] = useState<Plan[]>([]);
    const [recentPost, setRecentPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch all data in parallel
                const [cmsRes, blogRes, plansRes] = await Promise.all([
                    fetch('/api/content/homepage'),
                    fetch('/api/blog'),
                    fetch('/api/plans') 
                ]);

                if (cmsRes.ok) setContent(await cmsRes.json());
                if (blogRes.ok) {
                    const blogPosts = await blogRes.json();
                    if (blogPosts.length > 0) setRecentPost(blogPosts[0]);
                }
                if (plansRes.ok) setPlans(await plansRes.json());

            } catch (err) {
                console.error("Failed to fetch page data:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="bg-white text-gray-800 font-sans">
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
                        <li><a href="#features" className="hover:text-blue-600">Features</a></li>
                        <li><a href="#pricing" className="hover:text-blue-600">Pricing</a></li>
                        <li>
                            <Link href="/blog">
                                <span className="hover:text-blue-600 cursor-pointer">Blog</span>
                            </Link>
                        </li>
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

            <header className="text-center py-20 lg:py-32 bg-blue-700">
                 <div className="container mx-auto px-6">
                    <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight">
                        {content?.hero_title || 'The AI-Powered Analytics Dashboard for E-commerce'}
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-200">
                        {content?.hero_subtitle || 'Stop guessing. Start growing. CortexCart gives you the actionable insights you need to boost sales.'}
                    </p>
                    <div className="mt-8">
                        <Link href="/dashboard">
                           <div className="inline-flex items-center px-8 py-4 text-lg font-semibold text-blue-700 bg-white rounded-full hover:bg-gray-200 transition-transform transform hover:scale-105 cursor-pointer">
                                Get Started for Free <ArrowRightIcon className="h-5 w-5 ml-2" />
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            <section id="features" className="py-20">
                 <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                         <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Why Choose CortexCart?</h2>
                         <p className="mt-4 max-w-2xl mx-auto text-gray-600">Discover the tools that give you a competitive edge and simplify your path to success.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard icon={featureIcons.feature_1} title={content?.feature_1_title} description={content?.feature_1_description} />
                        <FeatureCard icon={featureIcons.feature_2} title={content?.feature_2_title} description={content?.feature_2_description} />
                        <FeatureCard icon={featureIcons.feature_3} title={content?.feature_3_title} description={content?.feature_3_description} />
                        <FeatureCard icon={featureIcons.feature_4} title={content?.feature_4_title} description={content?.feature_4_description} />
                        <FeatureCard icon={featureIcons.feature_5} title={content?.feature_5_title} description={content?.feature_5_description} />
                        <FeatureCard icon={featureIcons.feature_6} title={content?.feature_6_title} description={content?.feature_6_description} />
                    </div>
                </div>
            </section>
            
            {recentPost && (
                 <section id="from-the-blog" className="py-20 bg-gray-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">From the Blog</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-gray-600">Check out our latest insights and tutorials.</p>
                        </div>
                        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 rounded-lg shadow-xl">
                            <div className="w-full">
  <Image 
          src={recentPost.featured_image_url || 'https://placehold.co/600x400/E2E8F0/4A5568?text=CortexCart'} 
          alt={recentPost.title}
          fill
          className="object-cover"
        />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    {new Date(recentPost.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                                <h3 className="mt-2 text-2xl font-bold text-gray-900">{recentPost.title}</h3>
                                <p className="mt-4 text-gray-600">{recentPost.meta_description}</p>
                                <Link href={`/blog/${recentPost.slug}`}>
                                    <div className="mt-6 inline-flex items-center font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                                        Read more <ArrowRightIcon className="h-4 w-4 ml-2" />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}
            
            <section id="pricing" className="py-20 bg-gray-50">
                 <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-gray-600">
                            Choose the plan that&apos;s right for your business. Start free, no credit card required.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {plans.map(plan => <PricingCard key={plan.name} plan={plan} />)}
                    </div>
                </div>
            </section>

            <footer className="bg-gray-800 text-white py-8">
                 <div className="container mx-auto px-6 text-center">
                    <p>&copy; {new Date().getFullYear()} CortexCart. All rights reserved.</p>
                    <div className="mt-4">
                        <Link href="/privacy"><span className="px-3 hover:underline cursor-pointer">Privacy Policy</span></Link>
                        <span className="text-gray-500">|</span>
                        <Link href="/terms"><span className="px-3 hover:underline cursor-pointer">Terms of Service</span></Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
   <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="inline-block p-4 bg-blue-100 rounded-full">
            <Icon className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-gray-600">{description}</p>
    </div>
);

const PricingCard = ({ plan }: PricingCardProps) => {
    const isCustom = plan.name.toLowerCase() === 'custom';

    return (
        <div className={`border rounded-lg p-8 flex flex-col ${plan.is_popular ? 'border-blue-600 border-2' : 'border-gray-200'}`}>
             {plan.is_popular ? <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full self-center mb-4">Most Popular</span> : null}
            <h3 className="text-2xl font-bold text-center">{plan.name}</h3>
            <p className="mt-2 text-gray-600 text-center h-16">{plan.description}</p>
            <div className="mt-6 text-center text-gray-900">
                {isCustom ? (
                    <span className="text-4xl font-extrabold">Custom</span>
                ) : (
                    <>
                        <span className="text-4xl font-extrabold">£{plan.price_monthly}</span>
                        <span className="text-base font-medium text-gray-500">/ month</span>
                    </>
                )}
            </div>
            <ul className="mt-6 space-y-4 text-gray-600 flex-grow">
                {plan.features.map(feature => (
                    <li key={feature} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <div className="mt-8">
                 {isCustom ? (
                     <Link href="/contact">
                        <div className={`w-full text-center px-6 py-3 font-semibold rounded-lg transition-colors text-white bg-gray-700 hover:bg-gray-800`}>
                            Contact Us
                        </div>
                    </Link>
                 ) : (
                    <Link href="/dashboard">
                        <div className={`w-full text-center px-6 py-3 font-semibold rounded-lg transition-colors ${plan.is_popular ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-blue-600 bg-blue-100 hover:bg-blue-200'}`}>
                            Start 14-Day Free Trial
                        </div>
                    </Link>
                 )}
            </div>
        </div>
    );
};
