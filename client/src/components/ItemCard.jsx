import { Link } from 'react-router-dom';

export default function ItemCard({ item }) {
  return (
    <Link to={`/items/${item._id}`} className="card">
      <p>{item.type === 'lost' ? 'LOST' : 'FOUND'} · {item.category}</p>
      <h3>{item.title}</h3>
      <p>{item.location} · {new Date(item.date).toLocaleDateString()}</p>
      {item.status === 'closed' && <p><strong>Returned to owner</strong></p>}
    </Link>
  );
}