import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updatePaymentStatus, getOrderDetails } from '@/lib/googleSheets';
import { sendPaymentSuccessSMS } from '@/lib/sms';

export async function POST(req: NextRequest) {
    try {
        // PayHere sends data as form-data, not JSON
        const text = await req.text();
        const params = new URLSearchParams(text);

        const merchant_id = params.get('merchant_id');
        const order_id = params.get('order_id');
        const payhere_amount = params.get('payhere_amount');
        const payhere_currency = params.get('payhere_currency');
        const status_code = params.get('status_code');
        const md5sig = params.get('md5sig');

        const merchant_secret = process.env.NEXT_PUBLIC_MERCHANT_SECRET;

        if (!merchant_secret) {
            console.error('NEXT_PUBLIC_MERCHANT_SECRET is not set');
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
        }

        console.log(`[PayHere Notify] Received for Order: ${order_id}, Status: ${status_code}`);

        // 1. Verify Signature
        const secret = merchant_secret.trim();
        const secretHash = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
        const sigString = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`;
        const localSig = crypto.createHash('md5').update(sigString).digest('hex').toUpperCase();

        if (localSig !== md5sig) {
            console.error(`[PayHere Notify] Signature Mismatch! Local: ${localSig} vs Received: ${md5sig}`);
            console.log(`[PayHere Notify] Sig String used: ${sigString}`);
            return NextResponse.json({ error: 'Signature mismatch' }, { status: 400 });
        }

        console.log(`[PayHere Notify] Signature Verified. Updating Status...`);

        // 2. Update Status
        // Status Codes: 2 = Success, 0 = Pending, -1 = Canceled, -2 = Failed, -3 = Chargedback
        let status = 'Pending';
        if (status_code === '2') {
            status = 'Paid';
        } else if (status_code === '-1') {
            status = 'Canceled';
        } else if (status_code === '-2') {
            status = 'Failed';
        } else if (status_code === '-3') {
            status = 'Chargedback';
        }

        console.log(`Updating order ${order_id} to status: ${status}`);
        await updatePaymentStatus(order_id!, status);

        // 3. Send SMS if Paid
        if (status === 'Paid') {
            try {
                const orderDetails = await getOrderDetails(order_id!);
                if (orderDetails && orderDetails.phone) {
                    await sendPaymentSuccessSMS(orderDetails.phone, orderDetails.studentName, orderDetails.amount);
                } else {
                    console.warn(`[SMS] Could not fetch details for Order ${order_id}`);
                }
            } catch (smsError) {
                console.error('[SMS] Error sending SMS:', smsError);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error handling PayHere notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
