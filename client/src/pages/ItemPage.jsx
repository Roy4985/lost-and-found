import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../api.js';
import { useAuth } from '../auth/AuthContext.js';
import ClaimForm from '../components/ClaimForm.jsx';
import ClaimList from '../components/ClaimList.jsx';

export default function ItemPage() {
  const { id } = useParams();
  const { user, checking } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <Link to="/">← Back to the board</Link>

      <p>{item.type === 'lost' ? 'LOST' : 'FOUND'} · {item.category}</p>
      <h1>{item.title}</h1>
      <p>{item.location} · {new Date(item.date).toLocaleDateString()}</p>
      {item.description && <p>{item.description}</p>}
      {!isOpen && <p><strong>This item has been returned to its owner.</strong></p>}

      {!checking && (
        <>
          {!user && isOpen && (
            <p>
              <Link to="/login">Log in</Link> to claim this item.
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