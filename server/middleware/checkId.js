import mongoose from 'mongoose';

// Rejects ids in the URL that can't possibly exist (wrong format).
export function checkId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  next();
}