imimport { verifyAdminSession } from '@/lib/admin-auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
    
    const adminSession = await verifyAdminSession();
    if (!adminSession) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { topic } = await request.json();
        if (!topic) {
            // This is the correct validation for this specific API
            return NextResponse.json({ message: 'A topic is required.' }, { status: 400 });
        }

        const prompt = `As a content strategist for an e-commerce analytics company, generate 5 compelling and SEO-friendly blog post titles based on the following topic: "${topic}". The titles should be engaging and relevant to store owners. Return the response as a valid JSON object with a single key "ideas", which is an array of strings.`;
        
        const payload = { 
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
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
            const jsonText = result.candidates[0].content.parts[0].text;
            return NextResponse.json(JSON.parse(jsonText), { status: 200 });
        } else {
             throw new Error('Unexpected response structure from AI model.');
        }

    } catch (error) {
        console.error('Error generating blog ideas:', error);
        if (error instanceof SyntaxError) {
             return NextResponse.json({ message: 'Failed to parse AI response as JSON.' }, { status: 500 });
        }
        return NextResponse.json({ message: error.message || 'An internal error occurred.' }, { status: 500 });
    }
}
