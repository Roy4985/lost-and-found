import { Link } from 'react-router-dom';
import { categoryLabel, formatDate } from '../constants.js';

export default function ItemCard({ item }) {
  return (
    <Link to={`/items/${item._id}`} className="card">
      {item.photoUrl ? (
        <img className="card-photo" src={item.photoUrl} alt={`Photo of ${item.title}`} />
      ) : (
        <div className="card-photo card-photo-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
            <circle cx="7.5" cy="7.5" r="1.5" />
          </svg>
          No photo
        </div>
      )}

      <div className="card-body">
        <div className="card-top">
          <span className={`type type-${item.type}`}>{item.type === 'lost' ? 'Lost' : 'Found'}</span>
          <span className="card-date">{formatDate(item.date)}</span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.location}</p>
        <p>{categoryLabel(item.category)}</p>
        {item.status === 'closed' && <p className="returned">Back with its owner</p>}
      </div>
    </Link>
  );
}
