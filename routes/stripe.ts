import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

// Create payment
router.post("/create", async (req, res) => {
  const { name, email, amount } = req.body;

  if (!name || !email || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if customer exists
    let customer;
    const customers = await stripe.customers.list({ email });
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({ name, email });
    }

    // Create ephemeral key for mobile
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-06-20" }
    );

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount) * 100,
      currency: "usd",
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      paymentIntent,
      ephemeralKey,
      customer: customer.id,
    });
  } catch (error) {
    console.error("Stripe create error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Confirm payment
router.post("/pay", async (req, res) => {
  const { payment_method_id, payment_intent_id, customer_id } = req.body;

  if (!payment_method_id || !payment_intent_id || !customer_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Attach payment method to customer
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: customer_id,
    });

    // Confirm the PaymentIntent with the return_url
    const result = await stripe.paymentIntents.confirm(payment_intent_id, {
      payment_method: payment_method_id,
      return_url: "easyryde://book-ride", // ✅ Added the return_url for redirects
    });

    res.json({ success: true, message: "Payment successful", result });
  } catch (error) {
    console.error("Stripe confirm error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
