// src/app/api/stats/locations/route.js
import { db } from '@/lib/db';import { NextResponse } from 'next/server';
import { simpleCache } from '@/lib/cache';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!siteId) {
    return NextResponse.json({ message: 'Site ID is required' }, { status: 400 });
  }

  const cacheKey = `locations-${siteId}-${startDate}-${endDate}`;
  const cachedData = simpleCache.get(cacheKey);
  if (cachedData) {
    return NextResponse.json(cachedData, { status: 200 });
  }

  let dateFilter = '';
  const queryParams = [siteId];

  if (startDate && endDate) {
    const inclusiveEndDate = new Date(endDate);
    inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
    dateFilter = 'AND created_at BETWEEN ? AND ?';
    queryParams.push(startDate, inclusiveEndDate.toISOString().split('T')[0]);
  }

  try {
    // --- THIS IS THE CORRECTED QUERY ---
    // The ${dateFilter} variable is now included in the WHERE clause
    const query = `
      SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.country')) as name,
        COUNT(*) as value
      FROM events
      WHERE
        site_id = ? 
        AND event_name = 'pageview' 
        AND JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.country')) IS NOT NULL
        AND JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.country')) != ''
        ${dateFilter}
      GROUP BY 
        name
      HAVING
        name IS NOT NULL
      ORDER BY 
        value DESC;
    `;
    
    const [results] = await db.query(query, queryParams);
    simpleCache.set(cacheKey, results, 600);
    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('Error fetching location data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
