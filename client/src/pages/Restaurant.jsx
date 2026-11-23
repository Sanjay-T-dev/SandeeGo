import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getRestaurant, rupees, formatCount } from '../api.js';
import { useCart } from '../CartContext.jsx';

export default function Restaurant() {
  const { id } = useParams();
  const { cart, addItem, changeQty, count, subtotal } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setRestaurant(null);
    getRestaurant(id).then(setRestaurant).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!restaurant) return <p>Loading...</p>;

  const qtyInCart = (itemId) => cart.items.find((i) => i.id === itemId)?.quantity || 0;
  const q = query.trim().toLowerCase();
  const menu = restaurant.menu.filter(
    (m) => (!vegOnly || m.is_veg) && (!q || m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q))
  );
  const categories = [...new Set(menu.map((m) => m.category))];
  const bestsellers = menu.filter((m) => m.is_bestseller);

  const renderItem = (m) => {
    const qty = qtyInCart(m.id);
    return (
      <div className="menu-item" key={m.id}>
        <div>
          <span className={`veg-dot ${m.is_veg ? 'veg' : 'nonveg'}`} />
          {m.is_bestseller === 1 && <span className="bestseller">★ Bestseller</span>}
          <div><strong>{m.name}</strong></div>
          <span className="price">{rupees(m.price)}</span>
          <p className="muted">{m.description}</p>
        </div>
        {qty === 0 ? (
          <button className="btn" onClick={() => addItem(restaurant, m)}>ADD</button>
        ) : (
          <div className="qty">
            <button onClick={() => changeQty(m.id, -1)}>−</button>
            <span>{qty}</span>
            <button onClick={() => changeQty(m.id, 1)}>+</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Link to="/" className="back">← Back</Link>
      <div className="rest-header">
        <div className="emoji-big">{restaurant.emoji}</div>
        <div>
          <h2>{restaurant.name}</h2>
          <p className="muted">{restaurant.cuisine_tags || restaurant.cuisine} • {restaurant.area}</p>
          <div className="meta">
            <span className="rating-pill">★ {restaurant.rating.toFixed(1)}</span>
            <span className="muted">({formatCount(restaurant.rating_count)} ratings)</span>
            <span>🕒 {restaurant.delivery_time} min</span>
            <span>₹{restaurant.price_for_two} for two</span>
            <span>{restaurant.delivery_fee === 0 ? '🛵 Free delivery' : `🛵 ₹${restaurant.delivery_fee}`}</span>
          </div>
          {restaurant.offer && <p className="offer-line">🏷️ {restaurant.offer}</p>}
        </div>
      </div>

      <div className="menu-tools">
        <input
          className="search"
          placeholder={`Search in ${restaurant.name}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="toggle">
          <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} /> Veg only 🟢
        </label>
      </div>

      {menu.length === 0 && <p>No items found for this search. 😕</p>}

      {!q && bestsellers.length > 0 && (
        <section>
          <h3 className="cat-title">⭐ Bestsellers</h3>
          {bestsellers.map(renderItem)}
        </section>
      )}

      {categories.map((cat) => (
        <section key={cat}>
          <h3 className="cat-title">{cat}</h3>
          {menu.filter((m) => m.category === cat).map(renderItem)}
        </section>
      ))}

      {count > 0 && cart.restaurant?.id === restaurant.id && (
        <Link to="/cart" className="cart-bar">
          {count} item{count > 1 ? 's' : ''} | {rupees(subtotal)} &nbsp; View Cart →
        </Link>
      )}
    </>
  );
}
