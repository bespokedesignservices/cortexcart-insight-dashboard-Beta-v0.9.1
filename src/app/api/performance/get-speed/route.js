// src/app/api/performance/get-speed/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        // 1. Get the user's saved site URL
        const [sites] = await db.query('SELECT site_url FROM sites WHERE user_email = ?', [session.user.email]);
        const siteUrl = sites[0]?.site_url;

        if (!siteUrl) {
            return NextResponse.json({ message: 'Site URL not found in settings.' }, { status: 404 });
        }

        // 2. Call the Google PageSpeed Insights API
        const apiKey = process.env.PAGESPEED_API_KEY; // You'll need to add this to .env.local
        const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(siteUrl)}&key=${apiKey}&strategy=mobile`;

        const response = await fetch(apiEndpoint);
        if (!response.ok) {
            throw new Error('Failed to get a response from PageSpeed Insights API.');
        }
        const data = await response.json();

        // 3. Extract the most important scores
        const performanceScore = data.lighthouseResult.categories.performance.score * 100;
        const lcp = data.lighthouseResult.audits['largest-contentful-paint'].displayValue;
        const cls = data.lighthouseResult.audits['cumulative-layout-shift'].displayValue;

        const performanceData = {
            score: Math.round(performanceScore),
            lcp,
            cls,
        };

        return NextResponse.json(performanceData, { status: 200 });

    } catch (error) {
        console.error("Error fetching PageSpeed data:", error);
        return NextResponse.json({ message: `Failed to fetch PageSpeed data: ${error.message}` }, { status: 500 });
    }
}
