import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
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
    // cartItems is the structured cart line array (productId, quantity,
    // variant selections) — separate from `items`, which stays a short
    // human-readable summary string PayHere's own checkout window displays.
    const { items, cartItems, shipping, shippingCost = 0 } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }
    if (!shipping?.phone || !shipping?.street || !shipping?.city || !shipping?.country) {
      return res.status(400).json({ message: 'Shipping details are incomplete.' });
    }

    // The amount is never trusted from the browser — it is recalculated
    // here from each product's current price in the database, exactly as
    // the Week 8 practical requires ("do not trust totals sent by the
    // browser"). This also naturally re-validates that every product ID in
    // the cart still exists.
    const productIds = cartItems.map((i) => i.productId).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const orderItems = [];
    let subtotal = 0;
    for (const line of cartItems) {
      const product = productMap.get(String(line.productId));
      if (!product || product.active === false) {
        return res.status(400).json({ message: `A product in your cart is no longer available.` });
      }
      const quantity = Math.max(1, Number(line.quantity) || 1);
      if (product.stock < quantity) {
        return res.status(400).json({ message: `${product.name} only has ${product.stock} left in stock.` });
      }
      const lineTotal = product.price * quantity;
      subtotal += lineTotal;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        variant: line.variant || {},
      });
    }
    const total = subtotal + Number(shippingCost || 0);
    if (total <= 0) {
      return res.status(400).json({ message: 'A valid order amount is required.' });
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
    const formattedAmount = total.toFixed(2);
    const currency = 'LKR';
    const orderId = `KROMA-${Date.now()}`;

    // Created as "pending" now, before the customer even reaches PayHere's
    // checkout page. If they pay, /order-success confirms this record and
    // stock is deducted; if they cancel or never finish, it is left as
    // pending/cancelled and stock is never touched.
    await Order.create({
      orderId,
      user: user._id,
      items: orderItems,
      shipping,
      subtotal,
      shippingCost: Number(shippingCost || 0),
      total,
      currency,
      status: 'pending',
    });

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
        return_url: `${clientUrl}/order-success?order=${orderId}`,
        cancel_url: `${clientUrl}/order-cancelled?order=${orderId}`,
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

// Shared by both /confirm and /notify: marks an order paid and deducts
// stock exactly once (stockDeducted guards against double-processing if
// both the browser's return_url and PayHere's server-to-server notify_url
// end up calling this for the same order).
async function markOrderPaid(orderId) {
  const order = await Order.findOne({ orderId });
  if (!order) return null;
  if (order.status === 'paid' || order.status === 'processing' || order.status === 'shipped' || order.status === 'completed') {
    return order; // already confirmed, nothing further to do
  }
  order.status = 'paid';
  if (!order.stockDeducted) {
    for (const item of order.items) {
      if (item.product) {
        await Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        );
      }
    }
    order.stockDeducted = true;
  }
  await order.save();
  return order;
}

// POST /api/payment/confirm — called by the OrderSuccessPage once the
// customer's browser is redirected back from PayHere. This is what
// actually marks the order paid in a localhost dev setup, since PayHere's
// sandbox cannot reach notify_url on a machine that isn't publicly
// reachable from the internet. In a deployed production environment,
// /notify below is the authoritative source of truth instead.
router.post('/confirm', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'orderId is required.' });

    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (String(order.user) !== String(req.user.id)) {
      return res.status(403).json({ message: 'This order does not belong to you.' });
    }

    const updated = await markOrderPaid(orderId);
    res.json({ order: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/cancel — called by OrderCancelledPage so an abandoned
// pending order doesn't sit around forever looking like it might still be
// completed. Stock was never deducted for a pending order, so there is
// nothing to roll back.
router.post('/cancel', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ orderId, user: req.user.id });
    if (order && order.status === 'pending') {
      order.status = 'cancelled';
      await order.save();
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/notify — PayHere calls this directly, server-to-server,
// once a payment finishes. This is the authoritative confirmation path in
// a real deployment (unlike return_url, it can't be skipped by closing the
// tab), but PayHere's sandbox cannot reach a plain localhost address, so
// during local development /confirm above is what actually marks orders
// paid. A production deployment should additionally verify PayHere's own
// signature on this payload before trusting it.
router.post('/notify', express.urlencoded({ extended: true }), async (req, res) => {
  console.log('PayHere notify received:', req.body);
  try {
    const { order_id: orderId, status_code: statusCode } = req.body;
    if (orderId && statusCode === '2') {
      await markOrderPaid(orderId);
    }
  } catch (err) {
    console.error('Failed to process PayHere notify:', err.message);
  }
  res.sendStatus(200);
});

export default router;