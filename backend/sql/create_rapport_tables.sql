-- Tables nécessaires pour le rapport financier

-- Table des catégories d'achats
CREATE TABLE IF NOT EXISTS `categories_achats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text,
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des achats/dépenses
CREATE TABLE IF NOT EXISTS `achats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `societe_id` int(11) NOT NULL,
  `categorie_id` int(11) NOT NULL,
  `fournisseur_nom` varchar(200) NOT NULL,
  `date_achat` date NOT NULL,
  `description` text,
  `montant_ht` decimal(10,2) NOT NULL,
  `montant_tva` decimal(10,2) DEFAULT 0.00,
  `montant_ttc` decimal(10,2) NOT NULL,
  `taux_tva` decimal(5,2) DEFAULT 0.00,
  `statut` enum('brouillon','valide','refuse') DEFAULT 'brouillon',
  `justificatif_path` varchar(500) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `idx_societe` (`societe_id`),
  KEY `idx_categorie` (`categorie_id`),
  KEY `idx_date` (`date_achat`),
  KEY `idx_statut` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des lignes de facture (pour les détails TVA)
CREATE TABLE IF NOT EXISTS `lignes_facture` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `facture_id` int(11) NOT NULL,
  `produit_nom` varchar(200) NOT NULL,
  `description` text,
  `quantite` decimal(10,2) NOT NULL DEFAULT 1,
  `prix_unitaire_ht` decimal(10,2) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `taux_tva` decimal(5,2) NOT NULL DEFAULT 20.00,
  `montant_tva` decimal(10,2) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_facture` (`facture_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Mise à jour de la table factures existante pour avoir les champs corrects
ALTER TABLE factures 
  ADD COLUMN IF NOT EXISTS `total_ttc` decimal(10,2) DEFAULT 0.00 AFTER `total`,
  ADD COLUMN IF NOT EXISTS `total_ht` decimal(10,2) DEFAULT 0.00 AFTER `total_ttc`,
  ADD COLUMN IF NOT EXISTS `type_facture` enum('facture','avoir','devis') DEFAULT 'facture' AFTER `type_fact`,
  MODIFY COLUMN `statut` enum('brouillon','envoyee','acceptee','payee','en_retard','annulee','refusee') DEFAULT 'brouillon';

-- Données initiales pour les catégories d'achats
INSERT IGNORE INTO `categories_achats` (`nom`, `code`, `description`, `actif`) VALUES
('Fournitures de bureau', 'FOURNITURES', 'Matériel et fournitures de bureau', 1),
('Services et abonnements', 'SERVICES', 'Abonnements logiciels, services en ligne', 1),
('Déplacements', 'DEPLACEMENT', 'Frais de transport, hébergement professionnels', 1),
('Restauration', 'RESTAURATION', 'Repas d\'affaires, restauration professionnelle', 1),
('Matériel informatique', 'INFORMATIQUE', 'Ordinateurs, périphériques, matériel IT', 1),
('Formation', 'FORMATION', 'Formations professionnelles et développement', 1),
('Marketing et communication', 'MARKETING', 'Publicité, communication, marketing', 1),
('Maintenance et réparations', 'MAINTENANCE', 'Entretien, réparations, maintenance', 1),
('Assurances', 'ASSURANCE', 'Primes d\'assurance professionnelle', 1),
('Autres dépenses', 'AUTRES', 'Autres dépenses professionnelles diverses', 1);

-- Contraintes de clés étrangères
ALTER TABLE `achats`
  ADD CONSTRAINT `fk_achats_societe` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_achats_categorie` FOREIGN KEY (`categorie_id`) REFERENCES `categories_achats` (`id`) ON DELETE RESTRICT;

ALTER TABLE `lignes_facture`
  ADD CONSTRAINT `fk_lignes_facture` FOREIGN KEY (`facture_id`) REFERENCES `factures` (`id`) ON DELETE CASCADE;