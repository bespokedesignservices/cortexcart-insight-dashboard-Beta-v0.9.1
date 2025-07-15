// File: src/app/api/connect/facebook/route.js

import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const state = crypto.randomBytes(16).toString('hex');
        const callbackURL = `${process.env.NEXTAUTH_URL}/connect/callback/facebook`;
        
        // These are the permissions we configured earlier
        const scopes = 'email,public_profile,pages_show_list,pages_read_engagement,pages_manage_posts';

        const params = new URLSearchParams({
            client_id: process.env.FACEBOOK_CLIENT_ID,
            redirect_uri: callbackURL,
            response_type: 'code',
            scope: scopes,
            state: state,
        });

        const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;

        const response = new NextResponse(null, {
            status: 307, // Temporary Redirect
            headers: {
                Location: facebookAuthUrl,
            },
        });

        // Store the state in a secure, http-only cookie to prevent CSRF attacks
        response.cookies.set('facebook_oauth_state', state, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
});
        return response;

    } catch (error) {
        console.error("Error in Facebook auth route:", error);
        return NextResponse.json({ message: 'Error generating auth link.' }, { status: 500 });
    }
}