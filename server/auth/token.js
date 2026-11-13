import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

// Creates a token for a user. Called after signup and login.
export function signToken(user) {
  return jwt.sign({ sub: String(user._id) }, SECRET, { expiresIn: '7d' });
}

// Checks a token. Returns its payload if it's genuine and not expired.
// Throws an error if it was tampered with, faked, or has expired.
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}