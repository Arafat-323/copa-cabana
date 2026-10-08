// Plats d'exemple — À REMPLACER par le vrai menu du restaurant.
require('dotenv').config();
const mongoose = require('mongoose');
const { Dish } = require('./models');
const data = [
  ['Poisson braisé', 'Capitaine ou carpe, sauce pimentée, oignons', 'Poissons', 5000],
  ['Poulet bicyclette grillé', 'Mariné aux épices, braisé au feu de bois', 'Grillades', 4500],
  ['Brochettes de bœuf', 'Six brochettes, piment et oignons', 'Grillades', 3000],
  ['Crevettes sautées', 'Ail, persil, huile légère', 'Poissons', 6000],
  ['Alloco', 'Banane plantain frite', 'Accompagnements', 5],
  ['Frites', 'Pommes de terre fraîches', 'Accompagnements', 1500],
  ['Attiéké', 'Semoule de manioc', 'Accompagnements', 1000],
  ['Jus de bissap', "Fleurs d'hibiscus, glacé", 'Boissons', 800],
  ['Bière locale 65cl', 'Servie bien fraîche', 'Boissons', 1000],
  ['Salade de fruits', 'Ananas, mangue, papaye', 'Desserts', 1500],
];
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Dish.deleteMany({});
  await Dish.insertMany(data.map(([name, description, category, price]) => ({ name, description, category, price })));
  console.log("Menu d'exemple créé."); process.exit(0);
})();
