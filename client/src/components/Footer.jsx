import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

const CUISINES = ['Biryani', 'South Indian', 'Chinese', 'Pizza & Italian', 'Desserts & Bakery'];

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col brand-col">
          <div className="logo">🍔 SandeeGo</div>
          <p>Order food whenever you're hungry from the best restaurants in your area. Search, cart, checkout, live tracking, everything in one place.</p>
        </div>

        <div className="footer-col">
          <h4>Quick links</h4>
          <Link to="/">Home</Link>
          <Link to="/cart">Cart</Link>
          {user ? (
            <Link to="/orders">My Orders</Link>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign up</Link>
            </>
          )}
        </div>

        <div className="footer-col">
          <h4>Popular cuisines</h4>
          {CUISINES.map((c) => (
            <Link key={c} to={`/?cuisine=${encodeURIComponent(c)}`}>{c}</Link>
          ))}
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <span>📍 Chennai, Tamil Nadu</span>
          <span>✉️ support@sandeego.example</span>
          <span>🕒 Daily 8 AM to 11 PM</span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} SandeeGo. Demo project: Does not accept real orders, and all restaurants are fictional.</span>
      </div>
    </footer>
  );
}
