import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import ApiKey from '../models/ApiKey';
import { hashApiKey } from '../utils/apiKey';

interface DecodedToken {
    id: string;
}

// Extend Express Request type locally
declare global {
    namespace Express {
        interface Request {
            user?: User; // strict typing would require importing User document type
            apiKeyPermissions?: string[];
            authMethod?: 'jwt' | 'apikey';
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    let token;
    const apiKey = req.headers['x-api-key'] as string;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as DecodedToken;

            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ error: 'Not authorized, user not found' });
            }

            req.user = user;
            req.authMethod = 'jwt';
            req.apiKeyPermissions = ['*'];
            return next();
        } catch (error) {
            return res.status(401).json({ error: 'Not authorized, token failed' });
        }
    }

    if (apiKey) {
        try {
            const keyHash = hashApiKey(apiKey);
            const keyRecord = await ApiKey.findOne({ keyHash });

            if (!keyRecord) {
                return res.status(401).json({ error: 'Invalid API Key' });
            }

            if (keyRecord.revoked) {
                return res.status(401).json({ error: 'API Key revoked' });
            }

            if (new Date() > keyRecord.expiresAt) {
                return res.status(401).json({ error: 'API Key expired' });
            }

            const user = await User.findById(keyRecord.user);
            if (!user) {
                return res.status(401).json({ error: 'User associated with key not found' });
            }

            req.user = user;
            req.authMethod = 'apikey';
            req.apiKeyPermissions = keyRecord.permissions;
            return next();

        } catch (error) {
            return res.status(500).json({ error: 'Server error during API Key validation' });
        }
    }

    return res.status(401).json({ error: 'Not authorized, no token or api key' });
};

export const checkPermission = (requiredPermission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.authMethod === 'jwt') {
            return next();
        }

        if (req.apiKeyPermissions && (req.apiKeyPermissions.includes(requiredPermission) || req.apiKeyPermissions.includes('*'))) {
            return next();
        }

        return res.status(403).json({ error: `Missing permission: ${requiredPermission}` });
    };
};

export const protect = authenticate;
