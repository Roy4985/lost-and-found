import { Router } from 'express';
import { Item } from '../models/Item.js';

const router = Router();

// The only fields a client is allowed to send. Anything else is ignored.
const EDITABLE_FIELDS = ['type', 'title', 'description', 'category', 'location', 'date', 'photoUrl'];

function pickEditable(body = {}) {
  const data = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  return data;
}

// GET /api/items → all items, newest first
router.get('/', async (req, res) => {
  const items = await Item.find().sort({ createdAt: -1 });
  res.json(items);
});

// POST /api/items → create an item
router.post('/', async (req, res) => {
  try {
    const item = await Item.create(pickEditable(req.body));
    res.status(201).json(item);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const details = Object.values(err.errors).map((e) =>
        e.name === 'CastError' ? `${e.path} has an invalid value` : e.message
      );
      return res.status(400).json({ error: 'Invalid item data', details });
    }
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on the server' });
  }
});

export default router;