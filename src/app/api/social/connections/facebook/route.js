import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '../../../../../lib/db';
import { encrypt } from '@/lib/crypto';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ message: 'Authorization code not found.' }, { status: 400 });
    }

    const userEmail = session.user.email;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/social/connections/facebook`;

    try {
        // 1. Exchange the code for a user access token
        const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${redirectUri}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${code}`;
        const tokenRes = await fetch(tokenUrl);
        const tokenData = await tokenRes.json();
        if (tokenData.error) throw new Error(tokenData.error.message);
        const userAccessToken = tokenData.access_token;

        // 2. Get the list of Facebook Pages the user manages
        const pagesUrl = `https://graph.facebook.com/me/accounts?access_token=${userAccessToken}`;
        const pagesRes = await fetch(pagesUrl);
        const pagesData = await pagesRes.json();
        if (!pagesData.data || pagesData.data.length === 0) {
            throw new Error('No Facebook Pages found for this user.');
        }

        // 3. For this version, we will find the first available page.
        // A future improvement would be to let the user choose which page to connect.
        const pageToConnect = pagesData.data[0];
        const { id: pageId, access_token: pageAccessToken } = pageToConnect;

        // 4. Encrypt and save the credentials to the database
        const encryptedPageAccessToken = encrypt(pageAccessToken);
        const query = `
            INSERT INTO social_connections (user_email, platform, page_id, page_access_token_encrypted)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                page_id = VALUES(page_id),
                page_access_token_encrypted = VALUES(page_access_token_encrypted);
        `;
        await db.query(query, [userEmail, 'facebook', pageId, encryptedPageAccessToken]);

        // 5. Redirect the user back to the settings page on success
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings`);

    } catch (error) {
        console.error('Facebook connection error:', error);
        // Redirect back to settings with an error message
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?error=facebook_connection_failed`);
    }
}
