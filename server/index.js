import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import db from './db.js';
import { listRestaurants } from './queries.js';
import { authenticate, requireAuth, signup, login, me, logout } from './auth.js';
import { seedDatabase } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Pudhu / empty database (e.g. first deploy) na restaurants data automatic-ah load aagum
if (db.prepare('SELECT COUNT(*) AS c FROM restaurants').get().c === 0) {
  const r = seedDatabase();
  console.log(`Database empty: seeded ${r.restaurants} restaurants and ${r.menu} menu items`);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(authenticate); // valid token irundha req.user set aagum

// ---------- Auth ----------
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.get('/api/auth/me', requireAuth, me);
app.post('/api/auth/logout', requireAuth, logout);

// ---------- Restaurants ----------
app.get('/api/restaurants', (req, res) => {
  const { search = '', cuisine = '', veg = '', minRating = '0', sort = 'relevance' } = req.query;
  res.json(listRestaurants({ search, cuisine, veg: veg === '1', minRating, sort }));
});

app.get('/api/restaurants/:id', (req, res) => {
  const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(req.params.id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
  const menu = db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY is_bestseller DESC, category, name').all(req.params.id);
  res.json({ ...restaurant, menu });
});

// ---------- Orders ----------
// Demo: status time-based-ah progress aagum
const STATUS_STEPS = [
  { status: 'placed', after: 0 },
  { status: 'preparing', after: 20 },
  { status: 'out_for_delivery', after: 60 },
  { status: 'delivered', after: 120 },
];

function currentStatus(createdAt) {
  const elapsed = (Date.now() - createdAt) / 1000;
  let s = STATUS_STEPS[0].status;
  for (const step of STATUS_STEPS) if (elapsed >= step.after) s = step.status;
  return s;
}

function loadOrder(id) {
  const order = db
    .prepare(
      `SELECT o.*, r.name AS restaurant_name, r.emoji AS restaurant_emoji
       FROM orders o JOIN restaurants r ON r.id = o.restaurant_id WHERE o.id = ?`
    )
    .get(id);
  if (!order) return null;
  const status = currentStatus(order.created_at);
  if (status !== order.status) {
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    order.status = status;
  }
  order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
  return order;
}

app.post('/api/orders', requireAuth, (req, res) => {
  const { customer_name, phone, address, payment_method, items } = req.body || {};

  if (!customer_name?.trim() || !address?.trim()) return res.status(400).json({ error: 'Name and address required' });
  if (!/^\d{10}$/.test(String(phone || ''))) return res.status(400).json({ error: 'Valid 10-digit phone number kudunga' });
  if (!['cod', 'upi', 'card'].includes(payment_method)) return res.status(400).json({ error: 'Invalid payment method' });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Cart empty' });

  const getItem = db.prepare('SELECT * FROM menu_items WHERE id = ?');
  const lines = [];
  let restaurantId = null;

  for (const it of items) {
    const qty = Number(it.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return res.status(400).json({ error: 'Invalid quantity' });
    const menuItem = getItem.get(it.menu_item_id);
    if (!menuItem) return res.status(400).json({ error: `Item ${it.menu_item_id} not found` });
    if (restaurantId === null) restaurantId = menuItem.restaurant_id;
    if (menuItem.restaurant_id !== restaurantId)
      return res.status(400).json({ error: 'Orda oru restaurant-la irundhu mattum order pannalam' });
    lines.push({ menuItem, qty });
  }

  const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(restaurantId);
  const subtotal = lines.reduce((sum, l) => sum + l.menuItem.price * l.qty, 0);
  const delivery_fee = restaurant.delivery_fee;
  const total = subtotal + delivery_fee;

  const place = db.transaction(() => {
    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO orders (user_id, restaurant_id, customer_name, phone, address, payment_method, subtotal, delivery_fee, total, status, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`
      )
      .run(req.user.id, restaurantId, customer_name.trim(), phone, address.trim(), payment_method, subtotal, delivery_fee, total, 'placed', Date.now());
    const insItem = db.prepare('INSERT INTO order_items (order_id, menu_item_id, name, price, quantity) VALUES (?,?,?,?,?)');
    for (const l of lines) insItem.run(Number(lastInsertRowid), l.menuItem.id, l.menuItem.name, l.menuItem.price, l.qty);
    return Number(lastInsertRowid);
  });

  const orderId = place();
  res.status(201).json(loadOrder(orderId));
});

app.get('/api/orders/:id', requireAuth, (req, res) => {
  const order = loadOrder(req.params.id);
  // vera user-oda order-ah paakka koodaadhu (404 kudukkrom, exist aagudha nu kooda theriya koodaadhu)
  if (!order || order.user_id !== req.user.id) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.get('/api/orders', requireAuth, (req, res) => {
  const ids = db.prepare('SELECT id FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.user.id);
  res.json(ids.map((r) => loadOrder(r.id)));
});

// ---------- Production: built React app-ah Express-ae serve pannum ----------
// (client/dist irundha mattum. Dev-la Vite dhaan serve pannum)
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));
  // /restaurant/5, /login maari React routes refresh pannaalum index.html kudukkum
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => console.log(`FoodieGo API running on http://localhost:${PORT}`));
