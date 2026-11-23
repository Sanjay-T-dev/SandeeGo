// Authentication: signup / login / logout / me
// Extra npm package illa: password hashing-ku Node built-in `crypto` (scrypt) use pannirukken.
import crypto from 'crypto';
import { promisify } from 'util';
import db from './db.js';

const scrypt = promisify(crypto.scrypt);
const SESSION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- password hashing ----------
export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = String(stored).split(':');
  const expected = Buffer.from(hashHex || '', 'hex');
  if (!saltHex || expected.length === 0) return false;
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// Even when attempting to log in with a non-existent email, it should take the same amount of time (to reduce timing attacks).
let dummyHashPromise;
const dummyHash = () => (dummyHashPromise ||= hashPassword('not-a-real-password'));

// ---------- sessions ----------
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);
  db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?,?,?,?)').run(
    sha256(token), userId, now, now + SESSION_MS
  );
  return token;
}

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone });

// ---------- middleware ----------
// Valid token irundha req.user set pannum (illana ignore, next() pogum)
export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (token) {
    const row = db
      .prepare(
        `SELECT u.id, u.name, u.email, u.phone
         FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND s.expires_at > ?`
      )
      .get(sha256(token), Date.now());
    if (row) {
      req.user = { ...row };
      req.token = token;
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Login pannunga' });
  next();
}

// ---------- login rate limit (in-memory, demo) ----------
const attempts = new Map(); // key -> { count, resetAt }
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function isBlocked(key) {
  const a = attempts.get(key);
  if (!a) return false;
  if (Date.now() > a.resetAt) {
    attempts.delete(key);
    return false;
  }
  return a.count >= MAX_ATTEMPTS;
}
function recordFailure(key) {
  const a = attempts.get(key);
  if (!a || Date.now() > a.resetAt) attempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
  else a.count += 1;
}

// ---------- handlers ----------
export async function signup(req, res) {
  try {
    const { name = '', email = '', phone = '', password = '' } = req.body || {};
    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim();

    if (cleanName.length < 2 || cleanName.length > 60) return res.status(400).json({ error: 'Name 2 to 60 letters irukkanum' });
    if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 120) return res.status(400).json({ error: 'Valid email kudunga' });
    if (!/^\d{10}$/.test(cleanPhone)) return res.status(400).json({ error: 'Valid 10-digit phone number kudunga' });
    if (typeof password !== 'string' || password.length < 8 || password.length > 100)
      return res.status(400).json({ error: 'Password minimum 8 characters irukkanum' });

    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(cleanEmail))
      return res.status(409).json({ error: 'Intha email-la already account irukku. Login pannunga' });

    const passwordHash = await hashPassword(password);
    const { lastInsertRowid } = db
      .prepare('INSERT INTO users (name, email, phone, password_hash, created_at) VALUES (?,?,?,?,?)')
      .run(cleanName, cleanEmail, cleanPhone, passwordHash, Date.now());
    const userId = Number(lastInsertRowid);

    const token = createSession(userId);
    res.status(201).json({ token, user: { id: userId, name: cleanName, email: cleanEmail, phone: cleanPhone } });
  } catch (err) {
    // UNIQUE constraint (rendu requests ore neram-la vandha)
    if (String(err.message).includes('UNIQUE')) return res.status(409).json({ error: 'Intha email-la already account irukku' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function login(req, res) {
  try {
    const { email = '', password = '' } = req.body || {};
    const cleanEmail = String(email).trim().toLowerCase();
    const key = `${req.ip}|${cleanEmail}`;

    if (isBlocked(key)) return res.status(429).json({ error: 'Romba thadava thappa try pannitteenga. 15 nimisham apram try pannunga' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
    const ok = user
      ? await verifyPassword(String(password), user.password_hash)
      : (await verifyPassword(String(password), await dummyHash()), false);

    if (!ok) {
      recordFailure(key);
      // email thappa, password thappa nu sollaama same message (user enumeration prevent)
      return res.status(401).json({ error: 'Email allathu password thappu' });
    }

    attempts.delete(key);
    const token = createSession(user.id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export function me(req, res) {
  res.json({ user: req.user });
}

export function logout(req, res) {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(req.token));
  res.json({ ok: true });
}
