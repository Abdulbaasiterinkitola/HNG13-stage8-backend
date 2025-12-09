import express from 'express';
import { deposit, paystackWebhook, getBalance, transfer, getTransactions, getDepositStatus } from '../controllers/wallet.controller';
import { protect, checkPermission } from '../middleware/auth';

const router = express.Router();

router.post('/deposit', protect, checkPermission('deposit'), deposit);
router.post('/paystack/webhook', paystackWebhook); // Webhook does not need user auth, but signature verification
router.get('/balance', protect, checkPermission('read'), getBalance);
router.post('/transfer', protect, checkPermission('transfer'), transfer);
router.get('/transactions', protect, checkPermission('read'), getTransactions);
router.get('/deposit/:reference/status', protect, checkPermission('read'), getDepositStatus);

export default router;
