import { verifyAdminSession } from '@/lib/admin-auth';
import db from '../../../../../src/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        // Fetch essential SEO data from blog posts
        const [posts] = await db.query(
            'SELECT id, title, slug, status, meta_title, meta_description FROM blog_posts ORDER BY updated_at DESC'
        );
        
        return NextResponse.json({ posts }, { status: 200 });
    } catch (error) {
        console.error('Error fetching SEO data:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
