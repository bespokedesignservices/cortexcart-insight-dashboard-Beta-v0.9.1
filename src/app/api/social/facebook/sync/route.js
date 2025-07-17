// File: src/app/api/social/facebook/sync/route.js

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import { NextResponse } from 'next/server';

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const userEmail = session.user.email;

    try {
        const [connections] = await db.query(
            'SELECT page_id, page_access_token_encrypted FROM social_connect WHERE user_email = ? AND platform = ?',
            [userEmail, 'facebook']
        );

        if (!connections.length || !connections[0].page_id) {
            throw new Error('No Facebook Page has been connected.');
        }

        const { page_id, page_access_token_encrypted } = connections[0];
        const pageAccessToken = decrypt(page_access_token_encrypted);

        // Fetch posts from the Facebook Page
        const url = `https://graph.facebook.com/${page_id}/posts?fields=message,created_time,insights.metric(post_impressions_unique,post_reactions_like_total,post_shares)&limit=50&access_token=${pageAccessToken}`;
        const response = await fetch(url);
        const postData = await response.json();

        if (postData.error) {
            throw new Error(postData.error.message);
        }

        let postsUpserted = 0;
        if (postData.data) {
            for (const post of postData.data) {
                const insights = post.insights?.data || [];
                const getInsightValue = (metricName) => insights.find(i => i.name === metricName)?.values[0]?.value || 0;

                const impressions = getInsightValue('post_impressions_unique');
                const likes = getInsightValue('post_reactions_like_total');
                const shares = getInsightValue('post_shares');
                
                await db.query(
                    `INSERT INTO historical_social_posts (user_email, platform, platform_post_id, content, likes, shares, impressions, posted_at)
                     VALUES (?, 'facebook', ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                     likes = VALUES(likes), shares = VALUES(shares), impressions = VALUES(impressions);`,
                    [userEmail, post.id, post.message || '', likes, shares, impressions, new Date(post.created_time)]
                );
                postsUpserted++;
            }
        }
        
        return NextResponse.json({ message: `Sync complete. ${postsUpserted} posts from Facebook were updated or added.` });

    } catch (error) {
        console.error("Error syncing Facebook posts:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}