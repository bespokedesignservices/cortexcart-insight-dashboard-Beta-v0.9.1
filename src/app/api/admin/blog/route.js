import { verifyAdminSession } from '@/lib/admin-auth';
import { db } from '@/lib/db'; '../../../../../src/lib/db';
import { NextResponse } from 'next/server';

const generateSlug = (title) => {
    return title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

// GET handler (This part is correct and remains the same)
export async function GET() {
   const adminSession = await verifyAdminSession();
    if (!adminSession) {
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
        const postData = await request.json();
        const { 
            title, content, status, category_id, published_at,
            meta_title, meta_description, featured_image_url, author_name,
            read_time_minutes, featured_image_attribution_text, featured_image_attribution_link
        } = postData;

        if (!title || !status) {
            return NextResponse.json({ message: 'Title and status are required' }, { status: 400 });
        }

        const slug = generateSlug(title);
        const authorEmail = session.user.email;

        let finalPublishedAt = null;
        if (status === 'published') {
            finalPublishedAt = new Date();
        } else if (status === 'scheduled' && published_at) {
            // This is the key fix: ensures the received date is treated as a valid Date object
            finalPublishedAt = new Date(published_at);
        }

        const query = `
            INSERT INTO blog_posts (
                title, slug, content, status, author_email, published_at, category_id,
                meta_title, meta_description, featured_image_url, author_name, 
                read_time_minutes, featured_image_attribution_text, featured_image_attribution_link
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        
        const params = [
            title, slug, content || null, status, authorEmail, finalPublishedAt, category_id || 1,
            meta_title || null, meta_description || null, 
            featured_image_url || null, author_name || null, 
            read_time_minutes || null, featured_image_attribution_text || null, 
            featured_image_attribution_link || null
        ];

        await db.query(query, params);
        
        return NextResponse.json({ message: 'Blog post created successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error creating blog post:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
