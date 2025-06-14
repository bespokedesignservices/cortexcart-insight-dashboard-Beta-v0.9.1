import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }
  
  const userEmail = session.user.email;

  try {
    const [rows] = await db.query(
      // Updated to select the new 'currency' column
      'SELECT site_name, site_url, currency FROM sites WHERE user_email = ?',
      [userEmail]
    );

    if (rows.length > 0) {
      return NextResponse.json(rows[0], { status: 200 });
    } else {
      // Return default values if no settings exist yet
      return NextResponse.json({ site_name: '', site_url: '', currency: 'USD' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const userEmail = session.user.email;
    // Updated to include 'currency' from the request
    const { siteName, siteUrl, currency } = await request.json();

    if (!siteName || !siteUrl || !currency) {
        return NextResponse.json({ message: 'Site name, URL, and currency are required' }, { status: 400 });
    }

    try {
        // Updated query to insert/update the currency as well
        const query = `
            INSERT INTO sites (user_email, site_name, site_url, currency)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE site_name = VALUES(site_name), site_url = VALUES(site_url), currency = VALUES(currency);
        `;
        await db.query(query, [userEmail, siteName, siteUrl, currency]);
        return NextResponse.json({ message: 'Settings saved successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error saving site settings:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
