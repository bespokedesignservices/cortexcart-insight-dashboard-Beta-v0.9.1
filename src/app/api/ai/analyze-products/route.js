import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '../../../../../lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    const userEmail = session.user.email;

    try {
        // 1. Find underperforming products (high views, low sales)
        const productStatsQuery = `
            SELECT
                productId,
                productName,
                SUM(CASE WHEN event_name = 'pageview' THEN 1 ELSE 0 END) AS views,
                SUM(CASE WHEN event_name = 'sale' THEN 1 ELSE 0 END) AS sales
            FROM (
                SELECT
                    JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.productId')) AS productId,
                    JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.productName')) AS productName,
                    event_name
                FROM events
                WHERE site_id = ? AND JSON_EXTRACT(event_data, '$.productId') IS NOT NULL
            ) AS product_events
            GROUP BY productId, productName
            HAVING views > 10 AND sales < 2
            ORDER BY views DESC
            LIMIT 3;
        `;
        const [products] = await db.query(productStatsQuery, [userEmail]);

        if (products.length === 0) {
            return NextResponse.json({ message: "No underperforming products found to analyze. Keep gathering data!" }, { status: 200 });
        }

        // 2. Construct the prompt for Gemini
        const prompt = `
            As an expert e-commerce copywriter, you are tasked with improving underperforming products.
            Here is a list of products with their view and sales counts:
            ${JSON.stringify(products, null, 2)}

            For each product, suggest a new, more compelling "productName" and a brief, exciting "productDescription" (max 20 words) designed to increase conversions.
            
            Your response MUST be a valid JSON object. Do not include any text or markdown formatting before or after the JSON object.
            The JSON object should be an array, where each element is an object containing "productId", "originalName", "newName", and "newDescription".
        `;

        // 3. Call the Gemini API
        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiKey = ""; // Leave as-is
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) {
            throw new Error('Failed to get a response from the AI model.');
        }

        const result = await geminiResponse.json();
        
        if (result.candidates && result.candidates.length > 0) {
            const rawText = result.candidates[0].content.parts[0].text;
            const jsonText = rawText.replace(/```json|```/g, '').trim();
            const analysisData = JSON.parse(jsonText);
            return NextResponse.json(analysisData, { status: 200 });
        } else {
            throw new Error('No content received from the AI model.');
        }

    } catch (error) {
        console.error('Error in product analysis API:', error);
        return NextResponse.json({ message: error.message || 'An internal error occurred.' }, { status: 500 });
    }
}
