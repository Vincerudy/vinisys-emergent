# Vinisys - Logiciel de Facturation

## 🚀 Installation et Configuration

### 1. Cloner le projet
```bash
git clone <repo-url>
cd vinisys
```

### 2. Configuration des variables d'environnement

#### Backend
Copier le fichier d'exemple et le configurer :
```bash
cp backend/.env.example backend/.env
```

Éditer `backend/.env` et remplacer les valeurs suivantes :
- `SECRET_KEY` : Clé secrète pour l'application
- `JWT_SECRET` : Clé secrète pour JWT
- `SESSION_SECRET` : Clé secrète pour les sessions
- `STRIPE_SECRET_KEY` : Clé secrète Stripe (commence par `sk_`)
- `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` : Configuration email pour les relances automatiques

#### Frontend
Copier le fichier d'exemple et le configurer :
```bash
cp frontend/.env.example frontend/.env
```

Éditer `frontend/.env` et remplacer :
- `VITE_API_URL` : URL de votre API backend
- `REACT_APP_STRIPE_PUBLISHABLE_KEY` : Clé publique Stripe (commence par `pk_`)

### 3. Installation des dépendances

#### Backend
```bash
cd backend
yarn install
```

#### Frontend
```bash
cd frontend
yarn install
```

### 4. Configuration de la base de données

1. Créer la base de données MySQL :
```sql
CREATE DATABASE vinisys;
```

2. Importer le schéma :
```bash
mysql -u root -p vinisys < vinisys_latest.sql
```

### 5. Démarrage

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run dev
```

## 📋 Configuration Stripe

Pour utiliser les fonctionnalités de paiement :

1. Créer un compte sur [Stripe](https://stripe.com)
2. Récupérer vos clés API depuis le dashboard Stripe
3. Ajouter les clés dans les fichiers `.env` :
   - `STRIPE_SECRET_KEY` dans `backend/.env`
   - `REACT_APP_STRIPE_PUBLISHABLE_KEY` dans `frontend/.env`

## 🔐 Sécurité

- Les fichiers `.env` ne sont pas versionnés (ajoutés au `.gitignore`)
- Utilisez des clés de test Stripe pour le développement
- Changez toutes les clés par défaut en production

## 📝 Fonctionnalités

- Gestion des factures
- Système d'abonnements avec Stripe
- Relances automatiques par email
- Cahier de recettes en temps réel
- Gestion des notes de frais
- Multi-utilisateurs avec restrictions par plan

## 🛠 Support

Pour toute question ou support technique, consultez la documentation ou contactez l'équipe de développement.
