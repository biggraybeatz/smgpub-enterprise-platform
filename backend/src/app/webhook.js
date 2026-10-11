const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const router = express.Router();

// NOTE: Stripe webhooks require the raw request body to verify signatures.
router.post(
  '/v1/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`❌ Webhook Signature Verification Failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle checkout session completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const customerEmail = session.customer_details?.email || session.customer_email;
      const amountPaid = session.amount_total / 100;
      const currency = session.currency;
      const paymentIntentId = session.payment_intent;
      const productTier = session.metadata?.tier || 'Commercial License';

      console.log(`💳 Payment Succeeded for customerEmail(${amountPaid} ${currency.toUpperCase()})`);

      try {
        // Record transaction in PostgreSQL
        const queryText = `
          INSERT INTO transactions (customer_email, amount, currency, payment_intent_id, product_tier, status, created_at)
          VALUES ($1, $2, $3, $4, $5, 'completed', NOW())
          RETURNING id;
        `;
        const values = [customerEmail, amountPaid, currency, paymentIntentId, productTier];
        const dbRes = await pool.query(queryText, values);

        console.log(`✅ Transaction logged in DB with ID: ${dbRes.rows[0].id}`);
      } catch (dbErr) {
        console.error('❌ Database insertion failed during webhook processing:', dbErr);
      }
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;


