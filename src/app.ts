import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db';
import './config/passport';
import authRoutes from './routes/auth.routes';
import passport from 'passport';

dotenv.config();

connectDB();

const app = express();

app.set('trust proxy', 1);

app.use(cors());
app.use(helmet());
app.use(express.json({
    verify: (req: any, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(passport.initialize());

app.use('/auth', authRoutes);

import apiKeyRoutes from './routes/apiKey.routes';
import walletRoutes from './routes/wallet.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './docs/swagger';

app.use('/keys', apiKeyRoutes);
app.use('/wallet', walletRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Wallet Service API is running on Port 3000');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
