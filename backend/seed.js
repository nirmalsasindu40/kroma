import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Classic Crew T-Shirt',
    category: 'T-Shirts',
    price: 18.99,
    image: '',
    tag: 'Bestseller',
  },
  {
    name: 'Oversized Graphic Tee',
    category: 'T-Shirts',
    price: 21.5,
    image: '',
    tag: '',
  },
  {
    name: 'Full-Wrap Ceramic Mug',
    category: 'Mugs',
    price: 14.5,
    image: '',
    tag: '',
  },
  {
    name: 'Two-Tone Colour Mug',
    category: 'Mugs',
    price: 15.99,
    image: '',
    tag: 'New',
  },
  {
    name: 'Slim Phone Case',
    category: 'Phone Cases',
    price: 16.0,
    image: '',
    tag: 'New',
  },
  {
    name: 'Tough Phone Case',
    category: 'Phone Cases',
    price: 19.99,
    image: '',
    tag: '',
  },
  {
    name: 'Pullover Hoodie',
    category: 'Hoodies',
    price: 34.99,
    image: '',
    tag: '',
  },
  {
    name: 'Zip-Up Hoodie',
    category: 'Hoodies',
    price: 38.5,
    image: '',
    tag: 'Bestseller',
  },
  {
    name: 'Canvas Tote Bag',
    category: 'Tote Bags',
    price: 12.99,
    image: '',
    tag: '',
  },
  {
    name: 'Mini Canvas Tote',
    category: 'Tote Bags',
    price: 10.5,
    image: '',
    tag: '',
  },
  {
    name: 'Embroidered Cap',
    category: 'Caps',
    price: 15.5,
    image: '',
    tag: 'New',
  },
  {
    name: 'Snapback Cap',
    category: 'Caps',
    price: 17.0,
    image: '',
    tag: '',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected — seeding...');

    await Product.deleteMany({}); // clear existing products first
    const created = await Product.insertMany(sampleProducts);

    console.log(`Inserted ${created.length} products.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
