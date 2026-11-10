import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import itemsRouter from './routes/items.js';
import authRouter from './routes/auth.js';
import claimsRouter from './routes/claims.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/items', itemsRouter);
app.use('/api', claimsRouter);

// No route matched → 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Any error not handled by a route → clean JSON instead of a crash
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

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