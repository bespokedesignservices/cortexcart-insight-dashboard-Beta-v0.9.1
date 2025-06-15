import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const session = await getServerSession(authOptions);

    // Although the button is only visible to logged-in users,
    // we still protect the API for security.
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { subject, message } = await request.json();

        if (!subject || !message) {
            return NextResponse.json({ message: 'Subject and message are required.' }, { status: 400 });
        }

        const userEmail = session.user.email;
        const feedbackType = subject === 'bug' ? 'Bug Report' : 'Feature Request';

        // --- Simulate Sending Email ---
        // In a real application, you would use a library like 'nodemailer' or an
        // email service like SendGrid, Mailgun, or AWS SES here.
        console.log('--- FEEDBACK RECEIVED ---');
        console.log(`To: beta@cortexcart.com`);
        console.log(`From: ${userEmail}`);
        console.log(`Subject: [Feedback] ${feedbackType}`);
        console.log(`Message: ${message}`);
        console.log('-------------------------');
        // --- End of Simulation ---

        return NextResponse.json({ message: 'Feedback sent successfully!' }, { status: 200 });

    } catch (error) {
        console.error('Error sending feedback:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
