import { verifyAdminSession } from '@/lib/admin-auth';
import db from '@/lib/db';
import { NextResponse } from 'next/server';

// GET handler to fetch all FAQs
export async function GET() {
    // This route is public for the main site, so no session check is needed here.
    try {
        const [faqs] = await db.query(
            'SELECT * FROM faqs ORDER BY category, id'
        );
        return NextResponse.json(faqs, { status: 200 });
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST handler to create a new FAQ
export async function POST(request) {
   const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { question, answer, category } = await request.json();
        if (!question || !answer || !category) {
            return NextResponse.json({ message: 'Question, answer, and category are required' }, { status: 400 });
        }

        const query = 'INSERT INTO faqs (question, answer, category) VALUES (?, ?, ?)';
        const [result] = await db.query(query, [question, answer, category]);
        
        return NextResponse.json({ message: 'FAQ created successfully', faqId: result.insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating FAQ:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
