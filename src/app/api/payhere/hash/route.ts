import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { merchant_id, order_id, amount, currency } = body;
        const merchant_secret = process.env.MERCHANT_SECRET;

        if (!merchant_id || !order_id || !amount || !currency || !merchant_secret) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const formattedAmount = Number(amount).toFixed(2);
        const secret = merchant_secret.trim();
        const secretHash = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();

        console.log(`Generating Hash for: ID=${merchant_id}, Order=${order_id}, Amt=${formattedAmount}, Curr=${currency}`);

        const hashString = `${merchant_id}${order_id}${formattedAmount}${currency}${secretHash}`;
        const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

        return NextResponse.json({ hash });
    } catch (error) {
        console.error('Error generating hash:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
