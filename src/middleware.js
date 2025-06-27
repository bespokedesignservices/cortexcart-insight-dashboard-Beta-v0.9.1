import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        // This function runs only if the user is successfully authenticated.
        const token = req.nextauth.token;
        const pathname = req.nextUrl.pathname;

        // If the user tries to access any /admin route...
        if (pathname.startsWith('/admin')) {
            // ...and their role is NOT 'superadmin', redirect them to the user dashboard.
            if (token?.role !== 'superadmin') {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
        }
        
        // Allow the request to proceed if checks pass.
        return NextResponse.next();
    },
    {
        callbacks: {
            // This callback determines if the middleware function should run.
            // It will redirect to the sign-in page if the token doesn't exist.
            authorized: ({ token }) => !!token
        },
    }
);

// This config specifies which routes the middleware should apply to.
export const config = {
    matcher: [
        '/admin/:path*',      // Protect all admin routes
        '/dashboard/:path*',  // Protect all user dashboard routes
        '/settings/:path*',   // Protect all settings routes
	'/subscribe/:path*', // logged in users to choose plan before proceeding
    ], 
};
