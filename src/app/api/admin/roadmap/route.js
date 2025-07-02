// src/app/api/admin/roadmap/route.js

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../src/lib/auth';
import db from '../../../../../src/lib/db';
import { NextResponse } from 'next/server';

// GET handler to fetch all roadmap features
export async function GET() {
    // This route can be public, so no session check is needed here.
    try {
        const [features] = await db.query(
            'SELECT * FROM roadmap_features ORDER BY status, sort_order ASC'
        );
        return NextResponse.json(features, { status: 200 });
    } catch (error) {
        console.error('Error fetching roadmap features:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST handler to create a new feature
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { name, description, status } = await request.json();
        if (!name || !status) {
            return NextResponse.json({ message: 'Name and status are required' }, { status: 400 });
        }

        const query = `
            INSERT INTO roadmap_features (name, description, status)
            VALUES (?, ?, ?);
        `;
        const [result] = await db.query(query, [name, description, status]);
        
        return NextResponse.json({ message: 'Feature created successfully', featureId: result.insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating feature:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
