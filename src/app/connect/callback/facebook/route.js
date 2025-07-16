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

    // First, validate the state to prevent CSRF attacks.
    if (!code || !state || state !== originalState) {
        cookieStore.delete('facebook_oauth_state'); // Clean up on failure
        return redirect('/settings?connect_status=error&message=State_mismatch_or_code_missing');
    }

    // Since validation passed, we can safely delete the cookie now.
    // This is the key change that should resolve the error.
    cookieStore.delete('facebook_oauth_state');

    try {
        // Step 1: Exchange code for a short-lived token
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

        // Step 2: Exchange for a long-lived token
        const longLivedTokenParams = new URLSearchParams({
            grant_type: 'fb_exchange_token',
            client_id: process.env.FACEBOOK_CLIENT_ID,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET,
            fb_exchange_token: shortLivedTokenData.access_token,
        });
        const longLivedTokenResponse = await fetch(`${tokenUrl}?${longLivedTokenParams.toString()}`);
        const longLivedTokenData = await longLivedTokenResponse.json();
        if (longLivedTokenData.error) throw new Error(longLivedTokenData.error.message);

        // Step 3: Save the long-lived token to the database
        const { access_token, expires_in } = longLivedTokenData;
        const encryptedAccessToken = encrypt(access_token);
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        await db.query(
            `INSERT INTO social_connect (user_email, platform, access_token_encrypted, expires_at)
             VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE
             access_token_encrypted = VALUES(access_token_encrypted),
             expires_at = VALUES(expires_at);`,
            [session.user.email, 'facebook', encryptedAccessToken, expiresAt]
        );
        
        // If everything is successful, redirect to the settings page with a success message.
        return redirect('/settings?connect_status=success');

    } catch (error) {
        console.error("Error during Facebook OAuth2 callback:", error);
        // If any error occurs during the API calls, redirect with an error message.
        return redirect(`/settings?connect_status=error&message=${encodeURIComponent(error.message)}`);
    }
}