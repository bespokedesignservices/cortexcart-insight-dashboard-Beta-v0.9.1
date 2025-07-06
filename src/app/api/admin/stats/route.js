import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '../../../../../src/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        // Query for total users
        const [totalUsersResult] = await db.query('SELECT COUNT(*) as count FROM sites');
        
        // Query for new users in the last 30 days
        const [newUsersResult] = await db.query(
            'SELECT COUNT(*) as count FROM sites WHERE created_at >= NOW() - INTERVAL 30 DAY'
        );

        // Query for total events tracked
        const [totalEventsResult] = await db.query('SELECT COUNT(*) as count FROM events');

        // Query for user sign-ups per day for the last 30 days
        const [signupsByDay] = await db.query(`
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM sites 
            WHERE created_at >= NOW() - INTERVAL 30 DAY
            GROUP BY DATE(created_at) 
            ORDER BY date ASC
        `);

        const stats = {
            totalUsers: totalUsersResult[0].count,
            newUsersLast30Days: newUsersResult[0].count,
            totalEventsTracked: totalEventsResult[0].count,
            signupsByDay: signupsByDay,
        };

        return NextResponse.json(stats, { status: 200 });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
