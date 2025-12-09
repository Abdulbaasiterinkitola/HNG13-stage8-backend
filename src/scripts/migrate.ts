import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Wallet from '../models/Wallet';

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wallet_db');
        console.log('Connected to MongoDB');

        const wallets = await Wallet.find({ account_number: { $exists: false } });
        console.log(`Found ${wallets.length} wallets without account_number`);

        for (const wallet of wallets) {
            wallet.account_number = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            // We use updateOne because .save() might fail validation if other things are wrong, 
            // but here we just want to set this field.
            // actually wallet.save() should work now that we set it.
            await wallet.save();
            console.log(`Updated wallet for user ${wallet.user}`);
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed', error);
        process.exit(1);
    }
};

migrate();
