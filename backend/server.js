import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import productRoutes from './routes/products.js';
import designRoutes from './routes/designs.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/products', productRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error('Mongo connection error:', err));
