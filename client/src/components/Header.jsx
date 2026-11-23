import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext.jsx';
import { useAuth } from '../AuthContext.jsx';

export default function Header() {
  const { count } = useCart();
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <Link to="/" className="logo">🍔 SandeeGo</Link>

      <nav>
        <NavLink to="/" end>Home</NavLink>
        {user && <NavLink to="/orders">My Orders</NavLink>}
        <NavLink to="/cart" className="cart-link">
          🛒 Cart {count > 0 && <span className="badge">{count}</span>}
        </NavLink>

        {!loading && !user && (
          <>
            <Link to="/login" className="nav-btn outline">Login</Link>
            <Link to="/signup" className="nav-btn">Sign up</Link>
          </>
        )}

        {user && (
          <>
            <span className="user-chip" title={user.email}>👤 {user.name.split(' ')[0]}</span>
            <button className="nav-btn outline" onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}
