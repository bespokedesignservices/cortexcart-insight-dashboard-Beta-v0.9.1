// File: src/app/api/social/facebook/create-post/route.js

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { content, imageUrl } = await request.json();

        // 1. Get the user's connected page and its specific access token
        const [connections] = await db.query(
            'SELECT page_id, page_access_token_encrypted FROM social_connect WHERE user_email = ? AND platform = ?',
            [session.user.email, 'facebook']
        );

        if (connections.length === 0 || !connections[0].page_id || !connections[0].page_access_token_encrypted) {
            throw new Error('No Facebook Page has been connected. Please connect a page in settings.');
        }

        const connection = connections[0];
        const pageId = connection.page_id;
        const pageAccessToken = decrypt(connection.page_access_token_encrypted);

        // 2. Determine the correct Facebook API endpoint
        let endpoint = `https://graph.facebook.com/${pageId}/feed`;
        const params = new URLSearchParams({
            message: content,
            access_token: pageAccessToken,
        });

        // If an image is provided, switch to the photos endpoint
        if (imageUrl) {
            endpoint = `https://graph.facebook.com/${pageId}/photos`;
            params.set('url', imageUrl);
            params.set('caption', content);
            params.delete('message'); // 'message' is not used for photo uploads
        }
        
        // 3. Post to the Facebook Graph API
        const response = await fetch(`${endpoint}?${params.toString()}`, {
            method: 'POST',
        });

        const data = await response.json();

        if (data.error) {
            console.error('Facebook API Error:', data.error);
            throw new Error(data.error.message);
        }

        return NextResponse.json({ message: 'Successfully posted to Facebook!', postId: data.id || data.post_id }, { status: 200 });

    } catch (error) {
        console.error('Error posting to Facebook:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}