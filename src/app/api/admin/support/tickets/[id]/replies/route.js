import { verifyAdminSession } from '@/lib/admin-auth';
import { db } from '@/lib/db'; '../../../../../../../../lib/db';
import { NextResponse } from 'next/server';

// POST a new reply from an admin and create a notification
export async function POST(request, { params }) {
   const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id: ticketId } = params;
    const adminEmail = session.user.email;

    const connection = await db.getConnection();
    try {
        const { message } = await request.json();
        if (!message) {
            return NextResponse.json({ message: 'Message cannot be empty.' }, { status: 400 });
        }
        
        await connection.beginTransaction();

        // First, get the original ticket info to find the user's email
        const [tickets] = await connection.query(
            'SELECT user_email, subject FROM support_tickets WHERE id = ?',
            [ticketId]
        );

        if (tickets.length === 0) {
            throw new Error('Ticket not found.');
        }
        const ticketOwnerEmail = tickets[0].user_email;
        const ticketSubject = tickets[0].subject;

        // Insert the admin's reply
        await connection.query(
            'INSERT INTO ticket_replies (ticket_id, author_email, message) VALUES (?, ?, ?)',
            [ticketId, adminEmail, message]
        );

        // Update the ticket's `updated_at` timestamp and ensure it is 'open'
        await connection.query(
            "UPDATE support_tickets SET status = 'open', updated_at = NOW() WHERE id = ?",
            [ticketId]
        );
        
        // --- THIS IS THE NEW STEP ---
        // Create a notification for the user who owns the ticket
        const notificationMessage = `You have a new reply on your ticket: "${ticketSubject}"`;
        const notificationLink = `/support/${ticketId}`;
        await connection.query(
            'INSERT INTO notifications (user_email, message, link) VALUES (?, ?, ?)',
            [ticketOwnerEmail, notificationMessage, notificationLink]
        );
        
        await connection.commit();

        return NextResponse.json({ message: 'Reply posted successfully.' }, { status: 201 });
    } catch (error) {
        await connection.rollback();
        console.error(`Error posting reply to ticket ${ticketId}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        connection.release();
    }
}
