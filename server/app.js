import express from 'express';
import cors from 'cors';
import itemsRouter from './routes/items.js';
import authRouter from './routes/auth.js';
import claimsRouter from './routes/claims.js';
import photosRouter from './routes/photos.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/items', itemsRouter);
app.use('/api/photos', photosRouter);
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
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'The request body is too large' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

export default app;
