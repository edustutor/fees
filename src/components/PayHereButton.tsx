'use client';

import { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

interface PayHereButtonProps {
    amount: number;
    customerDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        country: string;
    };
    onSuccess: (orderId: string) => void;
    onDismissed: () => void;
    onError: (error: string) => void;
}

export function PayHereButton({ amount, customerDetails, onSuccess, onDismissed, onError }: PayHereButtonProps) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const orderId = `ORD-${Date.now()}`;
            const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID;
            const currency = 'LKR';

            // Generate hash
            const { data: { hash } } = await axios.post('/api/payhere/hash', {
                merchant_id: merchantId,
                order_id: orderId,
                amount: amount,
                currency: currency
            });

            const isSandbox = process.env.NEXT_PUBLIC_PAYHERE_MODE === 'sandbox';

            const payment = {
                "sandbox": isSandbox,
                "merchant_id": merchantId,
                "return_url": undefined,
                "cancel_url": undefined,
                "notify_url": process.env.NEXT_PUBLIC_PAYHERE_NOTIFY_URL,
                "order_id": orderId,
                "items": "Student Fees",
                "amount": amount.toFixed(2),
                "currency": currency,
                "hash": hash,
                "first_name": customerDetails.firstName,
                "last_name": customerDetails.lastName,
                "email": customerDetails.email,
                "phone": customerDetails.phone,
                "address": customerDetails.address,
                "city": customerDetails.city,
                "country": customerDetails.country,
            };

            // PayHere is loaded in window
            // @ts-ignore
            if (typeof window.payhere !== 'undefined') {
                // @ts-ignore
                window.payhere.onCompleted = function onCompleted(orderId) {
                    // console.log("Payment completed. OrderID:" + orderId);
                    onSuccess(orderId);
                };

                // @ts-ignore
                window.payhere.onDismissed = function onDismissed() {
                    onDismissed();
                };

                // @ts-ignore
                window.payhere.onError = function onError(error) {
                    onError(error);
                };

                // @ts-ignore
                window.payhere.startPayment(payment);
            } else {
                console.error("PayHere SDK not loaded");
                onError("PayHere SDK not loaded");
            }

        } catch (error) {
            console.error(error);
            onError("Failed to initiate payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md hover:shadow-lg transform active:scale-[0.99]"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Pay Online
        </button>
    );
}
