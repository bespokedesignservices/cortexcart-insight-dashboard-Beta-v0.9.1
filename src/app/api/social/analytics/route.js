import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '../../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    const userEmail = session.user.email;

    try {
        const connection = await db.getConnection();

        // --- THIS IS THE ROBUST QUERY FIX ---
        // It explicitly defines the type and collation for every column in the UNION.
        const allPostsQuery = `
            SELECT 
                CAST(platform AS CHAR(50)) COLLATE utf8mb4_unicode_ci AS platform,
                CAST(impressions AS SIGNED) AS impressions,
                CAST(likes AS SIGNED) AS likes,
                CAST(shares AS SIGNED) AS shares,
                CAST(posted_at AS DATETIME) AS scheduled_at
            FROM historical_social_posts 
            WHERE user_email = ?
            
            UNION ALL
            
            SELECT 
                CAST(platform AS CHAR(50)) COLLATE utf8mb4_unicode_ci AS platform,
                CAST(impressions AS SIGNED) AS impressions,
                CAST(likes AS SIGNED) AS likes,
                CAST(shares AS SIGNED) AS shares,
                CAST(scheduled_at AS DATETIME) AS scheduled_at
            FROM scheduled_posts 
            WHERE user_email = ? AND status = 'posted'
        `;

        const [generalStats] = await connection.query(
            `SELECT
                COUNT(*) as totalPosts,
                SUM(impressions) as totalReach,
                (SUM(likes + shares) / NULLIF(SUM(impressions), 0)) * 100 as engagementRate
             FROM (${allPostsQuery}) as all_posts`,
            [userEmail, userEmail]
        );
        connection.release();

        // Ensure we always return a valid object with empty arrays as fallbacks
        const responseData = {
            stats: generalStats[0] || {},
            dailyReach: dailyReach || [],
            platformStats: platformStats || [],
        };

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error('Error fetching social analytics:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}