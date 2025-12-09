import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Wallet Service API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
