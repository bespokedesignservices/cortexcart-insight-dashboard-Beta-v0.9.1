import db from '../../../../lib/db'; // Adjust path if necessary
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');
  const startDate = searchParams.get('startDate'); // e.g., '2025-06-01'
  const endDate = searchParams.get('endDate');     // e.g., '2025-06-13'

  if (!siteId) {
    return NextResponse.json({ message: 'Site ID is required' }, { status: 400 });
  }

  // Build the WHERE clause for the date range
  let dateFilter = '';
  const queryParams = [siteId];

  if (startDate && endDate) {
    // Add 1 day to the end date to include the entire day
    const inclusiveEndDate = new Date(endDate);
    inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);

    dateFilter = 'AND created_at BETWEEN ? AND ?';
    queryParams.push(startDate, inclusiveEndDate.toISOString().split('T')[0]);
  }

  try {
    // Dynamically add the date filter to each query
    const pageviewsQuery = `SELECT COUNT(*) as count FROM events WHERE site_id = ? AND event_name = 'pageview' ${dateFilter};`;
    const salesQuery = `SELECT COUNT(*) as count FROM events WHERE site_id = ? AND event_name = 'sale' ${dateFilter};`;
    const revenueQuery = `SELECT SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.amount')) AS DECIMAL(10,2))) as total FROM events WHERE site_id = ? AND event_name = 'sale' ${dateFilter};`;

    const [[pageviewsResult], [salesResult], [revenueResult]] = await Promise.all([
        db.query(pageviewsQuery, queryParams),
        db.query(salesQuery, queryParams),
        db.query(revenueQuery, queryParams)
    ]);

    return NextResponse.json({
      pageviews: pageviewsResult[0].count,
      sales: salesResult[0].count,
      totalRevenue: revenueResult[0].total || 0,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
