import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import itemsRouter from './routes/items.js';
import authRouter from './routes/auth.js';
import claimsRouter from './routes/claims.js';
import photosRouter from './routes/photos.js';

// Injection backstop: if a query value is an object like { "$ne": null },
// Mongoose treats it as a plain value instead of a query operator.
mongoose.set('sanitizeFilter', true);

const app = express();

// Render sits in front of the app as a proxy: trust it, so the rate limiter
// sees each visitor's real IP instead of the proxy's.
app.set('trust proxy', 1);

// Security headers. Photos are loaded by the frontend from another domain,
// so they must be allowed cross-origin.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '10kb' }));

// At most 300 requests per visitor every 15 minutes, on the whole API
const apiLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 300,
  message: { error: 'Too many requests. Try again in a few minutes.' },
});

// At most 10 failed login or signup attempts every 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

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
