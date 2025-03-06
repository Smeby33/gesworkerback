-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 01 mars 2025 à 09:58
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
-- Structure de la table `intervenant`
--

CREATE TABLE `intervenant` (
  `id` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `profile_picture` text DEFAULT NULL,
  `timestamp` bigint(20) NOT NULL,
  `proprietaire` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `intervenant`
--

INSERT INTO `intervenant` (`id`, `name`, `email`, `phone`, `role`, `password`, `profile_picture`, `timestamp`, `proprietaire`) VALUES
('dfQ9dP3mwvWLN4Cl357SpjpO8hV2', 'david', 'david@gmail.com', '65+59+6', 'dddf', 'david7732', NULL, 1739885415811, '0K56ujP89wa7blD7ckSKsaOxchW2'),
('FZhOmYyFcqTA6ciSQmhHSzecCcK2', 'emi', 'emi@gmail.com', '077679339', 'dresssseur', 'emi5518', NULL, 1739880203371, '0K56ujP89wa7blD7ckSKsaOxchW2'),
('SsKgJLd0lvPdahEpNhn7dAbiirt1', 'eds', 'eds@gmail.com', '084891651', 'zezrejez', 'eds3844', NULL, 1739718410392, '0K56ujP89wa7blD7ckSKsaOxchW2');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `intervenant`
--
ALTER TABLE `intervenant`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `proprietaire` (`proprietaire`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `intervenant`
--
ALTER TABLE `intervenant`
  ADD CONSTRAINT `intervenant_ibfk_1` FOREIGN KEY (`proprietaire`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
