import mongoose from 'mongoose';

// One line item within an order. A snapshot of the product's name/price/image
// is stored alongside the reference, so the order still displays correctly
// even if the product is later edited or deleted by an admin.
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    // e.g. { Size: 'M', Colour: 'Black' } — whatever variant groups the
    // product defined, flexible rather than fixed fields.
    variant: { type: Map, of: String, default: {} },
  },
  { _id: false }
);

const shippingSchema = new mongoose.Schema(
  {
    phone: String,
    street: String,
    city: String,
    postalCode: String,
    country: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // PayHere's own order_id, used to correlate the checkout redirect and
    // the eventual confirmation back to this record.
    orderId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    shipping: { type: shippingSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'LKR' },
    // pending: created, awaiting payment confirmation.
    // paid: payment confirmed, stock has been decremented.
    // processing / shipped / completed: admin-managed fulfilment stages.
    // cancelled: payment was cancelled or declined; stock untouched.
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'],
      default: 'pending',
    },
    stockDeducted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
