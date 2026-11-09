import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import itemsRouter from './routes/items.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/items', itemsRouter);

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('Could not connect to MongoDB:', err.message);
  process.exit(1);
}