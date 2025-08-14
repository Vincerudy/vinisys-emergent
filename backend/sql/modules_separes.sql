-- =====================================
-- REFONTE MODULES SÉPARES
-- Module 1: Dépenses/Achats (Entreprise)
-- Module 2: Notes de frais (Employés)
-- =====================================

-- =====================================
-- MODULE 1: DÉPENSES/ACHATS (ENTREPRISE)
-- =====================================

-- Table des fournisseurs
CREATE TABLE IF NOT EXISTS fournisseurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    pays VARCHAR(100) DEFAULT 'France',
    telephone VARCHAR(50),
    email VARCHAR(255),
    siret VARCHAR(50),
    numero_tva VARCHAR(50),
    conditions_paiement VARCHAR(100),
    compte_comptable VARCHAR(20),
    societe_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_societe_fournisseur (societe_id)
);

-- Table des projets/centres de coût
CREATE TABLE IF NOT EXISTS projets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    budget_prevu DECIMAL(10,2),
    date_debut DATE,
    date_fin DATE,
    responsable_id INT,
    societe_id INT,
    statut ENUM('actif', 'inactif', 'termine') DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_societe_projet (societe_id),
    INDEX idx_responsable (responsable_id)
);

-- Table des catégories d'achats
CREATE TABLE IF NOT EXISTS categories_achats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    compte_comptable VARCHAR(20),
    tva_deductible BOOLEAN DEFAULT TRUE,
    description TEXT,
    societe_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_societe_categorie (societe_id)
);

-- Table principale des achats/dépenses
CREATE TABLE IF NOT EXISTS achats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_facture VARCHAR(100),
    fournisseur_id INT,
    date_achat DATE NOT NULL,
    date_facture DATE,
    date_echeance DATE,
    montant_ht DECIMAL(10,2) NOT NULL,
    montant_tva DECIMAL(10,2) DEFAULT 0,
    montant_ttc DECIMAL(10,2) NOT NULL,
    taux_tva DECIMAL(5,2) DEFAULT 20,
    tva_deductible BOOLEAN DEFAULT TRUE,
    categorie_achat_id INT,
    projet_id INT,
    description TEXT,
    mode_paiement ENUM('virement', 'cheque', 'carte', 'especes', 'prelevement') DEFAULT 'virement',
    statut ENUM('brouillon', 'valide', 'paye', 'annule') DEFAULT 'brouillon',
    saisie_ocr BOOLEAN DEFAULT FALSE,
    utilisateur_id INT,
    societe_id INT,
    compte_comptable_achat VARCHAR(20),
    compte_comptable_tva VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fournisseur (fournisseur_id),
    INDEX idx_societe_achat (societe_id),
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_projet (projet_id),
    INDEX idx_date_achat (date_achat)
);

-- Table des justificatifs d'achats
CREATE TABLE IF NOT EXISTS justificatifs_achats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    achat_id INT,
    nom_fichier VARCHAR(255),
    chemin_fichier VARCHAR(500),
    type_mime VARCHAR(100),
    taille_fichier INT,
    donnees_ocr JSON,
    confiance_ocr DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (achat_id) REFERENCES achats(id) ON DELETE CASCADE,
    INDEX idx_achat_justificatif (achat_id)
);

-- =====================================
-- MODULE 2: NOTES DE FRAIS (EMPLOYÉS)
-- =====================================

-- Table des types de frais
CREATE TABLE IF NOT EXISTS types_frais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    justificatif_obligatoire BOOLEAN DEFAULT TRUE,
    montant_max DECIMAL(10,2),
    plafond_journalier DECIMAL(10,2),
    tva_applicable BOOLEAN DEFAULT FALSE,
    compte_comptable VARCHAR(20),
    societe_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_societe_type_frais (societe_id)
);

-- Table des barèmes kilométriques
CREATE TABLE IF NOT EXISTS baremes_kilometriques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    annee INT NOT NULL,
    type_vehicule ENUM('moins_3cv', '4_5cv', '6_7cv', '8cv_plus', 'motocyclette', 'cyclomoteur') NOT NULL,
    tranche_1_limite INT DEFAULT 5000,
    tranche_1_taux DECIMAL(4,3),
    tranche_2_limite INT DEFAULT 20000,
    tranche_2_taux DECIMAL(4,3),
    tranche_3_taux DECIMAL(4,3),
    societe_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_bareme (annee, type_vehicule, societe_id),
    INDEX idx_societe_bareme (societe_id)
);

-- Table principale des notes de frais
CREATE TABLE IF NOT EXISTS notes_frais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(50) UNIQUE,
    utilisateur_id INT NOT NULL,
    periode_debut DATE NOT NULL,
    periode_fin DATE NOT NULL,
    titre VARCHAR(255),
    description TEXT,
    montant_total DECIMAL(10,2) DEFAULT 0,
    statut ENUM('brouillon', 'soumise', 'validee', 'refusee', 'remboursee') DEFAULT 'brouillon',
    date_soumission TIMESTAMP NULL,
    validateur_id INT,
    date_validation TIMESTAMP NULL,
    motif_refus TEXT,
    societe_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_utilisateur_note (utilisateur_id),
    INDEX idx_societe_note (societe_id),
    INDEX idx_validateur (validateur_id),
    INDEX idx_statut (statut),
    INDEX idx_periode (periode_debut, periode_fin)
);

-- Table des lignes de frais détaillées
CREATE TABLE IF NOT EXISTS lignes_frais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note_frais_id INT NOT NULL,
    type_frais_id INT NOT NULL,
    date_frais DATE NOT NULL,
    description TEXT,
    montant DECIMAL(10,2) NOT NULL,
    montant_tva DECIMAL(10,2) DEFAULT 0,
    taux_tva DECIMAL(5,2) DEFAULT 0,
    
    -- Spécifique frais kilométriques
    distance_km DECIMAL(8,2),
    lieu_depart VARCHAR(255),
    lieu_arrivee VARCHAR(255),
    type_vehicule ENUM('moins_3cv', '4_5cv', '6_7cv', '8cv_plus', 'motocyclette', 'cyclomoteur'),
    bareme_id INT,
    
    -- Spécifique repas
    lieu_repas VARCHAR(255),
    nombre_personnes INT DEFAULT 1,
    type_repas ENUM('petit_dejeuner', 'dejeuner', 'diner', 'collation'),
    
    -- Spécifique hébergement  
    lieu_hebergement VARCHAR(255),
    nombre_nuits INT DEFAULT 1,
    
    -- Général
    projet_id INT,
    saisie_ocr BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (note_frais_id) REFERENCES notes_frais(id) ON DELETE CASCADE,
    FOREIGN KEY (type_frais_id) REFERENCES types_frais(id),
    FOREIGN KEY (bareme_id) REFERENCES baremes_kilometriques(id),
    FOREIGN KEY (projet_id) REFERENCES projets(id),
    INDEX idx_note_frais (note_frais_id),
    INDEX idx_type_frais (type_frais_id),
    INDEX idx_date_frais (date_frais)
);

-- Table des justificatifs de frais
CREATE TABLE IF NOT EXISTS justificatifs_frais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ligne_frais_id INT,
    nom_fichier VARCHAR(255),
    chemin_fichier VARCHAR(500),
    type_mime VARCHAR(100),
    taille_fichier INT,
    donnees_ocr JSON,
    confiance_ocr DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ligne_frais_id) REFERENCES lignes_frais(id) ON DELETE CASCADE,
    INDEX idx_ligne_frais_justificatif (ligne_frais_id)
);

-- Table historique des validations
CREATE TABLE IF NOT EXISTS historique_validations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note_frais_id INT NOT NULL,
    ancien_statut ENUM('brouillon', 'soumise', 'validee', 'refusee', 'remboursee'),
    nouveau_statut ENUM('brouillon', 'soumise', 'validee', 'refusee', 'remboursee'),
    utilisateur_id INT NOT NULL,
    commentaire TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_frais_id) REFERENCES notes_frais(id) ON DELETE CASCADE,
    INDEX idx_note_historique (note_frais_id),
    INDEX idx_utilisateur_historique (utilisateur_id)
);

-- =====================================
-- DONNÉES INITIALES
-- =====================================

-- Types de frais par défaut
INSERT INTO types_frais (nom, code, description, justificatif_obligatoire, compte_comptable, societe_id) VALUES
('Frais kilométriques', 'KM', 'Frais de déplacement en véhicule personnel', FALSE, '6251', 2),
('Repas d\'affaires', 'REPAS', 'Frais de restauration professionnelle', TRUE, '6256', 2),
('Hébergement', 'HOTEL', 'Frais d\'hébergement en déplacement', TRUE, '6255', 2),
('Péage/Parking', 'PEAGE', 'Frais de péage et stationnement', TRUE, '6251', 2),
('Transport public', 'TRANSPORT', 'Train, avion, taxi, etc.', TRUE, '6251', 2),
('Fournitures bureau', 'FOURNITURE', 'Achats ponctuels de fournitures', TRUE, '6064', 2),
('Formation', 'FORMATION', 'Frais de formation professionnelle', TRUE, '6313', 2),
('Télécommunication', 'TELECOM', 'Frais téléphone, internet mobile', TRUE, '6263', 2);

-- Barèmes kilométriques 2024 (URSSAF)
INSERT INTO baremes_kilometriques (annee, type_vehicule, tranche_1_limite, tranche_1_taux, tranche_2_limite, tranche_2_taux, tranche_3_taux, societe_id) VALUES
(2024, 'moins_3cv', 5000, 0.529, 20000, 0.316, 0.370, 2),
(2024, '4_5cv', 5000, 0.606, 20000, 0.340, 0.407, 2),
(2024, '6_7cv', 5000, 0.636, 20000, 0.357, 0.427, 2),
(2024, '8cv_plus', 5000, 0.665, 20000, 0.382, 0.447, 2),
(2024, 'motocyclette', 5000, 0.395, 20000, 0.099, 0.234, 2),
(2024, 'cyclomoteur', 5000, 0.315, 20000, 0.079, 0.198, 2);

-- Catégories d'achats par défaut
INSERT INTO categories_achats (nom, code, compte_comptable, tva_deductible, societe_id) VALUES
('Fournitures de bureau', 'FOURB', '6064', TRUE, 2),
('Logiciels et licences', 'SOFT', '6132', TRUE, 2),
('Matériel informatique', 'INFO', '2183', TRUE, 2),
('Prestations externes', 'PREST', '611', TRUE, 2),
('Publicité/Marketing', 'PUB', '623', TRUE, 2),
('Frais postaux', 'POST', '6261', TRUE, 2),
('Assurances', 'ASSUR', '616', FALSE, 2),
('Honoraires', 'HONOR', '6226', TRUE, 2);

-- Projets exemple
INSERT INTO projets (nom, code, description, budget_prevu, responsable_id, societe_id) VALUES
('Développement site web', 'WEB2024', 'Refonte du site internet de l\'entreprise', 15000.00, 67, 2),
('Campagne publicitaire', 'PUB2024', 'Campagne marketing digital Q1', 8000.00, 67, 2),
('Formation équipe', 'FORM2024', 'Programme de formation continue', 5000.00, 67, 2);

-- Mise à jour test_result.md
-- Fin du script SQL