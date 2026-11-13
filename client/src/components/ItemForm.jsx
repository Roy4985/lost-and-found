import { useState } from 'react';
import { CATEGORIES } from '../constants.js';

// Today's date as 'YYYY-MM-DD', the format a date input uses.
function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

// One form for both posting and editing an item.
// - initialItem: the item to edit (leave it out when posting a new one)
// - submitLabel: the button's text
// - onSubmit: an async function that receives the form's data and sends it
export default function ItemForm({ initialItem, submitLabel, onSubmit }) {
  const [form, setForm] = useState({
    type: initialItem?.type ?? 'found',
    title: initialItem?.title ?? '',
    category: initialItem?.category ?? '',
    location: initialItem?.location ?? '',
    date: initialItem?.date?.slice(0, 10) ?? today(),
    description: initialItem?.description ?? '',
  });
  const [error, setError] = useState('');
  const [details, setDetails] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setDetails([]);
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message);
      setDetails(err.details);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="item-form">
      <fieldset>
        <legend>Did you lose it or find it?</legend>
        <label>
          <input
            type="radio"
            name="type"
            value="lost"
            checked={form.type === 'lost'}
            onChange={(e) => update('type', e.target.value)}
          />
          I lost it
        </label>
        <label>
          <input
            type="radio"
            name="type"
            value="found"
            checked={form.type === 'found'}
            onChange={(e) => update('type', e.target.value)}
          />
          I found it
        </label>
      </fieldset>

      <label htmlFor="title">Title</label>
      <input
        id="title"
        type="text"
        placeholder="e.g. Black wallet"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        required
        maxLength={100}
      />

      <label htmlFor="category">Category</label>
      <select
        id="category"
        value={form.category}
        onChange={(e) => update('category', e.target.value)}
        required
      >
        <option value="">Choose a category</option>
        {CATEGORIES.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>

      <label htmlFor="location">Where on campus?</label>
      <input
        id="location"
        type="text"
        placeholder="e.g. Library, 2nd floor"
        value={form.location}
        onChange={(e) => update('location', e.target.value)}
        required
        maxLength={100}
      />

      <label htmlFor="date">When?</label>
      <input
        id="date"
        type="date"
        value={form.date}
        max={today()}
        onChange={(e) => update('date', e.target.value)}
        required
      />

      <label htmlFor="description">Description (optional)</label>
      <textarea
        id="description"
        placeholder="Color, brand, anything that helps — but keep one detail secret so the real owner can prove it's theirs."
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
        maxLength={1000}
        rows={4}
      />

      {error && <p className="error">{error}</p>}
      {details.length > 0 && (
        <ul className="error">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}