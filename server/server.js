import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const PORT = Number(process.env.PORT) || 3000;

// Fail fast: without these the app can't work, so stop with a clear message.
for (const key of ['MONGODB_URI', 'JWT_SECRET']) {
  if (!process.env[key]) {
    console.error(`Missing environment variable: ${key}`);
    process.exit(1);
  }
}

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