import { useState } from 'react';
import { sendMessage, waLink } from '../api.js';

export default function Contact() {
  const [f, setF] = useState({ name: '', phone: '', message: '' });
  const [s, setS] = useState({ busy: false, error: '', ok: false });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setS({ busy: true, error: '', ok: false });
    try { await sendMessage(f); setS({ busy: false, error: '', ok: true }); setF({ name: '', phone: '', message: '' }); }
    catch (err) { setS({ busy: false, error: err.message, ok: false }); }
  }

  return (
    <section id="contact" className="mx-auto grid max-w-6xl scroll-mt-16 gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Nous contacter</h2>
        <p className="mt-3">Une question, un événement à organiser ? Écrivez-nous, la réponse est plus rapide sur WhatsApp.</p>
        <a className="btn mt-5 bg-[#25D366] text-nuit hover:brightness-95" target="_blank" rel="noopener noreferrer" href={waLink('Bonjour Copa Cabana, ')}>Écrire sur WhatsApp</a>
        <address className="mt-6 not-italic leading-relaxed">
          Agla, Cotonou (Plus Code 99M7+FX)<br />
          <a className="underline" href="tel:+2290148245939">01 48 24 59 39</a><br />
          Tous les jours de 16h à 05h
        </address>
        <a className="mt-3 inline-block underline" target="_blank" rel="noopener noreferrer"
           href="https://www.google.com/maps/search/?api=1&query=99M7%2BFX%20Cotonou">Itinéraire sur Google Maps</a>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">Nom<input required className="field mt-1" value={f.name} onChange={set('name')} autoComplete="name" /></label>
        <label className="block">Téléphone<input type="tel" className="field mt-1" value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
        <label className="block">Message<textarea required rows="4" className="field mt-1" value={f.message} onChange={set('message')} /></label>
        {s.error && <p role="alert" className="text-hibiscus">{s.error}</p>}
        {s.ok && <p role="status" className="font-bold text-lagon">Message envoyé, merci.</p>}
        <button disabled={s.busy} className="btn btn-main disabled:opacity-60">{s.busy ? 'Envoi…' : 'Envoyer le message'}</button>
      </form>
    </section>
  );
}
