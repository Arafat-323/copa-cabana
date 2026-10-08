const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const Dish = model('Dish', new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['Grillades', 'Poissons', 'Accompagnements', 'Boissons', 'Desserts'], required: true },
  price: { type: Number, required: true, min: 0 }, // FCFA
  image: String,
  available: { type: Boolean, default: true },
}, { timestamps: true }));

const Order = model('Order', new Schema({
  customer: { name: { type: String, required: true }, phone: { type: String, required: true }, address: String },
  mode: { type: String, enum: ['sur_place', 'emporter', 'livraison'], default: 'emporter' },
  items: [{ dish: { type: Schema.Types.ObjectId, ref: 'Dish' }, name: String, price: Number, qty: Number }],
  total: { type: Number, required: true },
  payment: {
    method: { type: String, enum: ['kkiapay', 'sur_place'], default: 'sur_place' },
    status: { type: String, enum: ['en_attente', 'paye', 'echec'], default: 'en_attente' },
    transactionId: String,
  },
  status: { type: String, enum: ['nouvelle', 'en_preparation', 'prete', 'terminee', 'annulee'], default: 'nouvelle' },
}, { timestamps: true }));

const Reservation = model('Reservation', new Schema({
  name: { type: String, required: true }, phone: { type: String, required: true },
  date: { type: Date, required: true }, time: { type: String, required: true },
  guests: { type: Number, min: 1, max: 40, required: true }, note: String,
  status: { type: String, enum: ['en_attente', 'confirmee', 'annulee'], default: 'en_attente' },
}, { timestamps: true }));

const Message = model('Message', new Schema({
  name: { type: String, required: true }, phone: String, email: String, message: { type: String, required: true },
}, { timestamps: true }));

const User = model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['gerant', 'serveur'], default: 'serveur' },
}, { timestamps: true }));

module.exports = { Dish, Order, Reservation, Message, User };
