import { verifyAdminSession } from '@/lib/admin-auth';
import { db } from '@/lib/db'; '../../../../../../../lib/db';
import { NextResponse } from 'next/server';

// This file handles fetching a single ticket and updating its status

// GET a single ticket's details
export async function GET(request, { params }) {
    const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    try {
        const connection = await db.getConnection();
        const [tickets] = await connection.query('SELECT * FROM support_tickets WHERE id = ?', [id]);
        if (tickets.length === 0) {
            connection.release();
            return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
        }
        const [replies] = await connection.query('SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC', [id]);
        connection.release();

        return NextResponse.json({ ticket: tickets[0], replies: replies }, { status: 200 });
    } catch (error) {
        console.error(`Error fetching ticket ${id}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT to update a ticket's status
export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params;
        const { status } = await request.json();
        if (!status || !['open', 'closed'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status provided.' }, { status: 400 });
        }

        await db.query('UPDATE support_tickets SET status = ? WHERE id = ?', [status, id]);
        return NextResponse.json({ message: 'Ticket status updated.' }, { status: 200 });
    } catch (error) {
        console.error(`Error updating ticket ${params.id} status:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
