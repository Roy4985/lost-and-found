import mongoose from 'mongoose';

export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// One uploaded photo, stored inside MongoDB as raw bytes.
const photoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentType: { type: String, enum: PHOTO_TYPES, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export const Photo = mongoose.model('Photo', photoSchema);

// '/api/photos/6731c4…' → deletes that photo (used when an item is deleted or its photo replaced)
export async function deletePhotoByUrl(url) {
  const id = url?.split('/').pop();
  if (id && mongoose.isValidObjectId(id)) {
    await Photo.findByIdAndDelete(id);
  }
}
