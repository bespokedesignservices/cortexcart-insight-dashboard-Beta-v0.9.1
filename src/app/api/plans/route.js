import db from '../../../../lib/db'; // Adjust path if necessary
import { NextResponse } from 'next/server';

// This line tells Next.js to always fetch this route dynamically (no caching)
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [plans] = await db.query(
            `SELECT name, description, price_monthly, features, is_popular 
             FROM subscription_plans 
             WHERE is_active = TRUE 
             ORDER BY price_monthly ASC`
        );
        
        // Parse the features JSON string into an array for each plan
        const formattedPlans = plans.map(plan => ({
            ...plan,
            features: typeof plan.features === 'string' ? JSON.parse(plan.features) : [],
        }));

        return NextResponse.json(formattedPlans, { status: 200 });
    } catch (error) {
        console.error('Error fetching public subscription plans:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
