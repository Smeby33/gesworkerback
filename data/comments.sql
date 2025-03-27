-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 27 mars 2025 à 13:30
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gesworker`
--

-- --------------------------------------------------------

--
-- Structure de la table `comments`
--

CREATE TABLE `comments` (
  `id` varchar(36) NOT NULL,
  `task_id` varchar(11) DEFAULT NULL,
  `author_id` varchar(36) DEFAULT 'Admin',
  `author_type` varchar(20) DEFAULT 'intervenant',
  `text` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_pinned` tinyint(1) DEFAULT 0,
  `status` varchar(20) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `comments`
--

INSERT INTO `comments` (`id`, `task_id`, `author_id`, `author_type`, `text`, `created_at`, `updated_at`, `is_pinned`, `status`) VALUES
('05f75667-0b07-11f0-ab75-00be435578c9', 'qwyOIllPYBb', '00001008-b2d9-4efe-9d38-01a95c6fff44', '0K56ujP89wa7blD7ckSK', 'intervenant', '2025-03-27 12:28:44', '2025-03-27 12:28:44', 0, 'active'),
('9f9fb81e-0b06-11f0-ab75-00be435578c9', 'qwyOIllPYBb', '00001008-b2d9-4efe-9d38-01a95c6fff44', '0K56ujP89wa7blD7ckSK', 'intervenant', '2025-03-27 12:25:52', '2025-03-27 12:25:52', 0, 'active');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `author_id` (`author_id`),
  ADD KEY `author_type` (`author_type`),
  ADD KEY `comments_task_fk` (`task_id`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_task_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
