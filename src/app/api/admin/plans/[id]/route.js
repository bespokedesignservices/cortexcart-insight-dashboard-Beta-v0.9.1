import { verifyAdminSession } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET handler to fetch a single plan by its ID
export async function GET(request, { params }) {
  const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params;
        const [plans] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [id]);
        if (plans.length === 0) {
            return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
        }
        const plan = {
            ...plans[0],
            features: typeof plans[0].features === 'string' ? JSON.parse(plans[0].features) : [],
        };
        return NextResponse.json(plan, { status: 200 });
    } catch (error) {
        console.error('Error fetching plan:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT handler to update a plan
// PUT handler to update a plan
export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params;
        // Corrected: Now accepts stripe_price_id from the request
        const { name, description, price_monthly, stripe_price_id, visitor_limit, features, is_popular } = await request.json();
        
        if (!name || !price_monthly || !visitor_limit || !features) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }
        
        // Corrected: The UPDATE query now includes the stripe_price_id field
        await db.query(
            'UPDATE subscription_plans SET name = ?, description = ?, price_monthly = ?, stripe_price_id = ?, visitor_limit = ?, features = ?, is_popular = ? WHERE id = ?',
            [name, description, price_monthly, stripe_price_id || null, visitor_limit, JSON.stringify(features), is_popular, id]
        );

        return NextResponse.json({ message: 'Plan updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating plan:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
// DELETE handler to remove a plan
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params;
        await db.query('DELETE FROM subscription_plans WHERE id = ?', [id]);
        return NextResponse.json({ message: 'Plan deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting plan:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
