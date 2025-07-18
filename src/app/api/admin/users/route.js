import { verifyAdminSession } from '@/lib/admin-auth';
import db from '../../../../../src/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
       const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        // Fetch all users from the 'sites' table. 
        // In the future, you can join this with subscription or other tables.
        const [users] = await db.query(
            `SELECT 
                id, 
                user_email, 
                site_name, 
                site_url, 
                created_at 
             FROM sites 
             ORDER BY created_at DESC`
        );

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
