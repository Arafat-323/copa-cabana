import { useState } from 'react';
import { createOrder, verifyPayment, fcfa, waLink } from '../api.js';

const KEY = import.meta.env.VITE_KKIAPAY_PUBLIC_KEY;
const SANDBOX = import.meta.env.VITE_KKIAPAY_SANDBOX === 'true';

export default function Cart({ lines, total, setQty, onClose, onDone }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '', mode: 'emporter', pay: 'kkiapay' });
  const [state, setState] = useState({ busy: false, error: '', done: null });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const finish = (order, paid) => { setState({ busy: false, error: '', done: { ...order, paid } }); onDone(); };

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: '', done: null });
    try {
      const order = await createOrder({
        customer: { name: form.name, phone: form.phone, address: form.address },
        mode: form.mode, paymentMethod: form.pay,
        items: lines.map((l) => ({ dish: l.dish._id, qty: l.qty })),
      });
      if (form.pay !== 'kkiapay') return finish(order, false);

      window.openKkiapayWidget({ amount: order.total, api_key: KEY, sandbox: SANDBOX, phone: form.phone, theme: '#14A3A0' });
      window.addSuccessListener(async (r) => {
        try { const v = await verifyPayment(order.id, r.transactionId); finish(order, v.status === 'paye'); }
        catch (err) { setState({ busy: false, error: err.message, done: null }); }
      });
      window.addFailedListener(() => setState({ busy: false, error: 'Le paiement a échoué. Vous pouvez réessayer.', done: null }));
    } catch (err) {
      setState({ busy: false, error: err.message, done: null });
    }
  }

  const summary = lines.map((l) => `${l.qty} x ${l.dish.name}`).join(', ');

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-nuit/60" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-label="Votre panier" onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-md overflow-y-auto bg-ecume p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-extrabold">Votre commande</h2>
          <button onClick={onClose} className="rounded-full px-3 py-1 text-xl" aria-label="Fermer">✕</button>
        </div>

        {state.done ? (
          <div className="mt-8 space-y-4" role="status">
            <p className="font-display text-xl font-bold">Commande reçue, merci !</p>
            <p>{state.done.paid ? 'Votre paiement est confirmé.' : 'Vous réglerez au restaurant.'} Total : {fcfa(state.done.total)}.</p>
            <a className="btn btn-lagon" target="_blank" rel="noopener noreferrer"
               href={waLink(`Bonjour, je viens de passer la commande n°${state.done.id.slice(-6)}.`)}>Suivre sur WhatsApp</a>
          </div>
        ) : lines.length === 0 ? (
          <p className="mt-8">Votre panier est vide. Choisissez un plat dans le menu.</p>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <ul className="divide-y divide-nuit/15">
              {lines.map((l) => (
                <li key={l.dish._id} className="flex items-center justify-between gap-2 py-2">
                  <span>{l.dish.name}</span>
                  <span className="flex items-center gap-2">
                    <button type="button" onClick={() => setQty(l.dish._id, l.qty - 1)} className="h-8 w-8 rounded-full bg-nuit text-white" aria-label={`Retirer un ${l.dish.name}`}>−</button>
                    {l.qty}
                    <button type="button" onClick={() => setQty(l.dish._id, l.qty + 1)} className="h-8 w-8 rounded-full bg-nuit text-white" aria-label={`Ajouter un ${l.dish.name}`}>+</button>
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-right font-display text-xl font-bold">Total : {fcfa(total)}</p>

            <label className="block">Nom<input required className="field mt-1" value={form.name} onChange={set('name')} autoComplete="name" /></label>
            <label className="block">Téléphone<input required type="tel" className="field mt-1" value={form.phone} onChange={set('phone')} autoComplete="tel" /></label>
            <label className="block">Mode
              <select className="field mt-1" value={form.mode} onChange={set('mode')}>
                <option value="emporter">À emporter</option><option value="sur_place">Sur place</option><option value="livraison">Livraison</option>
              </select>
            </label>
            {form.mode === 'livraison' && <label className="block">Adresse de livraison<input required className="field mt-1" value={form.address} onChange={set('address')} /></label>}

            <fieldset className="space-y-2">
              <legend className="font-bold">Paiement</legend>
              <label className="flex gap-2"><input type="radio" name="pay" checked={form.pay === 'kkiapay'} onChange={() => setForm({ ...form, pay: 'kkiapay' })} />Mobile Money ou carte (Kkiapay)</label>
              <label className="flex gap-2"><input type="radio" name="pay" checked={form.pay === 'sur_place'} onChange={() => setForm({ ...form, pay: 'sur_place' })} />Payer au restaurant</label>
            </fieldset>

            {state.error && <p role="alert" className="text-hibiscus">{state.error}</p>}
            <button disabled={state.busy} className="btn btn-main w-full disabled:opacity-60">
              {state.busy ? 'Un instant…' : form.pay === 'kkiapay' ? `Payer ${fcfa(total)}` : 'Envoyer la commande'}
            </button>
            <a className="block text-center text-sm underline" target="_blank" rel="noopener noreferrer"
               href={waLink(`Bonjour, je souhaite commander : ${summary}. Total ${fcfa(total)}.`)}>Plutôt commander par WhatsApp</a>
          </form>
        )}
      </aside>
    </div>
  );
}
