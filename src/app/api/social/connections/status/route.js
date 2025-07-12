import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '../../../../../lib/db';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Handles GET requests to check connection status
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const userEmail = session.user.email;
    const supportedPlatforms = ['x', 'facebook', 'pinterest'];

    try {
        const [connections] = await db.query(
            'SELECT platform FROM social_connect WHERE user_email = ?',
            [userEmail]
        );

        const status = {};
        const connectedPlatforms = new Set(connections.map(c => c.platform.toLowerCase()));

        supportedPlatforms.forEach(platform => {
            status[platform] = connectedPlatforms.has(platform);
        });

        return NextResponse.json(status, { status: 200 });

    } catch (error) {
        console.error('Error fetching social connection statuses:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// Handles DELETE requests to disconnect an account
export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { platform } = await request.json();
        if (!platform) {
            return NextResponse.json({ message: 'Platform not specified' }, { status: 400 });
        }

        const userEmail = session.user.email;

        // The database query to delete the connection
        await db.query(
            'DELETE FROM social_connect WHERE user_email = ? AND platform = ?',
            [userEmail, platform]
        );

        // This clears the server cache and ensures the UI updates
        revalidatePath('/settings');

        return NextResponse.json({ message: `${platform} disconnected successfully` }, { status: 200 });

    } catch (error) {
        console.error('Error disconnecting account:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}