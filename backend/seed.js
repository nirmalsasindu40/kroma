import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Classic Crew T-Shirt',
    category: 'T-Shirts',
    price: 2500,
    image: '',
    tag: 'Bestseller',
  },
  {
    name: 'Oversized Graphic Tee',
    category: 'T-Shirts',
    price: 2950,
    image: '',
    tag: '',
  },
  {
    name: 'Full-Wrap Ceramic Mug',
    category: 'Mugs',
    price: 1450,
    image: '',
    tag: '',
  },
  {
    name: 'Two-Tone Colour Mug',
    category: 'Mugs',
    price: 1650,
    image: '',
    tag: 'New',
  },
  {
    name: 'Slim Phone Case',
    category: 'Phone Cases',
    price: 1850,
    image: '',
    tag: 'New',
  },
  {
    name: 'Tough Phone Case',
    category: 'Phone Cases',
    price: 2250,
    image: '',
    tag: '',
  },
  {
    name: 'Pullover Hoodie',
    category: 'Hoodies',
    price: 5800,
    image: '',
    tag: '',
  },
  {
    name: 'Zip-Up Hoodie',
    category: 'Hoodies',
    price: 6400,
    image: '',
    tag: 'Bestseller',
  },
  {
    name: 'Canvas Tote Bag',
    category: 'Tote Bags',
    price: 1350,
    image: '',
    tag: '',
  },
  {
    name: 'Mini Canvas Tote',
    category: 'Tote Bags',
    price: 1100,
    image: '',
    tag: '',
  },
  {
    name: 'Embroidered Cap',
    category: 'Caps',
    price: 1950,
    image: '',
    tag: 'New',
  },
  {
    name: 'Snapback Cap',
    category: 'Caps',
    price: 2200,
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
