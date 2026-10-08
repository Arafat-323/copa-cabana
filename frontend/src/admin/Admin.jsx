import { useCallback, useEffect, useState } from 'react';
import { api, send, getToken, setToken } from './adminApi.js';
import { fcfa } from '../api.js';

const fmt = (d) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
const ORDER_ST = { nouvelle: 'Nouvelle', en_preparation: 'En préparation', prete: 'Prête', terminee: 'Terminée', annulee: 'Annulée' };
const RESA_ST = { en_attente: 'En attente', confirmee: 'Confirmée', annulee: 'Annulée' };
const MODES = { sur_place: 'Sur place', emporter: 'À emporter', livraison: 'Livraison' };
const CATS = ['Grillades', 'Poissons', 'Accompagnements', 'Boissons', 'Desserts'];

function useList(path, every) {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const load = useCallback(() => api(path).then((d) => { setData(d); setError(''); }).catch((e) => setError(e.message)), [path]);
  useEffect(() => { load(); if (!every) return; const t = setInterval(load, every); return () => clearInterval(t); }, [load, every]);
  return [data, load, error];
}
const Err = ({ msg }) => msg ? <p role="alert" className="my-2 text-hibiscus">{msg}</p> : null;

function Login({ onLogin }) {
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  async function submit(e) {
    e.preventDefault();
    try { const r = await send('/auth/login', 'POST', f); setToken(r.token); onLogin(r.user); }
    catch (x) { setErr(x.message); }
  }
  return (
    <main className="grid min-h-screen place-items-center bg-nuit px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-ecume p-6">
        <h1 className="font-display text-2xl font-extrabold">Copa<span className="text-lagon">Cabana</span> · Espace équipe</h1>
        <label className="block">Email<input required type="email" className="field mt-1" autoComplete="username" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label className="block">Mot de passe<input required type="password" className="field mt-1" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        <Err msg={err} />
        <button className="btn btn-lagon w-full">Se connecter</button>
      </form>
    </main>
  );
}

function Orders() {
  const [orders, load, error] = useList('/orders', 30000);
  const upd = (id, body) => send(`/orders/${id}`, 'PATCH', body).then(load);
  return (
    <section>
      <Err msg={error} />
      {!orders.length && <p>Aucune commande pour le moment.</p>}
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o._id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <strong>{o.customer.name} · <a className="underline" href={`tel:${o.customer.phone}`}>{o.customer.phone}</a></strong>
              <span className="text-sm text-nuit/60">{fmt(o.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm">{o.items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</p>
            <p className="text-sm text-nuit/70">{MODES[o.mode]}{o.customer.address ? ` · ${o.customer.address}` : ''}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <strong>{fcfa(o.total)}</strong>
              <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${o.payment.status === 'paye' ? 'bg-lagon/20 text-lagon' : 'bg-mangue/30'}`}>
                {o.payment.method === 'kkiapay' ? 'Kkiapay' : 'Au restaurant'} · {o.payment.status === 'paye' ? 'payé' : o.payment.status === 'echec' ? 'échec' : 'en attente'}
              </span>
              {o.payment.method === 'sur_place' && o.payment.status !== 'paye' && <button className="btn btn-lagon !px-4 !py-1" onClick={() => upd(o._id, { paymentStatus: 'paye' })}>Marquer payé</button>}
              <select aria-label="Statut" className="field !w-auto" value={o.status} onChange={(e) => upd(o._id, { status: e.target.value })}>
                {Object.entries(ORDER_ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Reservations() {
  const [list, load, error] = useList('/reservations', 60000);
  return (
    <section>
      <Err msg={error} />
      {!list.length && <p>Aucune réservation.</p>}
      <ul className="space-y-3">
        {list.map((r) => (
          <li key={r._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div>
              <strong>{r.name} · <a className="underline" href={`tel:${r.phone}`}>{r.phone}</a></strong>
              <p className="text-sm">{new Date(r.date).toLocaleDateString('fr-FR')} à {r.time} · {r.guests} pers.</p>
              {r.note && <p className="text-sm text-nuit/70">{r.note}</p>}
            </div>
            <select aria-label="Statut" className="field !w-auto" value={r.status} onChange={(e) => send(`/reservations/${r._id}`, 'PATCH', { status: e.target.value }).then(load)}>
              {Object.entries(RESA_ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Messages() {
  const [list, , error] = useList('/contact');
  return (
    <section>
      <Err msg={error} />
      {!list.length && <p>Aucun message.</p>}
      <ul className="space-y-3">
        {list.map((m) => (
          <li key={m._id} className="rounded-xl bg-white p-4 shadow-sm">
            <strong>{m.name}</strong> {m.phone && <a className="underline" href={`tel:${m.phone}`}>{m.phone}</a>}
            <span className="ml-2 text-sm text-nuit/60">{fmt(m.createdAt)}</span>
            <p className="mt-1 whitespace-pre-wrap">{m.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const EMPTY_DISH = { name: '', description: '', category: CATS[0], price: '', available: true };
function MenuAdmin() {
  const [dishes, load, error] = useList('/menu/all');
  const [f, setF] = useState(EMPTY_DISH);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState('');
  async function submit(e) {
    e.preventDefault();
    try {
      const body = { ...f, price: Number(f.price) };
      editId ? await send(`/menu/${editId}`, 'PUT', body) : await send('/menu', 'POST', body);
      setF(EMPTY_DISH); setEditId(null); setErr(''); load();
    } catch (x) { setErr(x.message); }
  }
  const remove = (d) => window.confirm(`Supprimer « ${d.name} » ?`) && api(`/menu/${d._id}`, { method: 'DELETE' }).then(load);
  return (
    <section>
      <form onSubmit={submit} className="mb-6 grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2">
        <h2 className="font-display text-lg font-bold sm:col-span-2">{editId ? 'Modifier le plat' : 'Ajouter un plat'}</h2>
        <label>Nom<input required className="field mt-1" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label>Prix (FCFA)<input required type="number" min="0" className="field mt-1" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></label>
        <label>Catégorie<select className="field mt-1" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="flex items-end gap-2 pb-2"><input type="checkbox" checked={f.available} onChange={(e) => setF({ ...f, available: e.target.checked })} />Visible sur le site</label>
        <label className="sm:col-span-2">Description<input className="field mt-1" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
        <Err msg={err || error} />
        <div className="flex gap-3 sm:col-span-2">
          <button className="btn btn-lagon">{editId ? 'Enregistrer' : 'Ajouter'}</button>
          {editId && <button type="button" className="btn ring-2 ring-nuit/30" onClick={() => { setEditId(null); setF(EMPTY_DISH); }}>Annuler</button>}
        </div>
      </form>
      <ul className="divide-y divide-nuit/15 rounded-xl bg-white shadow-sm">
        {dishes.map((d) => (
          <li key={d._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className={d.available ? '' : 'opacity-50'}>
              <strong>{d.name}</strong> <span className="text-sm text-nuit/60">· {d.category}</span>
              <p className="text-sm">{fcfa(d.price)}{d.available ? '' : ' · masqué'}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn !px-4 !py-1 ring-2 ring-nuit/30" onClick={() => { setEditId(d._id); setF({ name: d.name, description: d.description || '', category: d.category, price: d.price, available: d.available }); window.scrollTo({ top: 0 }); }}>Modifier</button>
              <button className="btn !px-4 !py-1 bg-hibiscus text-white" onClick={() => remove(d)}>Supprimer</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Team({ me }) {
  const [users, load, error] = useList('/users');
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'serveur' });
  const [err, setErr] = useState('');
  async function submit(e) {
    e.preventDefault();
    try { await send('/users', 'POST', f); setF({ name: '', email: '', password: '', role: 'serveur' }); setErr(''); load(); }
    catch (x) { setErr(x.message); }
  }
  return (
    <section>
      <form onSubmit={submit} className="mb-6 grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2">
        <h2 className="font-display text-lg font-bold sm:col-span-2">Ajouter un membre</h2>
        <label>Nom<input required className="field mt-1" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label>Email<input required type="email" className="field mt-1" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label>Mot de passe (8 car. min.)<input required minLength={8} type="password" autoComplete="new-password" className="field mt-1" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        <label>Rôle<select className="field mt-1" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="serveur">Serveur (commandes, réservations)</option><option value="gerant">Gérant (tout)</option></select></label>
        <Err msg={err || error} />
        <button className="btn btn-lagon sm:col-span-2">Créer le compte</button>
      </form>
      <ul className="divide-y divide-nuit/15 rounded-xl bg-white shadow-sm">
        {users.map((u) => (
          <li key={u._id} className="flex items-center justify-between gap-3 p-4">
            <span><strong>{u.name}</strong> · {u.email} · {u.role === 'gerant' ? 'Gérant' : 'Serveur'}</span>
            {u.name !== me.name && <button className="btn !px-4 !py-1 bg-hibiscus text-white" onClick={() => window.confirm(`Supprimer ${u.name} ?`) && api(`/users/${u._id}`, { method: 'DELETE' }).then(load).catch(() => {})}>Supprimer</button>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Admin() {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(!getToken());
  const [tab, setTab] = useState('orders');

  useEffect(() => {
    if (getToken()) api('/auth/me').then(setUser).catch(() => {}).finally(() => setChecked(true));
    const out = () => setUser(null);
    window.addEventListener('cc-logout', out);
    return () => window.removeEventListener('cc-logout', out);
  }, []);

  if (!checked) return <p className="p-6">Chargement…</p>;
  if (!user) return <Login onLogin={setUser} />;

  const manager = user.role === 'gerant';
  const tabs = [['orders', 'Commandes'], ['resa', 'Réservations'], ...(manager ? [['msg', 'Messages'], ['menu', 'Menu'], ['team', 'Équipe']] : [])];
  return (
    <div className="min-h-screen">
      <header className="bg-nuit text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <strong className="font-display text-xl">Copa<span className="text-mangue">Cabana</span> · Équipe</strong>
          <span className="flex items-center gap-3 text-sm">{user.name} ({manager ? 'gérant' : 'serveur'})
            <button className="btn !px-4 !py-1 ring-2 ring-white/50" onClick={() => { setToken(null); setUser(null); }}>Déconnexion</button>
          </span>
        </div>
        <nav aria-label="Sections" className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-3">
          {tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} aria-current={tab === k} className={`btn shrink-0 !py-2 ${tab === k ? 'bg-mangue text-nuit' : 'ring-1 ring-white/40'}`}>{l}</button>)}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        {tab === 'orders' && <Orders />}
        {tab === 'resa' && <Reservations />}
        {manager && tab === 'msg' && <Messages />}
        {manager && tab === 'menu' && <MenuAdmin />}
        {manager && tab === 'team' && <Team me={user} />}
      </main>
    </div>
  );
}
