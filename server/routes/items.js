import { Router } from 'express';
import { Item } from '../models/Item.js';
import { handleDbError } from '../utils/handleDbError.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { checkId } from '../middleware/checkId.js';
import { Claim } from '../models/Claim.js';

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

// Middleware for edit and delete: loads the item and checks it belongs to the logged-in user.
async function requireOwner(req, res, next) {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (String(item.userId) !== req.userId) {
      return res.status(403).json({ error: 'Only the person who posted this item can change it' });
    }
    req.item = item;
    next();
  } catch (err) {
    handleDbError(err, res);
  }
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
router.post('/', requireAuth, async (req, res) => {
  try {
    const item = await Item.create({ ...pickEditable(req.body), userId: req.userId});
    res.status(201).json(item);
  } catch (err) {
    handleDbError(err, res);
  }
});

// PUT and PATCH /api/items/:id → update only the fields that were sent (owner only)
async function updateItem(req, res) {
  const changes = pickEditable(req.body);
  if (Object.keys(changes).length === 0) {
    return res.status(400).json({ error: 'Send at least one field to update' });
  }
  try {
    req.item.set(changes);
    await req.item.save();
    res.json(req.item);
  } catch (err) {
    handleDbError(err, res);
  }
}

router.put('/:id', requireAuth, checkId, requireOwner, updateItem);
router.patch('/:id', requireAuth, checkId, requireOwner, updateItem);


// DELETE /api/items/:id → delete an item (owner only)
router.delete('/:id', requireAuth, checkId, requireOwner, async (req, res) => {
  try {
    await Claim.deleteMany({ itemId: req.item._id });
    await req.item.deleteOne();
    res.sendStatus(204);
  } catch (err) {
    handleDbError(err, res);
  }
});


export default router;