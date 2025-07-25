import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; '../../../../../lib/db';
import crypto from 'crypto';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

function verifyPassword(password, storedHash) {
    const [salt, key] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return key === hash;
}

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
        }

        const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);

        if (admins.length === 0) {
            return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
        }

        const admin = admins[0];
        const isPasswordValid = verifyPassword(password, admin.password);

        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
        }

        // --- Create a session token (JWT) ---
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
        const token = await new SignJWT({
            id: admin.id,
            email: admin.email,
            role: admin.role,
        })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h') // Token is valid for 1 hour
        .sign(secret);
        
        // --- Set the token in a secure, http-only cookie ---
        cookies().set('admin-session-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'strict',
        });

        return NextResponse.json({ message: 'Login successful' }, { status: 200 });

    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json({ message: 'An internal error occurred.' }, { status: 500 });
    }
}
