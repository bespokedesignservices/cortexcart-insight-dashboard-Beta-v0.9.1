import db from '../../../../lib/db';
import { NextResponse } from 'next/server';
import * as UAParser from 'ua-parser-js';

export async function POST(request) {
  try {
    const eventData = await request.json();
    const { siteId, eventName, data } = eventData;

    if (!siteId || !eventName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const ua = request.headers.get('user-agent');
    const parser = new UAParser(ua);
    const device = parser.getDevice().type || 'desktop';

    // --- NEW: Capture IP Address ---
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim();
    // --- END OF NEW CODE ---
    
    const geo = { country: request.headers.get('x-vercel-ip-country') };
    
    // Add IP, geo, and device data to the event's data object
    const dataWithMeta = { ...data, ip, ...geo, device };

    await db.query(
      'INSERT INTO events (site_id, event_name, event_data) VALUES (?, ?, ?);',
      [siteId, eventName, JSON.stringify(dataWithMeta)] 
    );

    return NextResponse.json({ message: 'Event tracked' }, { status: 200 });
  } catch (error) {
    console.error('--- TRACK API CRASHED ---:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
