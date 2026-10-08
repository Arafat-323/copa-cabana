# Copa Cabana — Plateforme web

Application full-stack pour Copa Cabana : menu, commandes, réservations, espace d'administration, paiement Kkiapay et contact WhatsApp.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Base de données:** MongoDB / Mongoose
- **Paiement:** Kkiapay
- **Déploiement recommandé:** Render + MongoDB Atlas

## Structure

```text
copa-cabana/
├── backend/
│   ├── .env.example
│   ├── createAdmin.js
│   ├── models.js
│   ├── seed.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── .env.example
│   ├── src/
│   └── package.json
├── render.yaml
├── .gitignore
└── README.md
```

## Sécurité avant GitHub

Les fichiers `.env` réels ne doivent **jamais** être commités. Cette version ne contient aucun `.env` réel ni `node_modules`.

Si des clés présentes dans une ancienne copie ont déjà été exposées, régénérez-les avant la mise en production, notamment les clés Kkiapay et les secrets JWT/admin.

## Développement local

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

API locale : `http://localhost:5000`

### Frontend

Dans un autre terminal :

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Site local : `http://localhost:5173`

## Variables d'environnement

### Backend — `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/copacabana
CLIENT_URL=http://localhost:5173
ADMIN_KEY=remplacer-cette-cle
JWT_SECRET=remplacer-par-une-longue-valeur-aleatoire
KKIAPAY_PUBLIC_KEY=
KKIAPAY_PRIVATE_KEY=
KKIAPAY_SECRET=
KKIAPAY_SANDBOX=true
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_KKIAPAY_PUBLIC_KEY=
VITE_KKIAPAY_SANDBOX=true
VITE_WHATSAPP=2290148245939
```

Les valeurs `VITE_*` sont intégrées dans le bundle frontend : n'y placez **jamais** une clé privée ou un secret.

## Compte administrateur

Après avoir configuré `MONGO_URI` :

```bash
cd backend
npm run create-admin -- "Nom" admin@example.com "MotDePasseFort"
```

Utilisez un vrai mot de passe fort et ne le commitez jamais.

## Déploiement — Render + MongoDB Atlas

Le fichier `render.yaml` configure deux services :

- `copa-cabana-api` : API Node/Express
- `copa-cabana-web` : frontend React/Vite statique

### 1. MongoDB Atlas

Créez un cluster, un utilisateur de base de données et récupérez l'URI MongoDB.

Exemple :

```text
mongodb+srv://USER:PASSWORD@cluster.mongodb.net/copacabana
```

N'ajoutez jamais cette URI à GitHub.

### 2. GitHub

Depuis la racine du projet :

```bash
git init
git add .
git status
```

Vérifiez que `backend/.env`, `frontend/.env` et `node_modules` ne sont pas dans la liste, puis :

```bash
git commit -m "Prepare project for production deployment"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/copa-cabana.git
git push -u origin main
```

### 3. Render

Dans Render : **New → Blueprint** puis sélectionnez le dépôt GitHub.

Le Blueprint demandera les variables marquées `sync: false`.

Pour l'API :

- `MONGO_URI` : URI MongoDB Atlas
- `CLIENT_URL` : URL publique du frontend
- `KKIAPAY_PUBLIC_KEY` : clé publique Kkiapay
- `KKIAPAY_PRIVATE_KEY` : clé privée Kkiapay
- `KKIAPAY_SECRET` : secret Kkiapay

`JWT_SECRET` et `ADMIN_KEY` sont générés automatiquement par Render.

Pour le frontend :

- `VITE_API_URL` : URL de l'API + `/api`
- `VITE_KKIAPAY_PUBLIC_KEY` : clé publique Kkiapay
- `VITE_KKIAPAY_SANDBOX=true` pendant les tests

### 4. Ordre conseillé après création des services

1. Vérifier l'URL publique de l'API.
2. Définir `VITE_API_URL` avec cette URL suivie de `/api`.
3. Définir `CLIENT_URL` avec l'URL publique du frontend.
4. Redéployer les services.
5. Créer le compte administrateur avec `MONGO_URI` de production.
6. Tester menu, commande, réservation, administration et paiement.

## Production Kkiapay

Pendant les tests :

```env
KKIAPAY_SANDBOX=true
VITE_KKIAPAY_SANDBOX=true
```

Après validation et avec les clés de production :

```env
KKIAPAY_SANDBOX=false
VITE_KKIAPAY_SANDBOX=false
```

## Données du menu

`backend/seed.js` contient des données d'exemple. Vérifiez et remplacez les plats, prix et informations avant la mise en production.

## Commandes utiles

```bash
# Backend
npm run dev
npm start
npm run seed
npm run create-admin -- "Nom" admin@example.com "MotDePasseFort"

# Frontend
npm run dev
npm run build
npm run preview
```
