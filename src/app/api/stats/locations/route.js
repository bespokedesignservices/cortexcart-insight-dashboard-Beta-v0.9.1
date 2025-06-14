import db from '../../../../../lib/db'; 
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!siteId) {
    return NextResponse.json({ message: 'Site ID is required' }, { status: 400 });
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
    // This query counts pageviews, groups them by country code,
    // and returns the results.
    const query = `
      SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.country')) as id, 
        COUNT(*) as value
      FROM events
      WHERE
        site_id = ? 
        AND event_name = 'pageview' 
        AND JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.country')) IS NOT NULL
        ${dateFilter}
      GROUP BY 
        id
      ORDER BY 
        value DESC;
    `;
    
    const [results] = await db.query(query, queryParams);
    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('Error fetching location data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
