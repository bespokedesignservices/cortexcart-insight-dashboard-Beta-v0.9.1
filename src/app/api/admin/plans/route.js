// src/app/api/admin/plans/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../src/lib/auth';
import db from '../../../../../src/lib/db';
import { NextResponse } from 'next/server';

// GET handler to fetch all subscription plans
export async function GET() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const [plans] = await db.query('SELECT * FROM subscription_plans ORDER BY price_monthly ASC');
        return NextResponse.json(plans, { status: 200 });
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST handler to create a new subscription plan
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { name, description, price_monthly, stripe_price_id, visitor_limit, features, is_popular } = await request.json();
        
        if (!name || !price_monthly || !visitor_limit || !features) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const query = `
            INSERT INTO subscription_plans (name, description, price_monthly, stripe_price_id, visitor_limit, features, is_popular)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
        
        const [result] = await db.query(query, [name, description, price_monthly, stripe_price_id || null, visitor_limit, JSON.stringify(features), is_popular]);
        
        return NextResponse.json({ message: 'Plan created successfully', planId: result.insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating plan:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
