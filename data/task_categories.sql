-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 13 mars 2025 à 23:34
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
-- Structure de la table `task_categories`
--

CREATE TABLE `task_categories` (
  `task_id` varchar(11) NOT NULL,
  `category_id` int(5) NOT NULL,
  `sous_statut` varchar(255) DEFAULT 'En attente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `task_categories`
--

INSERT INTO `task_categories` (`task_id`, `category_id`, `sous_statut`) VALUES
('2JGLB6fFVUX', 2, 'En attente'),
('2JGLB6fFVUX', 4, 'En attente'),
('2JGLB6fFVUX', 6, 'En attente'),
('qwyOIllPYBb', 2, 'En attente'),
('qwyOIllPYBb', 3, 'En attente'),
('XkChA6FOBID', 2, 'En attente'),
('XkChA6FOBID', 4, 'En attente');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `task_categories`
--
ALTER TABLE `task_categories`
  ADD PRIMARY KEY (`task_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `task_categories`
--
ALTER TABLE `task_categories`
  ADD CONSTRAINT `task_categories_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
