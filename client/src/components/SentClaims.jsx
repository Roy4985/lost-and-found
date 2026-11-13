import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';

const STATUS_TEXT = {
  pending: 'Waiting for the poster to answer.',
  accepted: 'Accepted! The poster agreed it is yours.',
  rejected: 'Not accepted.',
};

export default function SentClaims() {
  const { data: claims, loading, error } = useApi('/api/claims/sent');

  if (loading) return <p>Loading your claims…</p>;
  if (error) return <p className="error">{error}</p>;
  if (claims.length === 0) return <p>You haven't claimed any items yet.</p>;

  return (
    <div>
      {claims.map((claim) => (
        <div key={claim._id} className="claim">
          <p>
            <Link to={`/items/${claim.itemId._id}`}>{claim.itemId.title}</Link> ·{' '}
            <span className={`status status-${claim.status}`}>{claim.status}</span>
          </p>
          <p>Your message: {claim.message}</p>
          <p><small>{STATUS_TEXT[claim.status]}</small></p>
        </div>
      ))}
    </div>
  );
}