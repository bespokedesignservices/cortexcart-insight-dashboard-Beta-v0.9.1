import { verifyAdminSession } from '@/lib/admin-auth';
import { db } from '@/lib/db'; '../../../../../src/lib/db';
import { NextResponse } from 'next/server';

// GET handler to fetch all blog categories
export async function GET() {
   
     const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const [categories] = await db.query('SELECT id, name FROM blog_categories ORDER BY name ASC');
        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        console.error('Error fetching blog categories:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
