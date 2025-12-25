# EDUS Fees Collection System

This is the secure payment portal for EDUS student fees.

## Features
- **PayHere Integration**: Online card payments.
- **Bank Transfer**: Submit slip uploads directly to AWS S3.
- **Google Sheets Logging**: Automatically tracks all payments.

## Tech Stack
- Next.js 15 (App Router)
- Tailwind CSS
- AWS S3
- Google Sheets API
- PayHere IPG

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Variables
Ensure `.env.local` is configured with:
- `NEXT_PUBLIC_MERCHANT_ID`
- `MERCHANT_SECRET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`
- `GOOGLE_SHEET_ID`
