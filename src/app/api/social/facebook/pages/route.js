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

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const cookieStore = cookies();
    const originalState = cookieStore.get('facebook_oauth_state')?.value;

    // --- FIX 1: Clean up cookie on validation failure ---
    if (!code || !state || state !== originalState) {
        cookieStore.delete('facebook_oauth_state');
        return redirect('/settings?connect_status=error&message=State_mismatch_or_code_missing');
    }

    // --- FIX 2: Remove the `finally` block and handle cookie deletion explicitly ---
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

        // Exchange for a long-lived token
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
        const encryptedAccessToken = encrypt(access_token);
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        // Save to the database
        await db.query(
            `INSERT INTO social_connect (user_email, platform, access_token_encrypted, expires_at)
             VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE
             access_token_encrypted = VALUES(access_token_encrypted),
             expires_at = VALUES(expires_at);`,
            [session.user.email, 'facebook', encryptedAccessToken, expiresAt]
        );
        
        // On success, delete the cookie and then redirect
        cookieStore.delete('facebook_oauth_state');
        return redirect('/settings?connect_status=success');

    } catch (error) {
        console.error("Error during Facebook OAuth2 callback:", error);
        // On error, also delete the cookie and then redirect
        cookieStore.delete('facebook_oauth_state');
        return redirect(`/settings?connect_status=error&message=${encodeURIComponent(error.message)}`);
    }
}