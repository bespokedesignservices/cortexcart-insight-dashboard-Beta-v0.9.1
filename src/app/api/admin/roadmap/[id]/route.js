// src/app/api/admin/roadmap/[id]/route.js

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'; '../../../../../../src/lib/db';
import { NextResponse } from 'next/server';

// PUT handler to update a feature's text
export async function PUT(request, { params }) {
    const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params;
        const { name, description } = await request.json();
        
        if (!name) {
            return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        }
        
        await db.query(
            'UPDATE roadmap_features SET name = ?, description = ? WHERE id = ?',
            [name, description, id]
        );

        return NextResponse.json({ message: 'Feature updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating feature:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE handler to remove a feature
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params;
        await db.query('DELETE FROM roadmap_features WHERE id = ?', [id]);
        return NextResponse.json({ message: 'Feature deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting feature:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
