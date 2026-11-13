import { useEffect, useState } from 'react';
import { apiFetch } from '../api.js';
import { formatDate } from '../constants.js';

export default function ClaimList({ itemId, itemIsOpen, onItemClosed }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    async function loadClaims() {
      try {
        setClaims(await apiFetch(`/api/items/${itemId}/claims`));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadClaims();
  }, [itemId, reloadKey]);

  async function answerClaim(claimId, action) {
    setError('');
    setBusy(true);
    try {
      const result = await apiFetch(`/api/claims/${claimId}/${action}`, { method: 'PATCH' });
      if (action === 'accept') onItemClosed(result.item);
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p>Loading claims…</p>;

  return (
    <div className="claim-list">
      <h2>Claims on your item ({claims.length})</h2>
      {error && <p className="error">{error}</p>}
      {claims.length === 0 && <p>No claims yet.</p>}

      {claims.map((claim) => (
        <div key={claim._id} className="claim">
          <p>
            <strong>{claim.userId.name}</strong> · {formatDate(claim.createdAt)} ·{' '}
            <span className={`status status-${claim.status}`}>{claim.status}</span>
          </p>
          <p>{claim.message}</p>

          {itemIsOpen && claim.status === 'pending' && (
            <div className="actions">
              <button onClick={() => answerClaim(claim._id, 'accept')} disabled={busy}>
                Accept
              </button>
              <button onClick={() => answerClaim(claim._id, 'reject')} disabled={busy}>
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
