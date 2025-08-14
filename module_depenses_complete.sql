-- =====================================================
-- SCRIPT SQL COMPLET - MODULE DÉPENSES VINISYS
-- =====================================================
-- Ce script crée toutes les tables nécessaires pour le module de gestion des dépenses
-- Compatible avec MySQL/MariaDB
-- Version: 1.0
-- Date: $(date)

-- =====================================================
-- 1. TABLE DES CATÉGORIES DE DÉPENSES
-- =====================================================
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
  INDEX idx_societe_type (societe_id, type),
  INDEX idx_nom (nom),
  UNIQUE KEY unique_nom_societe (nom, societe_id, type)
) COMMENT='Catégories personnalisables de dépenses par société';

-- =====================================================
-- 2. TABLE DES BARÈMES KILOMÉTRIQUES
-- =====================================================
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
  INDEX idx_societe_annee (societe_id, annee),
  INDEX idx_puissance (puissance_fiscale_min, puissance_fiscale_max),
  CONSTRAINT chk_puissance_fiscale CHECK (puissance_fiscale_min <= puissance_fiscale_max),
  CONSTRAINT chk_tarif_positif CHECK (tarif_par_km > 0)
) COMMENT='Barèmes kilométriques URSSAF par puissance fiscale et année';

-- =====================================================
-- 3. TABLE PRINCIPALE DES DÉPENSES
-- =====================================================
CREATE TABLE IF NOT EXISTS depenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  societe_id INT NOT NULL,
  type ENUM('kilometrique', 'repas', 'autres') NOT NULL,
  categorie_id INT NULL,
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
  INDEX idx_type_date (type, date_depense),
  INDEX idx_valideur (validee_par),
  INDEX idx_client (client_id),
  INDEX idx_created_at (created_at),
  CONSTRAINT chk_montants CHECK (montant_ttc >= montant_ht AND montant_ht >= 0),
  CONSTRAINT chk_tva CHECK (taux_tva >= 0 AND taux_tva <= 100)
) COMMENT='Table principale des dépenses professionnelles';

-- =====================================================
-- 4. TABLE DES DÉTAILS KILOMÉTRIQUES
-- =====================================================
CREATE TABLE IF NOT EXISTS depenses_kilometriques (
  id INT PRIMARY KEY AUTO_INCREMENT,
  depense_id INT NOT NULL,
  lieu_depart VARCHAR(255) NOT NULL,
  lieu_arrivee VARCHAR(255) NOT NULL,
  distance_km INT NOT NULL,
  bareme_id INT NULL,
  tarif_par_km DECIMAL(10,4) NULL,
  type_vehicule VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (depense_id) REFERENCES depenses(id) ON DELETE CASCADE,
  FOREIGN KEY (bareme_id) REFERENCES baremes_kilometriques(id) ON DELETE SET NULL,
  INDEX idx_depense (depense_id),
  INDEX idx_bareme (bareme_id),
  CONSTRAINT chk_distance_positive CHECK (distance_km > 0)
) COMMENT='Détails spécifiques aux dépenses kilométriques';

-- =====================================================
-- 5. TABLE DES DÉTAILS REPAS
-- =====================================================
CREATE TABLE IF NOT EXISTS depenses_repas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  depense_id INT NOT NULL,
  lieu VARCHAR(255),
  nombre_personnes INT DEFAULT 1,
  type_repas ENUM('petit_dejeuner', 'dejeuner', 'diner', 'autre') DEFAULT 'dejeuner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (depense_id) REFERENCES depenses(id) ON DELETE CASCADE,
  INDEX idx_depense (depense_id),
  CONSTRAINT chk_nb_personnes CHECK (nombre_personnes > 0)
) COMMENT='Détails spécifiques aux dépenses de repas';

-- =====================================================
-- 6. TABLE HISTORIQUE DES ACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS historique_depenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  depense_id INT NOT NULL,
  user_id INT NOT NULL,
  action ENUM('creation', 'modification', 'validation', 'refus', 'remboursement') NOT NULL,
  statut_ancien VARCHAR(50),
  statut_nouveau VARCHAR(50),
  commentaire TEXT,
  donnees_modifiees JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (depense_id) REFERENCES depenses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_depense_date (depense_id, created_at),
  INDEX idx_user_action (user_id, action),
  INDEX idx_action_date (action, created_at)
) COMMENT='Historique complet des actions sur les dépenses';

-- =====================================================
-- 7. TABLE DES PARAMÈTRES DU MODULE
-- =====================================================
CREATE TABLE IF NOT EXISTS parametres_depenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  societe_id INT NOT NULL,
  cle_parametre VARCHAR(100) NOT NULL,
  valeur_parametre TEXT,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (societe_id) REFERENCES societes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cle_societe (societe_id, cle_parametre),
  INDEX idx_societe_cle (societe_id, cle_parametre)
) COMMENT='Paramètres de configuration du module dépenses par société';

-- =====================================================
-- 8. TABLE DES NOTES DE FRAIS
-- =====================================================
CREATE TABLE IF NOT EXISTS notes_frais (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  societe_id INT NOT NULL,
  numero VARCHAR(50) NOT NULL,
  periode_debut DATE NOT NULL,
  periode_fin DATE NOT NULL,
  total_ht DECIMAL(10,2) DEFAULT 0.00,
  total_ttc DECIMAL(10,2) DEFAULT 0.00,
  total_tva DECIMAL(10,2) DEFAULT 0.00,
  statut ENUM('brouillon', 'soumise', 'validee', 'refusee', 'payee') DEFAULT 'brouillon',
  commentaire TEXT,
  validee_par INT NULL,
  validee_le TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (societe_id) REFERENCES societes(id) ON DELETE CASCADE,
  FOREIGN KEY (validee_par) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_periode (user_id, periode_debut, periode_fin),
  INDEX idx_societe_statut (societe_id, statut),
  INDEX idx_numero (numero),
  UNIQUE KEY unique_numero_societe (numero, societe_id)
) COMMENT='Notes de frais regroupant plusieurs dépenses';

-- =====================================================
-- 9. TABLE DE LIAISON NOTES DE FRAIS - DÉPENSES
-- =====================================================
CREATE TABLE IF NOT EXISTS note_frais_depenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  note_frais_id INT NOT NULL,
  depense_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_frais_id) REFERENCES notes_frais(id) ON DELETE CASCADE,
  FOREIGN KEY (depense_id) REFERENCES depenses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_note_depense (note_frais_id, depense_id),
  INDEX idx_note_frais (note_frais_id),
  INDEX idx_depense (depense_id)
) COMMENT='Liaison entre notes de frais et dépenses';

-- =====================================================
-- INSERTION DES DONNÉES PAR DÉFAUT
-- =====================================================

-- Catégories par défaut pour chaque société
INSERT IGNORE INTO categories_depenses (nom, description, type, societe_id) 
SELECT 'Transport professionnel', 'Déplacements et transport dans le cadre professionnel', 'kilometrique', id FROM societes WHERE id IS NOT NULL;

INSERT IGNORE INTO categories_depenses (nom, description, type, societe_id) 
SELECT 'Repas d\'affaires', 'Repas professionnels avec clients ou collègues', 'repas', id FROM societes WHERE id IS NOT NULL;

INSERT IGNORE INTO categories_depenses (nom, description, type, societe_id) 
SELECT 'Formation', 'Frais liés aux formations professionnelles', 'autres', id FROM societes WHERE id IS NOT NULL;

INSERT IGNORE INTO categories_depenses (nom, description, type, societe_id) 
SELECT 'Hébergement', 'Frais d\'hôtel et d\'hébergement professionnel', 'autres', id FROM societes WHERE id IS NOT NULL;

INSERT IGNORE INTO categories_depenses (nom, description, type, societe_id) 
SELECT 'Fournitures de bureau', 'Achats de matériel et fournitures de bureau', 'autres', id FROM societes WHERE id IS NOT NULL;

INSERT IGNORE INTO categories_depenses (nom, description, type, societe_id) 
SELECT 'Télécommunications', 'Frais de téléphone et internet professionnel', 'autres', id FROM societes WHERE id IS NOT NULL;

INSERT IGNORE INTO categories_depenses (nom, description, type, societe_id) 
SELECT 'Parking et péages', 'Frais de stationnement et péages autoroutiers', 'autres', id FROM societes WHERE id IS NOT NULL;

-- Barèmes kilométriques URSSAF 2024 pour chaque société
INSERT IGNORE INTO baremes_kilometriques (nom, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, annee, societe_id)
SELECT 'Véhicule jusqu\'à 3 CV (2024)', 1, 3, 0.502, 2024, id FROM societes WHERE id IS NOT NULL;

INSERT IGNORE INTO baremes_kilometriques (nom, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, annee, societe_id)
SELECT 'Véhicule de 4 à 7 CV (2024)', 4, 7, 0.575, 2024, id FROM societes WHERE id IS NOT NULL;

INSERT IGNORE INTO baremes_kilometriques (nom, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, annee, societe_id)
SELECT 'Véhicule de 8 CV et plus (2024)', 8, 99, 0.693, 2024, id FROM societes WHERE id IS NOT NULL;

-- Barèmes kilométriques URSSAF 2025 (prévisionnel)
INSERT IGNORE INTO baremes_kilometriques (nom, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, annee, societe_id)
SELECT 'Véhicule jusqu\'à 3 CV (2025)', 1, 3, 0.518, 2025, id FROM societes WHERE id IS NOT NULL;

INSERT IGNORE INTO baremes_kilometriques (nom, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, annee, societe_id)
SELECT 'Véhicule de 4 à 7 CV (2025)', 4, 7, 0.592, 2025, id FROM societes WHERE id IS NOT NULL;

INSERT IGNORE INTO baremes_kilometriques (nom, puissance_fiscale_min, puissance_fiscale_max, tarif_par_km, annee, societe_id)
SELECT 'Véhicule de 8 CV et plus (2025)', 8, 99, 0.714, 2025, id FROM societes WHERE id IS NOT NULL;

-- Paramètres par défaut du module
INSERT IGNORE INTO parametres_depenses (societe_id, cle_parametre, valeur_parametre, description)
SELECT id, 'ocr_active', 'true', 'Activation de la reconnaissance optique automatique' FROM societes WHERE id IS NOT NULL;

INSERT IGNORE INTO parametres_depenses (societe_id, cle_parametre, valeur_parametre, description)
SELECT id, 'montant_max_sans_validation', '50.00', 'Montant maximum sans validation managériale' FROM societes WHERE id IS NOT NULL;

INSERT IGNORE INTO parametres_depenses (societe_id, cle_parametre, valeur_parametre, description)
SELECT id, 'justificatif_obligatoire_montant', '25.00', 'Montant minimum nécessitant un justificatif' FROM societes WHERE id IS NOT NULL;

INSERT IGNORE INTO parametres_depenses (societe_id, cle_parametre, valeur_parametre, description)
SELECT id, 'auto_calcul_kilometrique', 'true', 'Calcul automatique des montants kilométriques' FROM societes WHERE id IS NOT NULL;

-- =====================================================
-- VUES UTILES POUR LES RAPPORTS
-- =====================================================

-- Vue des dépenses avec détails complets
CREATE OR REPLACE VIEW v_depenses_completes AS
SELECT 
    d.id,
    d.user_id,
    CONCAT(u.firstName, ' ', u.lastName) as nom_employe,
    u.email as email_employe,
    d.societe_id,
    s.companyName as nom_societe,
    d.type,
    d.date_depense,
    d.description,
    d.montant_ht,
    d.montant_ttc,
    d.montant_tva,
    d.taux_tva,
    d.statut,
    d.motif_refus,
    d.validee_par,
    CONCAT(uv.firstName, ' ', uv.lastName) as nom_valideur,
    d.validee_le,
    d.client_id,
    d.justificatif_url,
    d.justificatif_filename,
    c.nom as categorie_nom,
    c.description as categorie_description,
    -- Détails kilométriques
    dk.lieu_depart,
    dk.lieu_arrivee,
    dk.distance_km,
    dk.tarif_par_km as tarif_km_utilise,
    dk.type_vehicule,
    bk.nom as bareme_nom,
    -- Détails repas
    dr.lieu as lieu_repas,
    dr.nombre_personnes,
    dr.type_repas,
    d.created_at,
    d.updated_at
FROM depenses d
LEFT JOIN users u ON d.user_id = u.id
LEFT JOIN users uv ON d.validee_par = uv.id
LEFT JOIN societes s ON d.societe_id = s.id
LEFT JOIN categories_depenses c ON d.categorie_id = c.id
LEFT JOIN depenses_kilometriques dk ON d.id = dk.depense_id
LEFT JOIN baremes_kilometriques bk ON dk.bareme_id = bk.id
LEFT JOIN depenses_repas dr ON d.id = dr.depense_id;

-- Vue des statistiques par société et mois
CREATE OR REPLACE VIEW v_stats_depenses_mensuelles AS
SELECT 
    d.societe_id,
    s.companyName as nom_societe,
    YEAR(d.date_depense) as annee,
    MONTH(d.date_depense) as mois,
    d.type,
    d.statut,
    COUNT(*) as nombre_depenses,
    SUM(d.montant_ttc) as total_ttc,
    SUM(d.montant_ht) as total_ht,
    SUM(d.montant_tva) as total_tva,
    AVG(d.montant_ttc) as montant_moyen
FROM depenses d
LEFT JOIN societes s ON d.societe_id = s.id
GROUP BY d.societe_id, s.companyName, YEAR(d.date_depense), MONTH(d.date_depense), d.type, d.statut
ORDER BY annee DESC, mois DESC, d.societe_id;

-- =====================================================
-- PROCÉDURES STOCKÉES UTILES
-- =====================================================

DELIMITER //

-- Procédure pour calculer automatiquement les montants HT/TVA
CREATE OR REPLACE PROCEDURE CalculerMontantsTVA(
    IN p_depense_id INT,
    IN p_montant_ttc DECIMAL(10,2),
    IN p_taux_tva DECIMAL(5,2)
)
BEGIN
    DECLARE v_montant_ht DECIMAL(10,2);
    DECLARE v_montant_tva DECIMAL(10,2);
    
    IF p_taux_tva > 0 THEN
        SET v_montant_ht = p_montant_ttc / (1 + p_taux_tva / 100);
        SET v_montant_tva = p_montant_ttc - v_montant_ht;
    ELSE
        SET v_montant_ht = p_montant_ttc;
        SET v_montant_tva = 0;
    END IF;
    
    UPDATE depenses 
    SET montant_ht = v_montant_ht, 
        montant_tva = v_montant_tva 
    WHERE id = p_depense_id;
END //

-- Procédure pour générer un numéro de note de frais
CREATE OR REPLACE PROCEDURE GenererNumeroNoteFrais(
    IN p_societe_id INT,
    IN p_user_id INT,
    OUT p_numero VARCHAR(50)
)
BEGIN
    DECLARE v_counter INT DEFAULT 1;
    DECLARE v_year VARCHAR(4);
    DECLARE v_month VARCHAR(2);
    
    SET v_year = YEAR(NOW());
    SET v_month = LPAD(MONTH(NOW()), 2, '0');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero, -4) AS UNSIGNED)), 0) + 1 
    INTO v_counter
    FROM notes_frais 
    WHERE societe_id = p_societe_id 
    AND numero LIKE CONCAT('NF-', v_year, v_month, '%');
    
    SET p_numero = CONCAT('NF-', v_year, v_month, '-', LPAD(v_counter, 4, '0'));
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS POUR L'HISTORIQUE AUTOMATIQUE
-- =====================================================

DELIMITER //

-- Trigger pour enregistrer automatiquement la création
CREATE TRIGGER tr_depense_after_insert 
AFTER INSERT ON depenses
FOR EACH ROW
BEGIN
    INSERT INTO historique_depenses (depense_id, user_id, action, statut_nouveau, commentaire)
    VALUES (NEW.id, NEW.user_id, 'creation', NEW.statut, CONCAT('Création de la dépense de type ', NEW.type));
END //

-- Trigger pour enregistrer automatiquement les modifications
CREATE TRIGGER tr_depense_after_update 
AFTER UPDATE ON depenses
FOR EACH ROW
BEGIN
    IF OLD.statut != NEW.statut THEN
        INSERT INTO historique_depenses (
            depense_id, user_id, action, statut_ancien, statut_nouveau, commentaire
        ) VALUES (
            NEW.id, 
            COALESCE(NEW.validee_par, NEW.user_id), 
            CASE 
                WHEN NEW.statut = 'validee' THEN 'validation'
                WHEN NEW.statut = 'refusee' THEN 'refus' 
                WHEN NEW.statut = 'remboursee' THEN 'remboursement'
                ELSE 'modification'
            END,
            OLD.statut, 
            NEW.statut, 
            CASE 
                WHEN NEW.statut = 'refusee' AND NEW.motif_refus IS NOT NULL THEN NEW.motif_refus
                ELSE CONCAT('Changement de statut: ', OLD.statut, ' → ', NEW.statut)
            END
        );
    END IF;
END //

DELIMITER ;

-- =====================================================
-- INDEX POUR OPTIMISATION DES PERFORMANCES
-- =====================================================

-- Index composites pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_depenses_reporting ON depenses (societe_id, date_depense, statut, type);
CREATE INDEX IF NOT EXISTS idx_depenses_validation ON depenses (societe_id, statut, created_at);
CREATE INDEX IF NOT EXISTS idx_depenses_user_period ON depenses (user_id, date_depense, statut);

-- Index pour les recherches textuelles
CREATE FULLTEXT INDEX IF NOT EXISTS idx_depenses_description ON depenses (description);

-- =====================================================
-- COMMENTAIRES ET DOCUMENTATION
-- =====================================================

/*
UTILISATION DU MODULE DÉPENSES:

1. CRÉATION D'UNE DÉPENSE:
   - Insérer dans 'depenses'
   - Si type='kilometrique': insérer dans 'depenses_kilometriques'
   - Si type='repas': insérer dans 'depenses_repas'
   - L'historique est créé automatiquement par trigger

2. VALIDATION:
   - UPDATE depenses SET statut='validee', validee_par=X, validee_le=NOW()
   - L'historique est mis à jour automatiquement

3. CALCUL MONTANTS:
   - Utiliser la procédure CalculerMontantsTVA()
   - Ou calculer manuellement: HT = TTC / (1 + taux_tva/100)

4. RAPPORTS:
   - Utiliser la vue v_depenses_completes pour les détails complets
   - Utiliser la vue v_stats_depenses_mensuelles pour les statistiques

5. NOTES DE FRAIS:
   - Créer une note avec GenererNumeroNoteFrais()
   - Lier les dépenses via note_frais_depenses

PERFORMANCES:
- Les index composites optimisent les requêtes par société/période
- Les vues pré-joignent les données fréquemment demandées
- Les triggers maintiennent l'historique automatiquement

SÉCURITÉ:
- Toutes les FK avec CASCADE/SET NULL appropriés
- Contraintes CHECK pour valider les données
- Unique constraints pour éviter les doublons
*/

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

-- Vérification finale des tables créées
SELECT 
    TABLE_NAME as 'Table créée',
    TABLE_ROWS as 'Nombre de lignes',
    TABLE_COMMENT as 'Description'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME LIKE '%depense%' 
OR TABLE_NAME LIKE '%bareme%' 
OR TABLE_NAME LIKE '%note_frais%'
ORDER BY TABLE_NAME;