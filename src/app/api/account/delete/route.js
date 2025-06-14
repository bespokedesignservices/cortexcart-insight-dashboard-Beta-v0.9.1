import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '../../../../../lib/db';
import { NextResponse } from 'next/server';

// Corrected: Removed unused 'request' parameter
export async function POST() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const userEmail = session.user.email;
    const connection = await db.getConnection();

    try {
        // Use a transaction to ensure all or no data is deleted.
        await connection.beginTransaction();

        // 1. Delete all events associated with the user's siteId (their email)
        await connection.query('DELETE FROM events WHERE site_id = ?', [userEmail]);

        // 2. Delete the user's site settings
        await connection.query('DELETE FROM sites WHERE user_email = ?', [userEmail]);
        
        // In a full application, you would also delete the user from your 'users' table
        // if you had one.

        await connection.commit();

        return NextResponse.json({ message: 'Account and all data deleted successfully.' }, { status: 200 });

    } catch (error) {
        await connection.rollback(); // Roll back changes on error
        console.error('Error deleting account:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        connection.release(); // Release the connection back to the pool
    }
}
