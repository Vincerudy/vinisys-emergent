/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.11-MariaDB, for debian-linux-gnu (aarch64)
--
-- Host: localhost    Database: mjupgupviniprod
-- ------------------------------------------------------
-- Server version	10.11.11-MariaDB-0+deb12u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Reglement_mode`
--

DROP TABLE IF EXISTS `Reglement_mode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Reglement_mode` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero_facture` varchar(255) NOT NULL,
  `mode_reglement` varchar(255) NOT NULL,
  `Montant_total` varchar(255) NOT NULL,
  `Total_Paye` varchar(255) NOT NULL,
  `Reste_A_Payer` varchar(255) NOT NULL,
  `dat` varchar(255) NOT NULL,
  `societe_id` varchar(255) NOT NULL,
  `montant_paye` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Reglement_mode`
--

LOCK TABLES `Reglement_mode` WRITE;
/*!40000 ALTER TABLE `Reglement_mode` DISABLE KEYS */;
INSERT INTO `Reglement_mode` VALUES
(122,'JL802-1','cheque','44.00','12','32','2025-06-18','2','12'),
(123,'JL501-1','espece','88.00','88','0','2025-06-04','2','88'),
(124,'JL204-1','espece','3.00','3','0','2025-07-07','2','3'),
(125,'JU477-1','cheque','732.00','732','0','2025-07-10','3','732'),
(126,'JU018-1','espece','990975.00','990975','0','2025-07-10','7','990975'),
(127,'JU911-1','espece','209.00','209','0','2025-07-30','13','209');
/*!40000 ALTER TABLE `Reglement_mode` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `achats`
--

DROP TABLE IF EXISTS `achats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `achats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `societe_id` int(11) NOT NULL,
  `categorie_id` int(11) NOT NULL,
  `fournisseur_nom` varchar(200) NOT NULL,
  `date_achat` date NOT NULL,
  `description` text DEFAULT NULL,
  `montant_ht` decimal(10,2) NOT NULL,
  `montant_tva` decimal(10,2) DEFAULT 0.00,
  `montant_ttc` decimal(10,2) NOT NULL,
  `taux_tva` decimal(5,2) DEFAULT 0.00,
  `statut` enum('brouillon','valide','refuse') DEFAULT 'brouillon',
  `justificatif_path` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `idx_societe` (`societe_id`),
  KEY `idx_categorie` (`categorie_id`),
  KEY `idx_date` (`date_achat`),
  KEY `idx_statut` (`statut`),
  CONSTRAINT `fk_achats_categorie` FOREIGN KEY (`categorie_id`) REFERENCES `categories_achats` (`id`),
  CONSTRAINT `fk_achats_societe` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achats`
--

LOCK TABLES `achats` WRITE;
/*!40000 ALTER TABLE `achats` DISABLE KEYS */;
INSERT INTO `achats` VALUES
(1,'ACH-2025-001',2,1,'Bureau Vallée','2025-08-02','Fournitures papeterie',150.00,30.00,180.00,20.00,'valide',NULL,'2025-08-08 15:38:01','2025-08-08 15:38:01'),
(2,'ACH-2025-002',2,2,'Microsoft','2025-08-01','Licence Office 365',120.00,24.00,144.00,20.00,'valide',NULL,'2025-08-08 15:38:01','2025-08-08 15:38:01'),
(3,'ACH-2025-003',2,5,'LDLC','2025-08-10','Écran 24 pouces',299.00,59.80,358.80,20.00,'valide',NULL,'2025-08-08 15:38:01','2025-08-08 15:38:01'),
(4,'ACH-2025-004',2,3,'SNCF Connect','2025-08-05','Billets train Paris-Lyon',156.00,31.20,187.20,20.00,'valide',NULL,'2025-08-08 15:38:01','2025-08-08 15:38:01'),
(5,'ACH-2025-005',2,4,'Restaurant Le Gourmet','2025-08-07','Repas clients x4',145.00,14.50,159.50,10.00,'valide',NULL,'2025-08-08 15:38:01','2025-08-08 15:38:01'),
(6,'ACH-2025-006',2,6,'Formation Pro','2025-08-15','Formation gestion projet',890.00,89.00,979.00,10.00,'valide',NULL,'2025-08-08 15:38:01','2025-08-08 15:38:01'),
(7,'ACH-2025-007',2,7,'Google Ads','2025-08-03','Publicité en ligne août',450.00,90.00,540.00,20.00,'valide',NULL,'2025-08-08 15:38:01','2025-08-08 15:38:01');
/*!40000 ALTER TABLE `achats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alertes_facturation`
--

DROP TABLE IF EXISTS `alertes_facturation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `alertes_facturation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `societe_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date_alerte` varchar(255) DEFAULT NULL,
  `jours_avant` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_modification` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_societe_id` (`societe_id`),
  CONSTRAINT `alertes_facturation_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `alertes_facturation_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=112 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertes_facturation`
--

LOCK TABLES `alertes_facturation` WRITE;
/*!40000 ALTER TABLE `alertes_facturation` DISABLE KEYS */;
INSERT INTO `alertes_facturation` VALUES
(96,2,4,'29/06/2025',1,'Programmer les entretiens annuell de l\'équipe','entretien annuel ','2025-03-22 23:30:51','2025-06-29 12:35:32'),
(97,2,4,'27/06/2025',1,'Vérifier les message sur leboncoin','Message Leboncoin','2025-03-22 23:31:52','2025-06-27 19:35:24'),
(102,3,3,'26/03/2025',1,'test today','test','2025-03-26 18:35:19','2025-03-26 18:35:30'),
(104,2,4,'30/06/2025',5,'test','dd','2025-05-10 14:37:34','2025-06-27 19:32:44'),
(105,2,4,'27/06/2025',1,'rappel','test','2025-05-18 13:22:50','2025-06-27 19:32:24'),
(106,2,4,'08/07/2025',1,'faire la gamelle','faire la gamelle','2025-06-01 19:19:03','2025-07-08 21:55:29'),
(107,2,4,'08/07/2025',1,'test alerte','TEST','2025-07-06 14:31:14','2025-07-08 14:59:17'),
(108,2,4,'09/07/2025',1,'Me rappeler de commcer le module dépense ','Module de dépenses ','2025-07-06 14:37:19','2025-07-06 14:37:19'),
(111,12,58,'11/07/2025',1,'Alertes de messagerie ','Message ','2025-07-09 23:08:28','2025-07-09 23:09:12');
/*!40000 ALTER TABLE `alertes_facturation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `baremes_kilometriques`
--

DROP TABLE IF EXISTS `baremes_kilometriques`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `baremes_kilometriques` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `annee` year(4) NOT NULL,
  `puissance_fiscale` varchar(20) NOT NULL,
  `tarif_km` decimal(4,3) NOT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `baremes_kilometriques`
--

LOCK TABLES `baremes_kilometriques` WRITE;
/*!40000 ALTER TABLE `baremes_kilometriques` DISABLE KEYS */;
INSERT INTO `baremes_kilometriques` VALUES
(1,2025,'3 CV et moins',0.502,1,'2025-08-08 14:39:03'),
(2,2025,'4 CV',0.575,1,'2025-08-08 14:39:03'),
(3,2025,'5 CV',0.603,1,'2025-08-08 14:39:03'),
(4,2025,'6 CV',0.631,1,'2025-08-08 14:39:03'),
(5,2025,'7 CV et plus',0.661,1,'2025-08-08 14:39:03');
/*!40000 ALTER TABLE `baremes_kilometriques` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories_achats`
--

DROP TABLE IF EXISTS `categories_achats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories_achats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories_achats`
--

LOCK TABLES `categories_achats` WRITE;
/*!40000 ALTER TABLE `categories_achats` DISABLE KEYS */;
INSERT INTO `categories_achats` VALUES
(1,'Fournitures de bureau','FOURNITURES','Matériel et fournitures de bureau',1,'2025-08-08 15:37:51','2025-08-08 15:37:51'),
(2,'Services et abonnements','SERVICES','Abonnements logiciels, services en ligne',1,'2025-08-08 15:37:51','2025-08-08 15:37:51'),
(3,'Déplacements','DEPLACEMENT','Frais de transport, hébergement professionnels',1,'2025-08-08 15:37:51','2025-08-08 15:37:51'),
(4,'Restauration','RESTAURATION','Repas d\'affaires, restauration professionnelle',1,'2025-08-08 15:37:51','2025-08-08 15:37:51'),
(5,'Matériel informatique','INFORMATIQUE','Ordinateurs, périphériques, matériel IT',1,'2025-08-08 15:37:51','2025-08-08 15:37:51'),
(6,'Formation','FORMATION','Formations professionnelles et développement',1,'2025-08-08 15:37:51','2025-08-08 15:37:51'),
(7,'Marketing et communication','MARKETING','Publicité, communication, marketing',1,'2025-08-08 15:37:51','2025-08-08 15:37:51'),
(8,'Maintenance et réparations','MAINTENANCE','Entretien, réparations, maintenance',1,'2025-08-08 15:37:51','2025-08-08 15:37:51'),
(9,'Assurances','ASSURANCE','Primes d\'assurance professionnelle',1,'2025-08-08 15:37:51','2025-08-08 15:37:51'),
(10,'Autres dépenses','AUTRES','Autres dépenses professionnelles diverses',1,'2025-08-08 15:37:51','2025-08-08 15:37:51');
/*!40000 ALTER TABLE `categories_achats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `ville` varchar(255) DEFAULT NULL,
  `code_postal` varchar(10) DEFAULT NULL,
  `pays` varchar(50) DEFAULT NULL,
  `societe_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `phone` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `societe_id` (`societe_id`),
  CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES
(7,'Les amours','La@gmail.com','22 rue de Fresnes','Maison alfort','94200','France',3,'2024-09-22 10:15:35',NULL),
(24,'Maixen.','vincerudy@hotmail.fr','7 rue de la fete ','Paris','75020','France',2,'2024-09-29 17:57:34','0665248951'),
(25,'Rudy Vince','vincerudy@hotmail.fr','Cours de Vincennes','Paris','75020','France',2,'2025-03-08 23:38:27','0783322320'),
(26,'Giorgia Oliva ','olivagiorgia93@gmail.com','7 rue de la Houssaye','Bonnieres sur seine','78270','France',2,'2025-03-09 01:45:07','0695447522'),
(38,'Giorgia Oliva','mMlivagiorgia93@gmail.com','7 rue de la Houssaye','Bonnieres sur seine','78270','France',2,'2025-07-10 13:38:08','0695447522'),
(40,'Alexandre','alex@gmail.com','7 Rue de la Houssaye','Bonnieres sur seine','78270','France',3,'2025-07-10 15:10:49','0665248951'),
(41,'Maixen Dan','maixendan@gmail.com','20333','Libreville',NULL,'Gabon',7,'2025-07-10 15:19:44','06544484'),
(42,'Kusmi Tea','kusmitea@gmail.com',NULL,'paris',NULL,NULL,13,'2025-07-14 18:15:05','0987665689');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commandes`
--

DROP TABLE IF EXISTS `commandes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `commandes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `societe_id` int(11) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `date_commande` date NOT NULL,
  `statut` enum('en attente','expédiée','livrée') DEFAULT 'en attente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `societe_id` (`societe_id`),
  CONSTRAINT `commandes_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  CONSTRAINT `commandes_ibfk_2` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commandes`
--

LOCK TABLES `commandes` WRITE;
/*!40000 ALTER TABLE `commandes` DISABLE KEYS */;
/*!40000 ALTER TABLE `commandes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation`
--

DROP TABLE IF EXISTS `conversation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `match_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text DEFAULT NULL,
  `audio_path` text DEFAULT NULL,
  `language` varchar(10) DEFAULT NULL,
  `timestamp` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation`
--

LOCK TABLES `conversation` WRITE;
/*!40000 ALTER TABLE `conversation` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `birthDate` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `zipCode` varchar(20) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `socialSecurityNumber` varchar(50) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `poste` varchar(100) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `niveau` varchar(50) DEFAULT NULL,
  `coefficient` decimal(10,2) DEFAULT NULL,
  `manager` varchar(100) DEFAULT NULL,
  `hoursPerMonth` int(11) DEFAULT NULL,
  `hoursPerDay` int(11) DEFAULT NULL,
  `hourlyRate` decimal(10,2) DEFAULT NULL,
  `monthlySalary` decimal(10,2) DEFAULT NULL,
  `contractType` varchar(50) DEFAULT NULL,
  `entryDate` varchar(255) DEFAULT NULL,
  `exitDate` date DEFAULT NULL,
  `iban` varchar(34) DEFAULT NULL,
  `isExecutive` tinyint(1) DEFAULT 0,
  `isPartner` tinyint(1) DEFAULT 0,
  `isPartTime` tinyint(1) DEFAULT 0,
  `photo` varchar(255) DEFAULT NULL,
  `societe_id` int(11) NOT NULL,
  `genre` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES
(1,'Alice','Dupont','1989-12-31','123 Rue de Paris','75001','Paris','0123456789','alice.dupont@example.com','123-45-6789','Française','Développeuse','Junior','1',1.20,'manager1',160,8,20.00,3200.00,'CDI','2022-01-15',NULL,'FR761234567890',0,0,0,NULL,3,'female'),
(3,'Alice','Dupont','1989-12-31T23:00:00.000Z','123 Rue de Paris','75001','Paris','0123456789','alice1.dupont@example.com','123-45-6789','Française',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'CDI','2022-01-14T23:00:00.000Z',NULL,'FR761234567890',0,0,0,NULL,2,'female'),
(5,'Ding','Dong','1989-12-31T23:00:00.000Z','123 Rue de Paris','75001','Paris','0123456789','ding.dupont@example.com','123-45-6789','Française','Développeuse','Junior','1',1.20,'manager1',160,8,20.00,3200.00,'CDD','2022-01-14T23:00:00.000Z',NULL,'FR761234567890',1,0,1,NULL,2,'female');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `factures`
--

DROP TABLE IF EXISTS `factures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `factures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `societe_id` int(11) DEFAULT NULL,
  `date_facture` varchar(35) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `total_ttc` decimal(10,2) DEFAULT 0.00,
  `total_ht` decimal(10,2) DEFAULT 0.00,
  `statut` enum('brouillon','envoyee','acceptee','payee','en_retard','annulee','refusee') DEFAULT 'brouillon',
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `numero` varchar(100) DEFAULT NULL,
  `type_fact` varchar(4) DEFAULT NULL,
  `ht` varchar(255) DEFAULT NULL,
  `type_saisie` varchar(255) DEFAULT NULL,
  `total_tva` varchar(255) DEFAULT NULL,
  `type_fact` enum('facture','avoir','devis') DEFAULT 'facture',
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `societe_id` (`societe_id`),
  CONSTRAINT `factures_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  CONSTRAINT `factures_ibfk_2` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=257 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factures`
--

LOCK TABLES `factures` WRITE;
/*!40000 ALTER TABLE `factures` DISABLE KEYS */;
INSERT INTO `factures` VALUES
(221,25,2,'2025-06-23',44.00,44.00,36.67,'envoyee',NULL,'2025-06-23 19:35:53','JL802-1','FACT','36.67','HT','7.33','facture'),
(222,25,2,'2025-06-23',88.00,88.00,73.33,'envoyee',NULL,'2025-06-23 19:37:22','JL501-1','FACT','73.33','HT','14.67','facture'),
(223,26,2,'2025-06-24',21.00,21.00,17.50,'payee',NULL,'2025-06-24 18:21:20','JL894-1','DEVI','17.5','HT','3.5','facture'),
(224,26,2,'2025-06-24',12.10,12.10,10.08,'payee',NULL,'2025-06-24 18:32:56','JL249-1','DEVI','11','HT','1.1','facture'),
(225,24,2,'2025-04-21',38.68,38.68,32.23,'envoyee',NULL,'2025-06-27 19:33:24','JL523-1','FACT','36.66','TTC','2.02','facture'),
(226,24,2,'2025-05-28',44.00,44.00,36.67,'envoyee',NULL,'2025-06-27 19:34:00','JL002-1','FACT','36.67','TTC','7.33','facture'),
(227,26,2,'2025-06-27',22.00,22.00,18.33,'envoyee',NULL,'2025-06-27 19:34:40','JL299-1','FACT','18.33','TTC','3.67','facture'),
(228,25,2,'2025-05-14',3.00,3.00,2.50,'envoyee',NULL,'2025-06-27 19:34:57','JL204-1','FACT','2.5','TTC','0.5','facture'),
(229,24,2,'2025-07-07',143.36,143.36,119.47,'envoyee',NULL,'2025-07-06 22:47:32','JU213-1','DEVI','131.54','TTC','11.82','facture'),
(230,40,3,'2025-07-10',732.00,732.00,610.00,'envoyee',NULL,'2025-07-10 15:14:08','JU477-1','FACT','659.16','TTC','72.84','facture'),
(231,7,3,'2025-01-09',22.00,22.00,18.33,'envoyee',NULL,'2025-07-10 15:24:35','JU562-1','FACT','18.33','TTC','3.67','facture'),
(232,41,7,'2025-07-10',990975.00,990975.00,825812.50,'envoyee',NULL,'2025-07-10 17:02:06','JU018-1','FACT','905000','HT','85975','facture'),
(234,42,13,'2025-07-14',16.00,16.00,13.33,'envoyee',NULL,'2025-07-14 18:21:25','JU790-1','FACT','13.33','TTC','2.67','facture'),
(235,42,13,'2025-07-17',209.00,209.00,174.17,'envoyee',NULL,'2025-07-17 15:20:50','JU911-1','FACT','175.48','TTC','33.52','facture'),
(248,24,2,'2025-08-01',1200.00,1200.00,1000.00,'payee',NULL,'2025-08-08 15:37:45','FACT-2025-001',NULL,NULL,NULL,NULL,'facture'),
(249,25,2,'2025-08-05',2400.00,2400.00,2000.00,'payee',NULL,'2025-08-08 15:37:45','FACT-2025-002',NULL,NULL,NULL,NULL,'facture'),
(250,26,2,'2025-08-10',960.00,960.00,800.00,'payee',NULL,'2025-08-08 15:37:45','FACT-2025-003',NULL,NULL,NULL,NULL,'facture'),
(251,24,2,'2025-08-15',1800.00,1800.00,1500.00,'payee',NULL,'2025-08-08 15:37:45','FACT-2025-004',NULL,NULL,NULL,NULL,'facture'),
(252,25,2,'2025-08-18',3600.00,3600.00,3000.00,'envoyee',NULL,'2025-08-08 15:37:45','FACT-2025-005',NULL,NULL,NULL,NULL,'facture'),
(253,26,2,'2025-08-22',1440.00,1440.00,1200.00,'acceptee',NULL,'2025-08-08 15:37:45','FACT-2025-006',NULL,NULL,NULL,NULL,'facture'),
(254,24,2,'2025-08-25',2160.00,2160.00,1800.00,'envoyee',NULL,'2025-08-08 15:37:45','FACT-2025-007',NULL,NULL,NULL,NULL,'facture'),
(255,24,2,'2025-08-12',-240.00,-240.00,-200.00,'payee',NULL,'2025-08-08 15:37:45','AVOIR-2025-001',NULL,NULL,NULL,NULL,'avoir'),
(256,25,2,'2025-08-20',-120.00,-120.00,-100.00,'payee',NULL,'2025-08-08 15:37:45','AVOIR-2025-002',NULL,NULL,NULL,NULL,'avoir');
/*!40000 ALTER TABLE `factures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historique_validations`
--

DROP TABLE IF EXISTS `historique_validations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `historique_validations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `note_frais_id` int(11) NOT NULL,
  `ancien_statut` varchar(50) NOT NULL,
  `nouveau_statut` varchar(50) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `commentaire` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_note_frais` (`note_frais_id`),
  KEY `idx_utilisateur` (`utilisateur_id`),
  CONSTRAINT `fk_historique_note` FOREIGN KEY (`note_frais_id`) REFERENCES `notes_frais` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_historique_utilisateur` FOREIGN KEY (`utilisateur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historique_validations`
--

LOCK TABLES `historique_validations` WRITE;
/*!40000 ALTER TABLE `historique_validations` DISABLE KEYS */;
INSERT INTO `historique_validations` VALUES
(1,2,'brouillon','soumise',4,'Note soumise pour validation','2025-08-08 14:30:00'),
(2,3,'brouillon','soumise',3,'Note soumise pour validation','2025-08-08 11:15:00'),
(3,4,'brouillon','soumise',4,'Note soumise pour validation','2025-07-29 10:00:00'),
(4,4,'soumise','validee',4,'Note validée - conforme aux barèmes','2025-07-30 15:45:00'),
(5,2,'soumise','validee',4,'Note validée - test','2025-08-08 14:57:16'),
(6,5,'soumise','validee',4,'Note validée','2025-08-08 15:02:01');
/*!40000 ALTER TABLE `historique_validations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `justificatifs_frais`
--

DROP TABLE IF EXISTS `justificatifs_frais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `justificatifs_frais` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ligne_frais_id` int(11) NOT NULL,
  `nom_fichier` varchar(255) NOT NULL,
  `chemin_fichier` varchar(500) NOT NULL,
  `type_mime` varchar(100) NOT NULL,
  `taille_fichier` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ligne_frais` (`ligne_frais_id`),
  CONSTRAINT `fk_justificatifs_ligne` FOREIGN KEY (`ligne_frais_id`) REFERENCES `lignes_frais` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `justificatifs_frais`
--

LOCK TABLES `justificatifs_frais` WRITE;
/*!40000 ALTER TABLE `justificatifs_frais` DISABLE KEYS */;
/*!40000 ALTER TABLE `justificatifs_frais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lignes_facture`
--

DROP TABLE IF EXISTS `lignes_facture`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lignes_facture` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `facture_id` int(11) NOT NULL,
  `produit_nom` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `quantite` decimal(10,2) NOT NULL DEFAULT 1.00,
  `prix_unitaire_ht` decimal(10,2) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `taux_tva` decimal(5,2) NOT NULL DEFAULT 20.00,
  `montant_tva` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_facture` (`facture_id`),
  CONSTRAINT `fk_lignes_facture` FOREIGN KEY (`facture_id`) REFERENCES `factures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lignes_facture`
--

LOCK TABLES `lignes_facture` WRITE;
/*!40000 ALTER TABLE `lignes_facture` DISABLE KEYS */;
INSERT INTO `lignes_facture` VALUES
(1,248,'Service conseil','Prestations de conseil',1.00,1000.00,1000.00,20.00,200.00,'2025-08-08 15:38:08'),
(2,249,'Service conseil','Prestations de conseil',1.00,2000.00,2000.00,20.00,400.00,'2025-08-08 15:38:08'),
(3,251,'Service conseil','Prestations de conseil',1.00,1500.00,1500.00,20.00,300.00,'2025-08-08 15:38:08'),
(4,252,'Service conseil','Prestations de conseil',1.00,3000.00,3000.00,20.00,600.00,'2025-08-08 15:38:08'),
(5,253,'Service conseil','Prestations de conseil',1.00,1200.00,1200.00,20.00,240.00,'2025-08-08 15:38:08'),
(6,254,'Service conseil','Prestations de conseil',1.00,1800.00,1800.00,20.00,360.00,'2025-08-08 15:38:08');
/*!40000 ALTER TABLE `lignes_facture` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lignes_frais`
--

DROP TABLE IF EXISTS `lignes_frais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lignes_frais` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `note_frais_id` int(11) NOT NULL,
  `type_frais_id` int(11) NOT NULL,
  `date_frais` date NOT NULL,
  `description` text DEFAULT NULL,
  `montant` decimal(10,2) NOT NULL,
  `montant_tva` decimal(10,2) DEFAULT 0.00,
  `taux_tva` decimal(5,2) DEFAULT 0.00,
  `distance_km` int(11) DEFAULT NULL,
  `lieu_depart` varchar(200) DEFAULT NULL,
  `lieu_arrivee` varchar(200) DEFAULT NULL,
  `type_vehicule` varchar(50) DEFAULT NULL,
  `bareme_id` int(11) DEFAULT NULL,
  `lieu_repas` varchar(200) DEFAULT NULL,
  `nombre_personnes` int(11) DEFAULT 1,
  `type_repas` enum('petit_dejeuner','dejeuner','diner','autre') DEFAULT NULL,
  `lieu_hebergement` varchar(200) DEFAULT NULL,
  `nombre_nuits` int(11) DEFAULT 1,
  `projet_id` int(11) DEFAULT NULL,
  `saisie_ocr` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_note_frais` (`note_frais_id`),
  KEY `idx_type_frais` (`type_frais_id`),
  KEY `idx_projet` (`projet_id`),
  KEY `idx_bareme` (`bareme_id`),
  CONSTRAINT `fk_lignes_frais_bareme` FOREIGN KEY (`bareme_id`) REFERENCES `baremes_kilometriques` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lignes_frais_note` FOREIGN KEY (`note_frais_id`) REFERENCES `notes_frais` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lignes_frais_projet` FOREIGN KEY (`projet_id`) REFERENCES `projets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lignes_frais_type` FOREIGN KEY (`type_frais_id`) REFERENCES `types_frais` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lignes_frais`
--

LOCK TABLES `lignes_frais` WRITE;
/*!40000 ALTER TABLE `lignes_frais` DISABLE KEYS */;
INSERT INTO `lignes_frais` VALUES
(1,1,1,'2025-08-02','Trajet bureau-client ABC (85 km)',85.00,17.00,20.00,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,1,NULL,0,'2025-08-08 14:46:09','2025-08-08 14:46:09'),
(2,1,7,'2025-08-02','Déjeuner avec client ABC',65.00,13.00,20.00,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,1,NULL,0,'2025-08-08 14:46:09','2025-08-08 14:46:09'),
(3,1,9,'2025-08-03','Fournitures présentation',30.00,6.00,20.00,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,1,NULL,0,'2025-08-08 14:46:09','2025-08-08 14:46:09'),
(4,2,1,'2025-08-09','Déplacement formation Paris (120 km)',120.00,24.00,20.00,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,1,NULL,0,'2025-08-08 14:46:09','2025-08-08 14:46:09'),
(5,2,8,'2025-08-09','Repas formation',45.00,9.00,20.00,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,1,NULL,0,'2025-08-08 14:46:09','2025-08-08 14:46:09'),
(6,2,5,'2025-08-09','Hôtel formation Paris',110.50,22.10,20.00,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,1,NULL,0,'2025-08-08 14:46:09','2025-08-08 14:46:09'),
(7,3,1,'2025-08-03','Visites clients région (95 km)',95.00,19.00,20.00,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,1,NULL,0,'2025-08-08 14:46:09','2025-08-08 14:46:09'),
(8,3,7,'2025-08-04','Repas client prospects',49.00,9.80,20.00,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,1,NULL,0,'2025-08-08 14:46:09','2025-08-08 14:46:09'),
(9,4,12,'2025-07-25','Formation comptabilité',75.00,15.00,20.00,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,1,NULL,0,'2025-08-08 14:46:09','2025-08-08 14:46:09'),
(10,4,1,'2025-07-26','Déplacement formation (40 km)',32.88,6.58,20.00,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,1,NULL,0,'2025-08-08 14:46:09','2025-08-08 14:46:09'),
(11,5,1,'2025-08-16','Déplacement formation externe (75 km)',75.00,15.00,20.00,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,1,NULL,0,'2025-08-08 14:57:33','2025-08-08 14:57:33'),
(12,5,12,'2025-08-16','Formation sécurité',120.25,24.05,20.00,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,1,NULL,0,'2025-08-08 14:57:33','2025-08-08 14:57:33');
/*!40000 ALTER TABLE `lignes_frais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mail_parametrage`
--

DROP TABLE IF EXISTS `mail_parametrage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mail_parametrage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `societe_id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `objet` varchar(255) NOT NULL,
  `coprs` text NOT NULL,
  `date_crea` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_mis_ajou` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `societe_id` (`societe_id`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mail_parametrage`
--

LOCK TABLES `mail_parametrage` WRITE;
/*!40000 ALTER TABLE `mail_parametrage` DISABLE KEYS */;
/*!40000 ALTER TABLE `mail_parametrage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mail_settings`
--

DROP TABLE IF EXISTS `mail_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mail_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `societe_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `host` varchar(255) NOT NULL,
  `port` int(11) NOT NULL,
  `security` enum('Aucune','SSL','TLS') NOT NULL DEFAULT 'Aucune',
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `societe_id` (`societe_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `mail_settings_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mail_settings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mail_settings`
--

LOCK TABLES `mail_settings` WRITE;
/*!40000 ALTER TABLE `mail_settings` DISABLE KEYS */;
INSERT INTO `mail_settings` VALUES
(6,2,4,'smtp.ionos.fr',465,'SSL','contact@minutescoop.fr','Cinema12@selfie','2025-03-23 11:07:34','2025-03-23 18:40:59'),
(7,12,58,'smtp.ionos.fr',465,'SSL','idnovation2014@gmail.com','Cinema12','2025-07-09 19:46:57','2025-07-09 19:46:57');
/*!40000 ALTER TABLE `mail_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `societe_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `from` enum('client','support') NOT NULL,
  `message` text NOT NULL,
  `date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_message_societe` (`societe_id`),
  CONSTRAINT `fk_message_societe` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES
(1,7,2,2147483647,'support','remi','2025-07-05 11:32:59'),
(2,7,2,2147483647,'support','test','2025-07-05 11:36:00'),
(3,7,2,2147483647,'support','test','2025-07-05 12:25:26'),
(4,7,2,2147483647,'client','merci','2025-07-05 12:27:46'),
(5,7,2,2147483647,'client','test','2025-07-05 12:32:54'),
(6,7,2,2147483647,'client','uuu','2025-07-05 12:34:02'),
(7,7,2,2147483647,'support','test','2025-07-05 14:56:04'),
(8,7,2,2147483647,'client','test','2025-07-05 14:58:21'),
(9,7,2,2147483647,'client','test','2025-07-05 14:58:54'),
(10,7,2,2147483647,'support','test','2025-07-05 15:00:49'),
(11,7,2,2147483647,'client','test','2025-07-05 15:00:58'),
(12,9,2,2147483647,'support','Bonjour ce ticket a deja été traité, vous devez pouvoir saisir vos factures dès mainteant','2025-07-05 18:09:39'),
(13,9,2,2147483647,'client','Merci de votre réactivité','2025-07-05 18:10:50'),
(14,5,2,2147483647,'support','Problème résolu','2025-07-06 14:01:45'),
(15,9,2,2147483647,'support','J\'ai encore un problème','2025-07-07 07:38:35'),
(16,9,2,2147483647,'support','Ok pas de soucis, au plaisir','2025-07-07 19:38:48'),
(17,9,2,2147483647,'client','test','2025-07-08 13:09:10'),
(18,9,2,2147483647,'client','test','2025-07-08 13:17:55'),
(19,10,2,2147483647,'support','test message','2025-07-08 13:40:24'),
(20,10,2,2147483647,'client','merci de votre aide','2025-07-08 13:40:45'),
(21,10,2,2147483647,'client','bonjour','2025-07-08 13:46:58'),
(22,10,2,2147483647,'support','message test','2025-07-08 13:47:23'),
(23,10,2,2147483647,'support','test','2025-07-08 13:47:48'),
(24,10,2,2147483647,'support','test support','2025-07-08 13:48:52'),
(25,10,2,2147483647,'support','socket','2025-07-08 14:38:13'),
(26,9,2,2147483647,'client','io','2025-07-08 14:38:31'),
(27,9,2,2147483647,'client','tdestttt','2025-07-08 14:39:23'),
(28,10,2,2147483647,'support','test io','2025-07-08 14:40:12'),
(29,8,2,2147483647,'support','test','2025-07-08 14:40:50'),
(30,8,2,2147483647,'client','12','2025-07-08 14:52:16'),
(31,11,2,2147483647,'client','Bonjour','2025-07-08 15:12:56'),
(32,11,2,2147483647,'client','test','2025-07-08 15:13:34'),
(33,11,2,2147483647,'client','test','2025-07-08 16:18:01'),
(34,8,2,2147483647,'support','test','2025-07-08 16:18:17'),
(35,11,2,2147483647,'client','elton','2025-07-08 16:19:57'),
(36,11,2,2147483647,'client','al','2025-07-08 16:40:52'),
(37,11,2,2147483647,'support','al','2025-07-08 16:41:21'),
(38,11,2,2147483647,'support','mm','2025-07-08 16:41:38'),
(39,11,2,2147483647,'client','Merci','2025-07-08 16:43:34'),
(40,11,2,2147483647,'client','M','2025-07-08 16:43:53'),
(41,11,2,2147483647,'support','A','2025-07-08 16:54:24'),
(42,11,2,2147483647,'support','NNN','2025-07-08 22:11:51'),
(43,11,2,2147483647,'client','test','2025-07-09 18:37:56'),
(44,17,7,2147483647,'client','et la je saisie un message au support','2025-07-09 21:36:41'),
(45,19,7,2147483647,'client','Je suis pénalisé je dois l\'envoyer dans les plus bref delais','2025-07-10 15:35:21'),
(46,19,2,2147483647,'support','Je n\'arrive pas à reproduire ce bug','2025-07-10 16:21:17'),
(47,19,2,2147483647,'support','essaie de vider les caches de ton navigateur et ressaie et tiens moi au courant','2025-07-10 16:21:59'),
(48,18,2,2147483647,'support','Vu ensemble ce jour','2025-07-10 16:32:42'),
(49,19,7,2147483647,'client','Ok j\'essaie encore','2025-07-10 17:01:22'),
(50,20,2,2147483647,'support','Bonjour votre ticket seta pris en charge demain','2025-07-10 17:34:01'),
(51,20,2,2147483647,'support','merci','2025-07-10 17:35:32'),
(52,20,3,2147483647,'client','tes','2025-07-10 17:41:04'),
(53,20,2,2147483647,'support','test','2025-07-10 17:41:25'),
(56,20,3,2147483647,'client','iiii','2025-07-10 17:46:05'),
(57,20,2,2147483647,'support','mmm','2025-07-10 17:46:13'),
(58,20,2,2147483647,'support','Melonia','2025-07-10 18:01:44'),
(59,20,3,2147483647,'client','Bonjour votre ticket seta pris en charge demain.','2025-07-10 18:10:30'),
(60,19,2,2147483647,'support','Mais mets quand même les prix dans les produits avant','2025-07-10 18:19:31'),
(61,20,2,2147483647,'support','Bonjour votre ticket seta pris en charge demain','2025-07-10 18:19:55'),
(62,19,2,2147483647,'support','Tiens moi au courant quand tu auras testé apres avoir mis à jour les prix des produits et vidé les cache avant','2025-07-10 18:24:31'),
(63,20,3,2147483647,'client','Bonjour votre ticket seta pris en charge demain.','2025-07-10 18:41:58'),
(64,20,2,2147483647,'support','Bonjour votre ticket seta pris en charge demain.','2025-07-10 18:43:22'),
(65,19,2,2147483647,'support','J\'ai vu que tu as créé une facture, on peut fermer ce ticket ??','2025-07-10 19:35:21'),
(66,19,7,2147483647,'client','La même erreur revient, je ne sais pas si c\'est parce que je laisser ouvert sur un autre poste ou pas','2025-07-11 17:04:07'),
(67,19,7,2147483647,'client','Mais essaie de voir ce que tu peux faire... voir même essaie d\'ouvrir un compte sur plusieurs poste et dit moi...','2025-07-11 17:05:09'),
(68,19,7,2147483647,'client','Même quand je click sur une fenêtre j\'ai la même erruer','2025-07-11 17:06:46');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mouvements_stock`
--

DROP TABLE IF EXISTS `mouvements_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mouvements_stock` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `produit_id` int(11) NOT NULL,
  `societe_id` int(11) NOT NULL,
  `type` enum('ENTREE','SORTIE') NOT NULL,
  `quantite` int(11) NOT NULL,
  `motif` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date_mouvement` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `produit_id` (`produit_id`),
  KEY `user_id` (`user_id`),
  KEY `societe_id` (`societe_id`),
  CONSTRAINT `mouvements_stock_ibfk_1` FOREIGN KEY (`produit_id`) REFERENCES `produits_services` (`id`),
  CONSTRAINT `mouvements_stock_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `mouvements_stock_ibfk_3` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mouvements_stock`
--

LOCK TABLES `mouvements_stock` WRITE;
/*!40000 ALTER TABLE `mouvements_stock` DISABLE KEYS */;
INSERT INTO `mouvements_stock` VALUES
(95,28,2,'SORTIE',1,'Vente',4,'2025-06-23 21:36:31','2025-06-23 19:36:31'),
(96,28,2,'SORTIE',2,'Vente',4,'2025-06-23 21:37:32','2025-06-23 19:37:32'),
(97,29,2,'SORTIE',1,'Vente',4,'2025-06-24 20:21:48','2025-06-24 18:21:48'),
(98,2,2,'SORTIE',1,'Vente',4,'2025-06-25 16:11:32','2025-06-25 14:11:32'),
(99,45,3,'ENTREE',100,'Import de stock',3,'2025-07-10 16:50:53.242','2025-07-10 14:50:53'),
(100,46,3,'ENTREE',50,'Import de stock',3,'2025-07-10 16:50:53.242','2025-07-10 14:50:53'),
(101,47,3,'ENTREE',200,'Import de stock',3,'2025-07-10 16:50:53.242','2025-07-10 14:50:53'),
(102,43,3,'SORTIE',2,'Vol',3,'2025-07-15','2025-07-10 14:54:24'),
(103,43,3,'SORTIE',1,'Casse',3,'2025-07-10','2025-07-10 14:59:06'),
(104,48,7,'ENTREE',0,'Import de stock',52,'2025-07-10 17:18:38.761','2025-07-10 15:18:38'),
(105,49,7,'ENTREE',0,'Import de stock',52,'2025-07-10 17:18:38.761','2025-07-10 15:18:38'),
(106,50,7,'ENTREE',0,'Import de stock',52,'2025-07-10 17:18:38.761','2025-07-10 15:18:38'),
(107,51,7,'ENTREE',0,'Import de stock',52,'2025-07-10 17:18:38.761','2025-07-10 15:18:38'),
(108,52,7,'ENTREE',0,'Import de stock',52,'2025-07-10 17:18:38.761','2025-07-10 15:18:38'),
(109,53,7,'ENTREE',0,'Import de stock',52,'2025-07-10 17:18:38.761','2025-07-10 15:18:38'),
(110,54,7,'ENTREE',0,'Import de stock',52,'2025-07-10 17:18:38.761','2025-07-10 15:18:38'),
(111,55,7,'ENTREE',0,'Import de stock',52,'2025-07-10 17:18:38.761','2025-07-10 15:18:38'),
(112,57,13,'ENTREE',100,'Import de stock',65,'2025-07-28 16:46:50.019','2025-07-28 14:46:50'),
(113,58,13,'ENTREE',50,'Import de stock',65,'2025-07-28 16:46:50.019','2025-07-28 14:46:50'),
(114,59,13,'ENTREE',23,'Import de stock',65,'2025-07-28 16:46:50.019','2025-07-28 14:46:50'),
(115,57,13,'ENTREE',100,'Import de stock',65,'2025-07-28 16:51:04.295','2025-07-28 14:51:04'),
(116,58,13,'ENTREE',50,'Import de stock',65,'2025-07-28 16:51:04.295','2025-07-28 14:51:04'),
(117,59,13,'ENTREE',23,'Import de stock',65,'2025-07-28 16:51:04.295','2025-07-28 14:51:04'),
(118,57,13,'ENTREE',100,'Import de stock',65,'2025-07-28 16:55:28.730','2025-07-28 14:55:28'),
(119,58,13,'ENTREE',50,'Import de stock',65,'2025-07-28 16:55:28.730','2025-07-28 14:55:28'),
(120,59,13,'ENTREE',23,'Import de stock',65,'2025-07-28 16:55:28.730','2025-07-28 14:55:28'),
(121,60,13,'ENTREE',100,'Import de stock',65,'2025-07-28 16:56:52.871','2025-07-28 14:56:52'),
(122,61,13,'ENTREE',50,'Import de stock',65,'2025-07-28 16:56:52.871','2025-07-28 14:56:52'),
(123,62,13,'ENTREE',23,'Import de stock',65,'2025-07-28 16:56:52.871','2025-07-28 14:56:52'),
(124,60,13,'ENTREE',100,'Import de stock',65,'2025-07-28 16:58:17.674','2025-07-28 14:58:17'),
(125,61,13,'ENTREE',50,'Import de stock',65,'2025-07-28 16:58:17.674','2025-07-28 14:58:17'),
(126,62,13,'ENTREE',23,'Import de stock',65,'2025-07-28 16:58:17.674','2025-07-28 14:58:17');
/*!40000 ALTER TABLE `mouvements_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes_frais`
--

DROP TABLE IF EXISTS `notes_frais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notes_frais` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `societe_id` int(11) NOT NULL,
  `periode_debut` date NOT NULL,
  `periode_fin` date NOT NULL,
  `titre` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `total_ht` decimal(10,2) DEFAULT 0.00,
  `total_tva` decimal(10,2) DEFAULT 0.00,
  `total_ttc` decimal(10,2) DEFAULT 0.00,
  `statut` enum('brouillon','soumise','validee','refusee','payee') DEFAULT 'brouillon',
  `date_soumission` timestamp NULL DEFAULT NULL,
  `date_validation` timestamp NULL DEFAULT NULL,
  `validateur_id` int(11) DEFAULT NULL,
  `motif_refus` text DEFAULT NULL,
  `commentaire` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `idx_user` (`user_id`),
  KEY `idx_societe` (`societe_id`),
  KEY `idx_statut` (`statut`),
  KEY `fk_notes_frais_validateur` (`validateur_id`),
  CONSTRAINT `fk_notes_frais_societe` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notes_frais_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notes_frais_validateur` FOREIGN KEY (`validateur_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes_frais`
--

LOCK TABLES `notes_frais` WRITE;
/*!40000 ALTER TABLE `notes_frais` DISABLE KEYS */;
INSERT INTO `notes_frais` VALUES
(1,'NF-0001',4,2,'2025-08-01','2025-08-07','Note de frais semaine 1 août','Frais de déplacement et repas client',150.00,30.00,180.00,'brouillon',NULL,NULL,NULL,NULL,NULL,'2025-08-05 10:00:00','2025-08-08 14:46:09'),
(2,'NF-0002',4,2,'2025-08-08','2025-08-14','Note de frais semaine 2 août','Déplacements clients et formations',275.50,55.10,330.60,'validee','2025-08-08 14:30:00','2025-08-08 14:57:16',4,NULL,NULL,'2025-08-07 09:00:00','2025-08-08 14:57:16'),
(3,'NF-0003',3,3,'2025-08-01','2025-08-07','Frais août - Giorgia','Frais kilométriques et repas',120.00,24.00,144.00,'soumise','2025-08-08 11:15:00',NULL,NULL,NULL,NULL,'2025-08-06 16:30:00','2025-08-08 14:46:09'),
(4,'NF-0004',4,2,'2025-07-22','2025-07-28','Note de frais juillet','Frais de formation et déplacements',89.90,17.98,107.88,'validee','2025-07-29 10:00:00','2025-07-30 15:45:00',4,NULL,NULL,'2025-07-28 14:00:00','2025-08-08 14:46:09'),
(5,'NF-0005',4,2,'2025-08-15','2025-08-21','Note de frais NF-0005','Frais de déplacements et formations',195.25,39.05,234.30,'validee','2025-08-08 15:00:00','2025-08-08 15:02:01',4,NULL,NULL,'2025-08-08 08:00:00','2025-08-08 15:02:01'),
(6,'NF-0006',4,2,'2025-08-12','2025-08-18','Note de frais test création','Test création note via API',0.00,0.00,0.00,'brouillon',NULL,NULL,NULL,NULL,NULL,'2025-08-08 15:08:23','2025-08-08 15:08:23'),
(7,'NF-0007',4,2,'2025-08-04','2025-08-10','Note de frais - 04/08/2025','Nouvelle note de frais',0.00,0.00,0.00,'brouillon',NULL,NULL,NULL,NULL,NULL,'2025-08-08 15:09:35','2025-08-08 15:09:35'),
(8,'NF-0008',4,2,'2025-08-04','2025-08-10','Note de frais - 04/08/2025','Nouvelle note de frais',0.00,0.00,0.00,'brouillon',NULL,NULL,NULL,NULL,NULL,'2025-08-08 15:09:35','2025-08-08 15:09:35'),
(9,'NF-0009',4,2,'2025-08-04','2025-08-10','Note de frais - 04/08/2025','Nouvelle note de frais',0.00,0.00,0.00,'brouillon',NULL,NULL,NULL,NULL,NULL,'2025-08-08 15:09:50','2025-08-08 15:09:50'),
(10,'NF-0010',4,2,'2025-08-04','2025-08-10','Note de frais - 04/08/2025','Nouvelle note de frais',0.00,0.00,0.00,'brouillon',NULL,NULL,NULL,NULL,NULL,'2025-08-08 15:09:50','2025-08-08 15:09:50'),
(11,'NF-0011',4,2,'2025-08-04','2025-08-10','Note de frais - 04/08/2025','Nouvelle note de frais',0.00,0.00,0.00,'brouillon',NULL,NULL,NULL,NULL,NULL,'2025-08-08 15:14:41','2025-08-08 15:14:41'),
(13,'NF-0012',4,2,'2025-08-04','2025-08-10','Note de frais - 04/08/2025','Nouvelle note de frais',0.00,0.00,0.00,'brouillon',NULL,NULL,NULL,NULL,NULL,'2025-08-08 15:14:47','2025-08-08 15:14:47'),
(15,'NF-0013',4,2,'2025-08-04','2025-08-10','Note de frais - 04/08/2025','Nouvelle note de frais',0.00,0.00,0.00,'brouillon',NULL,NULL,NULL,NULL,NULL,'2025-08-08 16:27:35','2025-08-08 16:27:35'),
(17,'NF-0014',4,2,'2025-08-04','2025-08-10','Note de frais - 04/08/2025','Nouvelle note de frais',0.00,0.00,0.00,'brouillon',NULL,NULL,NULL,NULL,NULL,'2025-08-08 16:27:41','2025-08-08 16:27:41'),
(18,'NF-0015',4,2,'2025-08-04','2025-08-10','Note de frais - 04/08/2025','Nouvelle note de frais',0.00,0.00,0.00,'brouillon',NULL,NULL,NULL,NULL,NULL,'2025-08-08 16:27:41','2025-08-08 16:27:41'),
(19,'NF-0016',4,2,'2025-08-04','2025-08-10','Note de frais - 04/08/2025','Nouvelle note de frais',0.00,0.00,0.00,'brouillon',NULL,NULL,NULL,NULL,NULL,'2025-08-08 16:38:02','2025-08-08 16:38:02'),
(20,'NF-0017',4,2,'2025-08-04','2025-08-10','Note de frais - 04/08/2025','Nouvelle note de frais',0.00,0.00,0.00,'brouillon',NULL,NULL,NULL,NULL,NULL,'2025-08-08 16:38:02','2025-08-08 16:38:02');
/*!40000 ALTER TABLE `notes_frais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `options_societe`
--

DROP TABLE IF EXISTS `options_societe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `options_societe` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `societe_id` int(11) NOT NULL,
  `enable_facturation` tinyint(1) DEFAULT 0,
  `enable_recette` tinyint(1) DEFAULT 0,
  `enable_mailing` tinyint(1) DEFAULT 0,
  `enable_relances_auto` tinyint(1) DEFAULT 0,
  `enable_stock` tinyint(1) DEFAULT 0,
  `enable_import_produits_services` tinyint(1) DEFAULT 0,
  `enable_mouvements_stock` tinyint(1) DEFAULT 0,
  `enable_inventaire_manuel` tinyint(1) DEFAULT 0,
  `enable_inventaire_auto` tinyint(1) DEFAULT 0,
  `enable_user_input` tinyint(1) DEFAULT 0,
  `enable_user_limit` tinyint(1) DEFAULT 0,
  `user_limit` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_societe` (`societe_id`),
  CONSTRAINT `fk_societe` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `options_societe`
--

LOCK TABLES `options_societe` WRITE;
/*!40000 ALTER TABLE `options_societe` DISABLE KEYS */;
INSERT INTO `options_societe` VALUES
(3,12,0,0,1,0,1,0,0,0,0,0,0,0,'2025-07-02 17:50:59','2025-07-02 18:19:41'),
(4,6,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2025-07-02 19:06:41','2025-07-02 19:06:41'),
(5,7,1,1,1,1,1,1,1,1,1,1,1,5,'2025-07-02 19:07:17','2025-07-02 19:07:17'),
(6,2,1,NULL,NULL,NULL,1,1,NULL,NULL,NULL,1,NULL,0,'2025-07-05 17:02:35','2025-07-06 00:02:02'),
(7,13,1,1,1,1,0,0,0,0,0,0,0,5,'2025-07-14 17:49:33','2025-07-14 17:49:33');
/*!40000 ALTER TABLE `options_societe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paiements`
--

DROP TABLE IF EXISTS `paiements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `paiements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `facture_id` int(11) DEFAULT NULL,
  `montant` decimal(10,2) NOT NULL,
  `date_paiement` date NOT NULL,
  `mode_paiement` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `facture_id` (`facture_id`),
  CONSTRAINT `paiements_ibfk_1` FOREIGN KEY (`facture_id`) REFERENCES `factures` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paiements`
--

LOCK TABLES `paiements` WRITE;
/*!40000 ALTER TABLE `paiements` DISABLE KEYS */;
/*!40000 ALTER TABLE `paiements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES
(9,'access_reports'),
(2,'create_invoices'),
(4,'delete_invoices'),
(3,'edit_invoices'),
(6,'manage_clients'),
(15,'manage_inventory'),
(11,'manage_invoice_param'),
(13,'manage_stock'),
(8,'manage_users'),
(10,'settings_access'),
(16,'validate_inventory'),
(5,'view_clients'),
(14,'view_inventory'),
(1,'view_invoices'),
(12,'view_stock'),
(7,'view_users');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produits`
--

DROP TABLE IF EXISTS `produits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `produits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `quantite` int(11) NOT NULL,
  `societe_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `facture_id` int(11) DEFAULT NULL,
  `taux_tva` varchar(10) DEFAULT NULL,
  `total_tva` varchar(10) DEFAULT NULL,
  `id_prod_serv` int(11) DEFAULT NULL,
  `stat_stock` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `societe_id` (`societe_id`),
  KEY `fk_id_prod_serv` (`id_prod_serv`),
  CONSTRAINT `fk_id_prod_serv` FOREIGN KEY (`id_prod_serv`) REFERENCES `produits_services` (`id`) ON DELETE CASCADE,
  CONSTRAINT `produits_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=575 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produits`
--

LOCK TABLES `produits` WRITE;
/*!40000 ALTER TABLE `produits` DISABLE KEYS */;
INSERT INTO `produits` VALUES
(539,'Produit A',44.00,1,2,'2025-06-23 19:35:53',221,'20','8.8',28,'UPDATED'),
(540,'Produit A',44.00,2,2,'2025-06-23 19:37:22',222,'20','17.6',28,'UPDATED'),
(541,'Produit B',21.00,1,2,'2025-06-24 18:21:20',223,'20','4.2',29,'UPDATED'),
(543,'Giorgia stick ',38.68,1,2,'2025-06-27 19:33:24',225,'5.5','2.01649289',6,NULL),
(544,'Produit A',44.00,1,2,'2025-06-27 19:34:00',226,'20','7.33333333',28,NULL),
(545,'alexandre ',22.00,1,2,'2025-06-27 19:34:40',227,'20','3.66666666',5,NULL),
(546,'produit 3',3.00,1,2,'2025-06-27 19:34:57',228,'20','0.5',3,NULL),
(547,'Produit d\'entretien',11.00,1,2,'2025-07-06 20:15:51',224,'10%','1',NULL,NULL),
(559,'Macbook',100.00,1,3,'2025-07-10 15:16:16',230,'10%','9.09090909',NULL,NULL),
(560,'Produit B',100.00,1,3,'2025-07-10 15:16:16',230,'20%','16.6666666',NULL,NULL),
(561,'Produit B',33.00,1,3,'2025-07-10 15:16:16',230,'5.5%','1.72037914',NULL,NULL),
(562,'Produit C',499.00,1,3,'2025-07-10 15:16:16',230,'10.00','45.3636363',NULL,NULL),
(563,'Produit C',22.00,1,3,'2025-07-10 15:24:35',231,'20.00','3.66666666',47,NULL),
(564,'Site internet E-commerce',780000.00,1,7,'2025-07-10 18:18:38',232,'9.50','74100',NULL,NULL),
(565,'Logo',50000.00,1,7,'2025-07-10 18:18:38',232,'9.50','4750',NULL,NULL),
(566,'Gestion des réseaux sociaux',50000.00,1,7,'2025-07-10 18:18:38',232,'9.50','4750',NULL,NULL),
(567,'Conception page facebook',25000.00,1,7,'2025-07-10 18:18:38',232,'9.50','2375',NULL,NULL),
(568,'Giorgia stick ',38.68,2,2,'2025-07-10 19:26:59',229,'5.5%','4.03298578',NULL,NULL),
(569,'Produit A',44.00,1,2,'2025-07-10 19:26:59',229,'20%','7.33333333',NULL,NULL),
(570,'test ',22.00,1,2,'2025-07-10 19:26:59',229,'2.1%','0.45249755',NULL,NULL),
(571,'matcha ',10.00,1,13,'2025-07-14 18:21:25',234,'20.00','1.66666666',NULL,NULL),
(572,'Tasses ',6.00,1,13,'2025-07-14 18:21:25',234,'20.00','1',NULL,NULL),
(573,'tasses',20.00,10,13,'2025-07-17 15:20:50',235,'20.00','33.3333333',NULL,NULL),
(574,'matcha',9.00,1,13,'2025-07-17 15:20:50',235,'2.10','0.18511263',NULL,NULL);
/*!40000 ALTER TABLE `produits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produits_services`
--

DROP TABLE IF EXISTS `produits_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `produits_services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `description` varchar(4000) NOT NULL,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `quantite_en_stock` int(11) NOT NULL DEFAULT 0,
  `categorie` varchar(100) DEFAULT NULL,
  `sous_categorie` varchar(100) DEFAULT NULL,
  `seuil_minimum` int(11) NOT NULL DEFAULT 0,
  `fournisseur` varchar(100) DEFAULT NULL,
  `date_derniere_entree` date DEFAULT NULL,
  `societe_id` int(11) NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `statut_inventaire` enum('en_attente','valide','rejete') DEFAULT 'en_attente',
  `stock_reel` int(11) DEFAULT 0,
  `taux_tva` varchar(10) DEFAULT NULL,
  `total_tva` varchar(100) DEFAULT NULL,
  `tva` varchar(10) DEFAULT NULL,
  `prixUnitaireHT` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `societe_id` (`societe_id`),
  CONSTRAINT `produits_services_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produits_services`
--

LOCK TABLES `produits_services` WRITE;
/*!40000 ALTER TABLE `produits_services` DISABLE KEYS */;
INSERT INTO `produits_services` VALUES
(2,'Produit d\'entretien','dzdzd',11.00,0,'Logiciel','ERP',11,NULL,NULL,2,NULL,'en_attente',23,NULL,NULL,'10','10'),
(3,'produit 3','en stock',3.00,4,'Logiciel','Antivirus',5,NULL,NULL,2,NULL,'en_attente',7,NULL,NULL,'20','2.5'),
(5,'alexandre ','test',22.00,0,'Services','Maintenance',9,NULL,NULL,2,NULL,'en_attente',22,NULL,NULL,'20','18.333333333333336'),
(6,'Giorgia stick ','produit de beauté ',38.68,0,'Services','Maintenance',10,NULL,NULL,2,NULL,'en_attente',10,NULL,NULL,'5.5','36.66666666666667'),
(27,'produit test gio','produit de beauté',11.00,22,'Matériel','Imprimantes',5,NULL,NULL,2,NULL,'en_attente',22,NULL,NULL,'20','9.166666666666668'),
(28,'Produit A','Produit test A',44.00,27,'Électronique','Accessoires',10,NULL,NULL,2,NULL,'en_attente',33,NULL,NULL,'20','36.67'),
(29,'Produit B','Produit test B',21.00,32,'Alimentation','Boissons',5,NULL,NULL,2,NULL,'en_attente',33,NULL,NULL,'20','17.5'),
(30,'Produit C','Produit test C',23.83,20,'Bureau','Fournitures',3,NULL,NULL,2,NULL,'en_attente',21,NULL,NULL,'10','21.666666666666668'),
(37,'Pc dell','I3 4Go 500 SSD',288.00,10,'Matériel',NULL,1,NULL,NULL,2,NULL,'en_attente',0,NULL,NULL,'20','240'),
(39,'Produit 2 ','Test',39.60,35,'Services','Installation',5,NULL,NULL,12,NULL,'en_attente',0,NULL,NULL,'20','33'),
(40,'Site dynamique','Web site dynamique',888000.00,0,'Services','Installation',0,NULL,NULL,7,NULL,'en_attente',0,NULL,NULL,'20','740000'),
(41,'Macbook','ordi',100.00,10,'Matériel','PC',5,NULL,NULL,3,NULL,'en_attente',10,NULL,NULL,'10','90.91'),
(42,'Logo','Conception d\'un logo ',60000.00,0,'Services','Installation',0,NULL,NULL,7,NULL,'en_attente',0,NULL,NULL,'20','50000'),
(43,'EEE','EE',36.30,10,'Matériel','PC',5,NULL,NULL,3,NULL,'en_attente',10,NULL,NULL,'10','33'),
(44,'Conception page facebook','Gestion du réseau social',30000.00,0,'Services',NULL,0,NULL,NULL,7,NULL,'en_attente',0,NULL,NULL,'20','25000'),
(45,'Produit A','Produit de test A',0.00,50,'Électronique','Accessoires',10,NULL,'2025-07-10',3,NULL,'en_attente',50,NULL,NULL,NULL,NULL),
(46,'Produit B','Produit de test B',0.00,5,'Bureautique','Fournitures',5,NULL,'2025-07-10',3,NULL,'en_attente',5,NULL,NULL,NULL,NULL),
(47,'Produit C','Produit sans prix/tva',0.00,100,'Informatique','Logiciels',20,NULL,'2025-07-10',3,NULL,'en_attente',100,NULL,NULL,NULL,NULL),
(48,'Site internet Media','Media en ligne',0.00,0,'Service','Installation',0,NULL,'2025-07-10',7,NULL,'en_attente',0,NULL,NULL,NULL,NULL),
(49,'Site entreprise PME&PMI','Site entreprises',0.00,0,'Service','Installation',0,NULL,'2025-07-10',7,NULL,'en_attente',0,NULL,NULL,NULL,NULL),
(50,'Formation Intensive','Formation sur 5 jours',0.00,0,'Service','Formation',0,NULL,'2025-07-10',7,NULL,'en_attente',0,NULL,NULL,NULL,NULL),
(51,'Formation semi-intensive','Formation sur 10 jours',0.00,0,'Service','Formation',0,NULL,'2025-07-10',7,NULL,'en_attente',0,NULL,NULL,NULL,NULL),
(52,'Formation étendu','Formation sur 1 mois',0.00,0,'Service','Formation',0,NULL,'2025-07-10',7,NULL,'en_attente',0,NULL,NULL,NULL,NULL),
(53,'Indentité visuelle','Logo, charte graphique',0.00,0,'Service','Conception',0,NULL,'2025-07-10',7,NULL,'en_attente',0,NULL,NULL,NULL,NULL),
(54,'Gestion des réseaux sociaux','Gestion',0.00,0,'Service','Maintenance',0,NULL,'2025-07-10',7,NULL,'en_attente',0,NULL,NULL,NULL,NULL),
(55,'Site internet E-commerce','Site de vente',0.00,44,'Service','Installation',0,NULL,NULL,7,NULL,'en_attente',0,NULL,NULL,'5.5','0'),
(56,'thé vert de chine 100gr','thé vert de chine 100gr boite aluminium',10.55,20,NULL,NULL,2,NULL,NULL,13,NULL,'en_attente',0,NULL,NULL,'5.5','10'),
(57,'Thé verd fraise ','Thé verd fraise  boite 100g',0.00,300,'boite 100g','Thés verds',10,NULL,'2025-07-28',13,NULL,'en_attente',0,NULL,NULL,NULL,NULL),
(58,'Thé verd gingimbre ','Thé verd gingimbre boite 100g',0.00,150,'boite 100g','Thés verds',10,NULL,NULL,13,NULL,'en_attente',0,NULL,NULL,'5.5','0'),
(59,'Thé verd peche','Thé verd peche boite 100g',0.00,69,'boite 100g','Thés verds',10,NULL,NULL,13,NULL,'en_attente',0,NULL,NULL,'5.5','0'),
(60,'Thé verd citron ','Thé verd fraise  boite 100g',0.00,200,'boite 100g','Thés verds',10,NULL,'2025-07-28',13,NULL,'en_attente',0,NULL,NULL,NULL,NULL),
(61,'Thé verd Mure ','Thé verd gingimbre boite 100g',7.38,100,'boite 100g','Thés verds',10,NULL,NULL,13,NULL,'en_attente',0,NULL,NULL,'5.5','7'),
(62,'Thé verd framboise','Thé verd peche boite 100g',0.00,46,'boite 100g','Thés verds',10,NULL,'2025-07-28',13,NULL,'en_attente',0,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `produits_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projets`
--

DROP TABLE IF EXISTS `projets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `projets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `societe_id` int(11) NOT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_societe` (`societe_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projets`
--

LOCK TABLES `projets` WRITE;
/*!40000 ALTER TABLE `projets` DISABLE KEYS */;
INSERT INTO `projets` VALUES
(1,'Projet général','GENERAL','Projet par défaut pour les frais non spécifiques',2,1,'2025-08-08 14:39:03','2025-08-08 14:39:03'),
(2,'Développement produit','DEV_PROD','Frais liés au développement de nouveaux produits',2,1,'2025-08-08 14:39:03','2025-08-08 14:39:03'),
(3,'Commercial','COMMERCIAL','Frais liés aux activités commerciales',2,1,'2025-08-08 14:39:03','2025-08-08 14:39:03');
/*!40000 ALTER TABLE `projets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES
(1,'Admin'),
(3,'Editor'),
(2,'User');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `societe_parametrage_facturation`
--

DROP TABLE IF EXISTS `societe_parametrage_facturation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `societe_parametrage_facturation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `societe_id` varchar(30) DEFAULT NULL,
  `user_id` varchar(30) DEFAULT NULL,
  `enableQuotes` tinyint(1) DEFAULT NULL,
  `enableInvoices` tinyint(1) DEFAULT NULL,
  `vatRate` decimal(5,2) DEFAULT NULL,
  `vatLabel` varchar(255) DEFAULT NULL,
  `paymentDelay` int(11) DEFAULT NULL,
  `salesConditions` text DEFAULT NULL,
  `showHeaderNotes` tinyint(1) DEFAULT NULL,
  `headerNotes` text DEFAULT NULL,
  `showSalesConditions` tinyint(1) DEFAULT NULL,
  `date_crea` varchar(50) DEFAULT NULL,
  `date_mis_ajou` varchar(50) DEFAULT NULL,
  `enableAutoReminders` tinyint(1) NOT NULL DEFAULT 0,
  `enableTTC` tinyint(1) NOT NULL DEFAULT 0,
  `enableApprovalMention` tinyint(1) NOT NULL DEFAULT 0,
  `enableRecette` tinyint(1) DEFAULT 0,
  `enableMultipleTVA` varchar(10) DEFAULT NULL,
  `stockDeductionTrigger` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `societe_parametrage_facturation`
--

LOCK TABLES `societe_parametrage_facturation` WRITE;
/*!40000 ALTER TABLE `societe_parametrage_facturation` DISABLE KEYS */;
INSERT INTO `societe_parametrage_facturation` VALUES
(3,'2','4',1,1,20.00,'TVA',30,'Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.',0,'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.',0,'2025-02-16 14:43:25','2025-07-09 23:25:37',1,1,0,1,'1','quote_accepted'),
(4,'3','3',1,1,20.00,'TVA',22,'hdtytd uyrdfè§rè',1,'fiufifiufiyufdy mlhkohiugf',1,'2025-02-21 15:43:06','2025-07-10 17:09:40',0,1,1,1,'1','invoice_created'),
(5,'12','58',1,1,20.00,'TVA',1,'',0,'',0,'2025-07-09 23:38:36','2025-07-09 23:58:40',0,0,0,0,'1','quote_accepted'),
(6,'7','52',1,1,20.00,'TVA',1,'',1,'',1,'2025-07-09 23:39:01','2025-07-10 17:19:26',0,0,1,0,'0','quote_accepted'),
(7,'13','65',1,1,20.00,'TVA',30,'Joy est la reine',1,'Joy empoche tous les revenus',1,'2025-07-14 20:07:10','2025-07-14 20:07:10',0,1,1,1,'1','invoice_created');
/*!40000 ALTER TABLE `societe_parametrage_facturation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `societes`
--

DROP TABLE IF EXISTS `societes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `societes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `adresse` varchar(255) DEFAULT NULL,
  `ville` varchar(255) DEFAULT NULL,
  `code_postal` varchar(10) DEFAULT NULL,
  `pays` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `email` varchar(255) DEFAULT NULL,
  `facturation` varchar(1) DEFAULT NULL,
  `comptabilite` varchar(1) DEFAULT NULL,
  `administrative` varchar(1) DEFAULT NULL,
  `personnel` varchar(1) DEFAULT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `companyAddress` varchar(255) DEFAULT NULL,
  `workPhone` varchar(255) DEFAULT NULL,
  `NUME_TVA` varchar(20) DEFAULT NULL,
  `siret` varchar(14) DEFAULT NULL,
  `devise` varchar(14) DEFAULT NULL,
  `LANGUE` varchar(50) DEFAULT NULL,
  `societe_cle` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `societes`
--

LOCK TABLES `societes` WRITE;
/*!40000 ALTER TABLE `societes` DISABLE KEYS */;
INSERT INTO `societes` VALUES
(2,NULL,'Lyon','75000','France','2024-09-20 18:01:49','contact@societe.com','N','N','N','N','Le coin de la fête ','123 Rue de l\'Entreprise','+33 1 23 45 36 15','FR12345678900','12345678903615','€','fr','92f0d1c8e7314bcfbf43a9dd3b75f1ef7dca9e10f47e8a3d8c60cda9f0d7b263'),
(3,NULL,'Paris','75000','France','2024-09-20 18:10:58','contact@societe.com','N','N','N','N','Minutescoop','123 Rue de l\'Entreprise','+33 1 23 45 67 89','FR12345678900','86587576','CFA','fr',NULL),
(4,NULL,NULL,NULL,NULL,'2025-02-09 00:25:41','vincerudy@hotmail.fr','N','N','N','N','Bonnieres','7 rue de ka houssaye','0188991122',NULL,NULL,NULL,NULL,NULL),
(5,NULL,NULL,NULL,NULL,'2025-03-01 10:30:15','miroiterie@gmail.com','N','N','N','N','Miroiterie','7 rue de a houssaye, bonnieres sur seine','0788998888',NULL,NULL,NULL,NULL,NULL),
(6,NULL,NULL,NULL,NULL,'2025-06-01 18:51:32','vincerudy@gmail.com','N','N','N','N','Bonnieres','17 rue de pascal','00388393933',NULL,NULL,NULL,NULL,NULL),
(7,NULL,'Libreville','78279','Gabon','2025-07-01 19:54:35','maixendan@gmail.com','N','N','N','N','MXDEV Consulting','Derrière la pédiatrie','+24166544484','19','NSG6687878','CFA','fr',NULL),
(8,NULL,NULL,NULL,NULL,'2025-07-02 10:19:46','alexandre@hotmail.fr','N','N','N','N','Société enfant','7 rue de la houssaye, bonnieres sur seine','0665248951',NULL,NULL,NULL,NULL,NULL),
(9,NULL,NULL,NULL,NULL,'2025-07-02 10:23:29','alexandre@hotmail.fr','N','N','N','N','Société enfant','7 rue de la houssaye, bonnieres sur seine','0665248951',NULL,NULL,NULL,NULL,NULL),
(12,NULL,'Bonnieres sur seine','78270','France','2025-07-02 17:50:59','bonnieres@gmail.com','N','N','N','N','MEDIA QUERY','7 rue de la houssaye','06652388','FR12345678900','12345678903615','$','fr',NULL),
(13,NULL,'Bonnières-sur-Seine','78270','France','2025-07-14 17:49:33','vincerudy@outlook.fr','N','N','N','N','Joy.sarl','7 rue de derriere la prison','0898772633','FR12345678900','123 456 789 00','€','fr',NULL);
/*!40000 ALTER TABLE `societes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `societe_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Ouvert',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  `priority` varchar(20) DEFAULT NULL,
  `assigned_to` varchar(30) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_ticket_societe` (`societe_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_ticket_societe` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES
(1,2,'Problème de connexion','Problème technique','<p>Je n\'arrive pas à me connecter à mon compte depuis hier.</p>','Terminé','2025-07-05 01:14:56','2025-07-10 21:04:31',NULL,NULL,NULL),
(2,2,'Problème de connexion','Problème technique','<p>Je n\'arrive pas à me connecter à mon compte depuis hier.</p>','Terminé','2025-07-05 01:22:48','2025-07-10 21:04:41',NULL,NULL,NULL),
(3,2,'Problème de connexion','Anomalie','<p>Je n\'arrive pas à me connecter à mon compte depuis hier.</p>','Terminé','2025-07-05 01:23:09','2025-07-10 21:05:54',NULL,NULL,NULL),
(4,2,'Problème de connexion','Problème technique','<p>Je n\'arrive pas à me connecter à mon compte depuis hier. vince mouko</p>','Terminé','2025-07-05 02:06:49','2025-07-10 21:04:22',NULL,NULL,NULL),
(5,2,'Problème de connexion','Anomalie','<p>Je n\'arrive pas à me connecter à mon compte depuis hier.</p>','Terminé','2025-07-05 02:17:18','2025-07-06 14:02:03',NULL,NULL,NULL),
(6,2,'Impossible de se connecter','Anomalie','<p>Je n\'arrive pas à me connecter à mon compte depuis hier.</p>','En cours','2025-07-05 02:19:20','2025-07-05 02:19:20',NULL,NULL,NULL),
(7,2,'Impossible de se connecter','Anomalie','<p>Je n\'arrive pas à me connecter à mon <strong>compte depuis hier. test hier</strong></p>','Terminé','2025-07-05 02:20:11','2025-07-10 15:51:05',NULL,NULL,NULL),
(8,2,'Problème de connexion','Anomalie','<p>Je n\'arrive pas à me connecter à mon compte depuis hier.</p>','Terminé','2025-07-05 02:36:27','2025-07-10 21:06:25',NULL,NULL,NULL),
(9,2,'test ticket','Assistance','<p>test</p>','Terminé','2025-07-05 14:04:07','2025-07-06 14:06:13',NULL,NULL,NULL),
(10,2,'ticket test','Assistance','<p>test</p>','Terminé','2025-07-08 13:12:39','2025-07-10 16:34:15',NULL,NULL,NULL),
(11,2,'ticket elton','Assistance','<p>test ticket elton</p>','Terminé','2025-07-08 15:10:43','2025-07-09 07:31:58',NULL,NULL,NULL),
(12,7,'Les parametres de config des facturations ne fonctionne toujours pas','Anomalie','<p><br></p>','Terminé','2025-07-09 19:34:45','2025-07-10 16:34:27',NULL,NULL,NULL),
(13,7,'Les parametres de config des facturations ne fonctionne toujours pas','Anomalie','<p><br></p>','Terminé','2025-07-09 19:34:56','2025-07-09 19:34:56',NULL,NULL,NULL),
(14,12,'test','Assistance','<p>test</p>','Terminé','2025-07-09 19:50:16','2025-07-10 16:34:38',NULL,NULL,NULL),
(15,7,'test ticket ','Assistance','<p>test</p>','Terminé','2025-07-09 19:53:05','2025-07-10 16:33:58',NULL,NULL,NULL),
(16,7,'Test de saisie','Anomalie','<p><br></p>','Terminé','2025-07-09 21:16:52','2025-07-10 16:33:35',NULL,NULL,NULL),
(17,7,'Test de saisie','Anomalie','<p>Je viens de tester sur 2 mac</p>','Terminé','2025-07-09 21:17:00','2025-07-10 16:33:07',NULL,NULL,NULL),
(18,3,'Ticket de test','Assistance','<p>Je ne sais pas comment créer une facture</p>','Terminé','2025-07-09 23:24:02','2025-07-10 16:32:48',NULL,NULL,NULL),
(19,7,'Erreur lors de l\'envoie de devis','Anomalie','<p>Quand je choisis un produit la facture ou le devis m\'envoie une erreur.</p>','Terminé','2025-07-10 15:32:20','2025-07-10 21:03:21',NULL,NULL,52),
(20,3,'test','Anomalie','<p>test</p>','Terminé','2025-07-10 17:20:53','2025-07-10 21:03:54',NULL,NULL,3),
(21,13,'paramétrage de la facturation','','<p>Lorsque le client n\'a pas encore parametré le paramétrage de la facturation, mettre un message sur les pages qui s\'affichent vids</p>','En attente','2025-07-14 17:53:48','2025-07-14 17:53:48',NULL,NULL,65),
(22,13,'paramétrage de la facturation','','<p>Lorsque le client n\'a pas encore parametré le paramétrage de la facturation, mettre un message sur les pages qui s\'affichent vids</p>','En attente','2025-07-14 17:54:23','2025-07-14 17:54:23',NULL,NULL,65),
(23,13,'Ticket','','<p>Une fois que le ticket a été créé, rediriger le client vers la liste des tickets</p><p><br></p>','En attente','2025-07-14 17:55:31','2025-07-14 17:55:31',NULL,NULL,65),
(24,13,'relances automatiques','','<p>desactiver l\'ongler relances automatiques</p>','En attente','2025-07-14 17:58:46','2025-07-14 17:58:46',NULL,NULL,65),
(25,13,'Bouton enregistrer','','<p>Dans les paramétragres facturation, déplacer le bouton \"enregistrer\" en bas à gauche (pour uniformiser sa position avec les paramétrages généraux</p>','En attente','2025-07-14 18:09:41','2025-07-14 18:09:41',NULL,NULL,65),
(26,13,'Devis','','<p>Lorsque le client télécharge le devis, changer la denomination \"facture\" en \"devis\"</p><p><br></p>','En attente','2025-07-14 18:24:29','2025-07-14 18:24:29',NULL,NULL,65),
(27,13,' bouton \"devis accepté\"','','<p>soit tu enlève le bouton \"devis accepté\" soit quand tu acceptes le devis, soit tu mets une mention \"accepté\" sur le devis, </p>','En attente','2025-07-17 14:18:59','2025-07-17 14:18:59',NULL,NULL,65),
(28,13,'Postdatation du paiement de la facture','','<p>l\'enlever</p>','En attente','2025-07-17 15:22:37','2025-07-17 15:22:37',NULL,NULL,65),
(29,13,'Gestion des stocks ','','<p>Quand tu veux ajouter un produit, ajouter d\'autres catégories ?</p><p>Laisser la possibilité au client d\'ajouter des nouvelles catégories ?</p><p><br></p><p><br></p>','En attente','2025-07-28 14:04:01','2025-07-28 14:04:01',NULL,NULL,65),
(30,13,'tickets ','','<p>ajouter la possibilté de mettre des captures écran</p>','En attente','2025-07-28 14:07:04','2025-07-28 14:07:04',NULL,NULL,65),
(31,13,'Suppression d\'un article','','<p>Je n\'arrive pas à supprimer un article</p>','En attente','2025-07-28 14:48:57','2025-07-28 14:48:57',NULL,NULL,65),
(32,13,'Insertion produit','','<p>Lorsqu\'on insère des produits via fichier XLS le logiciel ne tient pas compte du prix </p><p>et lorsque l\'on modifie l\'article manuellement, la prix ne se met pas à jour, ça reste à 0</p>','En attente','2025-07-28 15:01:35','2025-07-28 15:01:35',NULL,NULL,65),
(33,13,'Insertion produit','','<p>Lorsqu\'on insère des produits via fichier XLS le logiciel ne tient pas compte du prix </p><p>et lorsque l\'on modifie l\'article manuellement, la prix ne se met pas à jour, ça reste à 0</p>','En attente','2025-07-28 15:09:47','2025-07-28 15:09:47',NULL,NULL,65);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tva`
--

DROP TABLE IF EXISTS `tva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tva` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `societe_id` int(11) NOT NULL,
  `libelle` varchar(255) NOT NULL,
  `taux` decimal(5,2) NOT NULL,
  `active` enum('O','N') DEFAULT 'O',
  `ordre` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `societe_id` (`societe_id`),
  CONSTRAINT `tva_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tva`
--

LOCK TABLES `tva` WRITE;
/*!40000 ALTER TABLE `tva` DISABLE KEYS */;
INSERT INTO `tva` VALUES
(25,2,'TVA ',20.00,'O',2),
(26,2,'TVA',10.00,'O',3),
(27,2,'TVA ',2.10,'O',1),
(28,2,'TVA ',5.50,'O',4),
(29,3,'TVA ',5.50,'O',4),
(30,3,'TVA ',10.00,'O',3),
(31,3,'TVA ',2.10,'O',1),
(32,3,'TVA ',20.00,'O',2),
(33,7,'TPS',9.50,'O',1),
(34,7,'CSS',1.00,'O',2),
(35,7,'TVA ',2.10,'N',3),
(36,7,'TVA ',5.50,'N',4),
(37,13,'TVA Accessoires',20.00,'O',1),
(38,13,'TVA consommables',10.00,'O',2),
(39,13,'TVA pain',2.10,'O',3),
(40,13,'TVA thé',6.00,'O',4);
/*!40000 ALTER TABLE `tva` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `types_frais`
--

DROP TABLE IF EXISTS `types_frais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `types_frais` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `types_frais`
--

LOCK TABLES `types_frais` WRITE;
/*!40000 ALTER TABLE `types_frais` DISABLE KEYS */;
INSERT INTO `types_frais` VALUES
(1,'Transport - Kilomètres','KM','Frais kilométriques pour véhicule personnel',1,'2025-08-08 14:39:03','2025-08-08 14:39:03'),
(2,'Transport - Taxi/VTC','TAXI','Frais de taxi, VTC, ou transport à la demande',1,'2025-08-08 14:39:03','2025-08-08 14:39:03'),
(3,'Transport - Train/Bus','TRANSPORT_PUBLIC','Transport en commun : train, bus, métro',1,'2025-08-08 14:39:03','2025-08-08 14:39:03'),
(4,'Transport - Avion','AVION','Billets d\'avion pour déplacements professionnels',1,'2025-08-08 14:39:03','2025-08-08 14:39:03'),
(5,'Hébergement - Hôtel','HOTEL','Nuitées d\'hôtel lors de déplacements',1,'2025-08-08 14:39:03','2025-08-08 14:39:03'),
(6,'Hébergement - Autre','HEBERGEMENT_AUTRE','Autres types d\'hébergement (AirBnB, etc.)',1,'2025-08-08 14:39:03','2025-08-08 14:39:03'),
(7,'Repas - Client','REPAS_CLIENT','Repas avec clients ou prospects',1,'2025-08-08 14:39:03','2025-08-08 14:39:03'),
(8,'Repas - Déplacement','REPAS_DEPLACEMENT','Repas lors de déplacements professionnels',1,'2025-08-08 14:39:03','2025-08-08 14:39:03'),
(9,'Fournitures - Bureau','FOURNITURES','Fournitures de bureau et petit matériel',1,'2025-08-08 14:39:03','2025-08-08 14:39:03'),
(10,'Téléphone - Professionnel','TELEPHONE','Frais de téléphone professionnel',1,'2025-08-08 14:39:03','2025-08-08 14:39:03'),
(11,'Internet - Connexion','INTERNET','Frais de connexion internet professionnel',1,'2025-08-08 14:39:03','2025-08-08 14:39:03'),
(12,'Formation','FORMATION','Frais de formation et développement professionnel',1,'2025-08-08 14:39:03','2025-08-08 14:39:03'),
(13,'Autres frais','AUTRES','Autres frais professionnels divers',1,'2025-08-08 14:39:03','2025-08-08 14:39:03');
/*!40000 ALTER TABLE `types_frais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `upload_fichier`
--

DROP TABLE IF EXISTS `upload_fichier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `upload_fichier` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fk` int(11) DEFAULT NULL,
  `societe_id` int(11) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `date_ajout` timestamp NOT NULL DEFAULT current_timestamp(),
  `file_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `societe_id` (`societe_id`),
  CONSTRAINT `upload_fichier_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `upload_fichier`
--

LOCK TABLES `upload_fichier` WRITE;
/*!40000 ALTER TABLE `upload_fichier` DISABLE KEYS */;
INSERT INTO `upload_fichier` VALUES
(1,NULL,2,'/uploads/1751651733462.png','2024-10-06 11:06:20','SOCI_IMG_LOGO'),
(3,NULL,3,'/uploads/1737289683000.png','2024-10-12 12:55:58','SOCI_IMG_LOGO'),
(4,0,2,'/uploads/1751651733462.png','2025-05-30 10:23:29','SOCI_IMG_LOGO'),
(5,0,2,'/uploads/1751651733462.png','2025-05-30 10:31:16','SOCI_IMG_LOGO'),
(6,5,2,'/uploads/1751651733462.png','2025-05-30 11:33:42','SOCI_IMG_LOGO'),
(7,6,2,'/uploads/1751651733462.png','2025-05-30 12:53:18','SOCI_IMG_LOGO'),
(8,20,2,'/uploads/1751651733462.png','2025-05-31 17:57:44','SOCI_IMG_LOGO'),
(9,21,2,'/uploads/1751651733462.png','2025-05-31 18:39:14','SOCI_IMG_LOGO'),
(10,7,2,'/uploads/1751651733462.png','2025-05-31 22:47:11','SOCI_IMG_LOGO'),
(11,8,2,'/uploads/1751651733462.png','2025-05-31 23:38:19','SOCI_IMG_LOGO'),
(12,27,2,'/uploads/1751651733462.png','2025-06-01 19:07:17','SOCI_IMG_LOGO'),
(13,6,2,'/uploads/1751651733462.png','2025-06-21 18:07:00','SOCI_IMG_LOGO'),
(14,32,2,'/uploads/1751651733462.png','2025-06-29 18:08:47','SOCI_IMG_LOGO'),
(15,36,2,'/uploads/1751651733462.png','2025-06-29 18:30:55','SOCI_IMG_LOGO'),
(16,44,2,'/uploads/1751651733462.png','2025-06-29 19:57:58','SOCI_IMG_LOGO'),
(17,4,2,'/uploads/1751651733462.png','2025-06-30 14:27:05','SOCI_IMG_LOGO'),
(19,47,2,'/uploads/1751651733462.png','2025-06-30 15:15:09','SOCI_IMG_LOGO'),
(20,4,2,'/uploads/users/1751652428315.png','2025-07-04 18:07:08','USER_PHOTO_PROFIL'),
(21,NULL,7,'/uploads/1751970581211.png','2025-07-08 10:29:34','SOCI_IMG_LOGO'),
(22,47,2,'/uploads/users/1752011593757.jpeg','2025-07-08 21:53:13','USER_PHOTO_PROFIL'),
(23,37,2,'uploads/prod-1752045451018-627272312.jpg','2025-07-09 07:17:31','PROD_IMG_DESC'),
(25,52,7,'/uploads/users/1752158065298.jpg','2025-07-10 14:34:25','USER_PHOTO_PROFIL'),
(26,44,7,'uploads/prod-1752159026121-448433479.jpg','2025-07-10 14:50:26','PROD_IMG_DESC'),
(27,56,13,'uploads/prod-1753711765115-137851803.png','2025-07-28 14:09:25','PROD_IMG_DESC');
/*!40000 ALTER TABLE `upload_fichier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_permissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `permission` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_user` (`user_id`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=436 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_permissions`
--

LOCK TABLES `user_permissions` WRITE;
/*!40000 ALTER TABLE `user_permissions` DISABLE KEYS */;
INSERT INTO `user_permissions` VALUES
(136,3,'view_invoices','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(137,3,'create_invoices','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(138,3,'manage_invoices','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(139,3,'view_quotes','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(140,3,'manage_quotes','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(141,3,'manage_invoice_param','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(142,3,'view_recette_page','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(143,3,'view_clients','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(144,3,'manage_clients','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(145,3,'view_users','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(146,3,'manage_users','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(147,3,'access_reports','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(148,3,'campany_setting','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(149,3,'settings_access','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(150,3,'view_stock','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(151,3,'manage_stock','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(152,3,'create_product','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(153,3,'manage_inventory','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(154,3,'validate_inventory','2025-07-01 15:37:02','2025-07-01 15:37:02'),
(157,51,'view_invoices','2025-07-01 15:41:53','2025-07-01 15:41:53'),
(158,51,'view_quotes','2025-07-01 15:41:53','2025-07-01 15:41:53'),
(292,52,'view_invoices','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(293,52,'create_invoices','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(294,52,'manage_invoices','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(295,52,'manage_invoice_param','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(296,52,'view_quotes','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(297,52,'manage_quotes','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(298,52,'view_recette_page','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(299,52,'view_clients','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(300,52,'manage_clients','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(301,52,'view_users','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(302,52,'manage_users','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(303,52,'access_reports','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(304,52,'campany_setting','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(305,52,'settings_access','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(306,52,'view_stock','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(307,52,'manage_stock','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(308,52,'create_product','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(309,52,'manage_inventory','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(310,52,'validate_inventory','2025-07-01 20:45:27','2025-07-01 20:45:27'),
(353,4,'view_invoices','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(354,4,'create_invoices','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(355,4,'manage_invoices','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(356,4,'manage_invoice_param','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(357,4,'view_quotes','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(358,4,'manage_quotes','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(359,4,'view_recette_page','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(360,4,'view_clients','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(361,4,'manage_clients','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(362,4,'view_users','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(363,4,'manage_users','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(364,4,'access_reports','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(365,4,'campany_setting','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(366,4,'settings_access','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(367,4,'view_stock','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(368,4,'manage_stock','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(369,4,'create_product','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(370,4,'manage_inventory','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(371,4,'validate_inventory','2025-07-01 21:01:24','2025-07-01 21:01:24'),
(376,54,'user_admin_full_acces_control','2025-07-02 10:23:29','2025-07-02 10:23:29'),
(377,55,'view_invoices','2025-07-02 10:25:32','2025-07-02 10:25:32'),
(380,58,'user_admin_full_acces_control','2025-07-02 17:50:59','2025-07-02 17:50:59'),
(395,61,'create_invoices','2025-07-08 10:59:28','2025-07-08 10:59:28'),
(396,60,'view_invoices','2025-07-08 21:33:11','2025-07-08 21:33:11'),
(397,60,'create_invoices','2025-07-08 21:33:11','2025-07-08 21:33:11'),
(399,62,'view_invoices','2025-07-08 21:34:39','2025-07-08 21:34:39'),
(425,47,'view_invoices','2025-07-08 22:06:28','2025-07-08 22:06:28'),
(426,47,'create_invoices','2025-07-08 22:06:28','2025-07-08 22:06:28'),
(427,47,'view_quotes','2025-07-08 22:06:28','2025-07-08 22:06:28'),
(428,47,'view_stock','2025-07-08 22:06:28','2025-07-08 22:06:28'),
(429,47,'view_clients','2025-07-08 22:06:28','2025-07-08 22:06:28'),
(430,49,'view_invoices','2025-07-08 22:12:57','2025-07-08 22:12:57'),
(431,63,'view_invoices','2025-07-09 19:47:48','2025-07-09 19:47:48'),
(432,63,'create_invoices','2025-07-09 19:47:48','2025-07-09 19:47:48'),
(433,64,'view_invoices','2025-07-10 14:35:45','2025-07-10 14:35:45'),
(434,64,'create_invoices','2025-07-10 14:35:45','2025-07-10 14:35:45'),
(435,65,'user_admin_full_acces_control','2025-07-14 17:49:33','2025-07-14 17:49:33');
/*!40000 ALTER TABLE `user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `birthDate` varchar(30) DEFAULT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `companyAddress` varchar(255) DEFAULT NULL,
  `workPhone` varchar(30) DEFAULT NULL,
  `personalPhone` varchar(30) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `societe_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiration` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `societe_id` (`societe_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(3,'olivagiorgia93@gmail.com',1,'Giorgia','Oliva','1993-04-09','','','','077777777','$2b$10$OjY5ZEBkeWtgJUIoqS7EV.XjkSo3t4ibsfBzcvI/V20HDZIzk9YbC',3,'2024-09-20 18:10:58','actif',NULL,NULL),
(4,'idnovation2014@gmail.com',0,'Vince ','Rudy',NULL,'','7 rue de la Houssaye','0695447522','066884638','$2b$10$YoROMWRhcICNmFtBd.MR4.hDOYcEy.uvfmFp8lfUEA.onomMA1jVi',2,'2024-09-20 18:01:49','actif','2c66822b0f1144b5b19e447362c5a826adecd405f3bc8e440eecf74fa527802f','2025-07-06 02:19:39'),
(5,'vincerudy@hotmail.fr',0,'Mouko','vince','1987-02-12',NULL,NULL,NULL,'0665248951','$2b$10$WBTcbRLqonrqfj5jTi7QE.YuYdktM81RmmsGwi2omAv2Px/q9UFla',4,'2025-02-09 00:25:41','actif','7c022514338d32fc16ff361bf196a72022e369158efa33ad8ea4871dec9ce3a3','2025-05-19 14:06:43'),
(6,'miroiterie@gmail.com',0,'Dos Santos','Richard','1987-12-28',NULL,NULL,NULL,'066666666','$2b$10$ZbJxmA2NYKGqcQoIazs58OAl43eqto19kQpR7038klJEOFNI7sTX.',5,'2025-03-01 10:30:15','actif',NULL,NULL),
(47,'elton@gmail.com',0,'Elton ','John','2025-07-08','IDNOVA','7 Rue de la Houssaye','0695447522','0695447522','$2b$10$lKGNgyrhstqTulOZF2BZ5.gqNWmQo/bttku6EfXtll0gPWYC2Fu8q',2,'2025-06-30 14:19:21','actif',NULL,NULL),
(48,'lebron@gmail.com',0,'lebron ','james',NULL,'','','','','$2b$10$SFy3Axt59r3fII87cMlm4.HnXyW9tMR63wPIZRMrsfNF5hYMgELLu',2,'2025-06-30 16:22:42','inactif',NULL,NULL),
(49,'compta@gmail.com',0,'Comptable','Général',NULL,'','','','','$2b$10$5hGMISJ7Q8apUwJ9eOYz5.VSvaWqS6OebwJI1M92nY4XPSF9SSPKC',2,'2025-06-30 16:27:12','actif',NULL,NULL),
(50,'al@gmail.com',2,'Alexandre','Mouko','2025-07-22','','','0695447522','','$2b$10$Jji2WBPoMkKGE1j9iQAnO.gFpm.reulgcMjCabqaBA/T6jGg8.HOi',2,'2025-06-30 16:35:12','actif',NULL,NULL),
(51,'m@gmail.com',2,'Vince','MOUK','2025-07-21','','','0695447522','','$2b$10$gAolLwEsolZwTHNNHTTDYOAIotAWkzANTy9JkZW5TFOf3n1qwHete',3,'2025-07-01 15:41:53','inactif',NULL,NULL),
(52,'maixendan@gmail.com',0,'Dakson','Maixant ',NULL,'','','','066544484','$2b$10$jaaqWewZDdXrZLHQNuZWBuCzWHtz8YwEJRL5AFp4EMGx.ys2f8FZ2',7,'2025-07-01 19:54:35','actif',NULL,NULL),
(54,'alexandre@hotmail.fr',0,'Mouko','Alexandre','2025-04-06',NULL,NULL,NULL,'0665248952','$2b$10$uNBXIc7YagNbRTq6B..l2.qAP0a8NnCJrnqbQqGRzNimTnW3ciA5S',9,'2025-07-02 10:23:29','actif',NULL,NULL),
(55,'user@gmail.com',0,'User','test',NULL,'','7 rue de la Houssaye','0695447522','','$2b$10$FTW0XK4GuPTzsO9y82/JYuHdRieITjZ85PoZDXRs.fHglWdpZueba',9,'2025-07-02 10:25:32','actif',NULL,NULL),
(58,'bonnieres@gmail.com',0,'MOUKO M','Vince Rudy','1987-10-28','','','','0665222799','$2b$10$XaLJGqbYP5gWzQkNQz/zwOED/HDKh0uPyRD3.gUjyl5tbj/czaSU2',12,'2025-07-02 17:50:59','actif',NULL,NULL),
(60,'ware@gmail.com',0,'Miles','WARE',NULL,'','7 rue de la Houssaye','0695447522','','$2b$10$M9oFqa2r1M.u7pmH0eYtQOGRSpznxNspWwciygNphTnc0Ft8qD.qe',2,'2025-07-04 17:44:32','actif',NULL,NULL),
(61,'idnovation@gmail.com',0,'Giorgia','Oliva',NULL,'IDNOVA','7 rue de la Houssaye','0695447522','','$2b$10$hGmjVMpgzXVb6uxl3JQsfOO5H5qijfEAUjWYz3nyziaoTzhBuAUsq',2,'2025-07-08 10:59:28','actif',NULL,NULL),
(62,'o93@gmail.com',0,'Giorgia','O',NULL,'','7 rue de la Houssaye','0695447522','','$2b$10$xM8lnHPwW524.1r5glacDOEKIHW4sUuWhEGeN3xwTcni.Qpa3SUOW',2,'2025-07-08 21:34:23','actif',NULL,NULL),
(63,'test@hotmail.fr',0,'test','test','2025-07-09','IDNOVA','7 rue de la Houssaye','0695447522','','$2b$10$SyyEkxIVNBNTVXfCar5y3eddrSr56khd6RaxKYbUQmd9kVLI6so0m',12,'2025-07-09 19:47:48','actif',NULL,NULL),
(64,'alex@gmail.com',0,'Alexandre','MOUKO','2025-04-06','','7 Rue de la Houssaye','0665248951','','$2b$10$0K48eSnJ8bOQiMgqzFnjHe7Ju2/WkEx2in4SUH0ln.eehPEJatFuS',3,'2025-07-10 14:35:45','actif',NULL,NULL),
(65,'vincerudy@outlook.fr',0,'Joy','Mouko','2010-02-14',NULL,NULL,NULL,'098272637738','$2b$10$BugRghzJyWJQKSyYuQ9w4O0Z/XdEBBIlFdDQJjYxwjp7k6yF6FMke',13,'2025-07-14 17:49:33','actif',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-08 16:40:14
