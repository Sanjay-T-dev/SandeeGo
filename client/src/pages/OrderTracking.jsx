import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder, rupees } from '../api.js';

export const STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '📝' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
];

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer;
    const load = async () => {
      try {
        const o = await getOrder(id);
        setOrder(o);
        // delivered aana polling stop
        if (o.status !== 'delivered') timer = setTimeout(load, 5000);
      } catch (e) {
        setError(e.message);
      }
    };
    load();
    return () => clearTimeout(timer);
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!order) return <p>Loading...</p>;

  const current = STEPS.findIndex((s) => s.key === order.status);

  return (
    <>
      <h2>Order #{order.id}</h2>
      <p className="muted">{order.restaurant_emoji} {order.restaurant_name}</p>

      <div className="panel tracker">
        {STEPS.map((s, i) => (
          <div key={s.key} className={`step ${i <= current ? 'done' : ''} ${i === current ? 'current' : ''}`}>
            <div className="step-icon">{s.icon}</div>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="panel">
        <h3>Items</h3>
        {order.items.map((i) => (
          <div className="cart-row" key={i.id}>
            <span>{i.name} × {i.quantity}</span>
            <span>{rupees(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="bill">
          <div><span>Delivery fee</span><span>{rupees(order.delivery_fee)}</span></div>
          <div className="grand"><span>Total ({order.payment_method.toUpperCase()})</span><span>{rupees(order.total)}</span></div>
        </div>
      </div>

      <div className="panel">
        <h3>Deliver to</h3>
        <p>{order.customer_name} • {order.phone}</p>
        <p className="muted">{order.address}</p>
      </div>

      <Link to="/" className="btn secondary">Back to home</Link>
    </>
  );
}
