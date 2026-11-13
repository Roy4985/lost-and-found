import { Link } from 'react-router-dom';
import { categoryLabel } from '../constants.js';

export default function ItemCard({ item }) {
  return (
    <Link to={`/items/${item._id}`} className="card">
      <p>{item.type === 'lost' ? 'LOST' : 'FOUND'} · {categoryLabel(item.category)}</p>
      <h3>{item.title}</h3>
      <p>{item.location} · {new Date(item.date).toLocaleDateString()}</p>
      {item.status === 'closed' && <p><strong>Returned to owner</strong></p>}
    </Link>
  );
}