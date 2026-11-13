import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import ItemCard from './ItemCard.jsx';

export default function MyPosts() {
  const { data: items, loading, error } = useApi('/api/items/mine');

  if (loading) return <p>Loading your posts…</p>;
  if (error) return <p className="error">{error}</p>;

  if (items.length === 0) {
    return (
      <p>
        You haven't posted anything yet. <Link to="/post">Post an item</Link>
      </p>
    );
  }

  return (
    <div className="grid">
      {items.map((item) => (
        <ItemCard key={item._id} item={item} />
      ))}
    </div>
  );
}