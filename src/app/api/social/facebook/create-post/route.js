import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Get a single connection from the pool to manage it properly
    const connection = await db.getConnection();

    try {
        const { content, imageUrl } = await request.json();

        // Use 'connection.query' instead of 'db.query'
        const [sites] = await connection.query(
            'SELECT active_facebook_page_id FROM facebook_pages_connected WHERE user_email = ?',
            [session.user.email]
        );

        const pageId = sites[0]?.active_facebook_page_id;
        if (!pageId) {
            throw new Error('No active Facebook Page has been set. Please connect a page in your settings.');
        }

        const [pages] = await connection.query(
            'SELECT access_token_encrypted FROM facebook_pages WHERE page_id = ? AND user_email = ?',
            [pageId, session.user.email]
        );

        if (pages.length === 0) {
            throw new Error('Access Token for the selected page was not found.');
        }
        
        const pageAccessToken = decrypt(pages[0].access_token_encrypted);

        let endpoint = `https://graph.facebook.com/${pageId}/feed`;
        let params = { message: content, access_token: pageAccessToken };

        if (imageUrl) {
            endpoint = `https://graph.facebook.com/${pageId}/photos`;
            params = { url: imageUrl, caption: content, access_token: pageAccessToken };
        }
        
        const response = await axios.post(endpoint, params);

        if (response.data.error) {
            throw new Error(response.data.error.message);
        }

        return NextResponse.json({ message: 'Successfully posted to Facebook!', postId: response.data.id || response.data.post_id });

    } catch (error) {
        console.error('Error posting to Facebook:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    } finally {
        // Now the 'connection' variable exists and can be released
        if (connection) connection.release();
    }
}