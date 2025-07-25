import { verifyAdminSession } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// PUT handler to update a specific FAQ
export async function PUT(request, { params }) {
   const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params;
        const { question, answer, category } = await request.json();
        
        if (!question || !answer || !category) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }
        
        await db.query(
            'UPDATE faqs SET question = ?, answer = ?, category = ? WHERE id = ?',
            [question, answer, category, id]
        );

        return NextResponse.json({ message: 'FAQ updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating FAQ:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE handler to remove an FAQ
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params;
        await db.query('DELETE FROM faqs WHERE id = ?', [id]);
        return NextResponse.json({ message: 'FAQ deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
