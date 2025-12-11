import { Request, Response } from 'express';
import ApiKey, { IApiKey } from '../models/ApiKey';
import { generateApiKey, hashApiKey, parseExpiry } from '../utils/apiKey';
import { IUser } from '../models/User';

export const createApiKey = async (req: Request, res: Response) => {
    try {
        const { name, permissions, expiry } = req.body;
        const user = req.user as IUser;

        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Name is required and must be a string' });
        }
        if (!permissions || !Array.isArray(permissions)) {
            return res.status(400).json({ error: 'Permissions must be an array of strings' });
        }
        if (!expiry || typeof expiry !== 'string') {
            return res.status(400).json({ error: 'Expiry is required and must be a string (e.g., "1M")' });
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
    } catch (error: any) {
        console.error("Create API Key Error:", error);
        res.status(500).json({ error: error.message || 'Server error', details: error });
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

        res.status(200).json({
            id: newKey._id,
            api_key: rawKey,
            expires_at: newKey.expiresAt
        });

    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};
