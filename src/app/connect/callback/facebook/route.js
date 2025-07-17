// File: src/app/connect/callback/facebook/route.js

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server'; // Import NextResponse
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { encrypt } from '@/lib/crypto';

export const runtime = 'nodejs';

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.redirect(new URL('/api/auth/signin', request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const cookieStore = cookies();
    const originalState = cookieStore.get('facebook_oauth_state')?.value;

    // We delete the cookie immediately after reading it to avoid conflicts.
    cookieStore.delete('facebook_oauth_state');

    if (!code || !state || state !== originalState) {
        const errorUrl = new URL('/settings', request.url);
        errorUrl.searchParams.set('connect_status', 'error');
        errorUrl.searchParams.set('message', 'State mismatch or invalid parameters.');
        return NextResponse.redirect(errorUrl);
    }

    try {
        // Step 1: Exchange code for a short-lived token
        const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token`;
        const tokenParams = new URLSearchParams({
            client_id: process.env.FACEBOOK_CLIENT_ID,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET,
            redirect_uri: `${process.env.NEXTAUTH_URL}/connect/callback/facebook`,
            code: code,
        });

        const tokenResponse = await fetch(`${tokenUrl}?${tokenParams.toString()}`);
        const tokenData = await tokenResponse.json();
        if (tokenData.error) throw new Error(tokenData.error.message);

        // Step 2: Exchange for a long-lived token
        const longLivedParams = new URLSearchParams({
            grant_type: 'fb_exchange_token',
            client_id: process.env.FACEBOOK_CLIENT_ID,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET,
            fb_exchange_token: tokenData.access_token,
        });
        const longLivedResponse = await fetch(`${tokenUrl}?${longLivedParams.toString()}`);
        const longLivedData = await longLivedResponse.json();
        if (longLivedData.error) throw new Error(longLivedData.error.message);

        // Step 3: Save the long-lived token to the database
        const { access_token, expires_in } = longLivedData;
        const encryptedAccessToken = encrypt(access_token);
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        const query = `
            INSERT INTO social_connect (user_email, platform, access_token_encrypted, expires_at)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                access_token_encrypted = VALUES(access_token_encrypted),
                expires_at = VALUES(expires_at);
        `;
        
        // --- THIS IS THE SQL FIX ---
        // The parameters array now correctly matches the query.
        const values = [session.user.email, 'facebook', encryptedAccessToken, expiresAt];
        await db.query(query, values);
        
    } catch (error) {
        console.error("Error during Facebook OAuth2 callback:", error);
        const errorUrl = new URL('/settings', request.url);
        errorUrl.searchParams.set('connect_status', 'error');
        errorUrl.searchParams.set('message', error.message);
        return NextResponse.redirect(errorUrl);
    }
    
    // If we reach here, everything was successful.
    const successUrl = new URL('/settings', request.url);
    successUrl.searchParams.set('connect_status', 'success');
    return NextResponse.redirect(successUrl);
}