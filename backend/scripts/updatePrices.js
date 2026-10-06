import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.getClient().db();
    const products = await db.collection('products').find({}).toArray();
    console.log('Current products:', products.map((p) => ({ name: p.name, price: p.price })));

    // Update products with low USD-like prices (< 100) to realistic LKR prices
    for (const p of products) {
      if (p.price < 100) {
        let newPrice = 2500;
        if (p.name.toLowerCase().includes('hoodie')) newPrice = 5800;
        else if (p.name.toLowerCase().includes('mug')) newPrice = 1450;
        else if (p.name.toLowerCase().includes('case')) newPrice = 1850;
        else if (p.name.toLowerCase().includes('tote')) newPrice = 1350;
        else if (p.name.toLowerCase().includes('cap')) newPrice = 1950;
        else if (p.name.toLowerCase().includes('tee') || p.name.toLowerCase().includes('shirt')) newPrice = 2800;

        await db.collection('products').updateOne({ _id: p._id }, { $set: { price: newPrice } });
        console.log(`Updated "${p.name}" from ${p.price} to ${newPrice} LKR`);
      }
    }

    console.log('Price update complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating prices:', err);
    process.exit(1);
  }
}

run();
