import { verifyAdminSession } from '@/lib/admin-auth';
import db from '../../../../../lib/db';
import { NextResponse } from 'next/server';

// GET handler to fetch all alert banners for the admin panel
export async function GET() {
   
     const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const [alerts] = await db.query(
            'SELECT * FROM alert_banners ORDER BY created_at DESC'
        );
        return NextResponse.json(alerts, { status: 200 });
    } catch (error) {
        console.error('Error fetching alert banners:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST handler to create a new alert banner
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { title, message, type } = await request.json();
        if (!title || !message || !type) {
            return NextResponse.json({ message: 'Title, message, and type are required' }, { status: 400 });
        }

        const query = 'INSERT INTO alert_banners (title, message, type) VALUES (?, ?, ?)';
        const [result] = await db.query(query, [title, message, type]);
        
        return NextResponse.json({ message: 'Alert created successfully', alertId: result.insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating alert:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
