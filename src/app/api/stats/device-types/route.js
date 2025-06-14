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
    // This query counts pageviews and groups them by device type.
    const query = `
      SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.device')) as device, 
        COUNT(*) as views
      FROM events
      WHERE
        site_id = ? 
        AND event_name = 'pageview' 
        AND JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.device')) IS NOT NULL
        ${dateFilter}
      GROUP BY 
        device;
    `;
    
    const [results] = await db.query(query, queryParams);
    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('Error fetching device data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
