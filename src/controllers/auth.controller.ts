import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export const googleAuthCallback = (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication failed' });
    }

    const user = req.user as IUser;

    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '30d' }
    );

    res.status(200).json({
        message: 'Login successful',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
};
