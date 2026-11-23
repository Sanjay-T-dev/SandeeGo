import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders, rupees } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyOrders().then(setOrders).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <h2>My Orders</h2>
      <p className="muted">{user.name} ({user.email})</p>

      {error && <p className="error">{error}</p>}
      {!orders && !error && <p>Loading...</p>}
      {orders && orders.length === 0 && (
        <div className="empty">
          <p>There are no orders yet. 🍽️</p>
          <Link to="/" className="btn">Browse restaurants.</Link>
        </div>
      )}

      {orders?.map((o) => (
        <Link to={`/order/${o.id}`} className="panel order-link" key={o.id}>
          <div>
            <strong>#{o.id} • {o.restaurant_emoji} {o.restaurant_name}</strong>
            <p className="muted">{new Date(o.created_at).toLocaleString()}</p>
          </div>
          <div className="right">
            <span className={`status ${o.status}`}>{o.status.replace(/_/g, ' ')}</span>
            <strong>{rupees(o.total)}</strong>
          </div>
        </Link>
      ))}
    </>
  );
}
