-- Tables pour le module Dépenses

-- Table des catégories de dépenses
CREATE TABLE IF NOT EXISTS categories_depenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  type ENUM('kilometrique', 'repas', 'autres') NOT NULL,
  actif BOOLEAN DEFAULT TRUE,
  societe_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (societe_id) REFERENCES societes(id) ON DELETE CASCADE,
  INDEX idx_societe_type (societe_id, type)
);

-- Table des barèmes kilométriques
CREATE TABLE IF NOT EXISTS baremes_kilometriques (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  puissance_fiscale_min INT NOT NULL,
  puissance_fiscale_max INT NOT NULL,
  tarif_par_km DECIMAL(10,4) NOT NULL,
  annee INT NOT NULL,
  actif BOOLEAN DEFAULT TRUE,
  societe_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (societe_id) REFERENCES societes(id) ON DELETE CASCADE,
  INDEX idx_societe_annee (societe_id, annee)
);

-- Table principale des dépenses
CREATE TABLE IF NOT EXISTS depenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  societe_id INT NOT NULL,
  type ENUM('kilometrique', 'repas', 'autres') NOT NULL,
  categorie_id INT,
  date_depense DATE NOT NULL,
  description TEXT,
  montant_ht DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  montant_ttc DECIMAL(10,2) NOT NULL,
  taux_tva DECIMAL(5,2) DEFAULT 0.00,
  montant_tva DECIMAL(10,2) DEFAULT 0.00,
  statut ENUM('en_attente', 'validee', 'refusee', 'remboursee') DEFAULT 'en_attente',
  motif_refus TEXT NULL,
  validee_par INT NULL,
  validee_le TIMESTAMP NULL,
  client_id INT NULL,
  projet_id INT NULL,
  justificatif_url VARCHAR(500),
  justificatif_filename VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (societe_id) REFERENCES societes(id) ON DELETE CASCADE,
  FOREIGN KEY (categorie_id) REFERENCES categories_depenses(id) ON DELETE SET NULL,
  FOREIGN KEY (validee_par) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_date (user_id, date_depense),
  INDEX idx_societe_statut (societe_id, statut),
  INDEX idx_type_date (type, date_depense)
);

-- Table pour les détails des dépenses kilométriques
CREATE TABLE IF NOT EXISTS depenses_kilometriques (
  id INT PRIMARY KEY AUTO_INCREMENT,
  depense_id INT NOT NULL,
  lieu_depart VARCHAR(255) NOT NULL,
  lieu_arrivee VARCHAR(255) NOT NULL,
  distance_km INT NOT NULL,
  bareme_id INT,
  tarif_par_km DECIMAL(10,4),
  type_vehicule VARCHAR(100),
  FOREIGN KEY (depense_id) REFERENCES depenses(id) ON DELETE CASCADE,
  FOREIGN KEY (bareme_id) REFERENCES baremes_kilometriques(id) ON DELETE SET NULL,
  INDEX idx_depense (depense_id)
);

-- Table pour les détails des dépenses de repas
CREATE TABLE IF NOT EXISTS depenses_repas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  depense_id INT NOT NULL,
  lieu VARCHAR(255),
  nombre_personnes INT DEFAULT 1,
  type_repas ENUM('dejeuner', 'diner', 'petit_dejeuner', 'autre') DEFAULT 'dejeuner',
  FOREIGN KEY (depense_id) REFERENCES depenses(id) ON DELETE CASCADE,
  INDEX idx_depense (depense_id)
);

-- Table pour l'historique des actions sur les dépenses
CREATE TABLE IF NOT EXISTS historique_depenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  depense_id INT NOT NULL,
  user_id INT NOT NULL,
  action ENUM('creation', 'modification', 'validation', 'refus', 'remboursement') NOT NULL,
  statut_ancien VARCHAR(50),
  statut_nouveau VARCHAR(50),
  commentaire TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (depense_id) REFERENCES depenses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_depense_date (depense_id, created_at)
);

-- Insertion des catégories par défaut pour chaque société
INSERT IGNORE INTO categories_depenses (nom, description, type, societe_id) 
SELECT 'Transport', 'Frais de transport et déplacements professionnels', 'kilometrique', id FROM societes;

INSERT IGNORE INTO categories_depenses (nom, description, type, societe_id) 
SELECT 'Repas d\'affaires', 'Repas professionnels et frais de restauration', 'repas', id FROM societes;

INSERT IGNORE INTO categories_depenses (nom, description, type, societe_id) 
SELECT 'Hébergement', 'Frais d\'hôtel et d\'hébergement', 'autres', id FROM societes;

INSERT IGNORE INTO categories_depenses (nom, description, type, societe_id) 
SELECT 'Fournitures de bureau', 'Achats de matériel et fournitures', 'autres', id FROM societes;

INSERT IGNORE INTO categories_depenses (nom, description, type, societe_id) 
SELECT 'Télécommunications', 'Frais de téléphone et internet professionnel', 'autres', id FROM societes;

-- Insertion des barèmes kilométriques par défaut (barème URSSAF 2024)
INSERT IGNORE INTO baremes_kilometriques (nom, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, annee, societe_id)
SELECT 'Véhicule jusqu\'à 3 CV', 1, 3, 0.502, 2024, id FROM societes;

INSERT IGNORE INTO baremes_kilometriques (nom, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, annee, societe_id)
SELECT 'Véhicule de 4 à 7 CV', 4, 7, 0.575, 2024, id FROM societes;

INSERT IGNORE INTO baremes_kilometriques (nom, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, annee, societe_id)
SELECT 'Véhicule 8 CV et plus', 8, 99, 0.693, 2024, id FROM societes;