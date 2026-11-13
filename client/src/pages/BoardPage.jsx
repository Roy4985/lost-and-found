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
      <h1>Lost it? Found it? Post it.</h1>
      <p className="lead">Everything here was lost or found on campus. Claim what's yours.</p>

      <div className="toolbar">
        <div className="search">
          <input
            type="text"
            placeholder="What are you looking for?"
            aria-label="Search by title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="chip" onClick={() => setSearch('')}>Clear</button>
        </div>

        <div className="filters">
          <button className={typeFilter === 'all' ? 'chip active' : 'chip'} onClick={() => setTypeFilter('all')}>
            All
          </button>
          <button className={typeFilter === 'lost' ? 'chip chip-lost active' : 'chip chip-lost'} onClick={() => setTypeFilter('lost')}>
            Lost
          </button>
          <button className={typeFilter === 'found' ? 'chip chip-found active' : 'chip chip-found'} onClick={() => setTypeFilter('found')}>
            Found
          </button>
        </div>
      </div>

      <p className="count">Showing {visibleItems.length} of {items.length} items</p>
      {visibleItems.length === 0 && <p>No items match. Try another search, or post what you lost.</p>}

      <div className="grid">
        {visibleItems.map((item) => (
          <ItemCard key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
}
