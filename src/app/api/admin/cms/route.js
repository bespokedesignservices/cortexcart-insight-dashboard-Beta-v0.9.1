import { verifyAdminSession } from '@/lib/admin-auth';
import db from '../../../../../src/lib/db';
import { NextResponse } from 'next/server';

// GET handler to fetch all CMS content
export async function GET() {
   const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const [rows] = await db.query('SELECT content_key, content_value FROM cms_content');
        // Convert the array of objects to a single key-value object
        const content = rows.reduce((acc, row) => {
            acc[row.content_key] = row.content_value;
            return acc;
        }, {});
        return NextResponse.json(content, { status: 200 });
    } catch (error) {
        console.error('Error fetching CMS content:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST handler to update a specific piece of CMS content
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { key, value } = await request.json();
        if (!key || value === undefined) {
            return NextResponse.json({ message: 'Key and value are required' }, { status: 400 });
        }

        const query = `
            INSERT INTO cms_content (content_key, content_value)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);
        `;
        await db.query(query, [key, value]);
        
        return NextResponse.json({ message: 'Content updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating CMS content:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
