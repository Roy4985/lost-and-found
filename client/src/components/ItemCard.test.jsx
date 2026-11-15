import { afterEach, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ItemCard from './ItemCard.jsx';

// A fake item, shaped like the ones the API sends back.
const wallet = {
  _id: '6731d5e6f7a8b9c0d1e2f3a4',
  type: 'found',
  title: 'Black wallet',
  category: 'cards-ids',
  location: 'Library, 2nd floor',
  date: '2026-11-12T00:00:00.000Z',
  photoUrl: '',
  status: 'open',
};

// ItemCard contains a <Link>, and a Link only works inside a router.
function renderCard(item) {
  render(
    <MemoryRouter>
      <ItemCard item={item} />
    </MemoryRouter>
  );
}

// Remove the card from the page after each test.
afterEach(cleanup);

test('shows the item details and links to its page', () => {
  renderCard(wallet);

  expect(screen.getByText('Black wallet')).toBeTruthy();
  expect(screen.getByText('Found')).toBeTruthy();
  expect(screen.getByText('Library, 2nd floor')).toBeTruthy();
  expect(screen.getByText('Cards & IDs')).toBeTruthy();
  expect(screen.getByText('No photo')).toBeTruthy();
  expect(screen.getByRole('link').getAttribute('href')).toBe('/items/6731d5e6f7a8b9c0d1e2f3a4');

  // The item is still open, so there is no "returned" bar.
  expect(screen.queryByText('Back with its owner')).toBeNull();
});

test('shows "Back with its owner" once the item is closed', () => {
  renderCard({ ...wallet, status: 'closed' });

  expect(screen.getByText('Back with its owner')).toBeTruthy();
});
