'use client';

import { useState } from 'react';
import { BankTransfer } from './BankTransfer';
import { PayHereButton } from './PayHereButton';
import axios from 'axios';
import { Loader2, CheckCircle, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
// import { useForm } from 'react-hook-form'; 

const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'A/L', 'Other'];
const FEES_TYPES = ['Monthly Fee', 'Exam Fee', 'Monthly + Exam Fee'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Helper component for consistent layout
const CardLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-2xl border-t-8 border-blue-600">
        <div className="flex justify-center mb-6">
            <div className="relative w-40 h-20">
                <Image
                    src="/logo.jpg"
                    alt="EDUS Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
        </div>

        {children}

        {/* Help Section - Persistent */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-2 font-medium">Need assistance?</p>
            <div className="flex flex-col items-center justify-center gap-2">
                <a href="https://wa.me/94704411717" target="_blank" className="text-blue-700 font-bold flex items-center justify-center gap-2 hover:bg-blue-50 px-5 py-2.5 rounded-full transition duration-200">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-6 h-6" />
                    Help Desk: +94 70 441 1717
                </a>
            </div>
        </div>
    </div>
);

export function FeeForm() {
    const [formData, setFormData] = useState({
        studentName: '',
        admissionNo: '',
        parentName: '',
        grade: '',
        medium: '', // New field
        phone: '',
        feesType: '',
        month: '',
        amount: '',
        paymentMethod: ''
    });

    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [bankFile, setBankFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid = formData.studentName && formData.admissionNo && formData.parentName && formData.grade && formData.medium && formData.phone.length === 10 && formData.feesType && formData.month && formData.amount && formData.paymentMethod;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        if (formData.paymentMethod === 'bank' && !bankFile) {
            setErrorMessage('Please select the bank receipt file.');
            return;
        }

        setStatus('submitting');
        setErrorMessage('');

        let receiptUrl = '';

        try {
            // 1. If Bank Transfer, Upload File First
            if (formData.paymentMethod === 'bank' && bankFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', bankFile);

                const uploadRes = await axios.post('/api/s3-upload', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                receiptUrl = uploadRes.data.fileUrl;
            }

            // 2. Submit Form Data
            await axios.post('/api/submit-form', {
                ...formData,
                amount: parseFloat(formData.amount),
                receiptUrl: receiptUrl, // Can be empty if not bank transfer
                status: formData.paymentMethod === 'bank' ? 'Pending Verification' : 'Paid'
            });
            setStatus('success');
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.error || error.message || 'Failed to submit form.';
            setErrorMessage(`Error: ${msg}`);
            setStatus('error');
        }
    };

    const handlePayHereSuccess = async (orderId: string) => {
        setStatus('submitting');
        try {
            await axios.post('/api/submit-form', {
                ...formData,
                amount: parseFloat(formData.amount),
                payhereOrderId: orderId,
                status: 'Paid'
            });
            setStatus('success');
        } catch (error) {
            console.error(error);
            setErrorMessage("Payment successful but failed to save record. Please contact support.");
            setStatus('error');
        }
    }



    if (status === 'success') {
        return (
            <CardLayout>
                <div className="flex flex-col items-center justify-center text-center space-y-6 py-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Payment Submitted!</h2>
                        <p className="text-gray-600 text-lg">
                            Thank you, <span className="font-semibold">{formData.parentName}</span>.
                        </p>
                        <p className="text-gray-600">
                            Your payment for <span className="font-semibold text-blue-700">{formData.studentName}</span> has been recorded.
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-lg hover:shadow-xl transform active:scale-95"
                    >
                        Make Another Payment
                    </button>
                </div>
            </CardLayout>
        )
    }

    return (
        <CardLayout>
            <h2 className="text-3xl font-extrabold text-blue-900 mb-2 text-center uppercase">FAST & EASY PAYMENTS!</h2>
            <p className="text-center text-gray-500 mb-8 font-medium text-balance">Easily transfer Online or deposit via CDM or Slip - quick and hassle -&nbsp;free!</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Student Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Admission No.</label>
                        <input
                            type="text"
                            name="admissionNo"
                            value={formData.admissionNo}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400 bg-gray-50 font-medium"
                            placeholder="ED1001"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Student Name</label>
                        <input
                            type="text"
                            name="studentName"
                            value={formData.studentName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400 bg-gray-50 font-medium"
                            placeholder="Anushalini"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Parent Name</label>
                        <input
                            type="text"
                            name="parentName"
                            value={formData.parentName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400 bg-gray-50 font-medium"
                            placeholder="Sivakumar"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Phone Number (10 digits)</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={(e) => {
                                const re = /^[0-9\b]+$/;
                                if (e.target.value === '' || re.test(e.target.value)) {
                                    if (e.target.value.length <= 10) {
                                        handleChange(e);
                                    }
                                }
                            }}
                            pattern="[0-9]{10}"
                            title="Phone number must be exactly 10 digits"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400 bg-gray-50 font-medium"
                            placeholder="0771234567"
                        />
                    </div>
                </div>

                {/* Grade and Medium */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Grade</label>
                        <select
                            name="grade"
                            value={formData.grade}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 text-gray-900 font-medium"
                        >
                            <option value="">Select Grade</option>
                            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Medium</label>
                        <select
                            name="medium"
                            value={formData.medium}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 text-gray-900 font-medium"
                        >
                            <option value="">Select Medium</option>
                            <option value="Tamil">Tamil</option>
                            <option value="English">English</option>
                            <option value="Sinhala">Sinhala</option>
                        </select>
                    </div>
                </div>



                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Fees Type</label>
                        <select
                            name="feesType"
                            value={formData.feesType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 text-gray-900 font-medium"
                        >
                            <option value="">Select Fee Type</option>
                            {FEES_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Month</label>
                        <select
                            name="month"
                            value={formData.month}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 text-gray-900 font-medium"
                        >
                            <option value="">Select Month</option>
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Amount (LKR)</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400 bg-gray-50 font-medium"
                        placeholder="2500.00"
                    />
                </div>

                {/* Payment Method */}
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Payment Method</label>
                    <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 text-gray-900 font-medium"
                    >
                        <option value="">Select Method</option>
                        <option value="payhere">Pay Online (Card/Online)</option>
                        <option value="bank">Bank Transfer</option>
                    </select>
                </div>

                {/* Conditional Rendering */}
                <div className="pt-4 border-t border-gray-100 mt-6">
                    {formData.paymentMethod === 'bank' && formData.amount && (
                        <div className="space-y-6">
                            <BankTransfer
                                amount={parseFloat(formData.amount)}
                                onFileSelect={setBankFile}
                            />
                            <button
                                type="submit"
                                disabled={status === 'submitting' || !bankFile}
                                className="w-full py-3.5 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-[0.99]"
                            >
                                {status === 'submitting' && <Loader2 className="animate-spin" />}
                                {status === 'submitting' && !bankFile ? "Uploading..." : "Submit Payment"}
                            </button>
                        </div>
                    )}

                    {formData.paymentMethod === 'payhere' && formData.amount && isFormValid && (
                        <div className="mt-4">
                            <PayHereButton
                                amount={parseFloat(formData.amount)}
                                formData={formData}
                                customerDetails={{
                                    firstName: formData.studentName.split(' ')[0] || 'Student',
                                    lastName: formData.studentName.split(' ').slice(1).join(' ') || '.',
                                    email: 'sugeevan@edus.lk',
                                    phone: formData.phone,
                                    address: 'N/A',
                                    city: 'N/A',
                                    country: 'Sri Lanka'
                                }}
                                onSuccess={handlePayHereSuccess}
                                onDismissed={() => setErrorMessage('Payment cancelled')}
                                onError={(err) => setErrorMessage(err)}
                            />
                        </div>
                    )}
                </div>

                {errorMessage && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100 font-medium">
                        {errorMessage}
                    </div>
                )}
            </form>
        </CardLayout>
    );
}
