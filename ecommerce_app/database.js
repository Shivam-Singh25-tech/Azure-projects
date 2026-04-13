// ─────────────────────────────────────────────────────
// TIER 3 — Data Tier  (SQLite)
// Tables: users, products, orders
// ─────────────────────────────────────────────────────
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'store.db'), err => {
  if (err) return console.error('DB error:', err);
  console.log('  ✅ SQLite connected');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, category TEXT NOT NULL,
    price REAL NOT NULL, orig REAL,
    desc TEXT, emoji TEXT, bg TEXT,
    rating REAL DEFAULT 4.5, reviews INTEGER DEFAULT 0,
    features TEXT, badge TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT, customer_email TEXT NOT NULL,
    address TEXT, items TEXT NOT NULL,
    subtotal REAL, total REAL, status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  // Seed products
  db.get('SELECT COUNT(*) as n FROM products', (err, row) => {
    if (err || row.n > 0) return;
    const ins = db.prepare(`INSERT INTO products
      (name,category,price,orig,desc,emoji,bg,rating,reviews,features,badge) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
    const P = [
      ['AirPods Pro Max','Electronics',24999,32999,'Premium over-ear headphones with Active Noise Cancellation, spatial audio and 30-hour battery life.','🎧','#0d1b2a',4.9,2847,'["ANC & Transparency mode","30hr battery","Spatial Audio","USB-C fast charging","Memory foam cushions"]','SALE'],
      ['Mechanical Keyboard','Electronics',8499,11999,'TKL mechanical keyboard with hot-swappable switches, per-key RGB and double-shot PBT keycaps.','⌨️','#0d1a0d',4.7,1243,'["Hot-swappable switches","Per-key RGB","PBT keycaps","USB-C detachable cable","N-key rollover"]','SALE'],
      ['Smart Watch Series X','Electronics',18999,null,'Next-gen smartwatch — always-on AMOLED, health monitoring suite and 18-day battery life.','⌚','#1a0a2e',4.8,3102,'["Always-on AMOLED","18-day battery","SpO2 & ECG sensor","5ATM waterproof","GPS + NFC"]','NEW'],
      ['Leather Bifold Wallet','Accessories',1999,2999,'Full-grain Italian leather bifold wallet with RFID blocking. 8 card slots, slim 8mm profile.','👜','#1a0e00',4.6,887,'["Full-grain Italian leather","RFID blocking","8 card slots","Slim 8mm profile","Hand-stitched edges"]','SALE'],
      ['Polarized Sunglasses','Accessories',5499,7999,'UV400 polarized sunglasses with titanium frame. Anti-scratch coating. Leather case included.','🕶️','#0a1a0a',4.5,562,'["Polarized UV400 lenses","Titanium frame","Spring hinges","Anti-scratch coating","Leather case"]','SALE'],
      ['Running Shoes Pro','Footwear',7999,10999,'Responsive foam midsole with carbon fibre plate, breathable mesh, 70% recycled materials.','👟','#001a0d',4.8,4210,'["Responsive foam midsole","Carbon fibre plate","Breathable mesh upper","70% recycled materials","8mm heel drop"]','SALE'],
      ['Premium Cotton Polo','Clothing',1299,1799,'100% Pima cotton polo with modern tailored fit. Pre-shrunk, anti-fade. Available in 8 colours.','👕','#1a1000',4.4,728,'["100% Pima cotton","Tailored slim fit","Pre-shrunk","8 colours available","Reinforced placket"]','SALE'],
      ['15W Wireless Charger','Electronics',2499,3499,'15W fast wireless charging pad with active cooling, LED indicator and non-slip base.','🔋','#001a1a',4.3,1089,'["15W fast wireless","Universal Qi","Active cooling fan","LED indicator","Non-slip silicone"]','SALE'],
      ['30L Explorer Backpack','Accessories',4299,null,'30L waterproof backpack — 15" laptop compartment, USB charging port, ventilated back panel.','🎒','#0d1a00',4.7,1530,'["30L capacity","Waterproof 600D fabric","15\" laptop compartment","USB-A port","Ventilated back"]','NEW'],
      ['Perfume Noir EDP','Beauty',3999,5499,'Sophisticated blend of oud, sandalwood & vetiver. Bergamot & pepper top notes. Lasts 12+ hours.','🧴','#1a001a',4.9,643,'["12+ hour longevity","Oud & sandalwood","Bergamot top notes","100ml EDP","Luxury gift box"]','SALE'],
      ['Barista Coffee Maker','Home',9999,13999,'Barista-grade espresso machine — 15-bar pump, built-in frother, 1.8L tank, cup warmer.','☕','#1a0a00',4.6,922,'["15-bar pump","Built-in frother","Adjustable grind","Cup warmer","1.8L water tank"]','SALE'],
      ['Architect Desk Lamp','Home',1799,2499,'LED desk lamp — 5 colour temps, infinite dimmer, 10W wireless charging base, USB-A port.','💡','#1a1a00',4.5,415,'["5 colour temperatures","Infinite dimmer","10W wireless charging","USB-A port","300° rotation"]','SALE'],
    ];
    P.forEach(row => ins.run(...row));
    ins.finalize();
    console.log('  🛍️  Seeded 12 products');
  });
});

module.exports = db;