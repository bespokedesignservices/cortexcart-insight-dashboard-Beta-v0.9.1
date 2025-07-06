import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '../../../../../lib/db';
import { decrypt, encrypt } from '@/lib/crypto';
import { TwitterApi } from 'twitter-api-v2';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const userEmail = session.user.email;
    const { platform, content } = await request.json();

    if (platform !== 'x') {
        return NextResponse.json({ message: 'This endpoint currently only supports posting to X (Twitter).' }, { status: 400 });
    }

    try {
        // 1. Fetch the user's saved tokens and expiry date
        const [connections] = await db.query(
            'SELECT access_token_encrypted, refresh_token_encrypted, expires_at FROM social_connections WHERE user_email = ? AND platform = ?',
            [userEmail, platform]
        );

        if (connections.length === 0) {
            return NextResponse.json({ message: 'X account not connected.' }, { status: 404 });
        }

        const connection = connections[0];
        let accessToken = decrypt(connection.access_token_encrypted);
        const refreshToken = decrypt(connection.refresh_token_encrypted);
        const expiresAt = new Date(connection.expires_at);

        const twitterClient = new TwitterApi({
            clientId: process.env.X_CLIENT_ID,
            clientSecret: process.env.X_CLIENT_SECRET,
        });
        
        let clientToUse;

        // 2. Check if the token is expired or close to expiring
        if (new Date() > expiresAt) {
            console.log("X token expired, refreshing...");
            const { client: refreshedClient, accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn } = await twitterClient.refreshOAuth2Token(refreshToken);
            
            // 3. Update the database with the new tokens and expiry
            const newExpiresAt = new Date(Date.now() + expiresIn * 1000);
            await db.query(
                `UPDATE social_connections SET 
                    access_token_encrypted = ?, 
                    refresh_token_encrypted = ?, 
                    expires_at = ?
                 WHERE user_email = ? AND platform = ?`,
                [encrypt(newAccessToken), encrypt(newRefreshToken), newExpiresAt, userEmail, platform]
            );
            
            clientToUse = refreshedClient;
        } else {
            // If token is still valid, use it directly
            clientToUse = new TwitterApi(accessToken).v2;
        }

        // 4. Post the tweet using the valid client
        await clientToUse.tweet(content);

        return NextResponse.json({ message: 'Post sent to X successfully!' }, { status: 200 });

    } catch (error) {
        console.error('Error posting to X:', error);
        return NextResponse.json({ message: `Failed to post to X: ${error.message}` }, { status: 500 });
    }
}
