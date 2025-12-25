import { NextRequest, NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/googleSheets';

export async function POST(req: NextRequest) {
    try {
        const { order_id } = await req.json();
        if (!order_id) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
        }

        const status = await getPaymentStatus(order_id);

        return NextResponse.json({ status: status || 'Pending' });
    } catch (error) {
        console.error('Error fetching status:', error);
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }
}
