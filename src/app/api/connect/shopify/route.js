// src/app/api/connect/shopify/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
    const formData = await request.formData();
    const shop = formData.get('shop');

    if (!shop) {
        return NextResponse.json({ message: 'Missing shop name.' }, { status: 400 });
    }

    const shopName = shop.replace('.myshopify.com', '').trim();
    const state = crypto.randomBytes(16).toString('hex');
    const redirectUri = `${process.env.NEXTAUTH_URL}/connect/callback/shopify`;
    const scopes = 'read_analytics,read_orders,read_products';

    const installUrl = `https://${shopName}.myshopify.com/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;

    const response = NextResponse.redirect(installUrl);

    response.cookies.set('shopify_oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
    });

     response.cookies.set('shopify_shop_name', shopName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
    });

    return response;
}