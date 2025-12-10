import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export const initializePayment = async (amount: number, email: string) => {
    try {
        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: Math.round(amount * 100), // Convert to kobo
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const verifyPayment = async (reference: string) => {
    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const verifyWebhookSignature = (signature: string, body: any, rawBody?: Buffer): boolean => {
    const payload = rawBody ? rawBody.toString() : JSON.stringify(body);
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY || '')
        .update(payload)
        .digest('hex');

    return hash === signature;
};
