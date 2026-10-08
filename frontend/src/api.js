const API = import.meta.env.VITE_API_URL;

async function call(path, options) {
  const res = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Une erreur est survenue. Réessayez.');
  return data;
}
const post = (path, body) => call(path, { method: 'POST', body: JSON.stringify(body) });

export const getMenu = () => call('/menu');
export const createOrder = (payload) => post('/orders', payload);
export const verifyPayment = (id, transactionId) => post(`/orders/${id}/verify`, { transactionId });
export const createReservation = (payload) => post('/reservations', payload);
export const sendMessage = (payload) => post('/contact', payload);

export const fcfa = (n) => `${Number(n).toLocaleString('fr-FR')} FCFA`;
export const WHATSAPP = import.meta.env.VITE_WHATSAPP;
export const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
