-- Structure des tables pour le module Notes de frais

-- Table des types de frais
CREATE TABLE IF NOT EXISTS `types_frais` (
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

-- Table des projets (pour associer les frais à des projets)
CREATE TABLE IF NOT EXISTS `projets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text,
  `societe_id` int(11) NOT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_societe` (`societe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des barèmes kilométriques
CREATE TABLE IF NOT EXISTS `baremes_kilometriques` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `annee` year NOT NULL,
  `puissance_fiscale` varchar(20) NOT NULL,
  `tarif_km` decimal(4,3) NOT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table principale des notes de frais
CREATE TABLE IF NOT EXISTS `notes_frais` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `societe_id` int(11) NOT NULL,
  `periode_debut` date NOT NULL,
  `periode_fin` date NOT NULL,
  `titre` varchar(200),
  `description` text,
  `total_ht` decimal(10,2) DEFAULT 0.00,
  `total_tva` decimal(10,2) DEFAULT 0.00,
  `total_ttc` decimal(10,2) DEFAULT 0.00,
  `statut` enum('brouillon','soumise','validee','refusee','payee') DEFAULT 'brouillon',
  `date_soumission` timestamp NULL,
  `date_validation` timestamp NULL,
  `validateur_id` int(11) DEFAULT NULL,
  `motif_refus` text,
  `commentaire` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `idx_user` (`user_id`),
  KEY `idx_societe` (`societe_id`),
  KEY `idx_statut` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des lignes de frais (détails de chaque frais)
CREATE TABLE IF NOT EXISTS `lignes_frais` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `note_frais_id` int(11) NOT NULL,
  `type_frais_id` int(11) NOT NULL,
  `date_frais` date NOT NULL,
  `description` text,
  `montant` decimal(10,2) NOT NULL,
  `montant_tva` decimal(10,2) DEFAULT 0.00,
  `taux_tva` decimal(5,2) DEFAULT 0.00,
  
  -- Champs spécifiques aux frais kilométriques
  `distance_km` int(11) DEFAULT NULL,
  `lieu_depart` varchar(200) DEFAULT NULL,
  `lieu_arrivee` varchar(200) DEFAULT NULL,
  `type_vehicule` varchar(50) DEFAULT NULL,
  `bareme_id` int(11) DEFAULT NULL,
  
  -- Champs spécifiques aux repas
  `lieu_repas` varchar(200) DEFAULT NULL,
  `nombre_personnes` int(11) DEFAULT 1,
  `type_repas` enum('petit_dejeuner','dejeuner','diner','autre') DEFAULT NULL,
  
  -- Champs spécifiques à l'hébergement
  `lieu_hebergement` varchar(200) DEFAULT NULL,
  `nombre_nuits` int(11) DEFAULT 1,
  
  -- Autres champs
  `projet_id` int(11) DEFAULT NULL,
  `saisie_ocr` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_note_frais` (`note_frais_id`),
  KEY `idx_type_frais` (`type_frais_id`),
  KEY `idx_projet` (`projet_id`),
  KEY `idx_bareme` (`bareme_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des justificatifs (fichiers attachés aux lignes de frais)
CREATE TABLE IF NOT EXISTS `justificatifs_frais` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ligne_frais_id` int(11) NOT NULL,
  `nom_fichier` varchar(255) NOT NULL,
  `chemin_fichier` varchar(500) NOT NULL,
  `type_mime` varchar(100) NOT NULL,
  `taille_fichier` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ligne_frais` (`ligne_frais_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table d'historique des validations
CREATE TABLE IF NOT EXISTS `historique_validations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `note_frais_id` int(11) NOT NULL,
  `ancien_statut` varchar(50) NOT NULL,
  `nouveau_statut` varchar(50) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `commentaire` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_note_frais` (`note_frais_id`),
  KEY `idx_utilisateur` (`utilisateur_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Contraintes de clés étrangères
ALTER TABLE `notes_frais`
  ADD CONSTRAINT `fk_notes_frais_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notes_frais_societe` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notes_frais_validateur` FOREIGN KEY (`validateur_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `lignes_frais`
  ADD CONSTRAINT `fk_lignes_frais_note` FOREIGN KEY (`note_frais_id`) REFERENCES `notes_frais` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_lignes_frais_type` FOREIGN KEY (`type_frais_id`) REFERENCES `types_frais` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_lignes_frais_projet` FOREIGN KEY (`projet_id`) REFERENCES `projets` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_lignes_frais_bareme` FOREIGN KEY (`bareme_id`) REFERENCES `baremes_kilometriques` (`id`) ON DELETE SET NULL;

ALTER TABLE `justificatifs_frais`
  ADD CONSTRAINT `fk_justificatifs_ligne` FOREIGN KEY (`ligne_frais_id`) REFERENCES `lignes_frais` (`id`) ON DELETE CASCADE;

ALTER TABLE `historique_validations`
  ADD CONSTRAINT `fk_historique_note` FOREIGN KEY (`note_frais_id`) REFERENCES `notes_frais` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_historique_utilisateur` FOREIGN KEY (`utilisateur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- Données initiales pour les types de frais
INSERT INTO `types_frais` (`nom`, `code`, `description`, `actif`) VALUES
('Transport - Kilomètres', 'KM', 'Frais kilométriques pour véhicule personnel', 1),
('Transport - Taxi/VTC', 'TAXI', 'Frais de taxi, VTC, ou transport à la demande', 1),
('Transport - Train/Bus', 'TRANSPORT_PUBLIC', 'Transport en commun : train, bus, métro', 1),
('Transport - Avion', 'AVION', 'Billets d''avion pour déplacements professionnels', 1),
('Hébergement - Hôtel', 'HOTEL', 'Nuitées d''hôtel lors de déplacements', 1),
('Hébergement - Autre', 'HEBERGEMENT_AUTRE', 'Autres types d''hébergement (AirBnB, etc.)', 1),
('Repas - Client', 'REPAS_CLIENT', 'Repas avec clients ou prospects', 1),
('Repas - Déplacement', 'REPAS_DEPLACEMENT', 'Repas lors de déplacements professionnels', 1),
('Fournitures - Bureau', 'FOURNITURES', 'Fournitures de bureau et petit matériel', 1),
('Téléphone - Professionnel', 'TELEPHONE', 'Frais de téléphone professionnel', 1),
('Internet - Connexion', 'INTERNET', 'Frais de connexion internet professionnel', 1),
('Formation', 'FORMATION', 'Frais de formation et développement professionnel', 1),
('Autres frais', 'AUTRES', 'Autres frais professionnels divers', 1);

-- Données initiales pour les barèmes kilométriques (exemple 2025)
INSERT INTO `baremes_kilometriques` (`annee`, `puissance_fiscale`, `tarif_km`, `actif`) VALUES
(2025, '3 CV et moins', 0.502, 1),
(2025, '4 CV', 0.575, 1),
(2025, '5 CV', 0.603, 1),
(2025, '6 CV', 0.631, 1),
(2025, '7 CV et plus', 0.661, 1);

-- Projets exemple (optionnel)
INSERT INTO `projets` (`nom`, `code`, `description`, `societe_id`, `actif`) VALUES
('Projet général', 'GENERAL', 'Projet par défaut pour les frais non spécifiques', 2, 1),
('Développement produit', 'DEV_PROD', 'Frais liés au développement de nouveaux produits', 2, 1),
('Commercial', 'COMMERCIAL', 'Frais liés aux activités commerciales', 2, 1);