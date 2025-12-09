import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
    wallet: mongoose.Types.ObjectId;
    type: 'deposit' | 'transfer';
    amount: number;
    reference: string;
    status: 'success' | 'failed' | 'pending';
    direction: 'credit' | 'debit';
    relatedWallet?: mongoose.Types.ObjectId;
    description?: string;
    createdAt: Date;
}

const TransactionSchema: Schema = new Schema({
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    type: {
        type: String,
        enum: ['deposit', 'transfer'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reference: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'pending'
    },
    direction: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    relatedWallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet'
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
