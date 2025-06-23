import db from '../../../../lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET handler to fetch a single published post and recent posts for the sidebar
export async function GET(request, { params }) {
    try {
        const { slug } = params;

        // Fetch the main post
        const [mainPostResult] = await db.query(
            "SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'", 
            [slug]
        );

        if (mainPostResult.length === 0) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }
        const mainPost = mainPostResult[0];

        // Fetch recent posts for the sidebar (including author and date)
        const [sidebarPosts] = await db.query(
            `SELECT id, title, slug, featured_image_url, author_name, published_at 
             FROM blog_posts 
             WHERE status = 'published' AND id != ?
             ORDER BY published_at DESC 
             LIMIT 4`,
            [mainPost.id]
        );

        const responseData = {
            mainPost,
            sidebarPosts
        };
        
        return NextResponse.json(responseData, { status: 200 });
    } catch (error) {
        console.error('Error fetching single post:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
