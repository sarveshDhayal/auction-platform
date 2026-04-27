// server/services/stripeService.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create a hold (authorize) — card is held but NOT charged yet
async function createHold(userId, amount, paymentMethodId) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe uses cents
    currency: 'usd',
    payment_method: paymentMethodId,
    confirm: true,
    capture_method: 'manual', // <-- KEY: authorize only, capture later
    return_url: 'http://localhost:3000/auctions',
  });
  return paymentIntent;
}

// Release a hold when someone is outbid
async function releaseHold(paymentIntentId) {
  await stripe.paymentIntents.cancel(paymentIntentId);
}

// Capture payment when auction ends — winner is charged
async function capturePayment(paymentIntentId) {
  await stripe.paymentIntents.capture(paymentIntentId);
}

module.exports = { createHold, releaseHold, capturePayment };
