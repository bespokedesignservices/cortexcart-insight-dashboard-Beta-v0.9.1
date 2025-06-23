import db from '../../../lib/db'; // Corrected Path
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET handler to fetch all PUBLISHED blog posts
export async function GET() {
    try {
        const [posts] = await db.query(
            `SELECT id, title, slug, featured_image_url, meta_description, published_at 
             FROM blog_posts 
             WHERE status = 'published' 
             ORDER BY published_at DESC`
        );
        return NextResponse.json(posts, { status: 200 });
    } catch (error) {
        console.error('Error fetching published blog posts:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
