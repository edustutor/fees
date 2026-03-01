import axios from 'axios';

// Config
const SMS_USER_EMAIL = process.env.SMS_USER_EMAIL;
const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'QKSendDemo';

export async function sendPaymentSuccessSMS(phone: string, studentName: string, amount: string | number) {
    if (!SMS_USER_EMAIL || !SMS_API_KEY) {
        console.warn("SMS Credentials missing. Skipping SMS.");
        return false;
    }

    // Format phone number: Ensure it starts with 94 if 0 is present 
    // QuickSend usually expects 947... or 07... depending on docs. 
    // The prompt example shows "to=0701234567" so we keep it as is, or ensure it matches the provider requirement.
    // Let's rely on the input for now, assuming it's a valid local number.

    const message = `Dear ${studentName}, we have received your payment of Rs. ${amount}. For urgent queries, call 070 707 2072. Thank you! edus.lk`;

    try {
        const url = `https://quicksend.lk/Client/api.php?FUN=SEND_SINGLE&with_get=true&un=${SMS_USER_EMAIL}&up=${SMS_API_KEY}&senderID=${SMS_SENDER_ID}&msg=${encodeURIComponent(message)}&to=${phone}`;

        console.log(`Sending SMS to ${phone}...`);
        const response = await axios.get(url);

        console.log("SMS Response:", response.data);
        return true;
    } catch (error) {
        console.error("Failed to send SMS:", error);
        return false;
    }
}

export async function sendBankPaymentSMS(phone: string, studentName: string) {
    if (!SMS_USER_EMAIL || !SMS_API_KEY) {
        return false;
    }

    const message = `Dear ${studentName}, we have received your payment update. Please allow us some time to verify and once approved, our Student Admin will call you and add you to the class with full details. For urgent queries, call 070 707 2072. – EDUS Online Institute.`;

    try {
        const url = `https://quicksend.lk/Client/api.php?FUN=SEND_SINGLE&with_get=true&un=${SMS_USER_EMAIL}&up=${SMS_API_KEY}&senderID=${SMS_SENDER_ID}&msg=${encodeURIComponent(message)}&to=${phone}`;
        await axios.get(url);
        return true;
    } catch (error) {
        console.error("Failed to send Bank SMS:", error);
        return false;
    }
}
