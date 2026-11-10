import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: {
      type: String,
      required: [true, 'message is required'],
      trim: true,
      maxlength: [500, 'message must be at most 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Rule 1, enforced by the database: one PENDING claim per user per item.
claimSchema.index(
  { itemId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

export const Claim = mongoose.model('Claim', claimSchema);