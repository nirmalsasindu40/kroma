import mongoose from 'mongoose';

// A single customization option group, e.g. { name: 'Size', options: ['S','M','L'] }
// or { name: 'Colour', options: ['Black','White','Navy'] }. Kept as a flexible
// array rather than fixed fields so a t-shirt (Size + Colour) and a mug
// (Colour only) can both be described the same way.
const variantGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: (arr) => Array.isArray(arr) && arr.length > 0,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    tag: { type: String, default: '' },
    stock: { type: Number, required: true, min: 0, default: 0 },
    // Soft-delete flag: deactivated products disappear from the storefront but
    // stay in the database, so past orders that reference them stay intact.
    active: { type: Boolean, default: true },
    variants: { type: [variantGroupSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);