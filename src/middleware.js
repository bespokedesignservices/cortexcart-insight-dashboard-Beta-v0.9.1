import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { jwtVerify } from 'jose';

// Helper function to get the secret key, ensuring it's available
const getSecret = () => {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
        throw new Error('Missing NEXTAUTH_SECRET environment variable');
    }
    return new TextEncoder().encode(secret);
};

export async function middleware(req) {
    const { pathname } = req.nextUrl;
    const secret = getSecret();
    // --- THE FIX: Use the reliable environment variable for the base URL ---
    const appUrl = process.env.NEXTAUTH_URL;
    // --- Admin Route Protection ---
    if (pathname.startsWith('/admin')) {
        // Allow the login page to be accessed without any token
        if (pathname.startsWith('/admin/login')) {
            return NextResponse.next();
        }

        const adminCookie = req.cookies.get('admin-session-token');
        const adminToken = adminCookie?.value;

        // If there's no admin token, redirect to the admin login page
        if (!adminToken) {
            return NextResponse.redirect(new URL('/admin/login', appUrl));
        }

        try {
            // Verify the custom admin token
            const { payload } = await jwtVerify(adminToken, secret);
            // Check if the user has the correct role
            if (payload.role !== 'superadmin') {
                return NextResponse.redirect(new URL('/admin/login?error=Forbidden', appUrl));
            }
            // If the token is valid and the role is correct, allow access
            return NextResponse.next();
        } catch (error) {
            // If the token is invalid (expired, tampered with, etc.), redirect to login
            console.error('Admin token verification failed:', error);
            return NextResponse.redirect(new URL('/admin/login', appUrl));
        }
    }

    // --- Regular User Route Protection ---
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings') || pathname.startsWith('/subscribe')) {
        // Use NextAuth's getToken helper to check for a valid user session
        const sessionToken = await getToken({ req, secret });

        if (!sessionToken) {
            // If the user is not signed in, redirect them to the main login page
            const signInUrl = new URL('/api/auth/signin', appUrl);
            // Save the page they were trying to access to redirect them back after login
            signInUrl.searchParams.set('callbackUrl', req.url);
            return NextResponse.redirect(signInUrl);
        }
    }

    // If the route is not protected or the user is authenticated, allow the request
    return NextResponse.next();
}

// This config specifies which routes the middleware should apply to.
export const config = {
    matcher: [
        '/admin/:path*',
        '/dashboard/:path*',
        '/settings/:path*',
        '/subscribe/:path*',
    ],
};
