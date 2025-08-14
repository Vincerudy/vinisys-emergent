-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:8889
-- Généré le : jeu. 07 août 2025 à 10:07
-- Version du serveur : 5.7.39
-- Version de PHP : 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `vinisys`
--

-- --------------------------------------------------------

--
-- Structure de la table `alertes_facturation`
--

CREATE TABLE `alertes_facturation` (
  `id` int(11) NOT NULL,
  `societe_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date_alerte` varchar(255) DEFAULT NULL,
  `jours_avant` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `date_creation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `alertes_facturation`
--

INSERT INTO `alertes_facturation` (`id`, `societe_id`, `user_id`, `date_alerte`, `jours_avant`, `titre`, `description`, `date_creation`, `date_modification`) VALUES
(96, 2, 4, '29/06/2025', 1, 'Programmer les entretiens annuell de l\'équipe', 'entretien annuel ', '2025-03-22 23:30:51', '2025-06-29 12:35:32'),
(97, 2, 4, '27/06/2025', 1, 'Vérifier les message sur leboncoin', 'Message Leboncoin', '2025-03-22 23:31:52', '2025-06-27 19:35:24'),
(102, 3, 3, '06/08/2025', 1, 'test today', 'test', '2025-03-26 18:35:19', '2025-08-06 21:09:55'),
(104, 2, 4, '30/06/2025', 5, 'test', 'dd', '2025-05-10 14:37:34', '2025-06-27 19:32:44'),
(105, 2, 4, '27/06/2025', 1, 'rappel', 'test', '2025-05-18 13:22:50', '2025-06-27 19:32:24'),
(106, 2, 4, '08/07/2025', 1, 'faire la gamelle', 'faire la gamelle', '2025-06-01 19:19:03', '2025-07-08 21:55:29'),
(107, 2, 4, '08/07/2025', 1, 'test alerte', 'TEST', '2025-07-06 14:31:14', '2025-07-08 14:59:17'),
(108, 2, 4, '09/07/2025', 1, 'Me rappeler de commcer le module dépense ', 'Module de dépenses ', '2025-07-06 14:37:19', '2025-07-06 14:37:19'),
(111, 12, 58, '11/07/2025', 1, 'Alertes de messagerie ', 'Message ', '2025-07-09 23:08:28', '2025-07-09 23:09:12'),
(112, 2, 4, '07/08/2025', 1, 'test alerte', 'test', '2025-08-06 22:55:56', '2025-08-06 22:55:56'),
(113, 13, 65, '07/08/2025', 1, 'Verifier les ticket traité', 'Il faudra vérifier les ticket traité car la demande de Maixen et tes ticket on été traités', '2025-08-06 23:33:06', '2025-08-06 23:33:06');

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `ville` varchar(255) DEFAULT NULL,
  `code_postal` varchar(10) DEFAULT NULL,
  `pays` varchar(50) DEFAULT NULL,
  `societe_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `phone` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `nom`, `email`, `adresse`, `ville`, `code_postal`, `pays`, `societe_id`, `created_at`, `phone`) VALUES
(7, 'Les amours', 'La@gmail.com', '22 rue de Fresnes', 'Maison alfort', '94200', 'France', 3, '2024-09-22 10:15:35', NULL),
(24, 'Maixen.', 'vincerudy@hotmail.fr', '7 rue de la fete ', 'Paris', '75020', 'France', 2, '2024-09-29 17:57:34', '0665248951'),
(25, 'Rudy Vince', 'vincerudy@hotmail.fr', 'Cours de Vincennes', 'Paris', '75020', 'France', 2, '2025-03-08 23:38:27', '0783322320'),
(26, 'Giorgia Oliva ', 'olivagiorgia93@gmail.com', '7 rue de la Houssaye', 'Bonnieres sur seine', '78270', 'France', 2, '2025-03-09 01:45:07', '0695447522'),
(38, 'Giorgia Oliva', 'mMlivagiorgia93@gmail.com', '7 rue de la Houssaye', 'Bonnieres sur seine', '78270', 'France', 2, '2025-07-10 13:38:08', '0695447522'),
(40, 'Alexandre', 'alex@gmail.com', '7 Rue de la Houssaye', 'Bonnieres sur seine', '78270', 'France', 3, '2025-07-10 15:10:49', '0665248951'),
(41, 'Maixen Dan', 'maixendan@gmail.com', '20333', 'Libreville', NULL, 'Gabon', 7, '2025-07-10 15:19:44', '06544484'),
(42, 'Kusmi Tea', 'kusmitea@gmail.com', NULL, 'paris', NULL, NULL, 13, '2025-07-14 18:15:05', '0987665689'),
(43, 'olivier Girou', 'olivier@gmail.com', '7 rue de la Houssaye', 'Bonnieres sur seine', '78270', 'France', 2, '2025-08-06 23:04:05', '0695447522');

-- --------------------------------------------------------

--
-- Structure de la table `commandes`
--

CREATE TABLE `commandes` (
  `id` int(11) NOT NULL,
  `client_id` int(11) DEFAULT NULL,
  `societe_id` int(11) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `date_commande` date NOT NULL,
  `statut` enum('en attente','expédiée','livrée') DEFAULT 'en attente',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `conversation`
--

CREATE TABLE `conversation` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `match_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text,
  `audio_path` text,
  `language` varchar(10) DEFAULT NULL,
  `timestamp` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
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
  `isExecutive` tinyint(1) DEFAULT '0',
  `isPartner` tinyint(1) DEFAULT '0',
  `isPartTime` tinyint(1) DEFAULT '0',
  `photo` varchar(255) DEFAULT NULL,
  `societe_id` int(11) NOT NULL,
  `genre` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `employees`
--

INSERT INTO `employees` (`id`, `firstName`, `lastName`, `birthDate`, `address`, `zipCode`, `city`, `phone`, `email`, `socialSecurityNumber`, `nationality`, `poste`, `position`, `niveau`, `coefficient`, `manager`, `hoursPerMonth`, `hoursPerDay`, `hourlyRate`, `monthlySalary`, `contractType`, `entryDate`, `exitDate`, `iban`, `isExecutive`, `isPartner`, `isPartTime`, `photo`, `societe_id`, `genre`) VALUES
(1, 'Alice', 'Dupont', '1989-12-31', '123 Rue de Paris', '75001', 'Paris', '0123456789', 'alice.dupont@example.com', '123-45-6789', 'Française', 'Développeuse', 'Junior', '1', '1.20', 'manager1', 160, 8, '20.00', '3200.00', 'CDI', '2022-01-15', NULL, 'FR761234567890', 0, 0, 0, NULL, 3, 'female'),
(3, 'Alice', 'Dupont', '1989-12-31T23:00:00.000Z', '123 Rue de Paris', '75001', 'Paris', '0123456789', 'alice1.dupont@example.com', '123-45-6789', 'Française', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CDI', '2022-01-14T23:00:00.000Z', NULL, 'FR761234567890', 0, 0, 0, NULL, 2, 'female'),
(5, 'Ding', 'Dong', '1989-12-31T23:00:00.000Z', '123 Rue de Paris', '75001', 'Paris', '0123456789', 'ding.dupont@example.com', '123-45-6789', 'Française', 'Développeuse', 'Junior', '1', '1.20', 'manager1', 160, 8, '20.00', '3200.00', 'CDD', '2022-01-14T23:00:00.000Z', NULL, 'FR761234567890', 1, 0, 1, NULL, 2, 'female');

-- --------------------------------------------------------

--
-- Structure de la table `factures`
--

CREATE TABLE `factures` (
  `id` int(11) NOT NULL,
  `client_id` int(11) DEFAULT NULL,
  `societe_id` int(11) DEFAULT NULL,
  `date_facture` varchar(35) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `statut` enum('payée','impayée','en retard','en attente','annulée','accepté') DEFAULT 'impayée',
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `numero` varchar(100) DEFAULT NULL,
  `type_fact` varchar(4) DEFAULT NULL,
  `ht` varchar(255) DEFAULT NULL,
  `type_saisie` varchar(255) DEFAULT NULL,
  `total_tva` varchar(255) DEFAULT NULL,
  `taxe_secondaire` varchar(255) DEFAULT NULL,
  `total_taxe_secondaire` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `factures`
--

INSERT INTO `factures` (`id`, `client_id`, `societe_id`, `date_facture`, `total`, `statut`, `due_date`, `created_at`, `numero`, `type_fact`, `ht`, `type_saisie`, `total_tva`, `taxe_secondaire`, `total_taxe_secondaire`) VALUES
(221, 25, 2, '2025-06-23', '44.00', 'impayée', NULL, '2025-06-23 19:35:53', 'JL802-1', 'FACT', '36.67', 'HT', '7.33', NULL, NULL),
(222, 25, 2, '2025-06-23', '88.00', 'impayée', NULL, '2025-06-23 19:37:22', 'JL501-1', 'FACT', '73.33', 'HT', '14.67', NULL, NULL),
(223, 26, 2, '2025-06-24', '21.00', 'accepté', NULL, '2025-06-24 18:21:20', 'JL894-1', 'DEVI', '17.5', 'HT', '3.5', NULL, NULL),
(224, 26, 2, '2025-06-24', '12.10', 'accepté', NULL, '2025-06-24 18:32:56', 'JL249-1', 'DEVI', '11', 'HT', '1.1', NULL, NULL),
(225, 24, 2, '2025-04-21', '38.68', 'en attente', NULL, '2025-06-27 19:33:24', 'JL523-1', 'FACT', '36.66', 'TTC', '2.02', NULL, NULL),
(226, 24, 2, '2025-05-28', '44.00', 'en attente', NULL, '2025-06-27 19:34:00', 'JL002-1', 'FACT', '36.67', 'TTC', '7.33', NULL, NULL),
(227, 26, 2, '2025-06-27', '22.00', 'en attente', NULL, '2025-06-27 19:34:40', 'JL299-1', 'FACT', '18.33', 'TTC', '3.67', NULL, NULL),
(228, 25, 2, '2025-05-14', '3.00', 'en attente', NULL, '2025-06-27 19:34:57', 'JL204-1', 'FACT', '2.5', 'TTC', '0.5', NULL, NULL),
(229, 24, 2, '2025-07-07', '143.36', 'en attente', NULL, '2025-07-06 22:47:32', 'JU213-1', 'DEVI', '131.54', 'TTC', '11.82', NULL, NULL),
(230, 40, 3, '2025-07-10', '732.00', 'impayée', NULL, '2025-07-10 15:14:08', 'JU477-1', 'FACT', '659.16', 'TTC', '72.84', NULL, NULL),
(231, 7, 3, '2025-01-09', '22.00', 'en attente', NULL, '2025-07-10 15:24:35', 'JU562-1', 'FACT', '18.33', 'TTC', '3.67', NULL, NULL),
(232, 41, 7, '2025-07-10', '990975.00', 'impayée', NULL, '2025-07-10 17:02:06', 'JU018-1', 'FACT', '905000', 'HT', '85975', NULL, NULL),
(234, 42, 13, '2025-07-14', '16.00', 'impayée', NULL, '2025-07-14 18:21:25', 'JU790-1', 'FACT', '13.33', 'TTC', '2.67', NULL, NULL),
(235, 42, 13, '2025-07-17', '209.00', 'en attente', NULL, '2025-07-17 15:20:50', 'JU911-1', 'FACT', '175.48', 'TTC', '33.52', NULL, NULL),
(236, 25, 2, '2025-08-07', '20.50', 'impayée', NULL, '2025-08-06 23:01:58', 'AU249-1', 'FACT', '17.87', 'TTC', '2.25', '2.10', '0.38'),
(237, 25, 2, '2025-08-07', '59.99', 'en attente', NULL, '2025-08-06 23:03:37', 'AU110-1', 'FACT', '49.99', 'TTC', '10', NULL, '0');

-- --------------------------------------------------------

--
-- Structure de la table `mail_parametrage`
--

CREATE TABLE `mail_parametrage` (
  `id` int(11) NOT NULL,
  `societe_id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `objet` varchar(255) NOT NULL,
  `coprs` text NOT NULL,
  `date_crea` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_mis_ajou` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `mail_settings`
--

CREATE TABLE `mail_settings` (
  `id` int(11) NOT NULL,
  `societe_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `host` varchar(255) NOT NULL,
  `port` int(11) NOT NULL,
  `security` enum('Aucune','SSL','TLS') NOT NULL DEFAULT 'Aucune',
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `mail_settings`
--

INSERT INTO `mail_settings` (`id`, `societe_id`, `user_id`, `host`, `port`, `security`, `username`, `password`, `created_at`, `updated_at`) VALUES
(6, 2, 4, 'smtp.ionos.fr', 465, 'SSL', 'contact@minutescoop.fr', 'Cinema12@selfie', '2025-03-23 11:07:34', '2025-03-23 18:40:59'),
(7, 12, 58, 'smtp.ionos.fr', 465, 'SSL', 'idnovation2014@gmail.com', 'Cinema12', '2025-07-09 19:46:57', '2025-07-09 19:46:57');

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `societe_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `from` enum('client','support') NOT NULL,
  `message` text NOT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `messages`
--

INSERT INTO `messages` (`id`, `ticket_id`, `societe_id`, `parent_id`, `from`, `message`, `date`) VALUES
(1, 7, 2, 2147483647, 'support', 'remi', '2025-07-05 11:32:59'),
(2, 7, 2, 2147483647, 'support', 'test', '2025-07-05 11:36:00'),
(3, 7, 2, 2147483647, 'support', 'test', '2025-07-05 12:25:26'),
(4, 7, 2, 2147483647, 'client', 'merci', '2025-07-05 12:27:46'),
(5, 7, 2, 2147483647, 'client', 'test', '2025-07-05 12:32:54'),
(6, 7, 2, 2147483647, 'client', 'uuu', '2025-07-05 12:34:02'),
(7, 7, 2, 2147483647, 'support', 'test', '2025-07-05 14:56:04'),
(8, 7, 2, 2147483647, 'client', 'test', '2025-07-05 14:58:21'),
(9, 7, 2, 2147483647, 'client', 'test', '2025-07-05 14:58:54'),
(10, 7, 2, 2147483647, 'support', 'test', '2025-07-05 15:00:49'),
(11, 7, 2, 2147483647, 'client', 'test', '2025-07-05 15:00:58'),
(12, 9, 2, 2147483647, 'support', 'Bonjour ce ticket a deja été traité, vous devez pouvoir saisir vos factures dès mainteant', '2025-07-05 18:09:39'),
(13, 9, 2, 2147483647, 'client', 'Merci de votre réactivité', '2025-07-05 18:10:50'),
(14, 5, 2, 2147483647, 'support', 'Problème résolu', '2025-07-06 14:01:45'),
(15, 9, 2, 2147483647, 'support', 'J\'ai encore un problème', '2025-07-07 07:38:35'),
(16, 9, 2, 2147483647, 'support', 'Ok pas de soucis, au plaisir', '2025-07-07 19:38:48'),
(17, 9, 2, 2147483647, 'client', 'test', '2025-07-08 13:09:10'),
(18, 9, 2, 2147483647, 'client', 'test', '2025-07-08 13:17:55'),
(19, 10, 2, 2147483647, 'support', 'test message', '2025-07-08 13:40:24'),
(20, 10, 2, 2147483647, 'client', 'merci de votre aide', '2025-07-08 13:40:45'),
(21, 10, 2, 2147483647, 'client', 'bonjour', '2025-07-08 13:46:58'),
(22, 10, 2, 2147483647, 'support', 'message test', '2025-07-08 13:47:23'),
(23, 10, 2, 2147483647, 'support', 'test', '2025-07-08 13:47:48'),
(24, 10, 2, 2147483647, 'support', 'test support', '2025-07-08 13:48:52'),
(25, 10, 2, 2147483647, 'support', 'socket', '2025-07-08 14:38:13'),
(26, 9, 2, 2147483647, 'client', 'io', '2025-07-08 14:38:31'),
(27, 9, 2, 2147483647, 'client', 'tdestttt', '2025-07-08 14:39:23'),
(28, 10, 2, 2147483647, 'support', 'test io', '2025-07-08 14:40:12'),
(29, 8, 2, 2147483647, 'support', 'test', '2025-07-08 14:40:50'),
(30, 8, 2, 2147483647, 'client', '12', '2025-07-08 14:52:16'),
(31, 11, 2, 2147483647, 'client', 'Bonjour', '2025-07-08 15:12:56'),
(32, 11, 2, 2147483647, 'client', 'test', '2025-07-08 15:13:34'),
(33, 11, 2, 2147483647, 'client', 'test', '2025-07-08 16:18:01'),
(34, 8, 2, 2147483647, 'support', 'test', '2025-07-08 16:18:17'),
(35, 11, 2, 2147483647, 'client', 'elton', '2025-07-08 16:19:57'),
(36, 11, 2, 2147483647, 'client', 'al', '2025-07-08 16:40:52'),
(37, 11, 2, 2147483647, 'support', 'al', '2025-07-08 16:41:21'),
(38, 11, 2, 2147483647, 'support', 'mm', '2025-07-08 16:41:38'),
(39, 11, 2, 2147483647, 'client', 'Merci', '2025-07-08 16:43:34'),
(40, 11, 2, 2147483647, 'client', 'M', '2025-07-08 16:43:53'),
(41, 11, 2, 2147483647, 'support', 'A', '2025-07-08 16:54:24'),
(42, 11, 2, 2147483647, 'support', 'NNN', '2025-07-08 22:11:51'),
(43, 11, 2, 2147483647, 'client', 'test', '2025-07-09 18:37:56'),
(44, 17, 7, 2147483647, 'client', 'et la je saisie un message au support', '2025-07-09 21:36:41'),
(45, 19, 7, 2147483647, 'client', 'Je suis pénalisé je dois l\'envoyer dans les plus bref delais', '2025-07-10 15:35:21'),
(46, 19, 2, 2147483647, 'support', 'Je n\'arrive pas à reproduire ce bug', '2025-07-10 16:21:17'),
(47, 19, 2, 2147483647, 'support', 'essaie de vider les caches de ton navigateur et ressaie et tiens moi au courant', '2025-07-10 16:21:59'),
(48, 18, 2, 2147483647, 'support', 'Vu ensemble ce jour', '2025-07-10 16:32:42'),
(49, 19, 7, 2147483647, 'client', 'Ok j\'essaie encore', '2025-07-10 17:01:22'),
(50, 20, 2, 2147483647, 'support', 'Bonjour votre ticket seta pris en charge demain', '2025-07-10 17:34:01'),
(51, 20, 2, 2147483647, 'support', 'merci', '2025-07-10 17:35:32'),
(52, 20, 3, 2147483647, 'client', 'tes', '2025-07-10 17:41:04'),
(53, 20, 2, 2147483647, 'support', 'test', '2025-07-10 17:41:25'),
(56, 20, 3, 2147483647, 'client', 'iiii', '2025-07-10 17:46:05'),
(57, 20, 2, 2147483647, 'support', 'mmm', '2025-07-10 17:46:13'),
(58, 20, 2, 2147483647, 'support', 'Melonia', '2025-07-10 18:01:44'),
(59, 20, 3, 2147483647, 'client', 'Bonjour votre ticket seta pris en charge demain.', '2025-07-10 18:10:30'),
(60, 19, 2, 2147483647, 'support', 'Mais mets quand même les prix dans les produits avant', '2025-07-10 18:19:31'),
(61, 20, 2, 2147483647, 'support', 'Bonjour votre ticket seta pris en charge demain', '2025-07-10 18:19:55'),
(62, 19, 2, 2147483647, 'support', 'Tiens moi au courant quand tu auras testé apres avoir mis à jour les prix des produits et vidé les cache avant', '2025-07-10 18:24:31'),
(63, 20, 3, 2147483647, 'client', 'Bonjour votre ticket seta pris en charge demain.', '2025-07-10 18:41:58'),
(64, 20, 2, 2147483647, 'support', 'Bonjour votre ticket seta pris en charge demain.', '2025-07-10 18:43:22'),
(65, 19, 2, 2147483647, 'support', 'J\'ai vu que tu as créé une facture, on peut fermer ce ticket ??', '2025-07-10 19:35:21'),
(66, 19, 7, 2147483647, 'client', 'La même erreur revient, je ne sais pas si c\'est parce que je laisser ouvert sur un autre poste ou pas', '2025-07-11 17:04:07'),
(67, 19, 7, 2147483647, 'client', 'Mais essaie de voir ce que tu peux faire... voir même essaie d\'ouvrir un compte sur plusieurs poste et dit moi...', '2025-07-11 17:05:09'),
(68, 19, 7, 2147483647, 'client', 'Même quand je click sur une fenêtre j\'ai la même erruer', '2025-07-11 17:06:46');

-- --------------------------------------------------------

--
-- Structure de la table `mouvements_stock`
--

CREATE TABLE `mouvements_stock` (
  `id` int(11) NOT NULL,
  `produit_id` int(11) NOT NULL,
  `societe_id` int(11) NOT NULL,
  `type` enum('ENTREE','SORTIE') NOT NULL,
  `quantite` int(11) NOT NULL,
  `motif` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date_mouvement` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `mouvements_stock`
--

INSERT INTO `mouvements_stock` (`id`, `produit_id`, `societe_id`, `type`, `quantite`, `motif`, `user_id`, `date_mouvement`, `created_at`) VALUES
(133, 68, 2, 'ENTREE', 100, 'Import de stock', 4, '2025-08-07 00:54:45.464', '2025-08-06 22:54:45'),
(134, 69, 2, 'ENTREE', 50, 'Import de stock', 4, '2025-08-07 00:54:45.464', '2025-08-06 22:54:45'),
(135, 30, 2, 'ENTREE', 200, 'Import de stock', 4, '2025-08-07 00:54:45.464', '2025-08-06 22:54:45'),
(136, 27, 2, 'SORTIE', 1, 'Vente', 4, '2025-08-07 01:02:38', '2025-08-06 23:02:38'),
(137, 69, 2, 'SORTIE', 1, 'Vente', 4, '2025-08-07 01:02:38', '2025-08-06 23:02:38');

-- --------------------------------------------------------

--
-- Structure de la table `options_societe`
--

CREATE TABLE `options_societe` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `societe_id` int(11) NOT NULL,
  `enable_facturation` tinyint(1) DEFAULT '0',
  `enable_recette` tinyint(1) DEFAULT '0',
  `enable_mailing` tinyint(1) DEFAULT '0',
  `enable_relances_auto` tinyint(1) DEFAULT '0',
  `enable_stock` tinyint(1) DEFAULT '0',
  `enable_import_produits_services` tinyint(1) DEFAULT '0',
  `enable_mouvements_stock` tinyint(1) DEFAULT '0',
  `enable_inventaire_manuel` tinyint(1) DEFAULT '0',
  `enable_inventaire_auto` tinyint(1) DEFAULT '0',
  `enable_user_input` tinyint(1) DEFAULT '0',
  `enable_user_limit` tinyint(1) DEFAULT '0',
  `user_limit` int(11) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `options_societe`
--

INSERT INTO `options_societe` (`id`, `societe_id`, `enable_facturation`, `enable_recette`, `enable_mailing`, `enable_relances_auto`, `enable_stock`, `enable_import_produits_services`, `enable_mouvements_stock`, `enable_inventaire_manuel`, `enable_inventaire_auto`, `enable_user_input`, `enable_user_limit`, `user_limit`, `created_at`, `updated_at`) VALUES
(3, 12, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, '2025-07-02 17:50:59', '2025-07-02 18:19:41'),
(4, 6, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-07-02 19:06:41', '2025-07-02 19:06:41'),
(5, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, '2025-07-02 19:07:17', '2025-07-02 19:07:17'),
(6, 2, 1, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 1, NULL, 0, '2025-07-05 17:02:35', '2025-07-06 00:02:02'),
(7, 13, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 5, '2025-07-14 17:49:33', '2025-07-14 17:49:33');

-- --------------------------------------------------------

--
-- Structure de la table `paiements`
--

CREATE TABLE `paiements` (
  `id` int(11) NOT NULL,
  `facture_id` int(11) DEFAULT NULL,
  `montant` decimal(10,2) NOT NULL,
  `date_paiement` date NOT NULL,
  `mode_paiement` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `permissions`
--

INSERT INTO `permissions` (`id`, `name`) VALUES
(9, 'access_reports'),
(2, 'create_invoices'),
(4, 'delete_invoices'),
(3, 'edit_invoices'),
(6, 'manage_clients'),
(15, 'manage_inventory'),
(11, 'manage_invoice_param'),
(13, 'manage_stock'),
(8, 'manage_users'),
(10, 'settings_access'),
(16, 'validate_inventory'),
(5, 'view_clients'),
(14, 'view_inventory'),
(1, 'view_invoices'),
(12, 'view_stock'),
(7, 'view_users');

-- --------------------------------------------------------

--
-- Structure de la table `produits`
--

CREATE TABLE `produits` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `quantite` int(11) NOT NULL,
  `societe_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `facture_id` int(11) DEFAULT NULL,
  `taux_tva` varchar(10) DEFAULT NULL,
  `total_tva` varchar(10) DEFAULT NULL,
  `id_prod_serv` int(11) DEFAULT NULL,
  `stat_stock` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `produits`
--

INSERT INTO `produits` (`id`, `nom`, `prix_unitaire`, `quantite`, `societe_id`, `created_at`, `facture_id`, `taux_tva`, `total_tva`, `id_prod_serv`, `stat_stock`) VALUES
(543, 'Giorgia stick ', '38.68', 1, 2, '2025-06-27 19:33:24', 225, '5.5', '2.01649289', 6, NULL),
(545, 'alexandre ', '22.00', 1, 2, '2025-06-27 19:34:40', 227, '20', '3.66666666', 5, NULL),
(546, 'produit 3', '3.00', 1, 2, '2025-06-27 19:34:57', 228, '20', '0.5', 3, NULL),
(547, 'Produit d\'entretien', '11.00', 1, 2, '2025-07-06 20:15:51', 224, '10%', '1', NULL, NULL),
(559, 'Macbook', '100.00', 1, 3, '2025-07-10 15:16:16', 230, '10%', '9.09090909', NULL, NULL),
(560, 'Produit B', '100.00', 1, 3, '2025-07-10 15:16:16', 230, '20%', '16.6666666', NULL, NULL),
(561, 'Produit B', '33.00', 1, 3, '2025-07-10 15:16:16', 230, '5.5%', '1.72037914', NULL, NULL),
(562, 'Produit C', '499.00', 1, 3, '2025-07-10 15:16:16', 230, '10.00', '45.3636363', NULL, NULL),
(563, 'Produit C', '22.00', 1, 3, '2025-07-10 15:24:35', 231, '20.00', '3.66666666', 47, NULL),
(564, 'Site internet E-commerce', '780000.00', 1, 7, '2025-07-10 18:18:38', 232, '9.50', '74100', NULL, NULL),
(565, 'Logo', '50000.00', 1, 7, '2025-07-10 18:18:38', 232, '9.50', '4750', NULL, NULL),
(566, 'Gestion des réseaux sociaux', '50000.00', 1, 7, '2025-07-10 18:18:38', 232, '9.50', '4750', NULL, NULL),
(567, 'Conception page facebook', '25000.00', 1, 7, '2025-07-10 18:18:38', 232, '9.50', '2375', NULL, NULL),
(568, 'Giorgia stick ', '38.68', 2, 2, '2025-07-10 19:26:59', 229, '5.5%', '4.03298578', NULL, NULL),
(569, 'Produit A', '44.00', 1, 2, '2025-07-10 19:26:59', 229, '20%', '7.33333333', NULL, NULL),
(570, 'test ', '22.00', 1, 2, '2025-07-10 19:26:59', 229, '2.1%', '0.45249755', NULL, NULL),
(571, 'matcha ', '10.00', 1, 13, '2025-07-14 18:21:25', 234, '20.00', '1.66666666', NULL, NULL),
(572, 'Tasses ', '6.00', 1, 13, '2025-07-14 18:21:25', 234, '20.00', '1', NULL, NULL),
(573, 'tasses', '20.00', 10, 13, '2025-07-17 15:20:50', 235, '20.00', '33.3333333', NULL, NULL),
(574, 'matcha', '9.00', 1, 13, '2025-07-17 15:20:50', 235, '2.10', '0.18511263', NULL, NULL),
(575, 'produit test gio', '9.67', 1, 2, '2025-08-06 23:01:58', 236, '5.50', '0.5', 27, 'UPDATED'),
(576, 'Produit B', '10.45', 1, 2, '2025-08-06 23:01:58', 236, '20.00', '1.74', 69, 'UPDATED'),
(577, 'Produit A', '59.99', 1, 2, '2025-08-06 23:03:37', 237, '20.00', '10', 68, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `produits_services`
--

CREATE TABLE `produits_services` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` varchar(4000) NOT NULL,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `quantite_en_stock` int(11) NOT NULL DEFAULT '0',
  `categorie` varchar(100) DEFAULT NULL,
  `sous_categorie` varchar(100) DEFAULT NULL,
  `seuil_minimum` int(11) NOT NULL DEFAULT '0',
  `fournisseur` varchar(100) DEFAULT NULL,
  `date_derniere_entree` date DEFAULT NULL,
  `societe_id` int(11) NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `statut_inventaire` enum('en_attente','valide','rejete') DEFAULT 'en_attente',
  `stock_reel` int(11) DEFAULT '0',
  `taux_tva` varchar(10) DEFAULT NULL,
  `total_tva` varchar(100) DEFAULT NULL,
  `tva` varchar(10) DEFAULT NULL,
  `prixUnitaireHT` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `produits_services`
--

INSERT INTO `produits_services` (`id`, `nom`, `description`, `prix_unitaire`, `quantite_en_stock`, `categorie`, `sous_categorie`, `seuil_minimum`, `fournisseur`, `date_derniere_entree`, `societe_id`, `reference`, `statut_inventaire`, `stock_reel`, `taux_tva`, `total_tva`, `tva`, `prixUnitaireHT`) VALUES
(2, 'Produit d\'entretien', 'dzdzd', '11.00', 0, 'Logiciel', 'ERP', 11, NULL, NULL, 2, NULL, 'en_attente', 23, NULL, NULL, '10', '10'),
(3, 'produit 3', 'en stock', '3.00', 4, 'Logiciel', 'Antivirus', 5, NULL, NULL, 2, NULL, 'en_attente', 7, NULL, NULL, '20', '2.5'),
(5, 'alexandre ', 'test', '22.00', 0, 'Services', 'Maintenance', 9, NULL, NULL, 2, NULL, 'en_attente', 22, NULL, NULL, '20', '18.333333333333336'),
(6, 'Giorgia stick ', 'produit de beauté ', '38.68', 0, 'Services', 'Maintenance', 10, NULL, NULL, 2, NULL, 'en_attente', 10, NULL, NULL, '5.5', '36.66666666666667'),
(27, 'produit test gio', 'produit de beauté', '9.67', 21, 'Matériel', 'Imprimantes', 5, NULL, NULL, 2, NULL, 'en_attente', 22, NULL, NULL, '5.5', '9.166666666666668'),
(30, 'Produit C', 'Produit test C', '23.83', 620, 'Bureau', 'Fournitures', 3, NULL, '2025-08-07', 2, NULL, 'en_attente', 21, NULL, NULL, '10', '21.666666666666668'),
(37, 'Pc dell', 'I3 4Go 500 SSD', '288.00', 10, 'Matériel', NULL, 1, NULL, NULL, 2, NULL, 'en_attente', 0, NULL, NULL, '20', '240'),
(39, 'Produit 2 ', 'Test', '39.60', 35, 'Services', 'Installation', 5, NULL, NULL, 12, NULL, 'en_attente', 0, NULL, NULL, '20', '33'),
(40, 'Site dynamique', 'Web site dynamique', '888000.00', 0, 'Services', 'Installation', 0, NULL, NULL, 7, NULL, 'en_attente', 0, NULL, NULL, '20', '740000'),
(41, 'Macbook', 'ordi', '100.00', 10, 'Matériel', 'PC', 5, NULL, NULL, 3, NULL, 'en_attente', 10, NULL, NULL, '10', '90.91'),
(42, 'Logo', 'Conception d\'un logo ', '60000.00', 0, 'Services', 'Installation', 0, NULL, NULL, 7, NULL, 'en_attente', 0, NULL, NULL, '20', '50000'),
(43, 'EEE', 'EE', '36.30', 10, 'Matériel', 'PC', 5, NULL, NULL, 3, NULL, 'en_attente', 10, NULL, NULL, '10', '33'),
(44, 'Conception page facebook', 'Gestion du réseau social', '30000.00', 0, 'Services', NULL, 0, NULL, NULL, 7, NULL, 'en_attente', 0, NULL, NULL, '20', '25000'),
(45, 'Produit A', 'Produit de test A', '0.00', 50, 'Électronique', 'Accessoires', 10, NULL, '2025-07-10', 3, NULL, 'en_attente', 50, NULL, NULL, NULL, NULL),
(46, 'Produit B', 'Produit de test B', '0.00', 5, 'Bureautique', 'Fournitures', 5, NULL, '2025-07-10', 3, NULL, 'en_attente', 5, NULL, NULL, NULL, NULL),
(47, 'Produit C', 'Produit sans prix/tva', '0.00', 100, 'Informatique', 'Logiciels', 20, NULL, '2025-07-10', 3, NULL, 'en_attente', 100, NULL, NULL, NULL, NULL),
(48, 'Site internet Media', 'Media en ligne', '0.00', 0, 'Service', 'Installation', 0, NULL, '2025-07-10', 7, NULL, 'en_attente', 0, NULL, NULL, NULL, NULL),
(49, 'Site entreprise PME&PMI', 'Site entreprises', '0.00', 0, 'Service', 'Installation', 0, NULL, '2025-07-10', 7, NULL, 'en_attente', 0, NULL, NULL, NULL, NULL),
(50, 'Formation Intensive', 'Formation sur 5 jours', '0.00', 0, 'Service', 'Formation', 0, NULL, '2025-07-10', 7, NULL, 'en_attente', 0, NULL, NULL, NULL, NULL),
(51, 'Formation semi-intensive', 'Formation sur 10 jours', '0.00', 0, 'Service', 'Formation', 0, NULL, '2025-07-10', 7, NULL, 'en_attente', 0, NULL, NULL, NULL, NULL),
(52, 'Formation étendu', 'Formation sur 1 mois', '0.00', 0, 'Service', 'Formation', 0, NULL, '2025-07-10', 7, NULL, 'en_attente', 0, NULL, NULL, NULL, NULL),
(53, 'Indentité visuelle', 'Logo, charte graphique', '0.00', 0, 'Service', 'Conception', 0, NULL, '2025-07-10', 7, NULL, 'en_attente', 0, NULL, NULL, NULL, NULL),
(54, 'Gestion des réseaux sociaux', 'Gestion', '0.00', 0, 'Service', 'Maintenance', 0, NULL, '2025-07-10', 7, NULL, 'en_attente', 0, NULL, NULL, NULL, NULL),
(55, 'Site internet E-commerce', 'Site de vente', '0.00', 44, 'Service', 'Installation', 0, NULL, NULL, 7, NULL, 'en_attente', 0, NULL, NULL, '5.5', '0'),
(56, 'thé vert de chine 100gr', 'thé vert de chine 100gr boite aluminium', '10.55', 20, NULL, NULL, 2, NULL, NULL, 13, NULL, 'en_attente', 0, NULL, NULL, '5.5', '10'),
(57, 'Thé verd fraise ', 'Thé verd fraise  boite 100g', '0.00', 300, 'boite 100g', 'Thés verds', 10, NULL, '2025-07-28', 13, NULL, 'en_attente', 0, NULL, NULL, NULL, NULL),
(58, 'Thé verd gingimbre ', 'Thé verd gingimbre boite 100g', '0.00', 150, 'boite 100g', 'Thés verds', 10, NULL, NULL, 13, NULL, 'en_attente', 0, NULL, NULL, '5.5', '0'),
(59, 'Thé verd peche', 'Thé verd peche boite 100g', '0.00', 69, 'boite 100g', 'Thés verds', 10, NULL, NULL, 13, NULL, 'en_attente', 0, NULL, NULL, '5.5', '0'),
(60, 'Thé verd citron ', 'Thé verd fraise  boite 100g', '0.00', 200, 'boite 100g', 'Thés verds', 10, NULL, '2025-07-28', 13, NULL, 'en_attente', 0, NULL, NULL, NULL, NULL),
(61, 'Thé verd Mure ', 'Thé verd gingimbre boite 100g', '7.38', 100, 'boite 100g', 'Thés verds', 10, NULL, NULL, 13, NULL, 'en_attente', 0, NULL, NULL, '5.5', '7'),
(62, 'Thé verd framboise', 'Thé verd peche boite 100g', '0.00', 46, 'boite 100g', 'Thés verds', 10, NULL, '2025-07-28', 13, NULL, 'en_attente', 0, NULL, NULL, NULL, NULL),
(63, 'Miroire', 'test', '27.60', 23, 'Matériel', 'Accessoires', 3, NULL, NULL, 3, NULL, 'en_attente', 0, NULL, NULL, '20', '23'),
(68, 'Produit A', 'Produit de test A', '59.99', 100, 'Électronique', 'Accessoires', 10, NULL, '2025-08-07', 2, NULL, 'en_attente', 0, NULL, NULL, NULL, NULL),
(69, 'Produit B', 'Produit de test B', '10.45', 49, 'Bureautique', 'Fournitures', 5, NULL, '2025-08-07', 2, NULL, 'en_attente', 0, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `Reglement_mode`
--

CREATE TABLE `Reglement_mode` (
  `id` int(11) NOT NULL,
  `numero_facture` varchar(255) NOT NULL,
  `mode_reglement` varchar(255) NOT NULL,
  `Montant_total` varchar(255) NOT NULL,
  `Total_Paye` varchar(255) NOT NULL,
  `Reste_A_Payer` varchar(255) NOT NULL,
  `dat` varchar(255) NOT NULL,
  `societe_id` varchar(255) NOT NULL,
  `montant_paye` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `Reglement_mode`
--

INSERT INTO `Reglement_mode` (`id`, `numero_facture`, `mode_reglement`, `Montant_total`, `Total_Paye`, `Reste_A_Payer`, `dat`, `societe_id`, `montant_paye`) VALUES
(122, 'JL802-1', 'cheque', '44.00', '12', '32', '2025-06-18', '2', '12'),
(123, 'JL501-1', 'espece', '88.00', '88', '0', '2025-06-04', '2', '88'),
(124, 'JL204-1', 'espece', '3.00', '3', '0', '2025-07-07', '2', '3'),
(125, 'JU477-1', 'cheque', '732.00', '732', '0', '2025-07-10', '3', '732'),
(126, 'JU018-1', 'espece', '990975.00', '990975', '0', '2025-07-10', '7', '990975'),
(127, 'JU911-1', 'espece', '209.00', '209', '0', '2025-07-30', '13', '209'),
(128, 'AU110-1', 'espece', '59.99', '23', '36.99', '2025-08-07', '2', '23');

-- --------------------------------------------------------

--
-- Structure de la table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'Admin'),
(3, 'Editor'),
(2, 'User');

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('VVbsbGCMscz5rC4Sn569UgsLsJgfD5Kt', 1754526662, '{\"cookie\":{\"originalMaxAge\":3600000,\"expires\":\"2025-08-07T00:31:02.275Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":65,\"email\":\"vincerudy@outlook.fr\",\"societe_id\":13,\"permissions\":[\"user_admin_full_acces_control\"],\"token\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjUsInNvY2lldGVfaWQiOjEzLCJlbWFpbCI6InZpbmNlcnVkeUBvdXRsb29rLmZyIiwicGVybWlzc2lvbnMiOlsidXNlcl9hZG1pbl9mdWxsX2FjY2VzX2NvbnRyb2wiXSwiaWF0IjoxNzU0NTIzMDYyLCJleHAiOjE3NTQ1MzM4NjJ9.P-huugngxFzUUADeQt69WPU8JE4ZhqAhxY9-BYQ_x1Q\"}}');

-- --------------------------------------------------------

--
-- Structure de la table `societes`
--

CREATE TABLE `societes` (
  `id` int(11) NOT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `ville` varchar(255) DEFAULT NULL,
  `code_postal` varchar(10) DEFAULT NULL,
  `pays` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
  `societe_cle` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `societes`
--

INSERT INTO `societes` (`id`, `adresse`, `ville`, `code_postal`, `pays`, `created_at`, `email`, `facturation`, `comptabilite`, `administrative`, `personnel`, `companyName`, `companyAddress`, `workPhone`, `NUME_TVA`, `siret`, `devise`, `LANGUE`, `societe_cle`) VALUES
(2, NULL, 'Lyon', '75000', 'France', '2024-09-20 18:01:49', 'contact@societe.com', 'N', 'N', 'N', 'N', 'Le coin de la fête ', '123 Rue de l\'Entreprise', '+33 1 23 45 36 15', 'FR12345678900', '12345678903615', '€', 'fr', '92f0d1c8e7314bcfbf43a9dd3b75f1ef7dca9e10f47e8a3d8c60cda9f0d7b263'),
(3, NULL, 'Paris', '75000', 'France', '2024-09-20 18:10:58', 'contact@societe.com', 'N', 'N', 'N', 'N', 'Minutescoop', '123 Rue de l\'Entreprise', '+33 1 23 45 67 89', 'FR12345678900', '86587576', 'CFA', 'fr', NULL),
(4, NULL, NULL, NULL, NULL, '2025-02-09 00:25:41', 'vincerudy@hotmail.fr', 'N', 'N', 'N', 'N', 'Bonnieres', '7 rue de ka houssaye', '0188991122', NULL, NULL, NULL, NULL, NULL),
(5, NULL, NULL, NULL, NULL, '2025-03-01 10:30:15', 'miroiterie@gmail.com', 'N', 'N', 'N', 'N', 'Miroiterie', '7 rue de a houssaye, bonnieres sur seine', '0788998888', NULL, NULL, NULL, NULL, NULL),
(6, NULL, NULL, NULL, NULL, '2025-06-01 18:51:32', 'vincerudy@gmail.com', 'N', 'N', 'N', 'N', 'Bonnieres', '17 rue de pascal', '00388393933', NULL, NULL, NULL, NULL, NULL),
(7, NULL, 'Libreville', '78279', 'Gabon', '2025-07-01 19:54:35', 'maixendan@gmail.com', 'N', 'N', 'N', 'N', 'MXDEV Consulting', 'Derrière la pédiatrie', '+24166544484', '19', 'NSG6687878', 'CFA', 'fr', NULL),
(8, NULL, NULL, NULL, NULL, '2025-07-02 10:19:46', 'alexandre@hotmail.fr', 'N', 'N', 'N', 'N', 'Société enfant', '7 rue de la houssaye, bonnieres sur seine', '0665248951', NULL, NULL, NULL, NULL, NULL),
(9, NULL, NULL, NULL, NULL, '2025-07-02 10:23:29', 'alexandre@hotmail.fr', 'N', 'N', 'N', 'N', 'Société enfant', '7 rue de la houssaye, bonnieres sur seine', '0665248951', NULL, NULL, NULL, NULL, NULL),
(12, NULL, 'Bonnieres sur seine', '78270', 'France', '2025-07-02 17:50:59', 'bonnieres@gmail.com', 'N', 'N', 'N', 'N', 'MEDIA QUERY', '7 rue de la houssaye', '06652388', 'FR12345678900', '12345678903615', '$', 'fr', NULL),
(13, NULL, 'Bonnières-sur-Seine', '78270', 'France', '2025-07-14 17:49:33', 'vincerudy@outlook.fr', 'N', 'N', 'N', 'N', 'Joy.sarl', '7 rue de derriere la prison', '0898772633', 'FR12345678900', '123 456 789 00', '€', 'fr', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `societe_parametrage_facturation`
--

CREATE TABLE `societe_parametrage_facturation` (
  `id` int(11) NOT NULL,
  `societe_id` varchar(30) DEFAULT NULL,
  `user_id` varchar(30) DEFAULT NULL,
  `enableQuotes` tinyint(1) DEFAULT NULL,
  `enableInvoices` tinyint(1) DEFAULT NULL,
  `vatRate` decimal(5,2) DEFAULT NULL,
  `vatLabel` varchar(255) DEFAULT NULL,
  `paymentDelay` int(11) DEFAULT NULL,
  `salesConditions` text,
  `showHeaderNotes` tinyint(1) DEFAULT NULL,
  `headerNotes` text,
  `showSalesConditions` tinyint(1) DEFAULT NULL,
  `date_crea` varchar(50) DEFAULT NULL,
  `date_mis_ajou` varchar(50) DEFAULT NULL,
  `enableAutoReminders` tinyint(1) NOT NULL DEFAULT '0',
  `enableTTC` tinyint(1) NOT NULL DEFAULT '0',
  `enableApprovalMention` tinyint(1) NOT NULL DEFAULT '0',
  `enableRecette` tinyint(1) DEFAULT '0',
  `enableMultipleTVA` varchar(10) DEFAULT NULL,
  `stockDeductionTrigger` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `societe_parametrage_facturation`
--

INSERT INTO `societe_parametrage_facturation` (`id`, `societe_id`, `user_id`, `enableQuotes`, `enableInvoices`, `vatRate`, `vatLabel`, `paymentDelay`, `salesConditions`, `showHeaderNotes`, `headerNotes`, `showSalesConditions`, `date_crea`, `date_mis_ajou`, `enableAutoReminders`, `enableTTC`, `enableApprovalMention`, `enableRecette`, `enableMultipleTVA`, `stockDeductionTrigger`) VALUES
(3, '2', '4', 1, 1, '20.00', 'TVA', 30, 'Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.', 0, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.', 0, '2025-02-16 14:43:25', '2025-08-07 00:13:53', 1, 1, 0, 0, '1', 'quote_accepted'),
(4, '3', '3', 1, 1, '20.00', 'TVA', 22, 'hdtytd uyrdfè§rè', 1, 'fiufifiufiyufdy mlhkohiugf', 1, '2025-02-21 15:43:06', '2025-08-06 22:35:26', 1, 1, 1, 1, '1', 'invoice_created'),
(5, '12', '58', 1, 1, '20.00', 'TVA', 1, '', 0, '', 0, '2025-07-09 23:38:36', '2025-07-09 23:58:40', 0, 0, 0, 0, '1', 'quote_accepted'),
(6, '7', '52', 1, 1, '20.00', 'TVA', 1, '', 1, '', 1, '2025-07-09 23:39:01', '2025-07-10 17:19:26', 0, 0, 1, 0, '0', 'quote_accepted'),
(7, '13', '65', 1, 1, '20.00', 'TVA', 30, 'Joy est la reine', 1, 'Joy empoche tous les revenus', 1, '2025-07-14 20:07:10', '2025-07-14 20:07:10', 0, 1, 1, 1, '1', 'invoice_created');

-- --------------------------------------------------------

--
-- Structure de la table `tickets`
--

CREATE TABLE `tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `societe_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `description` text,
  `status` varchar(50) DEFAULT 'Ouvert',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `priority` varchar(20) DEFAULT NULL,
  `assigned_to` varchar(30) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `tickets`
--

INSERT INTO `tickets` (`id`, `societe_id`, `title`, `reason`, `description`, `status`, `created_at`, `updated_at`, `priority`, `assigned_to`, `user_id`) VALUES
(1, 2, 'Problème de connexion', 'Problème technique', '<p>Je n\'arrive pas à me connecter à mon compte depuis hier.</p>', 'Terminé', '2025-07-05 01:14:56', '2025-07-10 21:04:31', NULL, NULL, NULL),
(2, 2, 'Problème de connexion', 'Problème technique', '<p>Je n\'arrive pas à me connecter à mon compte depuis hier.</p>', 'Terminé', '2025-07-05 01:22:48', '2025-07-10 21:04:41', NULL, NULL, NULL),
(3, 2, 'Problème de connexion', 'Anomalie', '<p>Je n\'arrive pas à me connecter à mon compte depuis hier.</p>', 'Terminé', '2025-07-05 01:23:09', '2025-07-10 21:05:54', NULL, NULL, NULL),
(4, 2, 'Problème de connexion', 'Problème technique', '<p>Je n\'arrive pas à me connecter à mon compte depuis hier. vince mouko</p>', 'Terminé', '2025-07-05 02:06:49', '2025-07-10 21:04:22', NULL, NULL, NULL),
(5, 2, 'Problème de connexion', 'Anomalie', '<p>Je n\'arrive pas à me connecter à mon compte depuis hier.</p>', 'Terminé', '2025-07-05 02:17:18', '2025-07-06 14:02:03', NULL, NULL, NULL),
(6, 2, 'Impossible de se connecter', 'Anomalie', '<p>Je n\'arrive pas à me connecter à mon compte depuis hier.</p>', 'En cours', '2025-07-05 02:19:20', '2025-07-05 02:19:20', NULL, NULL, NULL),
(7, 2, 'Impossible de se connecter', 'Anomalie', '<p>Je n\'arrive pas à me connecter à mon <strong>compte depuis hier. test hier</strong></p>', 'Terminé', '2025-07-05 02:20:11', '2025-07-10 15:51:05', NULL, NULL, NULL),
(8, 2, 'Problème de connexion', 'Anomalie', '<p>Je n\'arrive pas à me connecter à mon compte depuis hier.</p>', 'Terminé', '2025-07-05 02:36:27', '2025-07-10 21:06:25', NULL, NULL, NULL),
(9, 2, 'test ticket', 'Assistance', '<p>test</p>', 'Terminé', '2025-07-05 14:04:07', '2025-07-06 14:06:13', NULL, NULL, NULL),
(10, 2, 'ticket test', 'Assistance', '<p>test</p>', 'Terminé', '2025-07-08 13:12:39', '2025-07-10 16:34:15', NULL, NULL, NULL),
(11, 2, 'ticket elton', 'Assistance', '<p>test ticket elton</p>', 'Terminé', '2025-07-08 15:10:43', '2025-07-09 07:31:58', NULL, NULL, NULL),
(12, 7, 'Les parametres de config des facturations ne fonctionne toujours pas', 'Anomalie', '<p><br></p>', 'Terminé', '2025-07-09 19:34:45', '2025-07-10 16:34:27', NULL, NULL, NULL),
(13, 7, 'Les parametres de config des facturations ne fonctionne toujours pas', 'Anomalie', '<p><br></p>', 'Terminé', '2025-07-09 19:34:56', '2025-07-09 19:34:56', NULL, NULL, NULL),
(14, 12, 'test', 'Assistance', '<p>test</p>', 'Terminé', '2025-07-09 19:50:16', '2025-07-10 16:34:38', NULL, NULL, NULL),
(15, 7, 'test ticket ', 'Assistance', '<p>test</p>', 'Terminé', '2025-07-09 19:53:05', '2025-07-10 16:33:58', NULL, NULL, NULL),
(16, 7, 'Test de saisie', 'Anomalie', '<p><br></p>', 'Terminé', '2025-07-09 21:16:52', '2025-07-10 16:33:35', NULL, NULL, NULL),
(17, 7, 'Test de saisie', 'Anomalie', '<p>Je viens de tester sur 2 mac</p>', 'Terminé', '2025-07-09 21:17:00', '2025-07-10 16:33:07', NULL, NULL, NULL),
(18, 3, 'Ticket de test', 'Assistance', '<p>Je ne sais pas comment créer une facture</p>', 'Terminé', '2025-07-09 23:24:02', '2025-07-10 16:32:48', NULL, NULL, NULL),
(19, 7, 'Erreur lors de l\'envoie de devis', 'Anomalie', '<p>Quand je choisis un produit la facture ou le devis m\'envoie une erreur.</p>', 'Terminé', '2025-07-10 15:32:20', '2025-07-10 21:03:21', NULL, NULL, 52),
(20, 3, 'test', 'Anomalie', '<p>test</p>', 'Terminé', '2025-07-10 17:20:53', '2025-07-10 21:03:54', NULL, NULL, 3),
(21, 13, 'paramétrage de la facturation', '', '<p>Lorsque le client n\'a pas encore parametré le paramétrage de la facturation, mettre un message sur les pages qui s\'affichent vids</p>', 'En attente', '2025-07-14 17:53:48', '2025-07-14 17:53:48', NULL, NULL, 65),
(22, 13, 'paramétrage de la facturation', '', '<p>Lorsque le client n\'a pas encore parametré le paramétrage de la facturation, mettre un message sur les pages qui s\'affichent vids</p>', 'En attente', '2025-07-14 17:54:23', '2025-07-14 17:54:23', NULL, NULL, 65),
(23, 13, 'Ticket', '', '<p>Une fois que le ticket a été créé, rediriger le client vers la liste des tickets</p><p><br></p>', 'En attente', '2025-07-14 17:55:31', '2025-07-14 17:55:31', NULL, NULL, 65),
(24, 13, 'relances automatiques', '', '<p>desactiver l\'ongler relances automatiques</p>', 'En attente', '2025-07-14 17:58:46', '2025-07-14 17:58:46', NULL, NULL, 65),
(25, 13, 'Bouton enregistrer', '', '<p>Dans les paramétragres facturation, déplacer le bouton \"enregistrer\" en bas à gauche (pour uniformiser sa position avec les paramétrages généraux</p>', 'En attente', '2025-07-14 18:09:41', '2025-07-14 18:09:41', NULL, NULL, 65),
(26, 13, 'Devis', '', '<p>Lorsque le client télécharge le devis, changer la denomination \"facture\" en \"devis\"</p><p><br></p>', 'En attente', '2025-07-14 18:24:29', '2025-07-14 18:24:29', NULL, NULL, 65),
(27, 13, ' bouton \"devis accepté\"', '', '<p>soit tu enlève le bouton \"devis accepté\" soit quand tu acceptes le devis, soit tu mets une mention \"accepté\" sur le devis, </p>', 'En attente', '2025-07-17 14:18:59', '2025-07-17 14:18:59', NULL, NULL, 65),
(28, 13, 'Postdatation du paiement de la facture', '', '<p>l\'enlever</p>', 'En attente', '2025-07-17 15:22:37', '2025-07-17 15:22:37', NULL, NULL, 65),
(29, 13, 'Gestion des stocks ', '', '<p>Quand tu veux ajouter un produit, ajouter d\'autres catégories ?</p><p>Laisser la possibilité au client d\'ajouter des nouvelles catégories ?</p><p><br></p><p><br></p>', 'En attente', '2025-07-28 14:04:01', '2025-07-28 14:04:01', NULL, NULL, 65),
(30, 13, 'tickets ', '', '<p>ajouter la possibilté de mettre des captures écran</p>', 'En attente', '2025-07-28 14:07:04', '2025-07-28 14:07:04', NULL, NULL, 65),
(31, 13, 'Suppression d\'un article', '', '<p>Je n\'arrive pas à supprimer un article</p>', 'En attente', '2025-07-28 14:48:57', '2025-07-28 14:48:57', NULL, NULL, 65),
(32, 13, 'Insertion produit', '', '<p>Lorsqu\'on insère des produits via fichier XLS le logiciel ne tient pas compte du prix </p><p>et lorsque l\'on modifie l\'article manuellement, la prix ne se met pas à jour, ça reste à 0</p>', 'En attente', '2025-07-28 15:01:35', '2025-07-28 15:01:35', NULL, NULL, 65),
(33, 13, 'Insertion produit', '', '<p>Lorsqu\'on insère des produits via fichier XLS le logiciel ne tient pas compte du prix</p><p>et lorsque l\'on modifie l\'article manuellement, la prix ne se met pas à jour, ça reste à 0</p>', 'En attente', '2025-07-28 15:09:47', '2025-08-06 23:31:42', NULL, NULL, 65),
(34, 2, 'test', 'Assistance', '<p>test</p>', 'En attente', '2025-08-06 23:05:38', '2025-08-06 23:05:38', NULL, NULL, 4),
(35, 2, 'test 2', 'Anomalie', '<p>test</p>', 'En attente', '2025-08-06 23:11:49', '2025-08-06 23:11:49', NULL, NULL, 4);

-- --------------------------------------------------------

--
-- Structure de la table `tva`
--

CREATE TABLE `tva` (
  `id` int(11) NOT NULL,
  `societe_id` int(11) NOT NULL,
  `libelle` varchar(255) NOT NULL,
  `taux` decimal(5,2) NOT NULL,
  `active` enum('O','N') DEFAULT 'O',
  `ordre` int(11) NOT NULL DEFAULT '0',
  `taxe_secondaire` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `tva`
--

INSERT INTO `tva` (`id`, `societe_id`, `libelle`, `taux`, `active`, `ordre`, `taxe_secondaire`) VALUES
(25, 2, 'TVA ', '20.00', 'O', 2, 'NON'),
(26, 2, 'TVA', '10.00', 'O', 3, 'NON'),
(27, 2, 'CSS', '2.10', 'O', 1, 'OUI'),
(28, 2, 'TVA ', '5.50', 'O', 4, 'NON'),
(29, 3, 'TVA ', '5.50', 'O', 4, 'NON'),
(30, 3, 'TVA ', '10.00', 'O', 3, 'NON'),
(31, 3, 'TVA ', '2.10', 'O', 1, 'OUI'),
(32, 3, 'TVA ', '20.00', 'O', 2, 'NON'),
(33, 7, 'TPS', '9.50', 'O', 1, NULL),
(34, 7, 'CSS', '1.00', 'O', 2, NULL),
(35, 7, 'TVA ', '2.10', 'N', 3, NULL),
(36, 7, 'TVA ', '5.50', 'N', 4, NULL),
(37, 13, 'TVA Accessoires', '20.00', 'O', 1, 'NON'),
(38, 13, 'TVA consommables', '10.00', 'O', 2, 'NON'),
(39, 13, 'TVA pain', '2.10', 'O', 3, 'NON'),
(40, 13, 'TVA thé', '6.00', 'O', 4, 'NON');

-- --------------------------------------------------------

--
-- Structure de la table `upload_fichier`
--

CREATE TABLE `upload_fichier` (
  `id` int(11) NOT NULL,
  `fk` int(11) DEFAULT NULL,
  `societe_id` int(11) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `date_ajout` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `file_type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `upload_fichier`
--

INSERT INTO `upload_fichier` (`id`, `fk`, `societe_id`, `path`, `date_ajout`, `file_type`) VALUES
(1, NULL, 2, '/uploads/1754515132122.png', '2024-10-06 11:06:20', 'SOCI_IMG_LOGO'),
(3, NULL, 3, '/uploads/1737289683000.png', '2024-10-12 12:55:58', 'SOCI_IMG_LOGO'),
(4, 0, 2, '/uploads/1754515132122.png', '2025-05-30 10:23:29', 'SOCI_IMG_LOGO'),
(5, 0, 2, '/uploads/1754515132122.png', '2025-05-30 10:31:16', 'SOCI_IMG_LOGO'),
(6, 5, 2, '/uploads/1754515132122.png', '2025-05-30 11:33:42', 'SOCI_IMG_LOGO'),
(7, 6, 2, '/uploads/1754515132122.png', '2025-05-30 12:53:18', 'SOCI_IMG_LOGO'),
(8, 20, 2, '/uploads/1754515132122.png', '2025-05-31 17:57:44', 'SOCI_IMG_LOGO'),
(9, 21, 2, '/uploads/1754515132122.png', '2025-05-31 18:39:14', 'SOCI_IMG_LOGO'),
(10, 7, 2, '/uploads/1754515132122.png', '2025-05-31 22:47:11', 'SOCI_IMG_LOGO'),
(11, 8, 2, '/uploads/1754515132122.png', '2025-05-31 23:38:19', 'SOCI_IMG_LOGO'),
(12, 27, 2, '/uploads/1754515132122.png', '2025-06-01 19:07:17', 'SOCI_IMG_LOGO'),
(13, 6, 2, '/uploads/1754515132122.png', '2025-06-21 18:07:00', 'SOCI_IMG_LOGO'),
(14, 32, 2, '/uploads/1754515132122.png', '2025-06-29 18:08:47', 'SOCI_IMG_LOGO'),
(15, 36, 2, '/uploads/1754515132122.png', '2025-06-29 18:30:55', 'SOCI_IMG_LOGO'),
(16, 44, 2, '/uploads/1754515132122.png', '2025-06-29 19:57:58', 'SOCI_IMG_LOGO'),
(17, 4, 2, '/uploads/1754515132122.png', '2025-06-30 14:27:05', 'SOCI_IMG_LOGO'),
(19, 47, 2, '/uploads/1754515132122.png', '2025-06-30 15:15:09', 'SOCI_IMG_LOGO'),
(20, 4, 2, '/uploads/1754515132122.png', '2025-07-04 18:07:08', 'SOCI_IMG_LOGO'),
(21, NULL, 7, '/uploads/1751970581211.png', '2025-07-08 10:29:34', 'SOCI_IMG_LOGO'),
(22, 47, 2, '/uploads/1754515132122.png', '2025-07-08 21:53:13', 'SOCI_IMG_LOGO'),
(23, 37, 2, '/uploads/1754515132122.png', '2025-07-09 07:17:31', 'SOCI_IMG_LOGO'),
(25, 52, 7, '/uploads/users/1752158065298.jpg', '2025-07-10 14:34:25', 'USER_PHOTO_PROFIL'),
(26, 44, 7, 'uploads/prod-1752159026121-448433479.jpg', '2025-07-10 14:50:26', 'PROD_IMG_DESC'),
(27, 56, 13, '/uploads/1754523314446.png', '2025-07-28 14:09:25', 'SOCI_IMG_LOGO'),
(28, 66, 2, '/uploads/users/1754516936046.png', '2025-08-06 21:48:56', 'USER_PHOTO_PROFIL'),
(29, 4, 2, '/uploads/users/1754517710482.png', '2025-08-06 22:01:50', 'USER_PHOTO_PROFIL');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `birthDate` varchar(30) DEFAULT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `companyAddress` varchar(255) DEFAULT NULL,
  `workPhone` varchar(30) DEFAULT NULL,
  `personalPhone` varchar(30) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `societe_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiration` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `role_id`, `firstName`, `lastName`, `birthDate`, `companyName`, `companyAddress`, `workPhone`, `personalPhone`, `password`, `societe_id`, `created_at`, `statut`, `reset_token`, `reset_token_expiration`) VALUES
(3, 'olivagiorgia93@gmail.com', 1, 'Giorgia', 'Oliva', '1993-04-09', '', '', '', '077777777', '$2b$10$OjY5ZEBkeWtgJUIoqS7EV.XjkSo3t4ibsfBzcvI/V20HDZIzk9YbC', 3, '2024-09-20 18:10:58', 'actif', NULL, NULL),
(4, 'idnovation2014@gmail.com', 0, 'Vince ', 'Rudy', NULL, '', '7 rue de la Houssaye', '0695447522', '066884638', '$2b$10$epZas6oB..kNDN8x0fraXuMUfI93x1QtOuEvTgaa.DgZ3M5CnEWpG', 2, '2024-09-20 18:01:49', 'actif', '2c66822b0f1144b5b19e447362c5a826adecd405f3bc8e440eecf74fa527802f', '2025-07-06 02:19:39'),
(5, 'vincerudy@hotmail.fr', 0, 'Mouko', 'vince', '1987-02-12', NULL, NULL, NULL, '0665248951', '$2b$10$WBTcbRLqonrqfj5jTi7QE.YuYdktM81RmmsGwi2omAv2Px/q9UFla', 4, '2025-02-09 00:25:41', 'actif', '7c022514338d32fc16ff361bf196a72022e369158efa33ad8ea4871dec9ce3a3', '2025-05-19 14:06:43'),
(6, 'miroiterie@gmail.com', 0, 'Dos Santos', 'Richard', '1987-12-28', NULL, NULL, NULL, '066666666', '$2b$10$ZbJxmA2NYKGqcQoIazs58OAl43eqto19kQpR7038klJEOFNI7sTX.', 5, '2025-03-01 10:30:15', 'actif', NULL, NULL),
(47, 'elton@gmail.com', 0, 'Elton ', 'John', '2025-07-08', 'IDNOVA', '7 Rue de la Houssaye', '0695447522', '0695447522', '$2b$10$lKGNgyrhstqTulOZF2BZ5.gqNWmQo/bttku6EfXtll0gPWYC2Fu8q', 2, '2025-06-30 14:19:21', 'actif', NULL, NULL),
(48, 'lebron@gmail.com', 0, 'lebron ', 'james', NULL, '', '', '', '', '$2b$10$SFy3Axt59r3fII87cMlm4.HnXyW9tMR63wPIZRMrsfNF5hYMgELLu', 2, '2025-06-30 16:22:42', 'inactif', NULL, NULL),
(49, 'compta@gmail.com', 0, 'Comptable', 'Général', NULL, '', '', '', '', '$2b$10$5hGMISJ7Q8apUwJ9eOYz5.VSvaWqS6OebwJI1M92nY4XPSF9SSPKC', 2, '2025-06-30 16:27:12', 'actif', NULL, NULL),
(50, 'al@gmail.com', 2, 'Alexandre', 'Mouko', '2025-07-22', '', '', '0695447522', '', '$2b$10$Jji2WBPoMkKGE1j9iQAnO.gFpm.reulgcMjCabqaBA/T6jGg8.HOi', 2, '2025-06-30 16:35:12', 'actif', NULL, NULL),
(51, 'm@gmail.com', 2, 'Vince', 'MOUK', '2025-07-21', '', '', '0695447522', '', '$2b$10$gAolLwEsolZwTHNNHTTDYOAIotAWkzANTy9JkZW5TFOf3n1qwHete', 3, '2025-07-01 15:41:53', 'inactif', NULL, NULL),
(52, 'maixendan@gmail.com', 0, 'Dakson', 'Maixant ', NULL, '', '', '', '066544484', '$2b$10$jaaqWewZDdXrZLHQNuZWBuCzWHtz8YwEJRL5AFp4EMGx.ys2f8FZ2', 7, '2025-07-01 19:54:35', 'actif', NULL, NULL),
(54, 'alexandre@hotmail.fr', 0, 'Mouko', 'Alexandre', '2025-04-06', NULL, NULL, NULL, '0665248952', '$2b$10$uNBXIc7YagNbRTq6B..l2.qAP0a8NnCJrnqbQqGRzNimTnW3ciA5S', 9, '2025-07-02 10:23:29', 'actif', NULL, NULL),
(55, 'user@gmail.com', 0, 'User', 'test', NULL, '', '7 rue de la Houssaye', '0695447522', '', '$2b$10$FTW0XK4GuPTzsO9y82/JYuHdRieITjZ85PoZDXRs.fHglWdpZueba', 9, '2025-07-02 10:25:32', 'actif', NULL, NULL),
(58, 'bonnieres@gmail.com', 0, 'MOUKO M', 'Vince Rudy', '1987-10-28', '', '', '', '0665222799', '$2b$10$XaLJGqbYP5gWzQkNQz/zwOED/HDKh0uPyRD3.gUjyl5tbj/czaSU2', 12, '2025-07-02 17:50:59', 'actif', NULL, NULL),
(60, 'ware@gmail.com', 0, 'Miles', 'WARE', NULL, '', '7 rue de la Houssaye', '0695447522', '', '$2b$10$M9oFqa2r1M.u7pmH0eYtQOGRSpznxNspWwciygNphTnc0Ft8qD.qe', 2, '2025-07-04 17:44:32', 'actif', NULL, NULL),
(61, 'idnovation@gmail.com', 0, 'Giorgia', 'Oliva', NULL, 'IDNOVA', '7 rue de la Houssaye', '0695447522', '', '$2b$10$hGmjVMpgzXVb6uxl3JQsfOO5H5qijfEAUjWYz3nyziaoTzhBuAUsq', 2, '2025-07-08 10:59:28', 'actif', NULL, NULL),
(62, 'o93@gmail.com', 0, 'Giorgia', 'O', NULL, '', '7 rue de la Houssaye', '0695447522', '', '$2b$10$xM8lnHPwW524.1r5glacDOEKIHW4sUuWhEGeN3xwTcni.Qpa3SUOW', 2, '2025-07-08 21:34:23', 'actif', NULL, NULL),
(63, 'test@hotmail.fr', 0, 'test', 'test', '2025-07-09', 'IDNOVA', '7 rue de la Houssaye', '0695447522', '', '$2b$10$SyyEkxIVNBNTVXfCar5y3eddrSr56khd6RaxKYbUQmd9kVLI6so0m', 12, '2025-07-09 19:47:48', 'actif', NULL, NULL),
(64, 'alex@gmail.com', 0, 'Alexandre', 'MOUKO', '2025-04-06', '', '7 Rue de la Houssaye', '0665248951', '', '$2b$10$0K48eSnJ8bOQiMgqzFnjHe7Ju2/WkEx2in4SUH0ln.eehPEJatFuS', 3, '2025-07-10 14:35:45', 'actif', NULL, NULL),
(65, 'vincerudy@outlook.fr', 0, 'Joy', 'Mouko', '2010-02-14', NULL, NULL, NULL, '098272637738', '$2b$10$BugRghzJyWJQKSyYuQ9w4O0Z/XdEBBIlFdDQJjYxwjp7k6yF6FMke', 13, '2025-07-14 17:49:33', 'actif', NULL, NULL),
(66, 'test@gmail.com', NULL, 'Giorgia', 'Oliva', NULL, '', '7 rue de la Houssaye', '0695447522', '', '$2b$10$.Spc9M7kfEBkNHRt14Xv5eou4kanexDqyFQLXmljSbJDDWLT5Wg.2', 2, '2025-08-06 21:48:21', 'actif', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `user_permissions`
--

CREATE TABLE `user_permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `permission` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `user_permissions`
--

INSERT INTO `user_permissions` (`id`, `user_id`, `permission`, `created_at`, `updated_at`) VALUES
(136, 3, 'view_invoices', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(137, 3, 'create_invoices', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(138, 3, 'manage_invoices', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(139, 3, 'view_quotes', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(140, 3, 'manage_quotes', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(141, 3, 'manage_invoice_param', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(142, 3, 'view_recette_page', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(143, 3, 'view_clients', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(144, 3, 'manage_clients', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(145, 3, 'view_users', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(146, 3, 'manage_users', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(147, 3, 'access_reports', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(148, 3, 'campany_setting', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(149, 3, 'settings_access', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(150, 3, 'view_stock', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(151, 3, 'manage_stock', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(152, 3, 'create_product', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(153, 3, 'manage_inventory', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(154, 3, 'validate_inventory', '2025-07-01 15:37:02', '2025-07-01 15:37:02'),
(157, 51, 'view_invoices', '2025-07-01 15:41:53', '2025-07-01 15:41:53'),
(158, 51, 'view_quotes', '2025-07-01 15:41:53', '2025-07-01 15:41:53'),
(292, 52, 'view_invoices', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(293, 52, 'create_invoices', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(294, 52, 'manage_invoices', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(295, 52, 'manage_invoice_param', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(296, 52, 'view_quotes', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(297, 52, 'manage_quotes', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(298, 52, 'view_recette_page', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(299, 52, 'view_clients', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(300, 52, 'manage_clients', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(301, 52, 'view_users', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(302, 52, 'manage_users', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(303, 52, 'access_reports', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(304, 52, 'campany_setting', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(305, 52, 'settings_access', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(306, 52, 'view_stock', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(307, 52, 'manage_stock', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(308, 52, 'create_product', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(309, 52, 'manage_inventory', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(310, 52, 'validate_inventory', '2025-07-01 20:45:27', '2025-07-01 20:45:27'),
(353, 4, 'view_invoices', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(354, 4, 'create_invoices', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(355, 4, 'manage_invoices', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(356, 4, 'manage_invoice_param', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(357, 4, 'view_quotes', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(358, 4, 'manage_quotes', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(359, 4, 'view_recette_page', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(360, 4, 'view_clients', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(361, 4, 'manage_clients', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(362, 4, 'view_users', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(363, 4, 'manage_users', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(364, 4, 'access_reports', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(365, 4, 'campany_setting', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(366, 4, 'settings_access', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(367, 4, 'view_stock', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(368, 4, 'manage_stock', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(369, 4, 'create_product', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(370, 4, 'manage_inventory', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(371, 4, 'validate_inventory', '2025-07-01 21:01:24', '2025-07-01 21:01:24'),
(376, 54, 'user_admin_full_acces_control', '2025-07-02 10:23:29', '2025-07-02 10:23:29'),
(377, 55, 'view_invoices', '2025-07-02 10:25:32', '2025-07-02 10:25:32'),
(380, 58, 'user_admin_full_acces_control', '2025-07-02 17:50:59', '2025-07-02 17:50:59'),
(395, 61, 'create_invoices', '2025-07-08 10:59:28', '2025-07-08 10:59:28'),
(396, 60, 'view_invoices', '2025-07-08 21:33:11', '2025-07-08 21:33:11'),
(397, 60, 'create_invoices', '2025-07-08 21:33:11', '2025-07-08 21:33:11'),
(399, 62, 'view_invoices', '2025-07-08 21:34:39', '2025-07-08 21:34:39'),
(425, 47, 'view_invoices', '2025-07-08 22:06:28', '2025-07-08 22:06:28'),
(426, 47, 'create_invoices', '2025-07-08 22:06:28', '2025-07-08 22:06:28'),
(427, 47, 'view_quotes', '2025-07-08 22:06:28', '2025-07-08 22:06:28'),
(428, 47, 'view_stock', '2025-07-08 22:06:28', '2025-07-08 22:06:28'),
(429, 47, 'view_clients', '2025-07-08 22:06:28', '2025-07-08 22:06:28'),
(430, 49, 'view_invoices', '2025-07-08 22:12:57', '2025-07-08 22:12:57'),
(431, 63, 'view_invoices', '2025-07-09 19:47:48', '2025-07-09 19:47:48'),
(432, 63, 'create_invoices', '2025-07-09 19:47:48', '2025-07-09 19:47:48'),
(433, 64, 'view_invoices', '2025-07-10 14:35:45', '2025-07-10 14:35:45'),
(434, 64, 'create_invoices', '2025-07-10 14:35:45', '2025-07-10 14:35:45'),
(435, 65, 'user_admin_full_acces_control', '2025-07-14 17:49:33', '2025-07-14 17:49:33'),
(439, 66, 'view_invoices', '2025-08-06 21:48:56', '2025-08-06 21:48:56'),
(440, 66, 'create_invoices', '2025-08-06 21:48:56', '2025-08-06 21:48:56');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `alertes_facturation`
--
ALTER TABLE `alertes_facturation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_societe_id` (`societe_id`);

--
-- Index pour la table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `societe_id` (`societe_id`);

--
-- Index pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `societe_id` (`societe_id`);

--
-- Index pour la table `conversation`
--
ALTER TABLE `conversation`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Index pour la table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `factures`
--
ALTER TABLE `factures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `societe_id` (`societe_id`);

--
-- Index pour la table `mail_parametrage`
--
ALTER TABLE `mail_parametrage`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `societe_id` (`societe_id`,`type`);

--
-- Index pour la table `mail_settings`
--
ALTER TABLE `mail_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `societe_id` (`societe_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_message_societe` (`societe_id`);

--
-- Index pour la table `mouvements_stock`
--
ALTER TABLE `mouvements_stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `produit_id` (`produit_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `societe_id` (`societe_id`);

--
-- Index pour la table `options_societe`
--
ALTER TABLE `options_societe`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `fk_societe` (`societe_id`);

--
-- Index pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `facture_id` (`facture_id`);

--
-- Index pour la table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `produits`
--
ALTER TABLE `produits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `societe_id` (`societe_id`),
  ADD KEY `fk_id_prod_serv` (`id_prod_serv`);

--
-- Index pour la table `produits_services`
--
ALTER TABLE `produits_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `societe_id` (`societe_id`);

--
-- Index pour la table `Reglement_mode`
--
ALTER TABLE `Reglement_mode`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Index pour la table `societes`
--
ALTER TABLE `societes`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `societe_parametrage_facturation`
--
ALTER TABLE `societe_parametrage_facturation`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `fk_ticket_societe` (`societe_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Index pour la table `tva`
--
ALTER TABLE `tva`
  ADD PRIMARY KEY (`id`),
  ADD KEY `societe_id` (`societe_id`);

--
-- Index pour la table `upload_fichier`
--
ALTER TABLE `upload_fichier`
  ADD PRIMARY KEY (`id`),
  ADD KEY `societe_id` (`societe_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `societe_id` (`societe_id`);

--
-- Index pour la table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `fk_user` (`user_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `alertes_facturation`
--
ALTER TABLE `alertes_facturation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT pour la table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT pour la table `commandes`
--
ALTER TABLE `commandes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `conversation`
--
ALTER TABLE `conversation`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `factures`
--
ALTER TABLE `factures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=238;

--
-- AUTO_INCREMENT pour la table `mail_parametrage`
--
ALTER TABLE `mail_parametrage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `mail_settings`
--
ALTER TABLE `mail_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT pour la table `mouvements_stock`
--
ALTER TABLE `mouvements_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=138;

--
-- AUTO_INCREMENT pour la table `options_societe`
--
ALTER TABLE `options_societe`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `paiements`
--
ALTER TABLE `paiements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT pour la table `produits`
--
ALTER TABLE `produits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=578;

--
-- AUTO_INCREMENT pour la table `produits_services`
--
ALTER TABLE `produits_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT pour la table `Reglement_mode`
--
ALTER TABLE `Reglement_mode`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT pour la table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `societes`
--
ALTER TABLE `societes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `societe_parametrage_facturation`
--
ALTER TABLE `societe_parametrage_facturation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT pour la table `tva`
--
ALTER TABLE `tva`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT pour la table `upload_fichier`
--
ALTER TABLE `upload_fichier`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT pour la table `user_permissions`
--
ALTER TABLE `user_permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=441;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `alertes_facturation`
--
ALTER TABLE `alertes_facturation`
  ADD CONSTRAINT `alertes_facturation_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `alertes_facturation_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`);

--
-- Contraintes pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD CONSTRAINT `commandes_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `commandes_ibfk_2` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`);

--
-- Contraintes pour la table `factures`
--
ALTER TABLE `factures`
  ADD CONSTRAINT `factures_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `factures_ibfk_2` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`);

--
-- Contraintes pour la table `mail_settings`
--
ALTER TABLE `mail_settings`
  ADD CONSTRAINT `mail_settings_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mail_settings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `fk_message_societe` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `mouvements_stock`
--
ALTER TABLE `mouvements_stock`
  ADD CONSTRAINT `mouvements_stock_ibfk_1` FOREIGN KEY (`produit_id`) REFERENCES `produits_services` (`id`),
  ADD CONSTRAINT `mouvements_stock_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `mouvements_stock_ibfk_3` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `options_societe`
--
ALTER TABLE `options_societe`
  ADD CONSTRAINT `fk_societe` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD CONSTRAINT `paiements_ibfk_1` FOREIGN KEY (`facture_id`) REFERENCES `factures` (`id`);

--
-- Contraintes pour la table `produits`
--
ALTER TABLE `produits`
  ADD CONSTRAINT `fk_id_prod_serv` FOREIGN KEY (`id_prod_serv`) REFERENCES `produits_services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `produits_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`);

--
-- Contraintes pour la table `produits_services`
--
ALTER TABLE `produits_services`
  ADD CONSTRAINT `produits_services_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `fk_ticket_societe` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `tva`
--
ALTER TABLE `tva`
  ADD CONSTRAINT `tva_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `upload_fichier`
--
ALTER TABLE `upload_fichier`
  ADD CONSTRAINT `upload_fichier_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`);

--
-- Contraintes pour la table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
