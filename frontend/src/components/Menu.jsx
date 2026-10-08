import { useMemo, useState } from 'react';
import { fcfa } from '../api.js';

export default function Menu({ dishes, cart, setQty }) {
  const cats = useMemo(() => [...new Set(dishes.map((d) => d.category))], [dishes]);
  const [cat, setCat] = useState(null);
  const active = cat || cats[0];
  const list = dishes.filter((d) => d.category === active);

  return (
    <section id="menu" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12">
      <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Notre menu</h2>
      <div role="tablist" aria-label="Catégories" className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {cats.map((c) => (
          <button key={c} role="tab" aria-selected={c === active} onClick={() => setCat(c)}
            className={`btn shrink-0 !py-2 ${c === active ? 'bg-nuit text-white' : 'bg-white text-nuit ring-1 ring-nuit/20 hover:bg-nuit/5'}`}>{c}</button>
        ))}
      </div>
      {!dishes.length && <p className="mt-8 text-nuit/70">Le menu arrive dans un instant.</p>}
      <ul className="mt-4 divide-y divide-nuit/15">
        {list.map((d) => {
          const qty = cart[d._id] || 0;
          return (
            <li key={d._id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <h3 className="font-display text-lg font-semibold">{d.name}</h3>
                <p className="text-sm text-nuit/70">{d.description}</p>
                <p className="mt-1 font-bold text-lagon">{fcfa(d.price)}</p>
              </div>
              {qty === 0 ? (
                <button onClick={() => setQty(d._id, 1)} className="btn btn-lagon shrink-0 !py-2">Ajouter</button>
              ) : (
                <div className="flex shrink-0 items-center gap-3" role="group" aria-label={`Quantité de ${d.name}`}>
                  <button onClick={() => setQty(d._id, qty - 1)} className="h-10 w-10 rounded-full bg-nuit text-white" aria-label="Retirer un">−</button>
                  <span className="w-6 text-center font-bold">{qty}</span>
                  <button onClick={() => setQty(d._id, qty + 1)} className="h-10 w-10 rounded-full bg-nuit text-white" aria-label="Ajouter un">+</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
