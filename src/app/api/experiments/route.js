// src/app/api/admin/experiments/route.js

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../src/lib/auth';
import db from '../../../../src/lib/db';
import { NextResponse } from 'next/server';

// GET handler (remains the same)
export async function GET() {
    // ... code from previous step ...
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const [experiments] = await db.query(
            'SELECT * FROM ab_experiments WHERE user_email = ? ORDER BY created_at DESC',
            [session.user.email]
        );
        return NextResponse.json(experiments, { status: 200 });
    } catch (error) {
        console.error('Error fetching experiments:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST handler (updated to include target_url)
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const connection = await db.getConnection();
    try {
        const { name, description, target_selector, target_url, control_content, variant_content } = await request.json();
        if (!name || !target_selector || !target_url || !control_content || !variant_content) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }
        
        await connection.beginTransaction();

        const [expResult] = await connection.query(
            'INSERT INTO ab_experiments (user_email, name, description, target_selector, target_url) VALUES (?, ?, ?, ?, ?)',
            [session.user.email, name, description, target_selector, target_url]
        );
        const experimentId = expResult.insertId;

        await connection.query(
            'INSERT INTO ab_variants (experiment_id, name, content, is_control) VALUES (?, ?, ?, ?)',
            [experimentId, 'Control', control_content, true]
        );
        await connection.query(
            'INSERT INTO ab_variants (experiment_id, name, content) VALUES (?, ?, ?)',
            [experimentId, 'Variant', variant_content]
        );

        await connection.commit();
        return NextResponse.json({ message: 'Experiment created successfully', experimentId }, { status: 201 });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating experiment:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        connection.release();
    }
}
