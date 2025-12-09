import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
    user: mongoose.Types.ObjectId;
    balance: number;
    currency: string;
}

const WalletSchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    currency: {
        type: String,
        required: true,
        default: 'NGN'
    }
}, {
    timestamps: true
});

export default mongoose.model<IWallet>('Wallet', WalletSchema);
