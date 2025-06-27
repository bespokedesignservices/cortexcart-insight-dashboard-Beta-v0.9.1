import HomePageClient from './HomePageClient'; // Import the new client component

interface Plan {
    name: string;
    description: string;
    price_monthly: string;
    features: string[];
    is_popular: boolean;
}
// -----------------------------------------


// This async function fetches data on the server
async function getPageData() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        const [cmsRes, blogRes, plansRes] = await Promise.all([
            fetch(`${apiUrl}/api/content/homepage`, { next: { revalidate: 3600 } }),
            fetch(`${apiUrl}/api/blog`, { next: { revalidate: 3600 } }),
            fetch(`${apiUrl}/api/plans`, { next: { revalidate: 3600 } }) 
        ]);

        const content = cmsRes.ok ? await cmsRes.json() : {};
        const blogPosts = blogRes.ok ? await blogRes.json() : [];
        const planData = plansRes.ok ? await plansRes.json() : [];

        // Now, TypeScript knows what a 'Plan' is
        const formattedPlans = planData.map((plan: Plan) => ({
            ...plan,
            features: Array.isArray(plan.features) ? plan.features : []
        }));

        return {
            content,
            recentPost: blogPosts.length > 0 ? blogPosts[0] : null,
            plans: formattedPlans,
        };
    } catch (error) {
        console.error("Failed to fetch page data:", error);
        return { content: {}, recentPost: null, plans: [] };
    }
}


// This function generates metadata on the server
export async function generateMetadata() {
    const data = await getPageData();
    return {
        title: data.content.hero_title || 'CortexCart | AI-Powered E-commerce Analytics',
        description: data.content.hero_subtitle || 'Stop guessing. Start growing. CortexCart gives you the actionable insights you need to boost sales.',
    };
}

// This is the main page component. It's now a Server Component.
export default async function HomePage() {
    const pageData = await getPageData();
    
    // We pass the fetched data down to the Client Component as props
    return <HomePageClient {...pageData} />;
}
