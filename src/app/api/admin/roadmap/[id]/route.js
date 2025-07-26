// src/app/api/admin/roadmap/[id]/route.js (Corrected)

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

// Helper function to get the secret key
const getSecret = () => {
    const secret = process.env.JWT_ADMIN_SECRET;
    if (!secret) {
        throw new Error("JWT_ADMIN_SECRET is not set.");
    }
    return new TextEncoder().encode(secret);
};

// Middleware to verify admin token for both PUT and DELETE
async function verifyAdmin(req) {
    const adminCookie = req.cookies.get('admin-session-token');
    const token = adminCookie?.value;

    if (!token) {
        return { error: new NextResponse("Forbidden: No session token found.", { status: 403 }) };
    }
    
    try {
        const secret = getSecret();
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'superadmin') {
            return { error: new NextResponse("Forbidden: You do not have permission.", { status: 403 }) };
        }
        return { payload }; // Success
    } catch { // THE FIX: 'err' has been removed from here
        return { error: new NextResponse("Unauthorized: Invalid session token.", { status: 401 }) };
    }
}

// --- PUT: Update an existing roadmap item ---
export async function PUT(req, { params }) {
    const auth = await verifyAdmin(req);
    if (auth.error) return auth.error;

    try {
        const { id } = params;
        const body = await req.json();
        const { title, description, category, status, releaseDate } = body;

        const updatedItem = await db.roadmap.update({
            where: { id: parseInt(id, 10) },
            data: {
                title,
                description,
                category,
                status,
                release_date: releaseDate ? new Date(releaseDate) : null,
            },
        });

        return NextResponse.json(updatedItem, { status: 200 });

    } catch (error) {
        console.error('[ROADMAP_PUT_ERROR]', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


// --- DELETE: Remove a roadmap item ---
export async function DELETE(req, { params }) {
    const auth = await verifyAdmin(req);
    if (auth.error) return auth.error;

    try {
        const { id } = params;

        await db.roadmap.delete({
            where: { id: parseInt(id, 10) },
        });

        return new NextResponse(null, { status: 204 }); // 204 No Content is standard for a successful delete

    } catch (error) {
        console.error('[ROADMAP_DELETE_ERROR]', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}