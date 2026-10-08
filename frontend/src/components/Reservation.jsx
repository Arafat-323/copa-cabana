import { useState } from 'react';
import { createReservation, waLink } from '../api.js';

export default function Reservation() {
  const [f, setF] = useState({ name: '', phone: '', date: '', time: '20:00', guests: 2, note: '' });
  const [s, setS] = useState({ busy: false, error: '', ok: false });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setS({ busy: true, error: '', ok: false });
    try { await createReservation({ ...f, guests: Number(f.guests) }); setS({ busy: false, error: '', ok: true }); }
    catch (err) { setS({ busy: false, error: err.message, ok: false }); }
  }

  return (
    <section id="reserver" className="scroll-mt-16 bg-lagon/10 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Réserver une table</h2>
        <p className="mt-2 text-nuit/70">Nous vous confirmons par téléphone ou WhatsApp.</p>
        {s.ok ? (
          <p role="status" className="mt-6 rounded-lg bg-white p-4 font-bold">Demande envoyée. Nous vous répondons très vite.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label>Nom<input required className="field mt-1" value={f.name} onChange={set('name')} autoComplete="name" /></label>
            <label>Téléphone<input required type="tel" className="field mt-1" value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
            <label>Date<input required type="date" className="field mt-1" min={new Date().toISOString().slice(0, 10)} value={f.date} onChange={set('date')} /></label>
            <label>Heure<input required type="time" className="field mt-1" value={f.time} onChange={set('time')} /></label>
            <label>Personnes<input required type="number" min="1" max="40" className="field mt-1" value={f.guests} onChange={set('guests')} /></label>
            <label className="sm:col-span-2">Précisions (anniversaire, terrasse…)<textarea rows="2" className="field mt-1" value={f.note} onChange={set('note')} /></label>
            {s.error && <p role="alert" className="text-hibiscus sm:col-span-2">{s.error}</p>}
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button disabled={s.busy} className="btn btn-lagon disabled:opacity-60">{s.busy ? 'Envoi…' : 'Envoyer la demande'}</button>
              <a className="btn ring-2 ring-nuit/30" target="_blank" rel="noopener noreferrer"
                 href={waLink(`Bonjour, je souhaite réserver pour ${f.guests} personne(s) le ${f.date || '…'} à ${f.time}.`)}>Réserver via WhatsApp</a>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
