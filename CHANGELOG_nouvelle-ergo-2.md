# Changelog - Export nouvelle-ergo-2.sql
## Date : 1er septembre 2025

### 🚀 NOUVELLES FONCTIONNALITÉS AJOUTÉES

#### 1. **Système OCR pour les dépenses**
- ✅ Modal de choix "Saisie manuelle" / "Prendre une photo"
- ✅ Intégration Tesseract.js pour l'analyse OCR
- ✅ Pré-remplissage automatique des formulaires avec données extraites
- ✅ Type de frais "Repas" par défaut pour les dépenses OCR
- ✅ **Persistance des justificatifs** - Les fichiers OCR restent visibles après rafraîchissement

#### 2. **Amélioration du dashboard des dépenses**
- ✅ **Sélection d'intervalles de périodes** - Ex: du 01/06/2025 au 30/09/2025
- ✅ **Filtrage des dépenses validées uniquement** dans les totaux
- ✅ **TVA des dépenses validées** seulement dans les calculs
- ✅ Interface intuitive avec sélecteurs de dates + bouton "Mois actuel"

#### 3. **Blocs totaux TVA dans le rapport financier**
- ✅ **🔴 TVA collectée** (Rouge) - Dette à l'État
- ✅ **🟢 TVA déductible** (Vert) - Récupérable  
- ✅ **⚪️ TVA non déductible** (Gris) - Neutralisée
- ✅ **🟠 TVA à décaisser** (Orange) - Paiement à prévoir
- ✅ **🔵 TVA à reporter** (Bleu) - Crédit positif
- ✅ Calculs automatiques et interface colorée intuitive

#### 4. **Système de gestion des catégories de stock**
- ✅ **Bloc "Catégories"** dans `/liste-produits`
- ✅ **Page liste catégories** avec CRUD complet
- ✅ **Page détail catégorie** avec gestion des sous-catégories
- ✅ **Statistiques** : Nombre de sous-catégories et produits
- ✅ **Navigation intuitive** avec breadcrumb et boutons

### 🔧 CORRECTIONS TECHNIQUES

#### **Base de données**
- ✅ MariaDB/MySQL stabilisé et fonctionnel
- ✅ Nouvelles tables créées :
  - `categories_stock` - Catégories principales
  - `sous_categories_stock` - Sous-catégories avec liaison parent
  - `justificatifs_frais` - Justificatifs OCR persistants
- ✅ Contraintes d'intégrité et clés étrangères

#### **Backend (Node.js/Express)**
- ✅ Endpoints dashboard avec support intervalles de périodes
- ✅ Endpoints catégories/sous-catégories stock complets
- ✅ Endpoint justificatifs OCR avec upload automatique
- ✅ Calculs TVA avancés dans le rapport financier
- ✅ Filtrage strict des dépenses validées

#### **Frontend (React/Vite)**
- ✅ Composants OCRCapture avec Tesseract.js
- ✅ Interfaces de sélection de périodes dans tous les dashboards
- ✅ Pages de gestion des catégories avec Ant Design
- ✅ Affichage des justificatifs dans les tableaux de frais
- ✅ Blocs TVA visuels dans le rapport financier

### 📊 DONNÉES INCLUSES

#### **Catégories de stock de test**
```
Électronique
├── Ordinateurs (Ordinateurs portables et de bureau)
└── Smartphones (Téléphones et accessoires)

Mobilier  
├── Tables (Tables de bureau et de réunion)
└── Chaises (Chaises de bureau et sièges)

Fournitures
├── Papier (Papier et supports d'impression) 
└── Stylos (Stylos et instruments d'écriture)
```

#### **Justificatifs OCR**
- ✅ Justificatifs existants conservés avec liens fonctionnels
- ✅ Structure prête pour nouveaux uploads OCR

### 🛠️ ENDPOINTS API DISPONIBLES

#### **Catégories Stock**
```
GET    /api/categories-stock/:societeId       → Liste des catégories
GET    /api/categories-stock/:id/details      → Détail + sous-catégories  
POST   /api/categories-stock                  → Créer catégorie
PUT    /api/categories-stock/:id             → Modifier catégorie
DELETE /api/categories-stock/:id             → Supprimer catégorie

POST   /api/sous-categories-stock            → Créer sous-catégorie
PUT    /api/sous-categories-stock/:id        → Modifier sous-catégorie  
DELETE /api/sous-categories-stock/:id        → Supprimer sous-catégorie
```

#### **Justificatifs OCR**
```
POST   /api/frais/upload-justificatif        → Upload + association justificatifs
```

#### **Dashboards avec intervalles**
```
GET    /api/notes-frais/dashboard/:societeId?periode_debut=X&periode_fin=Y
GET    /api/achats/dashboard/:societeId?periode_debut=X&periode_fin=Y  
GET    /api/rapport/financier/:societeId?date_debut=X&date_fin=Y
```

### 🎯 FONCTIONNALITÉS PRÊTES À L'UTILISATION

1. **OCR dépenses** → Créer frais en photographiant reçus
2. **Dashboards flexibles** → Analyser n'importe quelle période 
3. **Rapport TVA visuel** → Comprendre obligations fiscales en un coup d'œil
4. **Gestion catégories** → Organiser le stock par catégories/sous-catégories
5. **Justificatifs persistants** → Tous les documents restent accessibles

### 📝 NOTES TECHNIQUES

- **Compatibilité** : MySQL/MariaDB 10.11+
- **Framework** : React 18 + Node.js + Express
- **Sécurité** : Validation frontend/backend + permissions utilisateurs
- **Performance** : Requêtes optimisées + pagination + cache
- **Responsive** : Interface adaptée mobile/desktop

---
**Export créé le 1er septembre 2025 - Base de données complète avec toutes les fonctionnalités opérationnelles**