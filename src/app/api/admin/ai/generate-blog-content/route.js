import { verifyAdminSession } from '@/lib/admin-auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
   const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    try {
        const { title, type } = await request.json();
        if (!title || !type) {
            return NextResponse.json({ message: 'Title and type are required.' }, { status: 400 });
        }

        let prompt;

        if (type === 'content') {
            prompt = `As an expert content writer for an e-commerce analytics company, write a blog post about "${title}". The post should be engaging, informative, well-structured with headings and paragraphs, and at least 400 words long. Use Markdown for formatting.`;
        } else if (type === 'meta_description') {
            prompt = `As an SEO expert, write a compelling, SEO-friendly meta description for a blog post titled "${title}". The description should be a maximum of 160 characters.`;
        } else {
            return NextResponse.json({ message: 'Invalid generation type.' }, { status: 400 });
        }
        
        const payload = { 
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        };
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.text();
            console.error("Gemini API Error:", errorBody);
            throw new Error('Failed to get a response from the AI model.');
        }

        const result = await geminiResponse.json();

        if (result.candidates && result.candidates[0] && result.candidates[0].content.parts[0]) {
            const generatedText = result.candidates[0].content.parts[0].text;
            return NextResponse.json({ generatedText }, { status: 200 });
        } else {
            throw new Error('Unexpected response structure from AI model.');
        }

    } catch (error) {
        console.error('Error generating blog content:', error);
        return NextResponse.json({ message: error.message || 'An internal error occurred.' }, { status: 500 });
    }
}
