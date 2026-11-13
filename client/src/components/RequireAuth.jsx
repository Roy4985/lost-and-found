import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';

// Wraps pages that need a logged-in user.
// Visitors are sent to the login page, which brings them back here after logging in.
export default function RequireAuth({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) return <p>Loading…</p>;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}