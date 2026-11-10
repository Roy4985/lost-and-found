import { Router } from 'express';
import { Item } from '../models/Item.js';
import { Claim } from '../models/Claim.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { checkId } from '../middleware/checkId.js';
import { handleDbError } from '../utils/handleDbError.js';

const router = Router();

const DUPLICATE_CLAIM = 'You already have a pending claim on this item';

// POST /api/items/:id/claims → send a claim on an item (login required)
router.post('/items/:id/claims', requireAuth, checkId, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (String(item.userId) === req.userId) {
      return res.status(403).json({ error: 'You cannot claim your own item' });
    }
    if (item.status === 'closed') {
      return res.status(409).json({ error: 'This item is already closed' });
    }
    const existing = await Claim.findOne({ itemId: item._id, userId: req.userId, status: 'pending' });
    if (existing) {
      return res.status(409).json({ error: DUPLICATE_CLAIM });
    }

    const claim = await Claim.create({
      itemId: item._id,
      userId: req.userId,
      message: req.body?.message,
    });
    res.status(201).json(claim);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: DUPLICATE_CLAIM });
    handleDbError(err, res);
  }
});

// GET /api/items/:id/claims → the claims on one item (poster only)
router.get('/items/:id/claims', requireAuth, checkId, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (String(item.userId) !== req.userId) {
      return res.status(403).json({ error: 'Only the person who posted this item can see its claims' });
    }
    const claims = await Claim.find({ itemId: item._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name');
    res.json(claims);
  } catch (err) {
    handleDbError(err, res);
  }
});

// GET /api/claims/sent → claims I sent (login required)
router.get('/claims/sent', requireAuth, async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate('itemId', 'title type location status');
    res.json(claims);
  } catch (err) {
    handleDbError(err, res);
  }
});

// GET /api/claims/received → claims on the items I posted (login required)
router.get('/claims/received', requireAuth, async (req, res) => {
  try {
    const myItems = await Item.find({ userId: req.userId }).select('_id');
    const myItemIds = myItems.map((item) => item._id);
    const claims = await Claim.find({ itemId: { $in: myItemIds } })
      .sort({ createdAt: -1 })
      .populate('itemId', 'title type location status')
      .populate('userId', 'name');
    res.json(claims);
  } catch (err) {
    handleDbError(err, res);
  }
});

// Middleware for accept and reject: loads the claim and its item, then checks
// that the logged-in user posted that item and that the claim is still pending.
async function requirePosterOfClaim(req, res, next) {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    const item = await Item.findById(claim.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (String(item.userId) !== req.userId) {
      return res.status(403).json({ error: 'Only the person who posted this item can answer its claims' });
    }
    if (claim.status !== 'pending') {
      return res.status(409).json({ error: `This claim was already ${claim.status}` });
    }
    req.claim = claim;
    req.item = item;
    next();
  } catch (err) {
    handleDbError(err, res);
  }
}

// PATCH /api/claims/:id/accept → accept a claim and close the item (poster only)
router.patch('/claims/:id/accept', requireAuth, checkId, requirePosterOfClaim, async (req, res) => {
  try {
    // Close the item only if it is still open, in one database operation.
    const item = await Item.findOneAndUpdate(
      { _id: req.item._id, status: 'open' },
      { status: 'closed' },
      { new: true }
    );
    if (!item) return res.status(409).json({ error: 'This item is already closed' });

    req.claim.status = 'accepted';
    await req.claim.save();

    // Every other pending claim on this item is rejected.
    await Claim.updateMany(
      { itemId: item._id, _id: { $ne: req.claim._id }, status: 'pending' },
      { status: 'rejected' }
    );

    res.json({ claim: req.claim, item });
  } catch (err) {
    handleDbError(err, res);
  }
});

// PATCH /api/claims/:id/reject → reject one claim; the item stays open (poster only)
router.patch('/claims/:id/reject', requireAuth, checkId, requirePosterOfClaim, async (req, res) => {
  try {
    req.claim.status = 'rejected';
    await req.claim.save();
    res.json(req.claim);
  } catch (err) {
    handleDbError(err, res);
  }
});

export default router;