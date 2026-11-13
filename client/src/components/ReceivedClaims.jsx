import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api.js';
import { useApi } from '../hooks/useApi.js';

export default function ReceivedClaims() {
  const { data: claims, loading, error, reload } = useApi('/api/claims/received');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  async function answerClaim(claimId, action) {
    setActionError('');
    setBusy(true);
    try {
      await apiFetch(`/api/claims/${claimId}/${action}`, { method: 'PATCH' });
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p>Loading claims…</p>;
  if (error) return <p className="error">{error}</p>;
  if (claims.length === 0) return <p>Nobody has claimed your items yet.</p>;

  return (
    <div>
      {actionError && <p className="error">{actionError}</p>}

      {claims.map((claim) => (
        <div key={claim._id} className="claim">
          <p>
            <Link to={`/items/${claim.itemId._id}`}>{claim.itemId.title}</Link> ·{' '}
            <span className={`status status-${claim.status}`}>{claim.status}</span>
          </p>
          <p>
            <strong>{claim.userId.name}</strong>: {claim.message}
          </p>

          {claim.status === 'pending' && claim.itemId.status === 'open' && (
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