import crypto from 'crypto';

export const generateApiKey = (): string => {
    return `sk_live_${crypto.randomBytes(24).toString('hex')}`;
};

export const hashApiKey = (key: string): string => {
    return crypto.createHash('sha256').update(key).digest('hex');
};

export const parseExpiry = (expiry: string): Date | null => {
    const now = new Date();
    const match = expiry.match(/^(\d+)([HDMY])$/);

    if (!match) return null;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 'H':
            now.setHours(now.getHours() + value);
            break;
        case 'D':
            now.setDate(now.getDate() + value);
            break;
        case 'M':
            now.setMonth(now.getMonth() + value);
            break;
        case 'Y':
            now.setFullYear(now.getFullYear() + value);
            break;
        default:
            return null;
    }
    return now;
};
