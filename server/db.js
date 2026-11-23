import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(path.join(__dirname, 'foodiego.db'));

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Node.js `node:sqlite` doesn't have a built-in transaction helper, so we'll create a simple helper ourselves.
db.transaction = (fn) => (...args) => {
  db.exec('BEGIN');
  try {
    const result = fn(...args);
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
};

// **Note:** Users and sessions will not be deleted, so the accounts created during reseeding will remain intact (only orders will be reset).
export function dropSchema() {
  db.exec(`
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS menu_items;
    DROP TABLE IF EXISTS restaurants;
  `);
}

export function createSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    -- token-ah plain-ah store panna maatom, SHA-256 hash mattum
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cuisine TEXT NOT NULL,
      cuisine_tags TEXT DEFAULT '',
      area TEXT DEFAULT '',
      rating REAL DEFAULT 4.0,
      rating_count INTEGER DEFAULT 0,
      delivery_time INTEGER DEFAULT 30,
      delivery_fee INTEGER DEFAULT 30,
      price_for_two INTEGER DEFAULT 300,
      offer TEXT DEFAULT '',
      is_pure_veg INTEGER DEFAULT 0,
      emoji TEXT DEFAULT '🍽️',
      description TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price INTEGER NOT NULL,
      category TEXT DEFAULT 'Main',
      is_veg INTEGER DEFAULT 1,
      is_bestseller INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      delivery_fee INTEGER NOT NULL,
      total INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'placed',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_menu_restaurant ON menu_items(restaurant_id);
    CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  `);

  // If the old database's `orders` table doesn't have a `user_id` column, it will be added (migration will happen without reseeding).
  const orderCols = db.prepare('PRAGMA table_info(orders)').all().map((c) => c.name);
  if (!orderCols.includes('user_id')) {
    db.exec('ALTER TABLE orders ADD COLUMN user_id INTEGER REFERENCES users(id)');
  }
  db.exec('CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)');
}

createSchema();

export default db;
