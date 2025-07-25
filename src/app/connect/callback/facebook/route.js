// File: src/app/connect/callback/facebook/route.js

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'; '@/lib/db'; // Assuming db.js handles transactions
import { encrypt } from '@/lib/crypto';

export const runtime = 'nodejs';

async function fetchUserPagesWithTokens(userAccessToken) {
    const fields = "id,name,picture{url},access_token";
    const url = `https://graph.facebook.com/me/accounts?fields=${fields}&access_token=${userAccessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(`Facebook API Error: ${data.error.message}`);
    return data.data || [];
}

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
    cookieStore.delete('facebook_oauth_state');

    if (!code || !state || state !== originalState) {
        const errorUrl = new URL('/settings', request.url);
        errorUrl.searchParams.set('connect_status', 'error');
        errorUrl.searchParams.set('message', 'State mismatch or invalid parameters.');
        return NextResponse.redirect(errorUrl);
    }
    
    // Using a transaction is best practice
    const connection = await db.getConnection(); 

    try {
        await connection.beginTransaction();

        // 1. Get the long-lived USER access token
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

        const longLivedParams = new URLSearchParams({
            grant_type: 'fb_exchange_token',
            client_id: process.env.FACEBOOK_CLIENT_ID,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET,
            fb_exchange_token: tokenData.access_token,
        });
        const longLivedResponse = await fetch(`${tokenUrl}?${longLivedParams.toString()}`);
        const longLivedData = await longLivedResponse.json();
        if (longLivedData.error) throw new Error(longLivedData.error.message);
        
        // We are renaming 'access_token' to 'userAccessToken' for clarity
        const { access_token: userAccessToken, expires_in } = longLivedData;

        // Ensure we actually got a token before proceeding
        if (!userAccessToken) {
            throw new Error("Could not retrieve a valid user access token from Facebook.");
        }
        
        // 2. Save the main USER connection
        await connection.query(
            `INSERT INTO social_connect (user_email, platform, access_token_encrypted, expires_at)
             VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE
             access_token_encrypted = VALUES(access_token_encrypted), expires_at = VALUES(expires_at);`,
            // **THE FIX**: Ensure we use the correct variable name here
            [session.user.email, 'facebook', encrypt(userAccessToken), new Date(Date.now() + expires_in * 1000)]
        );

        // 3. Fetch pages and their tokens
        const pages = await fetchUserPagesWithTokens(userAccessToken);
        
        // 4. Save each page and its unique token
        if (pages && pages.length > 0) {
            const upsertPageQuery = `
                INSERT INTO facebook_pages (user_email, page_id, page_name, page_access_token_encrypted, picture_url)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    page_name = VALUES(page_name),
                    page_access_token_encrypted = VALUES(page_access_token_encrypted),
                    picture_url = VALUES(picture_url);
            `;

            for (const page of pages) {
                // Ensure the page has its own token before saving
                if(page.access_token) {
                    await connection.query(upsertPageQuery, [
                        session.user.email,
                        page.id,
                        page.name,
                        encrypt(page.access_token),
                        page.picture?.data?.url || null
                    ]);
                }
            }
        }
        
        await connection.commit();
        
    } catch (error) {
        await connection.rollback();
        console.error("Error during Facebook OAuth2 callback:", error);
        const errorUrl = new URL('/settings', request.url);
        errorUrl.searchParams.set('connect_status', 'error');
        errorUrl.searchParams.set('message', error.message.replace(/ /g, '_'));
        return NextResponse.redirect(errorUrl);
    } finally {
        if (connection) connection.release();
    }
    
    const successUrl = new URL('/settings', request.url);
    successUrl.searchParams.set('connect_status', 'success');
    return NextResponse.redirect(successUrl);
}