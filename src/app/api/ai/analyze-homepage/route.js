import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '../../../../../lib/db';
import { NextResponse } from 'next/server';

async function fetchPageContent(url) {
    try {
        const response = await fetch(url, { redirect: 'follow' });
        if (!response.ok) throw new Error(`Failed to fetch page. Status: ${response.status}`);
        return await response.text();
    } catch (error) {
        // Corrected: Use the error variable to satisfy the linter
        console.error("Error fetching page content:", error);
        throw new Error(`Could not retrieve content from ${url}.`);
    }
}

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    const userEmail = session.user.email;
    const connection = await db.getConnection();

    try {
        // --- Cooldown Logic ---
        const [lastReport] = await connection.query(
            `SELECT created_at FROM analysis_reports 
             WHERE user_email = ? AND report_type = 'homepage' 
             ORDER BY created_at DESC LIMIT 1`,
            [userEmail]
        );

        if (lastReport.length > 0) {
            const lastReportTime = new Date(lastReport[0].created_at);
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            if (lastReportTime > twentyFourHoursAgo) {
                return NextResponse.json({ message: 'You can generate one homepage report per day. Please try again later.' }, { status: 429 });
            }
        }
        // --- END OF COOLDOWN LOGIC ---

        const [rows] = await connection.query('SELECT site_url FROM sites WHERE user_email = ?', [userEmail]);
        const siteUrl = rows[0]?.site_url;
        if (!siteUrl) {
            throw new Error('Site URL not found. Please set it in your General settings.');
        }

        const htmlContent = await fetchPageContent(siteUrl);
        const prompt = `As an expert e-commerce conversion rate optimization consultant, analyze the following HTML... Your response MUST be a valid JSON object... HTML to analyze:\n\`\`\`html\n${htmlContent.substring(0, 10000)}\n\`\`\``;
        
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        const geminiResponse = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

        if (!geminiResponse.ok) {
            throw new Error('Failed to get a response from the AI model.');
        }

        const result = await geminiResponse.json();
        
        if (result.candidates && result.candidates.length > 0) {
            const rawText = result.candidates[0].content.parts[0].text;
            const jsonText = rawText.replace(/```json|```/g, '').trim();
            const analysisData = JSON.parse(jsonText);

            await connection.beginTransaction();
            const [reportResult] = await connection.query(
                'INSERT INTO analysis_reports (user_email, report_type) VALUES (?, ?)',
                [userEmail, 'homepage']
            );
            const reportId = reportResult.insertId;

            for (const [category, recommendations] of Object.entries(analysisData)) {
                if (Array.isArray(recommendations)) {
                    for (const rec of recommendations) {
                        await connection.query(
                            'INSERT INTO recommendation_items (report_id, category, recommendation, confidence) VALUES (?, ?, ?, ?)',
                            [reportId, category, rec.recommendation, rec.confidence]
                        );
                    }
                }
            }
            await connection.commit();
            return NextResponse.json({ message: 'Analysis complete and saved.', reportId: reportId }, { status: 200 });
        } else {
            throw new Error('No content received from the AI model.');
        }
    } catch (error) {
        if (connection) await connection.rollback();
        return NextResponse.json({ message: error.message || 'An internal error occurred.' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
