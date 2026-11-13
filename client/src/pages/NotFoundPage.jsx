import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <p>That page doesn't exist.</p>
      <Link to="/">Back to the board</Link>
    </section>
  );
}