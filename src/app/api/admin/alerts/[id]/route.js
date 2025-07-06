import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '../../../../../../lib/db';
import { NextResponse } from 'next/server';

// PUT handler to update a specific alert banner
export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params;
        const { title, message, type, is_active } = await request.json();
        
        if (!title || !message || !type || is_active === undefined) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }
        
        await db.query(
            'UPDATE alert_banners SET title = ?, message = ?, type = ?, is_active = ? WHERE id = ?',
            [title, message, type, is_active, id]
        );

        return NextResponse.json({ message: 'Alert updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating alert:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE handler to remove an alert
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params;
        await db.query('DELETE FROM alert_banners WHERE id = ?', [id]);
        return NextResponse.json({ message: 'Alert deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting alert:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
