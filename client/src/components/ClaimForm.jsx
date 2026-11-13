import { useState } from 'react';
import { apiFetch } from '../api.js';

export default function ClaimForm({ itemId }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiFetch(`/api/items/${itemId}/claims`, {
        method: 'POST',
        body: { message },
      });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return <p>Claim sent! The person who posted this item will review it.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="claim-form">
      <h2>Is it yours?</h2>
      <label htmlFor="message">Describe something only the owner would know</label>
      <textarea
        id="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        maxLength={500}
        rows={4}
      />

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Sending…' : 'Send claim'}
      </button>
    </form>
  );
}