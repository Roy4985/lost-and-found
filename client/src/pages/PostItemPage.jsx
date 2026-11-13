import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api.js';
import ItemForm from '../components/ItemForm.jsx';

export default function PostItemPage() {
  const navigate = useNavigate();

  async function createItem(data) {
    const item = await apiFetch('/api/items', { method: 'POST', body: data });
    navigate(`/items/${item._id}`);
  }

  return (
    <section className="form-page">
      <h1>Post an item</h1>
      <ItemForm submitLabel="Post item" onSubmit={createItem} />
    </section>
  );
}