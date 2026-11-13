import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../api.js';
import { useAuth } from '../auth/AuthContext.js';
import { categoryLabel, formatDate } from '../constants.js';
import ClaimForm from '../components/ClaimForm.jsx';
import ClaimList from '../components/ClaimList.jsx';

export default function ItemPage() {
  const { id } = useParams();
  const { user, checking } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      setError('');
      try {
        setItem(await apiFetch(`/api/items/${id}`));
      } catch (err) {
        if (err.status === 404 || err.status === 400) {
          setError("This item doesn't exist.");
        } else {
          setError('Could not load this item. Is the server running?');
        }
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id]);

  async function handleDelete() {
    if (!window.confirm('Delete this item? Its claims will be deleted too.')) return;
    try {
      await apiFetch(`/api/items/${item._id}`, { method: 'DELETE' });
      navigate('/');
    } catch (err) {
      setDeleteError(err.message);
    }
  }

  if (loading) return <p>Loading item…</p>;
  if (error) {
    return (
      <section>
        <p>{error}</p>
        <Link to="/">Back to the board</Link>
      </section>
    );
  }

  const isPoster = user && item.userId === user._id;
  const isOpen = item.status === 'open';

  return (
    <section className="item-page">
      <Link to="/" className="back-link">← Back to the board</Link>

      {item.photoUrl && <img className="item-photo" src={item.photoUrl} alt={`Photo of ${item.title}`} />}

      <span className={`type type-${item.type}`}>{item.type === 'lost' ? 'Lost' : 'Found'}</span>
      <h1>{item.title}</h1>
      <p className="meta">
        {item.location} · {categoryLabel(item.category)} · {formatDate(item.date)}
      </p>
      {item.description && <p>{item.description}</p>}
      {!isOpen && <p className="returned">This item is back with its owner</p>}

      {isPoster && (
        <div className="actions">
          <Link to={`/items/${item._id}/edit`}>Edit</Link>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
      {deleteError && <p className="error">{deleteError}</p>}

      {!checking && (
        <>
          {!user && isOpen && (
            <p>
              <Link to="/login" state={{ from: `/items/${item._id}` }}>Log in</Link> to claim this item.
            </p>
          )}
          {user && !isPoster && isOpen && <ClaimForm itemId={item._id} />}
          {isPoster && (
            <ClaimList
              itemId={item._id}
              itemIsOpen={isOpen}
              onItemClosed={(closedItem) => setItem(closedItem)}
            />
          )}
        </>
      )}
    </section>
  );
}
