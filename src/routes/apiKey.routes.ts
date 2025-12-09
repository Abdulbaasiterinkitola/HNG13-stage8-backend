import express from 'express';
import { createApiKey, rolloverApiKey } from '../controllers/apiKey.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/create', protect, createApiKey);
router.post('/rollover', protect, rolloverApiKey);

export default router;
