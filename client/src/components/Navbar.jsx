import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';

export default function Navbar() {
  const { user, checking, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">Lost &amp; Found</Link>
      <nav>
        <NavLink to="/" end>Board</NavLink>
        {!checking && user && (
          <>
            <NavLink to="/post">Post item</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <span>Hi, {user.name}</span>
            <button onClick={handleLogout}>Log out</button>
          </>
        )}
        {!checking && !user && (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/signup">Sign up</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}