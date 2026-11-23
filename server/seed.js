// CSV files (server/data/*.csv) -> SQLite
// Run: npm run seed
// If you want to use your own dataset (Kaggle Zomato, etc.), make sure the CSV columns match.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { dropSchema, createSchema } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple CSV parser (handles quotes, commas, and newlines).
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const [header, ...data] = rows;
  return data.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), r[i] ?? ''])));
}

const readCSV = (file) => parseCSV(fs.readFileSync(path.join(__dirname, 'data', file), 'utf-8').replace(/^\uFEFF/, ''));

const restaurants = readCSV('restaurants.csv');
const menu = readCSV('menu_items.csv');

const seed = db.transaction(() => {
  dropSchema();
  createSchema();

  const insR = db.prepare(`
    INSERT INTO restaurants
      (id, name, cuisine, cuisine_tags, area, rating, rating_count, delivery_time, delivery_fee,
       price_for_two, offer, is_pure_veg, emoji, description)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  for (const r of restaurants) {
    insR.run(
      Number(r.id), r.name, r.cuisine, r.cuisine_tags, r.area, Number(r.rating), Number(r.rating_count),
      Number(r.delivery_time), Number(r.delivery_fee), Number(r.price_for_two), r.offer,
      Number(r.is_pure_veg), r.emoji || '🍽️', r.description
    );
  }

  const insM = db.prepare(`
    INSERT INTO menu_items (restaurant_id, name, description, price, category, is_veg, is_bestseller)
    VALUES (?,?,?,?,?,?,?)`);
  for (const m of menu) {
    insM.run(Number(m.restaurant_id), m.name, m.description, Number(m.price), m.category,
             Number(m.is_veg), Number(m.is_bestseller));
  }
});

seed();
console.log(`Seeded ${restaurants.length} restaurants and ${menu.length} menu items ✅`);
