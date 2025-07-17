// File: src/app/api/social/facebook/pages/route.js

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import { NextResponse } from 'next/server';

export async function GET() {
    console.log("\n--- [DEBUG] Fetching Facebook Pages ---");

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        console.log("[DEBUG] User not authenticated.");
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    console.log(`[DEBUG] Authenticated as: ${session.user.email}`);

    try {
        const [connections] = await db.query(
            'SELECT access_token_encrypted FROM social_connect WHERE user_email = ? AND platform = ?',
            [session.user.email, 'facebook']
        );

        if (!connections.length || !connections[0].access_token_encrypted) {
            console.log("[DEBUG] No Facebook access token found in database.");
            throw new Error('Facebook account not connected or access token not found.');
        }

        const accessToken = decrypt(connections[0].access_token_encrypted);
        console.log(`[DEBUG] Decrypted Access Token starts with: ${accessToken ? accessToken.substring(0, 15) : 'N/A'}...`);

        const url = `https://graph.facebook.com/me/accounts?access_token=${accessToken}&fields=id,name,picture`;
        console.log(`[DEBUG] Fetching from Facebook Graph API...`);
        
        const fbResponse = await fetch(url);
        const data = await fbResponse.json();

        // This is the most important log. It will show us exactly what Facebook is sending back.
        console.log("[DEBUG] Full response from Facebook:", JSON.stringify(data, null, 2));

        if (data.error) {
            throw new Error(data.error.message);
        }

        return NextResponse.json(data.data || [], { status: 200 });

    } catch (error) {
        console.error('--- [DEBUG] Error fetching Facebook pages ---:', error);
        return NextResponse.json({ message: `Failed to fetch pages: ${error.message}` }, { status: 500 });
    }
}