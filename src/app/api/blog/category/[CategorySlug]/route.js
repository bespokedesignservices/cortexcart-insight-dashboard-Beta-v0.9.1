import db from '../../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { categorySlug } = params;

        // This query is more robust. It applies the same slugification logic 
        // to the database column before comparing, avoiding case-sensitivity issues
        // with acronyms like "AI".
        const [posts] = await db.query(
            `SELECT id, title, slug, featured_image_url, meta_description, published_at, category 
             FROM blog_posts 
             WHERE 
                 status = 'published' AND 
                 REPLACE(LOWER(category), ' & ', '-and-') = ?
             ORDER BY published_at DESC`,
            [categorySlug]
        );
        
        return NextResponse.json(posts, { status: 200 });

    } catch (error) {
        console.error('Error fetching posts by category:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
