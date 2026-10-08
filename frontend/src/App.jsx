import { useEffect, useMemo, useState } from 'react';
import { getMenu, fcfa, waLink } from './api.js';
import Menu from './components/Menu.jsx';
import Cart from './components/Cart.jsx';
import Reservation from './components/Reservation.jsx';
import Contact from './components/Contact.jsx';

const NAV = [['menu', 'Menu'], ['reserver', 'Réserver'], ['contact', 'Contact']];

export default function App() {
  const [dishes, setDishes] = useState([]);
  const [error, setError] = useState('');
  const [cart, setCart] = useState({}); // { dishId: qty }
  const [open, setOpen] = useState(false);

  useEffect(() => { getMenu().then(setDishes).catch((e) => setError(e.message)); }, []);

  const lines = useMemo(
    () => Object.entries(cart).map(([id, qty]) => ({ dish: dishes.find((d) => d._id === id), qty })).filter((l) => l.dish),
    [cart, dishes],
  );
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.dish.price, 0);
  const setQty = (id, qty) => setCart((c) => { const n = { ...c }; qty > 0 ? (n[id] = qty) : delete n[id]; return n; });

  return (
    <>
      <header className="sticky top-0 z-30 bg-nuit text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#top" className="font-display text-2xl font-extrabold tracking-tight">Copa<span className="text-mangue">Cabana</span></a>
          <nav aria-label="Navigation principale" className="hidden gap-6 sm:flex">
            {NAV.map(([id, label]) => <a key={id} href={`#${id}`} className="hover:text-mangue">{label}</a>)}
          </nav>
          <button onClick={() => setOpen(true)} className="btn btn-main !py-2" aria-label={`Ouvrir le panier, ${count} article(s)`}>
            Panier{count > 0 && <span className="ml-2 rounded-full bg-nuit px-2 text-sm text-mangue">{count}</span>}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden bg-nuit text-white">
          <div aria-hidden="true" className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-mangue sm:h-96 sm:w-96" />
          <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-16 sm:pt-24">
            <h1 className="max-w-xl font-display text-5xl font-extrabold leading-[1.05] sm:text-7xl">La soirée commence à Agla.</h1>
            <p className="mt-5 max-w-md text-lg text-white/80">Grillades, poissons braisés et boissons fraîches dans un cadre au bord de l'été. Commandez en ligne ou réservez votre table.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#menu" className="btn btn-main">Voir le menu</a>
              <a href="#reserver" className="btn border-2 border-white/60 hover:bg-white/10">Réserver une table</a>
            </div>
          </div>
          <svg aria-hidden="true" viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute bottom-0 h-16 w-full">
            <path fill="#F1F8F6" d="M0 40c120 40 240 40 360 0s240-40 360 0 240 40 360 0 240-40 360 0v40H0z" />
          </svg>
        </section>

        <section aria-label="Informations pratiques" className="mx-auto -mt-2 grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-3">
          <p><strong className="block font-display text-lg">Ouvert de 16h à 05h</strong>Tous les jours, repas sur place</p>
          <p><strong className="block font-display text-lg">Agla, Cotonou</strong>Plus Code 99M7+FX</p>
          <p><strong className="block font-display text-lg"><a href="tel:+2290148245939" className="hover:text-lagon">01 48 24 59 39</a></strong>Appel ou WhatsApp</p>
        </section>

        {error && <p role="alert" className="mx-auto max-w-6xl px-4 text-hibiscus">{error}</p>}
        <Menu dishes={dishes} cart={cart} setQty={setQty} />
        <Reservation />
        <Contact />
      </main>

      <footer className="bg-nuit px-4 py-8 text-center text-sm text-white/70">
        © {new Date().getFullYear()} Copa Cabana · Agla, Cotonou · Prix en FCFA
      </footer>

      <a href={waLink('Bonjour Copa Cabana, ')} target="_blank" rel="noopener noreferrer"
         className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-bold text-nuit shadow-lg">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-1.9 1.3-.5.1-1.1.1-1.8-.1a14 14 0 0 1-5.6-4.9c-.7-.9-1.2-2-1.2-3 0-1 .5-1.5.7-1.7.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .5.4l.8 1.9c.1.2 0 .4-.1.5l-.4.5c-.1.1-.2.3-.1.5.5.8 1.2 1.500 2.100 2 .8.5 1.300.600 1.500.5.2-.1.600-.7.800-.9.200-.2.400-.2.600-.1l1.900.9c.2.100.3.200.4.300.1.200.1.700-.100 1.200Z"/></svg>
        <span className="hidden sm:inline">WhatsApp</span><span className="sr-only sm:hidden">Écrire sur WhatsApp</span>
      </a>

      {open && <Cart lines={lines} total={total} setQty={setQty} onClose={() => setOpen(false)} onDone={() => setCart({})} />}
    </>
  );
}
