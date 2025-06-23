import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../../src/lib/auth';
import db from '../../../../../../src/lib/db';
import { NextResponse } from 'next/server';

// GET handler to fetch a single post by its ID
export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params;
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
        const { id } = params;
        const { 
            title, content, status, category, meta_title, meta_description, featured_image_url,
            author_name, read_time_minutes, featured_image_attribution_text, featured_image_attribution_link
        } = await request.json();
        
        if (!title || !status) {
            return NextResponse.json({ message: 'Title and status are required' }, { status: 400 });
        }
        
        const publishedAt = status === 'published' ? new Date() : null;

        await db.query(
            `UPDATE blog_posts SET 
                title = ?, content = ?, status = ?, category = ?, published_at = ?, 
                meta_title = ?, meta_description = ?, featured_image_url = ?,
                author_name = ?, read_time_minutes = ?, featured_image_attribution_text = ?,
                featured_image_attribution_link = ?
             WHERE id = ?`,
            [
                title, content || null, status, category || 'General', publishedAt, meta_title || null, 
                meta_description || null, featured_image_url || null, author_name || null, 
                read_time_minutes || null, featured_image_attribution_text || null, 
                featured_image_attribution_link || null,
                id
            ]
        );

        return NextResponse.json({ message: 'Post updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE handler to delete a post
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    try {
        const { id } = params;
        await db.query('DELETE FROM blog_posts WHERE id = ?', [id]);
        return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
