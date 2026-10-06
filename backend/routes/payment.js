import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// The MD5 hash is calculated here, on the backend, rather than in the
// browser. The formula needs PAYHERE_MERCHANT_SECRET, and that value must
// never be shipped to the browser — anyone who read it out of the page's
// JavaScript could forge a fake "payment approved" hash for any amount.
function buildPayHereHash({ merchantId, orderId, amount, currency, merchantSecret }) {
  const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const raw = `${merchantId}${orderId}${amount}${currency}${hashedSecret}`;
  return crypto.createHash('md5').update(raw).digest('hex').toUpperCase();
}

// POST /api/payment/initiate
// Takes the order details from the checkout page, and returns everything
// the browser needs to build the hidden form that POSTs to PayHere's
// sandbox checkout — including the pre-calculated, tamper-proof hash.
router.post('/initiate', protect, async (req, res) => {
  try {
    const { amount, items, shipping } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'A valid order amount is required.' });
    }
    if (!shipping?.phone || !shipping?.street || !shipping?.city || !shipping?.country) {
      return res.status(400).json({ message: 'Shipping details are incomplete.' });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantId || !merchantSecret) {
      return res.status(500).json({
        message:
          'PayHere is not configured on the server yet. Add PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET to backend/.env.',
      });
    }

    // PayHere requires the amount formatted with exactly 2 decimal places —
    // a mismatch here (e.g. "1000" instead of "1000.00") causes the hash
    // PayHere calculates on their end to not match ours, and the payment
    // is rejected before it even reaches the test-card screen.
    const formattedAmount = Number(amount).toFixed(2);
    const currency = 'LKR';
    const orderId = `KROMA-${Date.now()}`;

    const hash = buildPayHereHash({
      merchantId,
      orderId,
      amount: formattedAmount,
      currency,
      merchantSecret,
    });

    const [firstName, ...rest] = (user.name || 'Customer').trim().split(' ');
    const lastName = rest.join(' ') || firstName;

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    res.json({
      action: 'https://sandbox.payhere.lk/pay/checkout',
      fields: {
        merchant_id: merchantId,
        return_url: `${clientUrl}/order-success`,
        cancel_url: `${clientUrl}/order-cancelled`,
        notify_url: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/payment/notify`,
        order_id: orderId,
        items: items || 'Kroma order',
        currency,
        amount: formattedAmount,
        first_name: firstName,
        last_name: lastName,
        email: user.email,
        phone: shipping.phone,
        address: shipping.street,
        city: shipping.city,
        country: shipping.country || 'Sri Lanka',
        hash,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/notify — PayHere calls this directly, server-to-server,
// once a payment finishes (this is separate from return_url, which is only
// where the customer's browser gets redirected). A real deployment would
// verify PayHere's own signature on this request and update an Order
// record here. Left as a stub for now since this project doesn't persist
// orders yet — logging it is enough to see the notification arrive during
// sandbox testing.
router.post('/notify', express.urlencoded({ extended: true }), (req, res) => {
  console.log('PayHere notify received:', req.body);
  res.sendStatus(200);
});

export default router;