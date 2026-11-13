import { useEffect, useState } from 'react';
import ItemCard from '../components/ItemCard.jsx';
import { apiFetch } from '../api.js';

export default function BoardPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    async function loadItems() {
        try {
        setItems(await apiFetch('/api/items'));
      } catch {
        setError('Could not load items. Is the server running?');
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, []);

  const visibleItems = items.filter((item) => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) return <p>Loading items…</p>;
  if (error) return <p>{error}</p>;

  return (
    <section>
      <h1>Campus Lost &amp; Found</h1>

      <input
        type="text"
        placeholder="Search by title…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={() => setSearch('')}>Clear</button>

      <div>
        <button onClick={() => setTypeFilter('all')}>
          {typeFilter === 'all' ? <strong>All</strong> : 'All'}
        </button>
        <button onClick={() => setTypeFilter('lost')}>
          {typeFilter === 'lost' ? <strong>Lost</strong> : 'Lost'}
        </button>
        <button onClick={() => setTypeFilter('found')}>
          {typeFilter === 'found' ? <strong>Found</strong> : 'Found'}
        </button>
      </div>

      <p>Showing {visibleItems.length} of {items.length} items</p>
      {visibleItems.length === 0 && <p>No items found.</p>}

      {visibleItems.map((item) => (
        <ItemCard key={item._id} item={item} />
      ))}
    </section>
  );
}