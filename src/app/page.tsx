'use client';

import { useState, useEffect, ElementType } from 'react'; // Import ElementType
import Link from 'next/link';
import { ShieldCheckIcon, ChartBarIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const featureIcons = {
    feature_1: ChartBarIcon,
    feature_2: SparklesIcon,
    feature_3: ShieldCheckIcon,
};

// Define a type for the CMS content to help TypeScript understand its shape.
interface CmsContent {
    hero_title: string;
    hero_subtitle: string;
    feature_1_title: string;
    feature_1_description: string;
    feature_2_title: string;
    feature_2_description: string;
    feature_3_title: string;
    feature_3_description: string;
}

// Define the props type for the FeatureCard component
interface FeatureCardProps {
    icon: ElementType;
    title?: string;
    description?: string;
}

// Define the props type for the PricingCard component
interface PricingCardProps {
    plan: string;
    price: string;
    description: string;
    features: string[];
    popular?: boolean;
}

export default function HomePage() {
    // Initialize state with the correct type, allowing it to be null initially.
    const [content, setContent] = useState<CmsContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchContent() {
            try {
                const res = await fetch('/api/admin/cms');
                if (!res.ok) throw new Error('Failed to fetch homepage content.');
                const data = await res.json();
                setContent(data);
            } catch (err) {
                if (err instanceof Error) {
                    console.error(err.message);
                } else {
                    console.error('An unknown error occurred', err);
                }
            } finally {
                setIsLoading(false);
            }
        }
        fetchContent();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="bg-white text-gray-800 font-sans">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <a href="#" className="text-2xl font-bold text-gray-900">CortexCart</a>
                    <ul className="flex items-center space-x-6">
                        <li><a href="#features" className="hover:text-blue-600">Features</a></li>
                        <li><a href="#pricing" className="hover:text-blue-600">Pricing</a></li>
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

            {/* Hero Section */}
            <header className="text-center py-20 lg:py-32 bg-gray-50">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                        {content?.hero_title || 'The AI-Powered Analytics Dashboard for E-commerce'}
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                        {content?.hero_subtitle || 'Stop guessing. Start growing. CortexCart gives you the actionable insights you need to boost sales.'}
                    </p>
                    <div className="mt-8">
                        <Link href="/dashboard">
                           <div className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105 cursor-pointer">
                                Get Started for Free <ArrowRightIcon className="h-5 w-5 ml-2" />
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                         <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Why Choose CortexCart?</h2>
                         <p className="mt-4 max-w-2xl mx-auto text-gray-600">Discover the tools that give you a competitive edge and simplify your path to success.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={featureIcons.feature_1}
                            title={content?.feature_1_title}
                            description={content?.feature_1_description}
                        />
                         <FeatureCard 
                            icon={featureIcons.feature_2}
                            title={content?.feature_2_title}
                            description={content?.feature_2_description}
                        />
                         <FeatureCard 
                            icon={featureIcons.feature_3}
                            title={content?.feature_3_title}
                            description={content?.feature_3_description}
                        />
                    </div>
                </div>
            </section>
            
            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-gray-600">
                            Choose the plan that&apos;s right for your business. Start free, no credit card required.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <PricingCard plan="Starter" price="£49" description="For small stores getting started." features={['Up to 5,000 Monthly Visitors', 'Basic Analytics', 'Product Recommendations']} />
                        <PricingCard plan="Growth" price="£99" description="For growing stores looking to maximize conversions." features={['Up to 20,000 Monthly Visitors', 'Advanced Analytics', 'A/B Testing', 'AI Copy Generation']} popular={true} />
                        <PricingCard plan="Business" price="£199" description="For established businesses requiring advanced features." features={['Up to 100,000 Monthly Visitors', 'Custom Algorithms', 'API Access', 'Dedicated Support']} />
                    </div>
                </div>
            </section>

            {/* Footer */}
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

const PricingCard = ({ plan, price, description, features, popular = false }: PricingCardProps) => (
    <div className={`border rounded-lg p-8 flex flex-col ${popular ? 'border-blue-600 border-2' : 'border-gray-200'}`}>
         {popular && <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full self-center mb-4">Most Popular</span>}
        <h3 className="text-2xl font-bold text-center">{plan}</h3>
        <p className="mt-2 text-gray-600 text-center">{description}</p>
        <div className="mt-6 text-center text-gray-900">
            <span className="text-4xl font-extrabold">{price}</span>
            <span className="text-base font-medium text-gray-500">/ month</span>
        </div>
        <ul className="mt-6 space-y-4 text-gray-600">
            {features.map(feature => (
                <li key={feature} className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <div className="mt-8">
             <Link href="/dashboard">
                <div className={`w-full text-center px-6 py-3 font-semibold rounded-lg transition-colors ${popular ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-blue-600 bg-blue-100 hover:bg-blue-200'}`}>
                    Start 14-Day Free Trial
                </div>
            </Link>
        </div>
    </div>
);
