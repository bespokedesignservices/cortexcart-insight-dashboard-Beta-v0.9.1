// File: src/lib/admin-auth.js

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const getSecret = () => {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) throw new Error('Missing NEXTAUTH_SECRET environment variable');
    return new TextEncoder().encode(secret);
};

/**
 * Verifies the admin-session-token cookie and ensures the user is a superadmin.
 * @returns {Promise<object|null>} The token payload if valid, otherwise null.
 */
export async function verifyAdminSession() {
    const token = cookies().get('admin-session-token')?.value;

    if (!token) {
        return null; // No token found
    }

    try {
        const { payload } = await jwtVerify(token, getSecret());
        if (payload.role !== 'superadmin') {
            return null; // Not a superadmin
        }
        return payload; // Success!
    } catch (e) {
        console.error('Admin session verification failed:', e);
        return null; // Token is invalid or expired
    }
}