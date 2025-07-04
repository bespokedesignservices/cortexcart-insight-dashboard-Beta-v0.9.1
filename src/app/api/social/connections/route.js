import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Corrected import
import db from '../../../../lib/db';
import { NextResponse } from 'next/server';

// DELETE handler to remove a social connection
export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { platform } = await request.json();
        if (!platform) {
            return NextResponse.json({ message: 'Platform is required' }, { status: 400 });
        }

        await db.query(
            'DELETE FROM social_connections WHERE user_email = ? AND platform = ?',
            [session.user.email, platform]
        );

        return NextResponse.json({ message: `${platform} account disconnected successfully.` }, { status: 200 });

    } catch (error) {
        console.error('Error disconnecting social account:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
