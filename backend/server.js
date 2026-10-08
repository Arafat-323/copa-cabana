require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sdk = require('@kkiapay-org/nodejs-sdk');
const { Dish, Order, Reservation, Message, User } = require('./models');

if (!process.env.JWT_SECRET) { console.error('JWT_SECRET manquant.'); process.exit(1); }
const createKkiapay = sdk.kkiapay || sdk.Kkiapay || sdk.default;

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', rateLimit({ windowMs: 60_000, max: 120 }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60_000, max: 10, message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' } }));

const kkiapay = createKkiapay({
  publickey: process.env.KKIAPAY_PUBLIC_KEY,
  privatekey: process.env.KKIAPAY_PRIVATE_KEY,
  secretkey: process.env.KKIAPAY_SECRET,
  sandbox: process.env.KKIAPAY_SANDBOX === 'true',
});

// ---- Authentification : auth() = tout compte connecté, auth('gerant') = gérant uniquement
const auth = (...roles) => (req, res, next) => {
  const h = req.headers.authorization || '';
  try {
    const p = jwt.verify(h.startsWith('Bearer ') ? h.slice(7) : '', process.env.JWT_SECRET);
    if (roles.length && !roles.includes(p.role)) return res.status(403).json({ error: 'Droits insuffisants.' });
    req.user = p;
    next();
  } catch {
    res.status(401).json({ error: 'Session expirée. Reconnectez-vous.' });
  }
};
const wrap = (fn) => (req, res) => fn(req, res).catch((e) => {
  console.error(e);
  if (e.code === 11000) return res.status(409).json({ error: 'Cet email existe déjà.' });
  const bad = e.name === 'ValidationError' || e.name === 'CastError';
  res.status(bad ? 400 : 500).json({ error: bad ? 'Données invalides.' : 'Erreur serveur.' });
});

const DUMMY_HASH = bcrypt.hashSync('inutilise', 12);
app.post('/api/auth/login', wrap(async (req, res) => {
  const { email = '', password = '' } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  const ok = await bcrypt.compare(String(password), user ? user.passwordHash : DUMMY_HASH);
  if (!user || !ok) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
  const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user: { name: user.name, role: user.role } });
}));
app.get('/api/auth/me', auth(), (req, res) => res.json({ name: req.user.name, role: req.user.role }));

// ---- Équipe (gérant)
app.get('/api/users', auth('gerant'), wrap(async (_q, res) => res.json(await User.find().select('-passwordHash').sort('name'))));
app.post('/api/users', auth('gerant'), wrap(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: 'Nom, email et mot de passe (8 caractères min.) requis.' });
  const u = await User.create({ name, email, role: role === 'gerant' ? 'gerant' : 'serveur', passwordHash: await bcrypt.hash(password, 12) });
  res.status(201).json({ id: u._id });
}));
app.delete('/api/users/:id', auth('gerant'), wrap(async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
  await User.findByIdAndDelete(req.params.id);
  res.status(204).end();
}));

// ---- Menu
app.get('/api/menu', wrap(async (_req, res) => res.json(await Dish.find({ available: true }).sort('category name'))));
app.get('/api/menu/all', auth('gerant'), wrap(async (_req, res) => res.json(await Dish.find().sort('category name'))));
app.post('/api/menu', auth('gerant'), wrap(async (req, res) => res.status(201).json(await Dish.create(req.body))));
app.put('/api/menu/:id', auth('gerant'), wrap(async (req, res) => res.json(await Dish.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));
app.delete('/api/menu/:id', auth('gerant'), wrap(async (req, res) => { await Dish.findByIdAndDelete(req.params.id); res.status(204).end(); }));

// ---- Commandes (le total est recalculé côté serveur à partir des prix en base)
app.post('/api/orders', wrap(async (req, res) => {
  const { customer, mode, items, paymentMethod } = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Le panier est vide.' });
  const dishes = await Dish.find({ _id: { $in: items.map((i) => i.dish) }, available: true });
  const lines = items.map((i) => {
    const d = dishes.find((x) => String(x._id) === String(i.dish));
    const qty = Math.min(Math.max(parseInt(i.qty, 10) || 0, 1), 50);
    return d && { dish: d._id, name: d.name, price: d.price, qty };
  });
  if (lines.some((l) => !l)) return res.status(400).json({ error: "Un plat n'est plus disponible." });
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const order = await Order.create({
    customer, mode, items: lines, total,
    payment: { method: paymentMethod === 'kkiapay' ? 'kkiapay' : 'sur_place' },
  });
  res.status(201).json({ id: order._id, total });
}));

// Vérification du paiement Kkiapay côté serveur (ne jamais faire confiance au navigateur)
app.post('/api/orders/:id/verify', wrap(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Commande introuvable.' });
  const tx = await kkiapay.verify(req.body.transactionId);
  const ok = tx && tx.status === 'SUCCESS' && Number(tx.amount) >= order.total;
  order.payment.status = ok ? 'paye' : 'echec';
  if (ok) order.payment.transactionId = req.body.transactionId;
  await order.save();
  res.json({ status: order.payment.status });
}));

app.get('/api/orders', auth(), wrap(async (_req, res) => res.json(await Order.find().sort('-createdAt').limit(200))));
app.patch('/api/orders/:id', auth(), wrap(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Commande introuvable.' });
  if (req.body.status) order.status = req.body.status;
  // Le personnel peut encaisser un paiement fait au restaurant (pas un paiement Kkiapay)
  if (req.body.paymentStatus === 'paye' && order.payment.method === 'sur_place') order.payment.status = 'paye';
  await order.save();
  res.json(order);
}));

// ---- Réservations
app.post('/api/reservations', wrap(async (req, res) => { const r = await Reservation.create(req.body); res.status(201).json({ id: r._id }); }));
app.get('/api/reservations', auth(), wrap(async (_req, res) => res.json(await Reservation.find().sort('-date').limit(200))));
app.patch('/api/reservations/:id', auth(), wrap(async (req, res) => res.json(await Reservation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }))));

// ---- Contact
app.post('/api/contact', wrap(async (req, res) => { await Message.create(req.body); res.status(201).json({ ok: true }); }));
app.get('/api/contact', auth('gerant'), wrap(async (_req, res) => res.json(await Message.find().sort('-createdAt').limit(200))));

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT || 5000, () => console.log('API Copa Cabana prête'));
}).catch((e) => { console.error('MongoDB :', e.message); process.exit(1); });
