// Must match the categories allowed by the backend (server/models/Item.js).
export const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'keys', label: 'Keys' },
  { value: 'cards-ids', label: 'Cards & IDs' },
  { value: 'bags', label: 'Bags' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'other', label: 'Other' },
];

// 'cards-ids' → 'Cards & IDs'
export function categoryLabel(value) {
  return CATEGORIES.find((category) => category.value === value)?.label ?? value;
}

// '2026-11-12T00:00:00.000Z' → 'Nov 12'
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
