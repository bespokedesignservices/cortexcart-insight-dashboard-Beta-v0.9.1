// File: src/app/api/connect/facebook/route.js

import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function GET(request) {
    try {
        const state = crypto.randomBytes(16).toString('hex');
        const callbackURL = `${process.env.NEXTAUTH_URL}/connect/callback/facebook`;
        
        const scopes = 'email,public_profile,pages_show_list,business_management';

        const params = new URLSearchParams({
            client_id: process.env.FACEBOOK_CLIENT_ID,
            redirect_uri: callbackURL,
            response_type: 'code',
            scope: scopes,
            state: state,
        });

        const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
        
        // This response will redirect the user to Facebook
        const response = NextResponse.redirect(facebookAuthUrl);

        // We set a secure cookie with the state value to check against later
         response.cookies.set('facebook_oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
            domain: '.cortexcart.com' // Set the root domain here
        });

        return response;

    } catch (error) {
        console.error("Error in Facebook auth route:", error);
        const errorUrl = new URL('/settings', request.url);
        errorUrl.searchParams.set('connect_status', 'error');
        errorUrl.searchParams.set('message', 'Could not generate Facebook auth link.');
        return NextResponse.redirect(errorUrl);
    }
}
