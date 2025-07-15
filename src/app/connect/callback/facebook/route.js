// File: src/app/connect/callback/facebook/route.js

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { encrypt } from '@/lib/crypto';

export const runtime = 'nodejs';

// --- THIS IS THE CORRECTED FUNCTION SIGNATURE ---
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return redirect('/api/auth/signin');
    }

    // Get searchParams from the request object's URL
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const originalState = cookies().get('facebook_oauth_state')?.value;

    if (!code || !state || state !== originalState) {
        return redirect('/settings?connect_status=error&message=Invalid_state_parameter');
    }

    try {
        const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token`;
        const params = new URLSearchParams({
            client_id: process.env.FACEBOOK_CLIENT_ID,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET,
            redirect_uri: `${process.env.NEXTAUTH_URL}/connect/callback/facebook`,
            code: code,
        });

        const tokenResponse = await fetch(`${tokenUrl}?${params.toString()}`);
        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            throw new Error(tokenData.error.message);
        }

        const { access_token, expires_in } = tokenData;

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