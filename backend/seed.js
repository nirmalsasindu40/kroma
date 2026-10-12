import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const SIZE_COLOUR = [
  { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
  { name: 'Colour', options: ['White', 'Black', 'Navy'] },
];
const COLOUR_ONLY = [{ name: 'Colour', options: ['White', 'Black'] }];
const CAP_COLOUR = [{ name: 'Colour', options: ['Black', 'Navy', 'Beige'] }];

const sampleProducts = [
  { name: 'Classic Crew T-Shirt', category: 'T-Shirts', price: 2500, image: '', tag: 'Bestseller', stock: 42, variants: SIZE_COLOUR },
  { name: 'Oversized Graphic Tee', category: 'T-Shirts', price: 2950, image: '', tag: '', stock: 18, variants: SIZE_COLOUR },
  { name: 'Full-Wrap Ceramic Mug', category: 'Mugs', price: 1450, image: '', tag: '', stock: 60, variants: COLOUR_ONLY },
  { name: 'Two-Tone Colour Mug', category: 'Mugs', price: 1650, image: '', tag: 'New', stock: 35, variants: COLOUR_ONLY },
  { name: 'Slim Phone Case', category: 'Phone Cases', price: 1850, image: '', tag: 'New', stock: 50, variants: COLOUR_ONLY },
  { name: 'Tough Phone Case', category: 'Phone Cases', price: 2250, image: '', tag: '', stock: 6, variants: COLOUR_ONLY },
  { name: 'Pullover Hoodie', category: 'Hoodies', price: 5800, image: '', tag: '', stock: 24, variants: SIZE_COLOUR },
  { name: 'Zip-Up Hoodie', category: 'Hoodies', price: 6400, image: '', tag: 'Bestseller', stock: 3, variants: SIZE_COLOUR },
  { name: 'Canvas Tote Bag', category: 'Tote Bags', price: 1350, image: '', tag: '', stock: 70, variants: [] },
  { name: 'Mini Canvas Tote', category: 'Tote Bags', price: 1100, image: '', tag: '', stock: 45, variants: [] },
  { name: 'Embroidered Cap', category: 'Caps', price: 1950, image: '', tag: 'New', stock: 28, variants: CAP_COLOUR },
  { name: 'Snapback Cap', category: 'Caps', price: 2200, image: '', tag: '', stock: 5, variants: CAP_COLOUR },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected — seeding...');

    await Product.deleteMany({}); // clear existing products first
    const created = await Product.insertMany(sampleProducts);

    console.log(`Inserted ${created.length} products (with stock and variants).`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
