import express from 'express';
import { createCheckoutSession, verifyCheckoutSession, stripeWebhook } from '../controllers/paymentController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Webhook endpoint (must NOT be parsed as JSON, handled raw in server.js)
router.post('/webhook', stripeWebhook);

// Protected Checkout endpoints
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify-session', protect, verifyCheckoutSession);

export default router;
