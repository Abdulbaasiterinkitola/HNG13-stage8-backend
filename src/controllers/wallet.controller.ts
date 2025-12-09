import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import { initializePayment, verifyWebhookSignature } from '../services/paystack.service';
import { IUser } from '../models/User';

export const deposit = async (req: Request, res: Response) => {
    try {
        const { amount } = req.body;
        const user = req.user as IUser;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const paystackResponse = await initializePayment(amount, user.email);
        const { reference, authorization_url } = paystackResponse.data;

        const wallet = await Wallet.findOne({ user: user._id });
        if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

        await Transaction.create({
            wallet: wallet._id,
            type: 'deposit',
            amount,
            reference,
            status: 'pending',
            direction: 'credit',
            description: 'Wallet funding (Paystack)'
        });

        res.status(200).json({ reference, authorization_url });
    } catch (error) {
        res.status(500).json({ error: 'Payment initialization failed' });
    }
};

export const paystackWebhook = async (req: Request, res: Response) => {
    try {
        const signature = req.headers['x-paystack-signature'] as string;

        if (!verifyWebhookSignature(signature, req.body, (req as any).rawBody)) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const event = req.body;

        if (event.event === 'charge.success') {
            const { reference } = event.data;
            const amount = event.data.amount / 100;

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                const transaction = await Transaction.findOne({ reference }).session(session);

                if (transaction && transaction.status === 'pending') {
                    const wallet = await Wallet.findById(transaction.wallet).session(session);

                    if (wallet) {
                        transaction.status = 'success';
                        await transaction.save({ session });

                        wallet.balance += amount;
                        await wallet.save({ session });

                        await session.commitTransaction();
                    } else {
                        await session.abortTransaction();
                    }
                } else {
                    await session.abortTransaction();
                }
            } catch (err) {
                await session.abortTransaction();
                console.error(err);
            } finally {
                session.endSession();
            }
        }

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
};

export const getBalance = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const wallet = await Wallet.findOne({ user: user._id });

        if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

        res.json({
            balance: wallet.balance,
            currency: wallet.currency,
            account_number: wallet.account_number
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const transfer = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { wallet_number, amount } = req.body;
        const user = req.user as IUser;

        if (!amount || amount <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ error: "Invalid amount" });
        }

        const senderWallet = await Wallet.findOne({ user: user._id }).session(session);
        const receiverWallet = await Wallet.findOne({ account_number: wallet_number }).session(session);

        if (!senderWallet) {
            await session.abortTransaction();
            return res.status(404).json({ error: "Sender wallet not found" });
        }
        if (!receiverWallet) {
            await session.abortTransaction();
            return res.status(404).json({ error: "Receiver wallet not found" });
        }

        if (senderWallet.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({ error: "Insufficient funds" });
        }

        senderWallet.balance -= amount;
        await senderWallet.save({ session });

        receiverWallet.balance += amount;
        await receiverWallet.save({ session });

        const ref = `TRX-${Date.now()}`;

        await Transaction.create([{
            wallet: senderWallet._id,
            type: 'transfer',
            amount,
            reference: ref,
            status: 'success',
            direction: 'debit',
            relatedWallet: receiverWallet._id,
            description: `Transfer to ${receiverWallet.account_number}`
        }], { session });

        await Transaction.create([{
            wallet: receiverWallet._id,
            type: 'transfer',
            amount,
            reference: ref + '-CREDIT',
            status: 'success',
            direction: 'credit',
            relatedWallet: senderWallet._id,
            description: `Transfer from ${senderWallet.account_number}`
        }], { session });

        await session.commitTransaction();
        res.json({ status: 'success', message: 'Transfer completed', reference: ref });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: "Transfer failed" });
    } finally {
        session.endSession();
    }
};

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const wallet = await Wallet.findOne({ user: user._id });
        if (!wallet) return res.status(404).json({ error: "Wallet not found" });

        const transactions = await Transaction.find({ wallet: wallet._id }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

// Helper for status check
export const getDepositStatus = async (req: Request, res: Response) => {
    try {
        const { reference } = req.params;
        const transaction = await Transaction.findOne({ reference, type: 'deposit' });

        if (!transaction) return res.status(404).json({ error: "Transaction not found" });

        res.json({
            reference: transaction.reference,
            status: transaction.status,
            amount: transaction.amount
        });
    } catch (error) {
        res.status(500).json({ error: "error" });
    }
}
