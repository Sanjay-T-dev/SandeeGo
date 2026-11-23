import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext.jsx';
import { useAuth } from '../AuthContext.jsx';
import { placeOrder, rupees } from '../api.js';

export default function Checkout() {
  const { cart, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    payment_method: 'cod',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (cart.items.length === 0) return <Navigate to="/cart" replace />;

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const order = await placeOrder({
        ...form,
        items: cart.items.map((i) => ({ menu_item_id: i.id, quantity: i.quantity })),
      });
      clearCart();
      navigate(`/order/${order.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h2>Checkout</h2>
      <form className="panel form" onSubmit={submit}>
        <label>
          Name
          <input name="customer_name" value={form.customer_name} onChange={update} required />
        </label>
        <label>
          Phone (10 digits)
          <input name="phone" value={form.phone} onChange={update} inputMode="numeric" maxLength={10} required />
        </label>
        <label>
          Delivery address
          <textarea name="address" rows={3} value={form.address} onChange={update} required />
        </label>
        <label>
          Payment
          <select name="payment_method" value={form.payment_method} onChange={update}>
            <option value="cod">Cash on Delivery</option>
            <option value="upi">UPI (demo)</option>
            <option value="card">Card (demo)</option>
          </select>
        </label>

        <div className="bill">
          <div><span>Item total</span><span>{rupees(subtotal)}</span></div>
          <div><span>Delivery fee</span><span>{rupees(deliveryFee)}</span></div>
          <div className="grand"><span>To pay</span><span>{rupees(total)}</span></div>
        </div>

        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={submitting}>
          {submitting ? 'Placing order...' : `Place Order • ${rupees(total)}`}
        </button>
      </form>
    </>
  );
}
