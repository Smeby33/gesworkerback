-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 27 mars 2025 à 11:42
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
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `icon`) VALUES
(1, 'Saisie prestataires contractuels', 'FaFileInvoice'),
(2, 'Saisie caisse', 'FaCashRegister'),
(3, 'Saisie autre dépense', 'FaCalculator'),
(4, 'Rapprochement bancaire', 'FaBalanceScale'),
(5, 'Plan de trésorerie', 'FaChartLine'),
(6, 'CNSS', 'FaFileInvoice'),
(7, 'CNAMGS', 'FaFileInvoice'),
(8, 'DSF', 'FaFileInvoice'),
(9, 'DAS', 'FaFileInvoice'),
(11, 'echeance', 'FaBalanceScale');

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

CREATE TABLE `clients` (
  `id` varchar(100) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `contact` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `timestamp` bigint(20) NOT NULL,
  `proprietaire` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `company_name`, `contact`, `email`, `address`, `description`, `timestamp`, `proprietaire`) VALUES
('00001008-b2d9-4efe-9d38-01a95c6fff44', 'most client ', 'zeéfre', 'fzerfre@ferfez', 'dferfzr', 'ezzefzfrzare', 2025, '0K56ujP89wa7blD7ckSKsaOxchW2'),
('14b6a44b-c8ae-4601-bec2-bed572121188', 'ALINA ', '04049', 'alina@gmail.com', 'cvfvgr', 'dsccfv', 2025, '0K56ujP89wa7blD7ckSKsaOxchW2'),
('ead34b6f-4f61-4c26-8119-08459c31aefb', 'O\'lo space ', '05156894', 'sfgjtrte@grbv.com', 'erfrgft(g', 'rt\'gt(gt', 2025, '0K56ujP89wa7blD7ckSKsaOxchW2');

-- --------------------------------------------------------

--
-- Structure de la table `comments`
--

CREATE TABLE `comments` (
  `id` varchar(36) NOT NULL,
  `entreprise_id` varchar(36) DEFAULT NULL,
  `author_id` varchar(36) DEFAULT NULL,
  `author_type` varchar(20) DEFAULT 'intervenant',
  `text` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_pinned` tinyint(1) DEFAULT 0,
  `status` varchar(20) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `comment_attachments`
--

CREATE TABLE `comment_attachments` (
  `id` varchar(36) NOT NULL,
  `comment_id` varchar(36) DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT 'application/octet-stream'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
('3AfpxDTUOUSwjMb1wYl4er2yeH33', 'anita', 'anita@gmail.com', '077679339', 'df', 'anita3498', NULL, 1741019703899, '0K56ujP89wa7blD7ckSKsaOxchW2'),
('cXE9EkfecqeFQHmqYFfM4iq6RWE2', 'lucas', 'lucas@gmail.com', '077679339', 'manager', 'lucas5197', NULL, 1742155569418, '0K56ujP89wa7blD7ckSKsaOxchW2'),
('dfQ9dP3mwvWLN4Cl357SpjpO8hV2', 'david', 'david@gmail.com', '65+59+6', 'dddf', 'david7732', NULL, 1739885415811, '0K56ujP89wa7blD7ckSKsaOxchW2'),
('FZhOmYyFcqTA6ciSQmhHSzecCcK2', 'emi', 'emi@gmail.com', '077679339', 'dresssseur', 'emi5518', NULL, 1739880203371, '0K56ujP89wa7blD7ckSKsaOxchW2'),
('pIQtoyOkPxSqjkqvTqJ31jGflws2', 'adio', 'adio@gmail.com', '077679339', 'efergft', 'adio5421', NULL, 1740859217936, '0K56ujP89wa7blD7ckSKsaOxchW2'),
('SsKgJLd0lvPdahEpNhn7dAbiirt1', 'eds', 'eds@gmail.com', '084891651', 'zezrejez', 'eds3844', NULL, 1739718410392, '0K56ujP89wa7blD7ckSKsaOxchW2'),
('UeQhbnpScyOl4nErt3E3mkpyzVA3', 'eni', 'eni@gmail.com', '078452520', 'snefboq', '$2b$10$l8ZPeNo63MUO105fm2YBYOQ.Yqd1zWjEZ/vsswg.Two.ay7tZoBA2', NULL, 1740858045118, '0K56ujP89wa7blD7ckSKsaOxchW2'),
('xDqIVtPZayZOMeoiLoVKgIebXxj1', 'nel', 'nel@gmail.com', '077101398', 'frgr', 'nel3788', NULL, 1742308687739, '0K56ujP89wa7blD7ckSKsaOxchW2');

-- --------------------------------------------------------

--
-- Structure de la table `performance`
--

CREATE TABLE `performance` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `total` int(11) DEFAULT 0,
  `completed` int(11) DEFAULT 0,
  `in_progress` int(11) DEFAULT 0,
  `cancelled` int(11) DEFAULT 0,
  `progress` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `performance`
--

INSERT INTO `performance` (`id`, `username`, `total`, `completed`, `in_progress`, `cancelled`, `progress`) VALUES
(1, 'pIQtoyOkPxSqjkqvTqJ31jGflws2', 3, 2, 1, 0, 67),
(38, 'pIQtoyOkPxSqjkqvTqJ31jGflws2', 3, 2, 1, 0, 67),
(39, 'pIQtoyOkPxSqjkqvTqJ31jGflws2', 3, 2, 1, 0, 67);

-- --------------------------------------------------------

--
-- Structure de la table `presences`
--

CREATE TABLE `presences` (
  `id` int(11) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `priorité`
--

CREATE TABLE `priorité` (
  `id` int(5) NOT NULL,
  `Type` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `priorité`
--

INSERT INTO `priorité` (`id`, `Type`) VALUES
(1, 'Priorité Maximale'),
(2, 'Priorité Élevée'),
(3, 'Priorité Moyenne'),
(4, 'Priorité Faible'),
(5, 'Priorité Nulle');

-- --------------------------------------------------------

--
-- Structure de la table `tasks`
--

CREATE TABLE `tasks` (
  `id` varchar(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `priorite` int(100) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `date_debut` datetime NOT NULL,
  `date_fin` datetime NOT NULL,
  `statut` enum('En attente','En cours','Terminé','Annulé') DEFAULT 'En attente',
  `timestamp` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `priorite`, `company`, `date_debut`, `date_fin`, `statut`, `timestamp`) VALUES
('2JGLB6fFVUX', 'hey', 4, '14b6a44b-c8ae-4601-bec2-bed572121188', '2025-03-06 09:58:00', '2025-03-28 10:59:00', 'En cours', 1741256287053),
('qwyOIllPYBb', 'diki', 1, '00001008-b2d9-4efe-9d38-01a95c6fff44', '2025-03-13 20:42:00', '2025-03-20 21:42:00', 'Terminé', 1741898577231),
('XkChA6FOBID', 'pascales', 3, '00001008-b2d9-4efe-9d38-01a95c6fff44', '2025-03-06 16:04:00', '2025-03-20 17:05:00', 'Terminé', 1741277162943);

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
('2JGLB6fFVUX', 2, 'Terminé'),
('2JGLB6fFVUX', 4, 'Terminé'),
('2JGLB6fFVUX', 6, 'Terminé'),
('qwyOIllPYBb', 2, 'En cours'),
('qwyOIllPYBb', 3, 'Terminé'),
('XkChA6FOBID', 2, 'Terminé'),
('XkChA6FOBID', 4, 'Terminé');

-- --------------------------------------------------------

--
-- Structure de la table `task_intervenants`
--

CREATE TABLE `task_intervenants` (
  `task_id` varchar(11) NOT NULL,
  `intervenant_id` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `task_intervenants`
--

INSERT INTO `task_intervenants` (`task_id`, `intervenant_id`) VALUES
('2JGLB6fFVUX', 'pIQtoyOkPxSqjkqvTqJ31jGflws2'),
('2JGLB6fFVUX', 'UeQhbnpScyOl4nErt3E3mkpyzVA3'),
('qwyOIllPYBb', '3AfpxDTUOUSwjMb1wYl4er2yeH33'),
('qwyOIllPYBb', 'pIQtoyOkPxSqjkqvTqJ31jGflws2'),
('XkChA6FOBID', 'pIQtoyOkPxSqjkqvTqJ31jGflws2'),
('XkChA6FOBID', 'UeQhbnpScyOl4nErt3E3mkpyzVA3');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_admin` tinyint(1) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `is_admin`, `company_name`, `profile_picture`) VALUES
('0K56ujP89wa7blD7ckSKsaOxchW2', 'test', 'test@gmail.com', '$2b$10$hxhYaaTNqHVO4Rk06CIkweNl75qBQp5JB/5QKBi0XOutS6LxqrHta', 1, 'testwork', NULL);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `proprietaire` (`proprietaire`);

--
-- Index pour la table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `entreprise_id` (`entreprise_id`),
  ADD KEY `author_id` (`author_id`),
  ADD KEY `author_type` (`author_type`);

--
-- Index pour la table `comment_attachments`
--
ALTER TABLE `comment_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comment_id` (`comment_id`);

--
-- Index pour la table `intervenant`
--
ALTER TABLE `intervenant`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `proprietaire` (`proprietaire`);

--
-- Index pour la table `performance`
--
ALTER TABLE `performance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`);

--
-- Index pour la table `presences`
--
ALTER TABLE `presences`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `priorité`
--
ALTER TABLE `priorité`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Priorité` (`priorite`),
  ADD KEY `company` (`company`);

--
-- Index pour la table `task_categories`
--
ALTER TABLE `task_categories`
  ADD PRIMARY KEY (`task_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Index pour la table `task_intervenants`
--
ALTER TABLE `task_intervenants`
  ADD PRIMARY KEY (`task_id`,`intervenant_id`),
  ADD KEY `intervenant_id` (`intervenant_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`name`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `performance`
--
ALTER TABLE `performance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT pour la table `presences`
--
ALTER TABLE `presences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `priorité`
--
ALTER TABLE `priorité`
  MODIFY `id` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`proprietaire`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Contraintes pour la table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`id`) REFERENCES `tasks` (`id`),
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`entreprise_id`) REFERENCES `tasks` (`company`),
  ADD CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`author_id`) REFERENCES `intervenant` (`id`),
  ADD CONSTRAINT `comments_ibfk_4` FOREIGN KEY (`author_type`) REFERENCES `intervenant` (`proprietaire`);

--
-- Contraintes pour la table `comment_attachments`
--
ALTER TABLE `comment_attachments`
  ADD CONSTRAINT `comment_attachments_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`);

--
-- Contraintes pour la table `intervenant`
--
ALTER TABLE `intervenant`
  ADD CONSTRAINT `intervenant_ibfk_1` FOREIGN KEY (`proprietaire`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `performance`
--
ALTER TABLE `performance`
  ADD CONSTRAINT `performance_ibfk_1` FOREIGN KEY (`username`) REFERENCES `intervenant` (`id`);

--
-- Contraintes pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`priorite`) REFERENCES `priorité` (`id`),
  ADD CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`company`) REFERENCES `clients` (`id`);

--
-- Contraintes pour la table `task_categories`
--
ALTER TABLE `task_categories`
  ADD CONSTRAINT `task_categories_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `task_intervenants`
--
ALTER TABLE `task_intervenants`
  ADD CONSTRAINT `task_intervenants_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_intervenants_ibfk_2` FOREIGN KEY (`intervenant_id`) REFERENCES `intervenant` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
