import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/googleSheets';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            studentName,
            parentName,
            phone,
            grade,
            medium,
            month,
            paymentMethod,
            amount,
            receiptUrl,
            payhereOrderId,
            status
        } = body;

        console.log("Form Submission Body:", body);
        console.log("Extracted Amount:", amount, "Type:", typeof amount);

        const timestamp = new Date().toISOString();

        await appendToSheet({
            Timestamp: timestamp,
            StudentName: studentName,
            ParentName: parentName,
            Grade: grade,
            Medium: medium || '',
            Phone: phone,
            Month: month,
            PaymentMethod: paymentMethod,
            Amount: amount,
            ReceiptURL: receiptUrl || '',
            PayHereOrderID: payhereOrderId || '',
            Status: status || 'Pending', // 'Pending' for bank transfers usually, 'Paid' for PayHere success
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error submitting form:', error);
        return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
    }
}
