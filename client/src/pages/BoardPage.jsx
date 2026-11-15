import { useEffect, useState } from 'react';
import ItemCard from '../components/ItemCard.jsx';
import { apiFetch } from '../api.js';

export default function BoardPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [slow, setSlow] = useState(false);

  // If loading takes more than 3 seconds, the free server is probably waking up.
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

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
    // Search the title, the location and the description
    const text = `${item.title} ${item.location} ${item.description ?? ''}`.toLowerCase();
    const matchesSearch = text.includes(search.trim().toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return <p>{slow ? 'Waking up the server, this can take up to a minute…' : 'Loading items…'}</p>;
  }
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
            aria-label="Search by title, place or description"
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
