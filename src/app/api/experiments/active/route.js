// src/app/api/experiments/active/route.js

import db from '../../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const siteId = searchParams.get('siteId');

    if (!url || !siteId) {
        return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
    }

    try {
        // Find a running experiment that matches the user's email (siteId) and the current URL
        const [experiments] = await db.query(
            `SELECT * FROM ab_experiments 
             WHERE user_email = ? AND status = 'running' AND target_url = ? 
             LIMIT 1`,
            [siteId, url]
        );

        if (experiments.length === 0) {
            return NextResponse.json(null, { status: 200 }); // No active experiment
        }

        const experiment = experiments[0];

        // Fetch the variants for that experiment
        const [variants] = await db.query(
            'SELECT * FROM ab_variants WHERE experiment_id = ?',
            [experiment.id]
        );

        // Attach variants to the experiment object
        experiment.variants = variants;

        return NextResponse.json(experiment, { status: 200 });
    } catch (error) {
        console.error('Error fetching active experiment:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
