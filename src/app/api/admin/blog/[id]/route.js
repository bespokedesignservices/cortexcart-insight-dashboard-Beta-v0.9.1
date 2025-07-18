import db from '../../../../../../src/lib/db';
import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';

// GET handler to fetch a single post by its ID for the editor
export async function GET(request, { params }) {
const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params; // This is the correct way
        const [posts] = await db.query('SELECT * FROM blog_posts WHERE id = ?', [id]);
        if (posts.length === 0) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }
        return NextResponse.json(posts[0], { status: 200 });
    } catch (error) {
        console.error('Error fetching post:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT handler to update a post
export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params; // This is the correct way
        const postData = await request.json();
        const { 
            title, content, status, 
            category_id, 
            published_at
        } = postData;
        
        if (!title || !status) {
            return NextResponse.json({ message: 'Title and status are required' }, { status: 400 });
        }
        
        let finalPublishedAt = null;
        if (status === 'published') {
            const [existingPost] = await db.query('SELECT published_at, status FROM blog_posts WHERE id = ?', [id]);
            if (existingPost.length > 0 && existingPost[0].status !== 'published') {
                finalPublishedAt = new Date();
            } else {
                finalPublishedAt = existingPost[0]?.published_at;
            }
        } else if (status === 'scheduled' && published_at) {
            finalPublishedAt = new Date(published_at);
        }

        const query = `
            UPDATE blog_posts SET 
                title = ?, content = ?, status = ?, category_id = ?, published_at = ?, 
                meta_title = ?, meta_description = ?, featured_image_url = ?,
                author_name = ?, read_time_minutes = ?, featured_image_attribution_text = ?,
                featured_image_attribution_link = ?
            WHERE id = ?`;

        const queryParams = [
            title, content || null, status, 
            category_id, 
            finalPublishedAt, postData.meta_title || null, 
            postData.meta_description || null, postData.featured_image_url || null, 
            postData.author_name || null, postData.read_time_minutes || null, 
            postData.featured_image_attribution_text || null, 
            postData.featured_image_attribution_link || null,
            id
        ];

        await db.query(query, queryParams);

        return NextResponse.json({ message: 'Post updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

// DELETE handler to delete a post
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    try {
        const { id } = params; // This is the correct way
        await db.query('DELETE FROM blog_posts WHERE id = ?', [id]);
        return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
