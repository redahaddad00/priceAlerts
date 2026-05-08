const express = require('express');
const { createCheckoutSession, webhookHandler } = require('../controllers/stripeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
// Webhook needs raw body, we'll handle this in server.js before body-parser
router.post('/webhook', express.raw({type: 'application/json'}), webhookHandler);

module.exports = router;
