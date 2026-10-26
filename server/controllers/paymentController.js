import Stripe from 'stripe';
import User from '../models/User.js';
import { sendSubscriptionEmail } from '../config/email.js';

// Initialize Stripe with secret key
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Initialize Stripe only when a payment feature is used
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error(
      'Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file.'
    );
  }

  return new Stripe(key);
};
// Create a Stripe Checkout Session for Pro subscription
export const createCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripe();
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Create Stripe Customer if not already exists
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: userId.toString() }
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create Checkout Session for Subscription ($10/month)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Resumify Pro Plan',
              description: 'Unlimited Resumes, AI ATS Optimization Audit, PDF & Word Export, Vanity URLs.',
            },
            unit_amount: 1000, // $10.00 in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/app?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/app?payment=cancel`,
      metadata: {
        userId: userId.toString(),
      },
    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("Create Checkout Session Error:", error);
    return res.status(400).json({ message: error.message });
  }
};

// Verify checkout session locally (development fallback without webhooks)
export const verifyCheckoutSession = async (req, res) => {
  try {
     const stripe = getStripe();
    const { sessionId } = req.body;
    const userId = req.userId;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return res.status(400).json({ message: "Session not found" });
    }

    if (session.payment_status === 'paid') {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Upgrade user to premium if not already premium
      if (!user.isPremium) {
        user.isPremium = true;
        user.stripeSubscriptionId = session.subscription;
        user.stripeCustomerId = session.customer;
        await user.save();
        
        // Send email notification (non-blocking)
        sendSubscriptionEmail(user.email, user.name);
      }

      return res.status(200).json({
        success: true,
        message: "Subscription activated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isPremium: user.isPremium
        }
      });
    } else {
      return res.status(400).json({ message: "Payment not completed" });
    }

  } catch (error) {
    console.error("Verify Checkout Session Error:", error);
    return res.status(400).json({ message: error.message });
  }
};

// Stripe Webhook handler for async event updates (Production standard)
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event;

  try {
    // req.body must be a raw buffer (configured in server.js)
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        
        if (userId) {
          const user = await User.findById(userId);
          if (user && !user.isPremium) {
            user.isPremium = true;
            user.stripeSubscriptionId = session.subscription;
            user.stripeCustomerId = session.customer;
            await user.save();
            
            // Send email notification (non-blocking)
            sendSubscriptionEmail(user.email, user.name);
            console.log(`User ${userId} upgraded via Webhook.`);
          }
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        
        // Downgrade user back to free tier when subscription is cancelled/deleted
        const user = await User.findOne({ stripeSubscriptionId: subscriptionId });
        if (user) {
          user.isPremium = false;
          user.stripeSubscriptionId = null;
          await user.save();
          console.log(`User ${user._id} downgraded to Free tier via Webhook.`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        // Mark user as free tier if subscription payment fails
        if (subscriptionId) {
          const user = await User.findOne({ stripeSubscriptionId: subscriptionId });
          if (user) {
            user.isPremium = false;
            await user.save();
            console.log(`User ${user._id} subscription payment failed. Downgraded.`);
          }
        }
        break;
      }

      default:
        // Other unhandled events
        break;
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("Webhook Handler Error:", error);
    return res.status(500).json({ message: "Webhook handler failed" });
  }
};
