import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../api.js';
import { useAuth } from '../auth/AuthContext.js';
import ItemForm from '../components/ItemForm.jsx';

export default function EditItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, checking } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadItem() {
      try {
        setItem(await apiFetch(`/api/items/${id}`));
      } catch (err) {
        setError(err.status === 404 || err.status === 400
          ? "This item doesn't exist."
          : 'Could not load this item. Is the server running?');
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id]);

  async function saveItem(data) {
    await apiFetch(`/api/items/${id}`, { method: 'PATCH', body: data });
    navigate(`/items/${id}`);
  }

  if (loading || checking) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;

  if (!user || item.userId !== user._id) {
    return (
      <section>
        <p>You can only edit items you posted.</p>
        <Link to={`/items/${id}`}>Back to the item</Link>
      </section>
    );
  }

  return (
    <section className="form-page">
      <h1>Edit item</h1>
      <ItemForm initialItem={item} submitLabel="Save changes" onSubmit={saveItem} />
    </section>
  );
}