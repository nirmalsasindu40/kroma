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
import paymentRoutes from './routes/payment.js';
import orderRoutes from './routes/orders.js';
import communityRoutes from './routes/community.js';

dotenv.config();
const app = express();
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = new Set([clientOrigin]);
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.add('http://localhost:5173');
  allowedOrigins.add('http://localhost:5174');
}

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin && allowedOrigins.has(origin) ? origin : clientOrigin);
    },
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
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/community', communityRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error('Mongo connection error:', err));