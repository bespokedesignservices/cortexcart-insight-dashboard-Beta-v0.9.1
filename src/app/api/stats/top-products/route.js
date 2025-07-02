// src/app/api/stats/top-products/route.js

import db from '../../../../../lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// The unused 'request' parameter has been removed from the function definition
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const siteId = session.user.email;

    try {
        const query = `
            SELECT
                JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.productName')) as productName,
                JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.path')) as path,
                COUNT(*) as views
            FROM events
            WHERE
                site_id = ?
                AND event_name = 'pageview'
                AND JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.type')) = 'product'
            GROUP BY
                productName, path
            ORDER BY
                views DESC
            LIMIT 10;
        `;
        
        const [results] = await db.query(query, [siteId]);
        return NextResponse.json(results, { status: 200 });

    } catch (error) {
        console.error('Error fetching top products:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
