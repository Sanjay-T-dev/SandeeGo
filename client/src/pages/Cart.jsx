import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext.jsx';
import { rupees } from '../api.js';

export default function Cart() {
  const { cart, changeQty, clearCart, subtotal, deliveryFee, total } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0)
    return (
      <div className="empty">
        <h2>Cart is empty 🛒</h2>
        <Link to="/" className="btn">Restaurants paarunga</Link>
      </div>
    );

  return (
    <>
      <h2>Your Cart</h2>
      <p className="muted">
        {cart.restaurant.emoji} {cart.restaurant.name}
      </p>

      <div className="panel">
        {cart.items.map((i) => (
          <div className="cart-row" key={i.id}>
            <span>{i.name}</span>
            <div className="qty">
              <button onClick={() => changeQty(i.id, -1)}>−</button>
              <span>{i.quantity}</span>
              <button onClick={() => changeQty(i.id, 1)}>+</button>
            </div>
            <span className="price">{rupees(i.price * i.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="panel bill">
        <div><span>Item total</span><span>{rupees(subtotal)}</span></div>
        <div><span>Delivery fee</span><span>{rupees(deliveryFee)}</span></div>
        <div className="grand"><span>To pay</span><span>{rupees(total)}</span></div>
      </div>

      <div className="actions">
        <button className="btn secondary" onClick={clearCart}>Clear cart</button>
        <button className="btn" onClick={() => navigate('/checkout')}>Checkout →</button>
      </div>
    </>
  );
}
