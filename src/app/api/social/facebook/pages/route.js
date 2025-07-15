// File: src/app/api/social/facebook/pages/route.js

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        // 1. Get the user's main access token from the database
        const [connections] = await db.query(
            'SELECT access_token_encrypted FROM social_connect WHERE user_email = ? AND platform = ?',
            [session.user.email, 'facebook']
        );

        if (connections.length === 0 || !connections[0].access_token_encrypted) {
            throw new Error('Facebook account not connected or access token not found.');
        }

        const accessToken = decrypt(connections[0].access_token_encrypted);

        // 2. Use the token to fetch the user's pages from the Facebook Graph API
        const url = `https://graph.facebook.com/me/accounts?access_token=${accessToken}&fields=id,name,picture,access_token`;
        const fbResponse = await fetch(url);
        const data = await fbResponse.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        // 3. Return the list of pages to the frontend
        return NextResponse.json(data.data || [], { status: 200 });

    } catch (error) {
        console.error('Error fetching Facebook pages:', error);
        return NextResponse.json({ message: `Failed to fetch pages: ${error.message}` }, { status: 500 });
    }
}