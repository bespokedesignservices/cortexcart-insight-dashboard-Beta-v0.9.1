// src/app/api/heatmaps/route.js

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pagePath = searchParams.get('path');
    const siteId = session.user.email;

    if (!pagePath) {
        return NextResponse.json({ message: 'Page path is required' }, { status: 400 });
    }

    try {
        // This query finds all 'click' events for a specific user and page path
        // from the last 30 days.
        const query = `
            SELECT JSON_EXTRACT(event_data, '$.x') as x, JSON_EXTRACT(event_data, '$.y') as y
            FROM events
            WHERE
                site_id = ?
                AND event_name = 'click'
                AND JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.path')) = ?
                AND created_at >= NOW() - INTERVAL 30 DAY;
        `;
        
        const [results] = await db.query(query, [siteId, pagePath]);

        // Format the data for the heatmap.js library
        const heatmapData = results.map(row => ({
            x: row.x,
            y: row.y,
            value: 1 // Each click has a value of 1
        }));

        return NextResponse.json(heatmapData, { status: 200 });

    } catch (error) {
        console.error('Error fetching heatmap data:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
