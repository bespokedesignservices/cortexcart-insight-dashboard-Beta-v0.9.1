import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { NextResponse } from 'next/server';

// GET handler to fetch the current beta mode status
export async function GET() {
    try {
        const [rows] = await db.query(
            "SELECT setting_value FROM global_settings WHERE setting_key = 'is_beta_mode_active'"
        );
        const isActive = rows.length > 0 ? rows[0].setting_value === 'true' : true;
        return NextResponse.json({ isActive }, { status: 200 });
    } catch (error) {
        console.error('Error fetching beta mode status:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST handler to update the beta mode status
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { isActive } = await request.json();
        const value = isActive ? 'true' : 'false';

        await db.query(
            "INSERT INTO global_settings (setting_key, setting_value) VALUES ('is_beta_mode_active', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
            [value, value]
        );
        
        return NextResponse.json({ message: 'Beta mode status updated.' }, { status: 200 });
    } catch (error) {
        console.error('Error updating beta mode status:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
