import { Router } from 'express';
import mongoose from 'mongoose';
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

// Middleware for every /:id route. Rejects ids that can't possibly exist.
function checkId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid item id' });
  }
  next();
}

// Turns database errors into clean JSON answers.
function handleDbError(err, res) {
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) =>
      e.name === 'CastError' ? `${e.path} has an invalid value` : e.message
    );
    return res.status(400).json({ error: 'Invalid item data', details });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `${err.path} has an invalid value` });
  }
  console.error(err);
  return res.status(500).json({ error: 'Something went wrong on the server' });
}

// GET /api/items → all items, newest first
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    handleDbError(err, res);
  }
});

// GET /api/items/:id → one item
router.get('/:id', checkId, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    handleDbError(err, res);
  }
});

// POST /api/items → create an item
router.post('/', async (req, res) => {
  try {
    const item = await Item.create(pickEditable(req.body));
    res.status(201).json(item);
  } catch (err) {
    handleDbError(err, res);
  }
});

// PUT and PATCH /api/items/:id → update only the fields that were sent
async function updateItem(req, res) {
  const changes = pickEditable(req.body);
  if (Object.keys(changes).length === 0) {
    return res.status(400).json({ error: 'Send at least one field to update' });
  }
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, changes, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    handleDbError(err, res);
  }
}

router.put('/:id', checkId, updateItem);
router.patch('/:id', checkId, updateItem);


// DELETE /api/items/:id → delete an item
router.delete('/:id', checkId, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.sendStatus(204);
  } catch (err) {
    handleDbError(err, res);
  }
});


export default router;