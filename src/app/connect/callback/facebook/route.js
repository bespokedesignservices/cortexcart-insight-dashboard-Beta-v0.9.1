// File: src/app/connect/callback/facebook/route.js

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { encrypt } from '@/lib/crypto';

export const runtime = 'nodejs';

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return redirect('/api/auth/signin');
    }

    // --- THIS IS THE CORRECTED PART ---
    // We create a new URL object from the request URL to access its parameters.
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    // --- END OF FIX ---

    const originalState = cookies().get('facebook_oauth_state')?.value;

    if (!code || !state || state !== originalState) {
        return redirect('/settings?connect_status=error&message=Invalid_state_parameter');
    }

    try {
        // Exchange the code for a short-lived token
        const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token`;
        const shortLivedTokenParams = new URLSearchParams({
            client_id: process.env.FACEBOOK_CLIENT_ID,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET,
            redirect_uri: `${process.env.NEXTAUTH_URL}/connect/callback/facebook`,
            code: code,
        });

        const shortLivedTokenResponse = await fetch(`${tokenUrl}?${shortLivedTokenParams.toString()}`);
        const shortLivedTokenData = await shortLivedTokenResponse.json();

        if (shortLivedTokenData.error) throw new Error(shortLivedTokenData.error.message);

        // Exchange the short-lived token for a long-lived token
        const longLivedTokenParams = new URLSearchParams({
            grant_type: 'fb_exchange_token',
            client_id: process.env.FACEBOOK_CLIENT_ID,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET,
            fb_exchange_token: shortLivedTokenData.access_token,
        });

        const longLivedTokenResponse = await fetch(`${tokenUrl}?${longLivedTokenParams.toString()}`);
        const longLivedTokenData = await longLivedTokenResponse.json();

        if (longLivedTokenData.error) throw new Error(longLivedTokenData.error.message);

        const { access_token, expires_in } = longLivedTokenData;

        // Save the long-lived token to the database
        const userEmail = session.user.email;
        const encryptedAccessToken = encrypt(access_token);
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        const query = `
            INSERT INTO social_connect (user_email, platform, access_token_encrypted, expires_at)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                access_token_encrypted = VALUES(access_token_encrypted),
                expires_at = VALUES(expires_at);
        `;
        await db.query(query, [userEmail, 'facebook', encryptedAccessToken, expiresAt]);

    } catch (error) {
        console.error("Error during Facebook OAuth2 callback:", error);
        return redirect(`/settings?connect_status=error&message=${encodeURIComponent(error.message)}`);
    } finally {
        cookies().delete('facebook_oauth_state');
    }
    
    return redirect('/settings?connect_status=success');
}