const API_URL = import.meta.env.VITE_API_URL;
const MAX_WIDTH = 1200;      // photos are shrunk to at most 1200 px wide…
const QUALITY = 0.8;         // …and saved as JPEG at 80% quality

// Shrinks a photo inside the browser, before uploading it.
// A 4 MB phone photo becomes ~150 KB, so uploads are fast and the database stays small.
async function shrinkPhoto(file) {
  const image = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / image.width);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
}

// Shrinks the photo, sends it to our backend, and returns its link ('/api/photos/<id>').
export async function uploadPhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Please choose a JPG, PNG or WebP image.');
  }

  const photo = await shrinkPhoto(file);
  const res = await fetch(`${API_URL}/api/photos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'image/jpeg',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: photo,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? 'The photo could not be uploaded. Please try again.');
  return data.url;
}

// '/api/photos/6731c4…' → 'https://…onrender.com/api/photos/6731c4…', for <img src>
export function photoSrc(photoUrl) {
  return `${API_URL}${photoUrl}`;
}
