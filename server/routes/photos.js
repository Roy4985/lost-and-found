import express, { Router } from 'express';
import { Photo, PHOTO_TYPES } from '../models/Photo.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { checkId } from '../middleware/checkId.js';
import { handleDbError } from '../utils/handleDbError.js';

const router = Router();

// Reads the request body as raw bytes, but only for image types, up to 2 MB.
const readImage = express.raw({ type: PHOTO_TYPES, limit: '2mb' });

// POST /api/photos → upload one photo (login required)
router.post('/', requireAuth, readImage, async (req, res) => {
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    return res.status(400).json({ error: 'Send a JPEG, PNG or WebP image' });
  }
  try {
    const photo = await Photo.create({
      userId: req.userId,
      contentType: req.get('Content-Type'),
      data: req.body,
    });
    res.status(201).json({ url: `/api/photos/${photo._id}` });
  } catch (err) {
    handleDbError(err, res);
  }
});

// GET /api/photos/:id → the image itself (public, so <img> tags can show it)
router.get('/:id', checkId, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    res.set('Content-Type', photo.contentType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(photo.data);
  } catch (err) {
    handleDbError(err, res);
  }
});

export default router;
