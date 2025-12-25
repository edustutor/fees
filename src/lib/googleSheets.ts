import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
// Config variables
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.error("Google Sheets Credentials missing. Set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local");
}

// Initialize Auth
const serviceAccountAuth = new JWT({
    email: GOOGLE_CLIENT_EMAIL,
    key: GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Handle newlines in env vars
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const doc = new GoogleSpreadsheet(SPREADSHEET_ID as string, serviceAccountAuth);

export async function appendToSheet(data: Record<string, string | number>) {
    if (!SPREADSHEET_ID) {
        console.warn("Google Sheets ID missing. Set GOOGLE_SHEET_ID in .env.local");
        console.log("Data to append:", data);
        return;
    }

    try {
        await doc.loadInfo();

        // Select sheet by title 'FeesCollection' or use the first sheet if not found/preferred
        // Using 'FeesCollection' ensures we don't overwrite random sheets
        let sheet = doc.sheetsByTitle['FeesCollection'];

        if (!sheet) {
            // Create if not exists
            sheet = await doc.addSheet({
                title: 'FeesCollection',
                headerValues: [
                    'Timestamp',
                    'StudentName',
                    'ParentName',
                    'Grade',
                    'Medium', // New Column match user order
                    'Phone',
                    'Month',
                    'PaymentMethod',
                    'Amount',
                    'ReceiptURL',
                    'PayHereOrderID',
                    'Status'
                ]
            });
        } else {
            // Robust check for headers:
            // 1. Try to load headers.
            // 2. If loading fails (e.g. empty sheet), we assume we need to create them.
            // 3. If loading succeeds but they are empty, we create them.
            let shouldSetHeaders = false;
            try {
                await sheet.loadHeaderRow();
                if (sheet.headerValues.length === 0 || !sheet.headerValues.includes('Medium')) {
                    shouldSetHeaders = true;
                }
            } catch (e) {
                // loadHeaderRow throws if the sheet is completely empty
                shouldSetHeaders = true;
            }

            if (shouldSetHeaders) {
                // Force update headers to include Medium
                await sheet.setHeaderRow([
                    'Timestamp',
                    'StudentName',
                    'ParentName',
                    'Grade',
                    'Medium',
                    'Phone',
                    'Month',
                    'PaymentMethod',
                    'Amount',
                    'ReceiptURL',
                    'PayHereOrderID',
                    'Status'
                ]);
            }
        }

        await sheet.addRow(data);
    } catch (e) {
        console.error('Error appending to Google Sheet: ', e);
        throw new Error('Failed to save to Google Sheet');
    }
}
