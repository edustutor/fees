'use client';

import { useState } from 'react';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const BANK_ACCOUNTS = [
    {
        id: 1,
        name: "HNB",
        display: "HNB",
        accountHolder: "EDUS Lanka (PVT) LTD",
        accountNumber: "016020877522",
        branch: "Jaffna Metro"
    },
    {
        id: 2,
        name: "Bank of Ceylon",
        display: "BOC",
        accountHolder: "EDUS Lanka (PVT) LTD",
        accountNumber: "87979133",
        branch: "Kokuvil"
    },
    {
        id: 3,
        name: "Sampath Bank",
        display: "Sampath Bank",
        accountHolder: "EDUS Lanka (PVT) LTD",
        accountNumber: "103614023585",
        branch: "036 - Wellawatta Super"
    },
    {
        id: 4,
        name: "Cargills Bank",
        display: "CargillsBank",
        accountHolder: "EDUS Lanka (PVT) LTD",
        accountNumber: "00110300356",
        branch: "001 - Corporate Branch"
    }
];

interface BankTransferProps {
    amount: number;
    onFileSelect: (file: File | null) => void;
}

export function BankTransfer({ amount, onFileSelect }: BankTransferProps) {
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
                setError('Only images and PDF files are allowed.');
                setFileName(null);
                onFileSelect(null);
                return;
            }
            setFileName(selectedFile.name);
            onFileSelect(selectedFile);
            setError(null);
        } else {
            setFileName(null);
            onFileSelect(null);
        }
    };

    return (
        <div className="space-y-6 border p-6 rounded-lg bg-blue-50 border-blue-100">
            <h3 className="font-bold text-lg text-blue-900 mb-4">Bank Transfer Details</h3>

            <div className="grid gap-4 md:grid-cols-2">
                {BANK_ACCOUNTS.map((bank) => (
                    <div key={bank.id} className="bg-white p-4 rounded-md shadow-sm border border-blue-100">
                        <h4 className="font-bold text-blue-600 mb-1">{bank.display}</h4>
                        <div className="text-sm text-gray-700 space-y-0.5">
                            <p><span className="font-medium text-gray-500">Account Name:</span> {bank.accountHolder}</p>
                            <p><span className="font-medium text-gray-500">Account No:</span> <span className="font-mono font-bold text-gray-900">{bank.accountNumber}</span></p>
                            <p><span className="font-medium text-gray-500">Branch:</span> {bank.branch}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-2 border-t border-blue-200">
                <p className="text-blue-900 mb-2">Total Amount to Transfer: <span className="font-bold text-xl ml-2">LKR {amount.toFixed(2)}</span></p>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-900">Upload Receipt (Image/PDF)</label>
                <div className="flex items-center gap-2">
                    <div className="relative w-full">
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition text-blue-700 bg-white shadow-sm"
                        >
                            <Upload className="w-5 h-5 mr-2 flex-shrink-0" />
                            {fileName ? <span className="font-semibold truncate max-w-[200px]">{fileName}</span> : "Click to select receipt"}
                        </label>
                    </div>
                    {fileName && (
                        <button
                            onClick={() => {
                                setFileName(null);
                                onFileSelect(null);
                                setError(null);
                                // Reset the file input value to allow re-selecting same file
                                const input = document.getElementById('file-upload') as HTMLInputElement;
                                if (input) input.value = '';
                            }}
                            className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            title="Remove file"
                            type="button"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                {fileName && <p className="text-sm text-green-600 flex items-center gap-1 font-medium"><Check className="w-4 h-4" /> Ready to submit</p>}
            </div>
        </div>
    );
}
