// Crée (ou met à jour) le compte gérant : npm run create-admin -- "Nom" email@exemple.com motdepasse
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./models');

const [, , name, email, password] = process.argv;
if (!name || !email || !password || password.length < 8) {
  console.log('Usage : npm run create-admin -- "Nom" email@exemple.com motdepasse (8 caractères minimum)');
  process.exit(1);
}
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: 'gerant' },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  console.log('Compte gérant prêt.');
  process.exit(0);
})();
