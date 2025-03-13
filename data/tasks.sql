-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 04 mars 2025 à 09:50
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
-- Structure de la table `tasks`
-- 

CREATE TABLE `tasks` (
  `id` varchar(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `categories` int(5) NOT NULL,
  `priorite` int(100) NOT NULL,
  `intervenants` varchar(100) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `date_debut` datetime NOT NULL,
  `date_fin` datetime NOT NULL,
  `statut` enum('En attente','En cours','Terminé') DEFAULT 'En attente',
  `timestamp` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `categories`, `priorite`, `intervenants`, `company`, `date_debut`, `date_fin`, `statut`, `timestamp`) VALUES
('40qTWNZPuy5', 'Nouvelle tâche', 1, 2, 'FZhOmYyFcqTA6ciSQmhHSzecCcK2', '14b6a44b-c8ae-4601-bec2-bed572121188', '2025-02-18 09:00:00', '2025-02-19 18:00:00', 'En attente', 1739942842935);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Priorité` (`priorite`),
  ADD KEY `categories` (`categories`),
  ADD KEY `company` (`company`),
  ADD KEY `intervenants` (`intervenants`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`priorite`) REFERENCES `priorité` (`id`),
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`categories`) REFERENCES `task_categories` (`id`),
  ADD CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`company`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `tasks_ibfk_4` FOREIGN KEY (`intervenants`) REFERENCES `intervenant` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
