// Turns database errors into clean JSON answers. Used by every router.
export function handleDbError(err, res) {
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) =>
      e.name === 'CastError' ? `${e.path} has an invalid value` : e.message
    );
    return res.status(400).json({ error: 'Invalid data', details });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `${err.path} has an invalid value` });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'value';
    return res.status(409).json({ error: `That ${field} is already in use` });
  }
  console.error(err);
  return res.status(500).json({ error: 'Something went wrong on the server' });
}