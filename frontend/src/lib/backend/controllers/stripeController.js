const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

const PLAN_PRICES = {
  BASIC: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic_mock',
  PRO: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_mock',
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['BASIC', 'PRO'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const priceId = PLAN_PRICES[plan];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: req.user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `http://localhost:3000/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/dashboard/billing?canceled=true`,
      client_reference_id: req.user.id,
      metadata: {
        userId: req.user.id,
        plan: plan,
      }
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: 'Stripe error', error: error.message });
  }
};

exports.webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    // Update user plan
    await User.findByIdAndUpdate(userId, { plan, stripeCustomerId: session.customer });
    console.log(`Updated user ${userId} to plan ${plan}`);
  }

  res.json({ received: true });
};
