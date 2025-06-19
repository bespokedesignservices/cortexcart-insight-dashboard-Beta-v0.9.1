import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    const userEmail = session.user.email;

    try {
        const [notifications] = await db.query(
            'SELECT * FROM notifications WHERE user_email = ? ORDER BY created_at DESC LIMIT 20',
            [userEmail]
        );
        return NextResponse.json(notifications, { status: 200 });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { notificationId } = await request.json();
        if (!notificationId) {
            return NextResponse.json({ message: 'Notification ID is required' }, { status: 400 });
        }

        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_email = ?',
            [notificationId, session.user.email]
        );

        return NextResponse.json({ message: 'Notification marked as read.' }, { status: 200 });

    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
