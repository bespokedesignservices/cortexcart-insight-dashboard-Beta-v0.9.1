// File: src/app/api/social/facebook/connect-page/route.js

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { encrypt } from '@/lib/crypto';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { pageId, pageAccessToken } = await request.json();
        if (!pageId || !pageAccessToken) {
            return NextResponse.json({ message: 'Page ID and Page Access Token are required.' }, { status: 400 });
        }

        // Encrypt the long-lived page access token before storing it
        const encryptedPageAccessToken = encrypt(pageAccessToken);

        // Update the existing row for this user's Facebook connection
        await db.query(
            `UPDATE social_connect 
             SET page_id = ?, page_access_token_encrypted = ? 
             WHERE user_email = ? AND platform = 'facebook'`,
            [pageId, encryptedPageAccessToken, session.user.email]
        );

        return NextResponse.json({ message: 'Page connected successfully!' }, { status: 200 });

    } catch (error) {
        console.error('Error connecting Facebook page:', error);
        return NextResponse.json({ message: `Failed to connect page: ${error.message}` }, { status: 500 });
    }
}