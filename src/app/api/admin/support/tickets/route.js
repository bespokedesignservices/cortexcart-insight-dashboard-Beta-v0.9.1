import { verifyAdminSession } from '@/lib/admin-auth';
import { db } from '@/lib/db'; '../../../../../../lib/db';
import { NextResponse } from 'next/server';

// GET handler to fetch ALL support tickets for the admin panel
export async function GET() {
    const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const [tickets] = await db.query(
            'SELECT * FROM support_tickets ORDER BY updated_at DESC'
        );
        return NextResponse.json(tickets, { status: 200 });
    } catch (error) {
        console.error('Error fetching all support tickets:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
