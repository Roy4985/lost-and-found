import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';

export default function Navbar() {
  const { user, checking, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">lost+found</Link>
      <nav>
        <NavLink to="/" end>Board</NavLink>
        {!checking && user && (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <span>Hi, {user.name}</span>
            <NavLink to="/post" className="nav-cta">+ Post item</NavLink>
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
