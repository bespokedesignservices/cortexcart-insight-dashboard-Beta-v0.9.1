// src/middleware.js (Corrected)

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { jwtVerify } from 'jose';

// Helper function to get the REGULAR user JWT secret
const getUserSecret = () => new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

// Helper function to get the ADMIN JWT secret
const getAdminSecret = () => new TextEncoder().encode(process.env.JWT_ADMIN_SECRET);

export async function middleware(req) {
    const { pathname } = req.nextUrl;
    const appUrl = process.env.NEXTAUTH_URL;

    // --- Admin Route Protection ---
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const adminCookie = req.cookies.get('admin-session-token');
        const adminToken = adminCookie?.value;

        if (!adminToken) {
            return NextResponse.redirect(new URL('/admin/login', appUrl));
        }

        try {
            // THE FIX: Use the correct admin secret for verification
            const adminSecret = getAdminSecret();
            const { payload } = await jwtVerify(adminToken, adminSecret);
            
            if (payload.role !== 'superadmin') {
                return NextResponse.redirect(new URL('/admin/login?error=Forbidden', appUrl));
            }
            // If the token is valid, allow access
            return NextResponse.next();
        } catch (error) {
            console.error('Admin token verification failed:', error.message);
            // If the token is invalid (expired, tampered, etc.), redirect to login
            return NextResponse.redirect(new URL('/admin/login?error=InvalidToken', appUrl));
        }
    }

    // --- Regular User Route Protection ---
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings') || pathname.startsWith('/subscribe')) {
        const userSecret = process.env.NEXTAUTH_SECRET;
        const sessionToken = await getToken({ req, secret: userSecret });

        if (!sessionToken) {
            const signInUrl = new URL('/api/auth/signin', appUrl);
            signInUrl.searchParams.set('callbackUrl', req.url);
            return NextResponse.redirect(signInUrl);
        }
    }

    // If no protected routes match, allow the request
    return NextResponse.next();
}

// Config to specify which paths the middleware should run on
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/settings/:path*',
        '/subscribe/:path*',
        '/admin/:path*',
    ],
};