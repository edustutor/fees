import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/googleSheets';
import { sendBankPaymentSMS } from '@/lib/sms';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            studentName,
            admissionNo,
            parentName,
            phone,
            grade,
            medium,
            feesType,
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
            AdmissionNo: admissionNo || '',
            StudentName: studentName,
            ParentName: parentName,
            Grade: grade,
            Medium: medium || '',
            Phone: phone,
            FeesType: feesType || '',
            Month: month,
            PaymentMethod: paymentMethod,
            Amount: amount,
            ReceiptURL: receiptUrl || '',
            PayHereOrderID: payhereOrderId || '',
            Status: status || 'Pending', // 'Pending' for bank transfers usually, 'Paid' for PayHere success
        });

        if (paymentMethod === 'bank') {
            try {
                // Send specific SMS for bank transfer
                await sendBankPaymentSMS(phone, studentName);
            } catch (smsError) {
                console.error("Error sending bank SMS:", smsError);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error submitting form:', error);
        return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
    }
}
