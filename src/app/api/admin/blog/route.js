import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../src/lib/auth';
import db from '../../../../../src/lib/db';
import { NextResponse } from 'next/server';

// Helper function to generate a URL-friendly slug
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
};

// GET handler to fetch all blog posts
export async function GET() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const [posts] = await db.query('SELECT id, title, slug, status, author_email, updated_at FROM blog_posts ORDER BY updated_at DESC');
        return NextResponse.json(posts, { status: 200 });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST handler to create a new blog post
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        // Updated to provide default null values for all optional fields
        const { 
            title, 
            content, 
            status, 
            meta_title = null, 
            meta_description = null, 
            featured_image_url = null 
        } = await request.json();
        
        if (!title) {
            return NextResponse.json({ message: 'Title is required' }, { status: 400 });
        }

        const slug = generateSlug(title);
        const authorEmail = session.user.email;
        const publishedAt = status === 'published' ? new Date() : null;

        const query = `
            INSERT INTO blog_posts (title, slug, content, status, author_email, published_at, meta_title, meta_description, featured_image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        
        // Ensure empty strings are saved as NULL
        const params = [
            title, slug, content || null, status, authorEmail, publishedAt, 
            meta_title || null, meta_description || null, featured_image_url || null
        ];

        const [result] = await db.query(query, params);
        
        return NextResponse.json({ message: 'Blog post created successfully', postId: result.insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating blog post:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
