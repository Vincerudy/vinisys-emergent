#!/bin/bash

echo "🚀 Configuration de Vinisys - Logiciel de Facturation"
echo "=================================================="

# Vérifier si nous sommes dans le bon répertoire
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Erreur: Veuillez exécuter ce script depuis la racine du projet Vinisys"
    exit 1
fi

# Configuration du backend
echo "📦 Configuration du backend..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Fichier backend/.env créé depuis .env.example"
    echo "⚠️  IMPORTANT: Éditez backend/.env pour configurer vos clés API"
else
    echo "ℹ️  Le fichier backend/.env existe déjà"
fi

# Installation des dépendances backend
echo "📦 Installation des dépendances backend..."
cd backend
if command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi
cd ..

# Configuration du frontend
echo "📦 Configuration du frontend..."
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Fichier frontend/.env créé depuis .env.example"
    echo "⚠️  IMPORTANT: Éditez frontend/.env pour configurer vos clés API"
else
    echo "ℹ️  Le fichier frontend/.env existe déjà"
fi

# Installation des dépendances frontend
echo "📦 Installation des dépendances frontend..."
cd frontend
if command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi
cd ..

echo ""
echo "✅ Installation terminée !"
echo ""
echo "📝 Étapes suivantes :"
echo "1. Configurer la base de données MySQL :"
echo "   mysql -u root -p -e \"CREATE DATABASE vinisys;\""
echo "   mysql -u root -p vinisys < vinisys_latest.sql"
echo ""
echo "2. Éditer les fichiers de configuration :"
echo "   - backend/.env (clés Stripe, configuration email, etc.)"
echo "   - frontend/.env (clé publique Stripe, URL API)"
echo ""
echo "3. Démarrer les services :"
echo "   Backend: cd backend && npm start"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "🔗 Plus d'informations dans README.md"