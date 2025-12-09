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

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(passport.initialize());

app.use('/auth', authRoutes);

import apiKeyRoutes from './routes/apiKey.routes';
app.use('/keys', apiKeyRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Wallet Service API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
