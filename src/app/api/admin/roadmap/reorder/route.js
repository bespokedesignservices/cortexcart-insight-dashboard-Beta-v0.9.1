// src/app/api/admin/roadmap/reorder/route.js

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../../src/lib/auth';
import db from '../../../../../../src/lib/db';
import { NextResponse } from 'next/server';

// PATCH handler to update the order and status of multiple features
export async function PATCH(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const connection = await db.getConnection();
    try {
        const featuresToUpdate = await request.json(); // Expects an array of {id, status, sort_order}
        
        await connection.beginTransaction();
        
        for (const feature of featuresToUpdate) {
            await connection.query(
                'UPDATE roadmap_features SET status = ?, sort_order = ? WHERE id = ?',
                [feature.status, feature.sort_order, feature.id]
            );
        }
        
        await connection.commit();
        
        return NextResponse.json({ message: 'Roadmap order updated successfully' }, { status: 200 });
    } catch (error) {
        await connection.rollback();
        console.error('Error reordering features:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        connection.release();
    }
}
