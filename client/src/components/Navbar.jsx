import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand">Lost &amp; Found</Link>
      <nav>
        <NavLink to="/" end>Board</NavLink>
        <NavLink to="/post">Post item</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/login">Log in</NavLink>
      </nav>
    </header>
  );
}