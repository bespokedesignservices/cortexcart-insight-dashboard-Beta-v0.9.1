// src/app/api/admin/login/route.js (Corrected)

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

// Helper function to get the ADMIN JWT secret
const getAdminSecret = () => {
    const secret = process.env.JWT_ADMIN_SECRET;
    if (!secret) {
        throw new Error("JWT_ADMIN_SECRET is not set in environment variables.");
    }
    return new TextEncoder().encode(secret);
};

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return new NextResponse("Email and password are required", { status: 400 });
        }

        const admin = await db.admin.findUnique({
            where: { email: email },
        });

        if (!admin) {
            return new NextResponse("Invalid credentials", { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return new NextResponse("Invalid credentials", { status: 401 });
        }

        // --- THE FIX: Create the token using 'jose' ---
        const secret = getAdminSecret();
        const token = await new SignJWT({
            userId: admin.id,
            email: admin.email,
            role: admin.role,
        })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h') // Token is valid for 1 hour
        .sign(secret);

        // Set the token in a secure, httpOnly cookie
        cookies().set('admin-session-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60, // 1 hour in seconds
        });

        return NextResponse.json({ message: "Login successful" }, { status: 200 });

    } catch (error) {
        console.error('[ADMIN_LOGIN_ERROR]', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}