// ─────────────────────────────────────────────────────
// TIER 2 — Application Tier  (Node.js + Express API)
// ─────────────────────────────────────────────────────
const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const path    = require('path');
const db      = require('./database');


const app = express();
const SECRET = process.env.JWT_SECRET || 'luxe_jwt_secret_2025';

app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(__dirname));


function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

// AUTH
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  const hashed = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (name,email,password) VALUES (?,?,?)', [name, email, hashed], function(err) {
    if (err) return res.status(409).json({ error: 'Email already registered' });
    const token = jwt.sign({ id: this.lastID, name, email }, SECRET, { expiresIn: '7d' });
    res.status(201).json({ id: this.lastID, name, email, token });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email=?', [email], async (err, u) => {
    if (err || !u) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, u.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: u.id, name: u.name, email: u.email }, SECRET, { expiresIn: '7d' });
    res.json({ id: u.id, name: u.name, email: u.email, token });
  });
});

// PRODUCTS
app.get('/api/products', (req, res) => {
  const { category, search, sort } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const p = [];
  if (category) { sql += ' AND category=?'; p.push(category); }
  if (search)   { sql += ' AND name LIKE ?'; p.push('%'+search+'%'); }
  sql += sort === 'priceLow' ? ' ORDER BY price ASC'
       : sort === 'priceHigh' ? ' ORDER BY price DESC'
       : sort === 'rating' ? ' ORDER BY rating DESC'
       : ' ORDER BY id ASC';
  db.all(sql, p, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => ({ ...r, features: JSON.parse(r.features||'[]') })));
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id=?', [req.params.id], (err, r) => {
    if (err || !r) return res.status(404).json({ error: 'Not found' });
    res.json({ ...r, features: JSON.parse(r.features||'[]') });
  });
});

// ORDERS
app.post('/api/orders', (req, res) => {
  const { customer_name, customer_email, address, items, subtotal, total } = req.body;
  if (!customer_email || !items?.length) return res.status(400).json({ error: 'Missing fields' });
  db.run(
    `INSERT INTO orders (customer_name,customer_email,address,items,subtotal,total,status) VALUES (?,?,?,?,?,?,'pending')`,
    [customer_name, customer_email, address, JSON.stringify(items), subtotal, total],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, status: 'pending' });
    }
  );
});

app.get('/api/orders', auth, (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items) })));
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname,'index.html'));
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`\n  🛍️  LUXE Store → http://localhost:${PORT}\n`));