import { Request, Response } from 'express';
import ApiKey, { IApiKey } from '../models/ApiKey';
import { generateApiKey, hashApiKey, parseExpiry } from '../utils/apiKey';
import { IUser } from '../models/User';

export const createApiKey = async (req: Request, res: Response) => {
    try {
        const { name, permissions, expiry } = req.body;
        const user = req.user as IUser;

        if (!name || !permissions || !expiry) {
            return res.status(400).json({ error: 'Please provide name, permissions, and expiry' });
        }

        const expiresAt = parseExpiry(expiry);
        if (!expiresAt) {
            return res.status(400).json({ error: 'Invalid expiry format. Use 1H, 1D, 1M, 1Y' });
        }

        // Check limit (5 active keys)
        const activeKeysCount = await ApiKey.countDocuments({
            user: user._id,
            revoked: false,
            expiresAt: { $gt: new Date() }
        });

        if (activeKeysCount >= 5) {
            return res.status(400).json({ error: 'Maximum of 5 active API keys allowed' });
        }

        const rawKey = generateApiKey();
        const keyHash = hashApiKey(rawKey);

        const apiKey = await ApiKey.create({
            user: user._id,
            name,
            permissions,
            expiresAt,
            keyHash
        });

        res.status(201).json({
            id: apiKey._id,
            api_key: rawKey,
            expires_at: apiKey.expiresAt
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const rolloverApiKey = async (req: Request, res: Response) => {
    try {
        const { expired_key_id, expiry } = req.body;
        const user = req.user as IUser;

        const oldKey = await ApiKey.findById(expired_key_id);

        if (!oldKey) {
            return res.status(404).json({ error: 'API Key not found' });
        }

        if (oldKey.user.toString() !== user._id.toString()) {
            return res.status(401).json({ error: 'Unauthorized to access this key' });
        }

        // Check if truly expired
        if (new Date() < oldKey.expiresAt) {
            return res.status(400).json({ error: 'Key is not expired yet' });
        }

        const expiresAt = parseExpiry(expiry);
        if (!expiresAt) {
            return res.status(400).json({ error: 'Invalid expiry format' });
        }

        const rawKey = generateApiKey();
        const keyHash = hashApiKey(rawKey);

        const newKey = await ApiKey.create({
            user: user._id,
            name: oldKey.name,
            permissions: oldKey.permissions,
            expiresAt,
            keyHash
        });

        // Optionally mark old key as revoked/handled if not already, though it is expired.

        res.status(200).json({
            id: newKey._id,
            api_key: rawKey,
            expires_at: newKey.expiresAt
        });

    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};
