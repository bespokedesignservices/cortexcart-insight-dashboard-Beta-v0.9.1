// src/app/connect/callback/shopify/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { encrypt } from '@/lib/crypto';
import axios from 'axios';

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.redirect(new URL('/settings?connect_status=error&message=User_not_authenticated', request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const cookieStore = cookies();
    const storedState = cookieStore.get('shopify_oauth_state')?.value;
    const shopName = cookieStore.get('shopify_shop_name')?.value;

    const settingsUrl = new URL('/settings', request.url);

    if (!code || !state || state !== storedState || !shopName) {
        settingsUrl.searchParams.set('connect_status', 'error');
        settingsUrl.searchParams.set('message', 'Authentication failed.');
        return NextResponse.redirect(settingsUrl);
    }
    
    let connection;
    try {
        const tokenUrl = `https://${shopName}.myshopify.com/admin/oauth/access_token`;
        const response = await axios.post(tokenUrl, {
            client_id: process.env.SHOPIFY_API_KEY,
            client_secret: process.env.SHOPIFY_API_SECRET,
            code: code,
        });

        const { access_token } = response.data;
        if (!access_token) throw new Error('Failed to retrieve access token.');

        connection = await db.getConnection();
        await connection.query(
            `INSERT INTO shopify_stores (user_email, store_url, access_token_encrypted)
             VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE
             store_url = VALUES(store_url), access_token_encrypted = VALUES(access_token_encrypted);`,
            [session.user.email, `${shopName}.myshopify.com`, encrypt(access_token)]
        );

        settingsUrl.searchParams.set('connect_status', 'success');
        return NextResponse.redirect(settingsUrl);

    } catch (error) {
        console.error("Shopify callback error:", error);
        settingsUrl.searchParams.set('connect_status', 'error');
        settingsUrl.searchParams.set('message', error.message.replace(/ /g, '_'));
        return NextResponse.redirect(settingsUrl);
    } finally {
        if (connection) connection.release();
    }
}