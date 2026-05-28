import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import Groq from 'groq-sdk';

import authRoutes from './routes/authRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();

// Groq Setup
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/orders', orderRoutes);

// Home Route
app.get('/', (req, res) => {
  res.send('Medicine Marketplace API is running...');
});

// AI Route
app.get('/api/ai', async (req, res) => {

  try {

    const chatCompletion =
      await groq.chat.completions.create({

        messages: [
          {
            role: 'user',
            content: 'Hello AI',
          },
        ],

        model: 'llama-3.1-8b-instant',
      });

    res.json({
      success: true,
      message:
        chatCompletion.choices[0].message.content,
    });

  } catch (error) {

    console.log('Groq Error:', error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// MongoDB Connection
mongoose.connect(
  process.env.MONGO_URI || 'mongodb://localhost:27017/med-marketplace'
)
.then(() => {
  console.log('✅ MongoDB Connected');
})
.catch((err) => {
  console.log('❌ DB Connection Error:', err);
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});