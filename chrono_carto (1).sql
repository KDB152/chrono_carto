-- phpMyAdmin SQL Dump
-- version 4.7.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le :  jeu. 02 oct. 2025 à 19:40
-- Version du serveur :  5.7.17
-- Version de PHP :  5.6.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `chrono_carto`
--

DELIMITER $$
--
-- Procédures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_column_if_not_exists` (IN `tbl` VARCHAR(64), IN `col` VARCHAR(64), IN `col_def` TEXT)  BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = tbl 
        AND COLUMN_NAME = col
    ) THEN
        SET @stmt = CONCAT('ALTER TABLE ', tbl, ' ADD COLUMN ', col_def);
        PREPARE stmt FROM @stmt;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `add_index_if_not_exists` (IN `tbl` VARCHAR(64), IN `idx` VARCHAR(64), IN `col` VARCHAR(64))  BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = tbl
        AND INDEX_NAME = idx
    ) THEN
        SET @stmt = CONCAT('CREATE INDEX ', idx, ' ON ', tbl, '(', col, ')');
        PREPARE stmt FROM @stmt;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `CreateParentStudentRelation` (IN `p_parent_first_name` VARCHAR(100), IN `p_parent_last_name` VARCHAR(100), IN `p_student_first_name` VARCHAR(100), IN `p_student_last_name` VARCHAR(100), IN `p_class_name` VARCHAR(100))  BEGIN
    DECLARE parent_id INT;
    DECLARE student_id INT;
    
        SELECT p.id INTO parent_id
    FROM parents_new p
    JOIN users_new u ON p.user_id = u.id
    WHERE u.first_name = p_parent_first_name 
    AND u.last_name = p_parent_last_name
    AND p.student_class = p_class_name;
    
        SELECT s.id INTO student_id
    FROM students_new s
    JOIN users_new u ON s.user_id = u.id
    WHERE u.first_name = p_student_first_name 
    AND u.last_name = p_student_last_name
    AND s.class_name = p_class_name;
    
        IF parent_id IS NOT NULL AND student_id IS NOT NULL THEN
        INSERT IGNORE INTO parent_student_relations_new 
        (parent_id, student_id, relation_type, created_automatically)
        VALUES (parent_id, student_id, 'parent', TRUE);
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `EnregistrerPaiement` (IN `p_student_id` INT, IN `p_parent_id` INT, IN `p_seances_payees` INT, IN `p_montant_paye` DECIMAL(10,2))  BEGIN
    DECLARE v_seances_non_payees INT;
    DECLARE v_montant_restant DECIMAL(10,2);
    
    SELECT seances_non_payees, montant_restant 
    INTO v_seances_non_payees, v_montant_restant
    FROM paiement 
    WHERE student_id = p_student_id AND parent_id = p_parent_id;
    
    IF v_seances_non_payees >= p_seances_payees THEN
        UPDATE paiement 
        SET 
            seances_payees = seances_payees + p_seances_payees,
            seances_non_payees = seances_non_payees - p_seances_payees,
            montant_paye = montant_paye + p_montant_paye,
            montant_restant = montant_restant - p_montant_paye,
            date_dernier_paiement = CURRENT_DATE,
            date_modification = CURRENT_TIMESTAMP,
            statut = CASE 
                WHEN (seances_non_payees - p_seances_payees) = 0 THEN 'paye'
                WHEN (seances_non_payees - p_seances_payees) <= 2 THEN 'partiel'
                ELSE 'en_attente'
            END
        WHERE student_id = p_student_id AND parent_id = p_parent_id;
    ELSE
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Nombre de séances non payées insuffisant';
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdatePaiementOnPresence` (IN `p_student_id` INT, IN `p_parent_id` INT, IN `p_date_presence` DATE)  BEGIN
    DECLARE v_prix_seance DECIMAL(10,2) DEFAULT 50.00;
    
    INSERT INTO paiement (
        student_id, parent_id, seances_total, seances_non_payees,
        montant_total, montant_restant, date_derniere_presence
    ) VALUES (
        p_student_id, p_parent_id, 1, 1,
        v_prix_seance, v_prix_seance, p_date_presence
    )
    ON DUPLICATE KEY UPDATE
        seances_total = seances_total + 1,
        seances_non_payees = seances_non_payees + 1,
        montant_total = montant_total + v_prix_seance,
        montant_restant = montant_restant + v_prix_seance,
        date_derniere_presence = p_date_presence,
        date_modification = CURRENT_TIMESTAMP;
        
    UPDATE paiement 
    SET statut = CASE 
        WHEN seances_non_payees = 0 THEN 'paye'
        WHEN seances_non_payees <= 2 THEN 'partiel'
        WHEN seances_non_payees > 5 THEN 'en_retard'
        ELSE 'en_attente'
    END
    WHERE student_id = p_student_id AND parent_id = p_parent_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `session_date` date NOT NULL,
  `is_present` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `attendance`
--

INSERT INTO `attendance` (`id`, `student_id`, `session_date`, `is_present`, `created_at`, `updated_at`) VALUES
(48, 1, '2025-09-30', 1, '2025-09-30 17:52:49', '2025-09-30 17:52:49'),
(47, 1, '2025-09-28', 1, '2025-09-28 16:02:53', '2025-09-28 16:02:53');

-- --------------------------------------------------------

--
-- Structure de la table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Standard',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `classes`
--

INSERT INTO `classes` (`id`, `name`, `description`, `level`, `created_at`, `updated_at`) VALUES
(1, 'Terminale groupe 1', NULL, 'Avancé', '2025-09-02 18:23:42', '2025-09-11 18:38:15'),
(2, 'Terminale groupe 2', NULL, 'Avancé', '2025-09-02 18:23:42', '2025-09-11 18:38:20'),
(3, 'Terminale groupe 3', NULL, 'Avancé', '2025-09-02 18:23:42', '2025-09-11 18:38:27'),
(4, 'Terminale groupe 4', NULL, 'Avancé', '2025-09-02 18:23:42', '2025-09-11 18:38:24'),
(5, '1ère groupe 1', NULL, 'Intermédiaire', '2025-09-02 18:23:42', '2025-09-11 18:38:30'),
(6, '1ère groupe 2', NULL, 'Intermédiaire', '2025-09-02 18:23:42', '2025-09-11 18:38:39'),
(7, '1ère groupe 3', NULL, 'Intermédiaire', '2025-09-02 18:23:42', '2025-09-11 18:38:34');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `content_by_subject`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `content_by_subject` (
);

-- --------------------------------------------------------

--
-- Structure de la table `conversation`
--

CREATE TABLE `conversation` (
  `id` int(11) NOT NULL,
  `groupe_id` int(11) DEFAULT NULL,
  `last_message_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'direct',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `participant1_id` int(11) DEFAULT NULL,
  `participant2_id` int(11) DEFAULT NULL,
  `class_level` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `conversation`
--

INSERT INTO `conversation` (`id`, `groupe_id`, `last_message_id`, `created_at`, `updated_at`, `type`, `title`, `participant1_id`, `participant2_id`, `class_level`) VALUES
(53, NULL, NULL, '2025-09-21 21:49:27', '2025-09-21 21:49:27', 'direct', 'Parent Temporaire', 48, 52, NULL),
(51, NULL, 49, '2025-09-15 20:22:55', '2025-09-30 18:03:50', 'direct', 'Administrateur', 48, 50, NULL),
(52, NULL, NULL, '2025-09-15 21:02:41', '2025-09-30 18:03:50', 'direct', 'Mehdi El Abed', 49, 50, NULL),
(50, NULL, NULL, '2025-09-11 18:38:48', '2025-09-11 18:38:48', 'class', 'Terminale groupe 4', NULL, NULL, 'Terminale groupe 4'),
(49, NULL, 50, '2025-09-11 18:38:48', '2025-09-30 17:54:01', 'class', 'Terminale groupe 3', NULL, NULL, 'Terminale groupe 3'),
(48, NULL, NULL, '2025-09-11 18:38:48', '2025-09-11 18:38:48', 'class', 'Terminale groupe 2', NULL, NULL, 'Terminale groupe 2'),
(47, NULL, 48, '2025-09-11 18:38:48', '2025-09-16 20:06:32', 'class', 'Terminale groupe 1', NULL, NULL, 'Terminale groupe 1'),
(45, NULL, NULL, '2025-09-11 18:38:47', '2025-09-11 18:38:47', 'class', '1ère groupe 2', NULL, NULL, '1ère groupe 2'),
(46, NULL, NULL, '2025-09-11 18:38:47', '2025-09-11 18:38:47', 'class', '1ère groupe 3', NULL, NULL, '1ère groupe 3'),
(44, NULL, 44, '2025-09-11 18:38:47', '2025-09-15 21:01:44', 'class', '1ère groupe 1', NULL, NULL, '1ère groupe 1');

-- --------------------------------------------------------

--
-- Structure de la table `dossiers`
--

CREATE TABLE `dossiers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nom du dossier global',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Description du dossier',
  `target_class` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Classes cibles (JSON)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `dossiers`
--

INSERT INTO `dossiers` (`id`, `name`, `description`, `target_class`, `created_at`, `updated_at`) VALUES
(1, 'histoire', '', '[\"Terminale groupe 3\"]', '2025-09-30 17:53:14', '2025-09-30 17:53:14');

-- --------------------------------------------------------

--
-- Structure de la table `fichiers`
--

CREATE TABLE `fichiers` (
  `id` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Titre du fichier',
  `sous_dossier_id` int(11) NOT NULL COMMENT 'ID du sous-dossier parent',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Description du fichier',
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nom du fichier original',
  `stored_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nom de stockage',
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Chemin du fichier',
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Type MIME du fichier',
  `file_size` bigint(20) NOT NULL COMMENT 'Taille du fichier en bytes',
  `download_count` int(11) DEFAULT '0' COMMENT 'Nombre de téléchargements',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `fichiers`
--

INSERT INTO `fichiers` (`id`, `title`, `sous_dossier_id`, `description`, `file_name`, `stored_name`, `file_path`, `file_type`, `file_size`, `download_count`, `created_at`, `updated_at`) VALUES
(1, ',kadz', 1, '', 'Order - OVHcloud1 (1).pdf', '1759254825224_wfwg98qoj4.pdf', 'uploads/fichiers/1759254825224_wfwg98qoj4.pdf', 'application/pdf', 122750, 1, '2025-09-30 17:53:45', '2025-09-30 17:54:49');

-- --------------------------------------------------------

--
-- Structure de la table `folders`
--

CREATE TABLE `folders` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `parent_id` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `is_global` tinyint(1) NOT NULL DEFAULT '0',
  `target_classes` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `groupes`
--

CREATE TABLE `groupes` (
  `id` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_level` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `groupes`
--

INSERT INTO `groupes` (`id`, `title`, `class_level`, `created_at`, `updated_at`) VALUES
(1, 'Groupe Terminale groupe 1', 'Terminale groupe 1', '2025-09-07 11:23:11', '2025-09-07 11:23:11'),
(2, 'Groupe Terminale groupe 2', 'Terminale groupe 2', '2025-09-07 11:23:36', '2025-09-07 11:23:36'),
(3, 'Groupe Terminale groupe 3', 'Terminale groupe 3', '2025-09-07 11:23:36', '2025-09-07 11:23:36'),
(4, 'Groupe Terminale groupe 4', 'Terminale groupe 4', '2025-09-07 11:23:36', '2025-09-07 11:23:36'),
(5, 'Groupe 1ère groupe 1', '1ère groupe 1', '2025-09-07 11:23:36', '2025-09-07 11:23:36'),
(6, 'Groupe 1ère groupe 2', '1ère groupe 2', '2025-09-07 11:23:36', '2025-09-07 11:23:36'),
(7, 'Groupe 1ère groupe 3', '1ère groupe 3', '2025-09-07 11:23:36', '2025-09-07 11:23:36');

-- --------------------------------------------------------

--
-- Structure de la table `groups`
--

CREATE TABLE `groups` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `class_level` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'class',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `groups`
--

INSERT INTO `groups` (`id`, `name`, `description`, `class_level`, `type`, `is_active`, `created_at`, `updated_at`) VALUES
(3, 'Terminale Groupe 1', 'Groupe de messagerie pour la classe Terminale groupe 1', 'Terminale groupe 1', 'class', 1, '2025-09-06 23:56:31', '2025-09-06 23:56:31'),
(4, 'Terminale Groupe 2', 'Groupe de messagerie pour la classe Terminale groupe 2', 'Terminale groupe 2', 'class', 1, '2025-09-06 23:56:31', '2025-09-06 23:56:31'),
(5, 'Terminale Groupe 3', 'Groupe de messagerie pour la classe Terminale groupe 3', 'Terminale groupe 3', 'class', 1, '2025-09-06 23:56:31', '2025-09-06 23:56:31'),
(6, 'Terminale Groupe 4', 'Groupe de messagerie pour la classe Terminale groupe 4', 'Terminale groupe 4', 'class', 1, '2025-09-06 23:56:31', '2025-09-06 23:56:31'),
(7, '1ère Groupe 1', 'Groupe de messagerie pour la classe 1ère groupe 1', '1ère groupe 1', 'class', 1, '2025-09-06 23:56:31', '2025-09-06 23:56:31'),
(8, '1ère Groupe 2', 'Groupe de messagerie pour la classe 1ère groupe 2', '1ère groupe 2', 'class', 1, '2025-09-06 23:56:31', '2025-09-06 23:56:31'),
(9, '1ère Groupe 3', 'Groupe de messagerie pour la classe 1ère groupe 3', '1ère groupe 3', 'class', 1, '2025-09-06 23:56:31', '2025-09-06 23:56:31');

-- --------------------------------------------------------

--
-- Structure de la table `meetings`
--

CREATE TABLE `meetings` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `meeting_date` datetime NOT NULL,
  `duration_minutes` int(11) DEFAULT '30',
  `status` enum('scheduled','completed','cancelled','rescheduled') COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meeting_type` enum('in_person','online','phone') COLLATE utf8mb4_unicode_ci DEFAULT 'in_person',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `meetings`
--
DELIMITER $$
CREATE TRIGGER `tr_meeting_approved_notification` AFTER UPDATE ON `meetings` FOR EACH ROW BEGIN
    DECLARE parent_user_id INT;
    DECLARE admin_name VARCHAR(255);
    
        IF (OLD.status != 'approved' AND NEW.status = 'approved') OR 
       (OLD.status != 'confirmed' AND NEW.status = 'confirmed') THEN
        
                SELECT p.user_id INTO parent_user_id
        FROM parents p
        WHERE p.id = NEW.parent_id;
        
                SELECT CONCAT(first_name, ' ', last_name) INTO admin_name
        FROM users 
        WHERE id = NEW.admin_id;
        
                IF parent_user_id IS NOT NULL THEN
            INSERT INTO notifications (
                user_id, type_id, title, message, is_urgent,
                related_entity_type, related_entity_id, metadata, expires_at
            )
            SELECT 
                parent_user_id,
                nt.id,
                'Rendez-vous approuvé',
                CONCAT('Votre rendez-vous du ', DATE_FORMAT(NEW.meeting_date, '%d/%m/%Y à %H:%i'), ' a été approuvé par ', COALESCE(admin_name, 'l'administrateur')),
                FALSE,
                'meeting',
                NEW.id,
                JSON_OBJECT(
                    'meeting_id', NEW.id,
                    'meeting_date', NEW.meeting_date,
                    'meeting_title', NEW.title,
                    'meeting_location', COALESCE(NEW.location, 'Non spécifié'),
                    'admin_name', COALESCE(admin_name, 'Administrateur'),
                    'status', NEW.status,
                    'approved_at', NOW()
                ),
                NEW.meeting_date
            FROM notification_types nt
            WHERE nt.type_name = 'meeting_scheduled';
        END IF;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_meeting_reminder_notification` AFTER INSERT ON `meetings` FOR EACH ROW BEGIN
    DECLARE parent_user_id INT;
    
        SELECT p.user_id INTO parent_user_id
    FROM parents p
    WHERE p.id = NEW.parent_id;
    
        IF parent_user_id IS NOT NULL THEN
        INSERT INTO notifications (
            user_id, type_id, title, message, is_urgent,
            related_entity_type, related_entity_id, metadata, expires_at
        )
        SELECT 
            parent_user_id,
            nt.id,
            'Rappel de rendez-vous',
            CONCAT('Vous avez un rendez-vous demain à ', TIME_FORMAT(NEW.meeting_date, '%H:%i'), ' - ', NEW.title),
            FALSE,
            'meeting',
            NEW.id,
            JSON_OBJECT(
                'meeting_date', NEW.meeting_date,
                'meeting_title', NEW.title,
                'meeting_location', COALESCE(NEW.location, 'Non spécifié'),
                'meeting_type', NEW.meeting_type
            ),
            NEW.meeting_date
        FROM notification_types nt
        WHERE nt.type_name = 'meeting_reminder';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `recipient_id` int(11) DEFAULT NULL,
  `groupe_id` int(11) DEFAULT NULL,
  `conversation_id` int(11) NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'text',
  `is_read` tinyint(1) DEFAULT '0',
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `groupe_id`, `conversation_id`, `content`, `message_type`, `is_read`, `file_path`, `created_at`, `updated_at`) VALUES
(50, 48, NULL, NULL, 49, 'cc', 'text', 1, NULL, '2025-09-30 17:54:01', '2025-09-30 17:54:37');

-- --------------------------------------------------------

--
-- Structure de la table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(11) NOT NULL,
  `timestamp` bigint(20) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `migrations`
--

INSERT INTO `migrations` (`id`, `timestamp`, `name`) VALUES
(2, 1700000000000, 'CreatePaymentsTable1700000000000'),
(3, 1700000000002, 'CreateFoldersTables1700000000002'),
(4, 1700000000002, 'CreateFoldersTables1700000000002'),
(5, 1700000000004, 'RemoveTargetClassesFromFiles1700000000004'),
(6, 1700000000005, 'CreateNewStructureTables1700000000005');

-- --------------------------------------------------------

--
-- Structure de la table `paiement`
--

CREATE TABLE `paiement` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `seances_total` int(11) DEFAULT '0' COMMENT 'Nombre total de séances (présences)',
  `seances_non_payees` int(11) DEFAULT '0' COMMENT 'Nombre de séances non payées',
  `seances_payees` int(11) DEFAULT '0' COMMENT 'Nombre de séances payées',
  `montant_total` decimal(10,2) DEFAULT '0.00' COMMENT 'Montant total des séances',
  `montant_paye` decimal(10,2) DEFAULT '0.00' COMMENT 'Montant payé',
  `montant_restant` decimal(10,2) DEFAULT '0.00' COMMENT 'Montant restant à payer',
  `prix_seance` decimal(10,2) DEFAULT '50.00' COMMENT 'Prix par séance (configurable)',
  `statut` enum('en_attente','partiel','paye','en_retard') COLLATE utf8mb4_unicode_ci DEFAULT 'en_attente',
  `date_derniere_presence` date DEFAULT NULL COMMENT 'Date de la dernière présence',
  `date_dernier_paiement` date DEFAULT NULL COMMENT 'Date du dernier paiement',
  `date_creation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `paiement`
--

INSERT INTO `paiement` (`id`, `student_id`, `parent_id`, `seances_total`, `seances_non_payees`, `seances_payees`, `montant_total`, `montant_paye`, `montant_restant`, `prix_seance`, `statut`, `date_derniere_presence`, `date_dernier_paiement`, `date_creation`, `date_modification`) VALUES
(1, 1, NULL, 2, 2, 0, '80.00', '0.00', '80.00', '40.00', 'partiel', NULL, NULL, '2025-09-28 16:02:53', '2025-09-30 17:52:49');

-- --------------------------------------------------------

--
-- Structure de la table `parents`
--

CREATE TABLE `parents` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `phone_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `occupation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `parents`
--

INSERT INTO `parents` (`id`, `user_id`, `phone_number`, `address`, `occupation`) VALUES
(1, 50, '95588885', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `parent_student`
--

CREATE TABLE `parent_student` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `parent_student`
--

INSERT INTO `parent_student` (`id`, `parent_id`, `student_id`, `created_at`) VALUES
(1, 1, 1, '2025-09-28 16:59:56.555986');

-- --------------------------------------------------------

--
-- Structure de la table `pdp`
--

CREATE TABLE `pdp` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stored_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` enum('JPEG','PNG','SVG','GIF','WebP') COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table pour stocker les photos de profil des utilisateurs';

--
-- Déchargement des données de la table `pdp`
--

INSERT INTO `pdp` (`id`, `user_id`, `file_name`, `stored_name`, `file_path`, `file_type`, `file_size`, `created_at`, `updated_at`) VALUES
(12, 48, 'chrono_carto_logo (1) (1) (1).png', 'cf5a926e-b37e-4cd4-a7d2-b3523db96207.png', 'C:\\Users\\ABU ZELZEL\\OneDrive\\Bureau\\rani bhim\\Chrono_Carto\\chrono-carto-backend\\uploads\\profiles\\cf5a926e-b37e-4cd4-a7d2-b3523db96207.png', 'PNG', 1581428, '2025-09-30 17:53:53', '2025-09-30 17:53:53');

-- --------------------------------------------------------

--
-- Structure de la table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int(11) DEFAULT '0',
  `attempts` int(11) DEFAULT '0',
  `average_score` decimal(5,2) DEFAULT '0.00',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Brouillon',
  `is_time_limited` tinyint(1) DEFAULT '0',
  `allow_retake` tinyint(1) DEFAULT '0',
  `show_results` tinyint(1) DEFAULT '1',
  `target_groups` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `quizzes`
--

INSERT INTO `quizzes` (`id`, `title`, `description`, `subject`, `level`, `duration`, `attempts`, `average_score`, `status`, `is_time_limited`, `allow_retake`, `show_results`, `target_groups`, `created_at`, `updated_at`) VALUES
(23, 'cc', '', 'Histoire', NULL, 10, 1, '0.00', 'Publié', 1, 0, 1, '[\"Terminale groupe 3\"]', '2025-09-28 16:13:50', '2025-09-28 16:14:45');

-- --------------------------------------------------------

--
-- Structure de la table `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `total_points` int(11) NOT NULL,
  `percentage` int(11) NOT NULL,
  `time_spent` int(11) NOT NULL DEFAULT '0',
  `completed_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `answers` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `quiz_attempts`
--

INSERT INTO `quiz_attempts` (`id`, `quiz_id`, `student_id`, `student_name`, `total_points`, `percentage`, `time_spent`, `completed_at`, `answers`) VALUES
(1, 23, 1, 'Mehdi El Abed', 2, 50, 3, '2025-09-28 17:14:45.155582', '{\"1\": \"nn\", \"2\": \"fzieoj\"}');

-- --------------------------------------------------------

--
-- Structure de la table `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `question` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` text COLLATE utf8mb4_unicode_ci,
  `correct_answer` text COLLATE utf8mb4_unicode_ci,
  `explanation` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `quiz_questions`
--

INSERT INTO `quiz_questions` (`id`, `quiz_id`, `question`, `type`, `options`, `correct_answer`, `explanation`) VALUES
(1, 23, 'cv', 'single', 'nn,nnn,nnnn', 'nn', ''),
(2, 23, 'cv', 'single', 'tyes,fzieoj,jpfao', 'tyes', '');

-- --------------------------------------------------------

--
-- Structure de la table `quiz_results`
--

CREATE TABLE `quiz_results` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `total_questions` int(11) NOT NULL,
  `correct_answers` int(11) NOT NULL,
  `time_spent_minutes` int(11) DEFAULT NULL,
  `completed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `answers` json DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `quiz_results`
--
DELIMITER $$
CREATE TRIGGER `tr_quiz_completed_notification` AFTER INSERT ON `quiz_results` FOR EACH ROW BEGIN
    DECLARE parent_user_id INT;
    
        SELECT p.user_id INTO parent_user_id
    FROM students s
    JOIN parents p ON s.parent_id = p.id
    WHERE s.id = NEW.student_id;
    
        IF parent_user_id IS NOT NULL THEN
        INSERT INTO notifications (
            user_id, type_id, title, message, is_urgent,
            related_entity_type, related_entity_id, metadata
        )
        SELECT 
            parent_user_id,
            nt.id,
            'Quiz terminé',
            CONCAT('Votre enfant a terminé un quiz avec un score de ', NEW.score, '/', NEW.total_questions),
            FALSE,
            'quiz',
            NEW.id,
            JSON_OBJECT(
                'student_id', NEW.student_id,
                'quiz_id', NEW.quiz_id,
                'score', NEW.score,
                'total_questions', NEW.total_questions,
                'completed_at', NEW.completed_at
            )
        FROM notification_types nt
        WHERE nt.type_name = 'quiz_completed';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `rendez_vous`
--

CREATE TABLE `rendez_vous` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `parent_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `child_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `child_class` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timing` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `parent_reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_reason` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `child_id` int(11) DEFAULT NULL,
  `parent_id_int` int(11) DEFAULT NULL,
  `child_id_int` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `rendez_vous`
--

INSERT INTO `rendez_vous` (`id`, `parent_id`, `parent_name`, `parent_email`, `parent_phone`, `child_name`, `child_class`, `timing`, `parent_reason`, `admin_reason`, `status`, `created_at`, `updated_at`, `child_id`, `parent_id_int`, `child_id_int`) VALUES
(25, '1', 'Parent Temporaire', 'parent.mehdielabed86@gmail.com', '95588885', 'Mehdi El Abed', 'Terminale groupe 3', '2025-09-28 16:15:57', 'cvvvvvvv', 'ok', 'approved', '2025-09-28 16:15:24', '2025-09-28 16:15:24', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `session_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled','no_show') COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `payment_id` int(11) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`id`, `student_id`, `teacher_id`, `session_date`, `start_time`, `end_time`, `subject`, `status`, `payment_id`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2025-09-05', '09:00:00', '10:00:00', 'Mathématiques', 'completed', NULL, 'Séance de test 1', '2025-09-05 15:17:35', '2025-09-05 15:17:35'),
(2, 1, 1, '2025-09-05', '09:00:00', '10:00:00', 'Mathématiques', 'completed', NULL, 'Séance de test 2', '2025-09-05 15:17:35', '2025-09-05 15:17:35'),
(3, 1, 1, '2025-09-05', '09:00:00', '10:00:00', 'Mathématiques', 'completed', NULL, 'Séance de test 3', '2025-09-05 15:17:35', '2025-09-05 15:17:35'),
(4, 1, 1, '2025-09-05', '09:00:00', '10:00:00', 'Mathématiques', 'completed', NULL, 'Séance de test 4', '2025-09-05 15:17:35', '2025-09-05 15:17:35'),
(5, 1, 1, '2025-09-05', '09:00:00', '10:00:00', 'Mathématiques', 'completed', NULL, 'Séance de test 5', '2025-09-05 15:17:35', '2025-09-05 15:17:35'),
(6, 1, 1, '2025-09-05', '09:00:00', '10:00:00', 'Mathématiques', 'completed', NULL, 'Séance de test 6', '2025-09-05 15:17:35', '2025-09-05 15:17:35'),
(7, 1, 1, '2025-09-05', '09:00:00', '10:00:00', 'Mathématiques', 'completed', NULL, 'Séance de test 7', '2025-09-05 15:17:35', '2025-09-05 15:17:35'),
(8, 1, 1, '2025-09-05', '09:00:00', '10:00:00', 'Mathématiques', 'completed', NULL, 'Séance de test 8', '2025-09-05 15:17:35', '2025-09-05 15:17:35'),
(9, 1, 1, '2025-09-05', '09:00:00', '10:00:00', 'Mathématiques', 'completed', NULL, 'Séance de test 9', '2025-09-05 15:17:35', '2025-09-05 15:17:35'),
(10, 1, 1, '2025-09-05', '09:00:00', '10:00:00', 'Mathématiques', 'completed', NULL, 'Séance de test 10', '2025-09-05 15:17:35', '2025-09-05 15:17:35'),
(11, 1, 1, '2025-09-05', '09:00:00', '10:00:00', 'Mathématiques', 'completed', NULL, 'Séance de test 11', '2025-09-05 15:17:35', '2025-09-05 15:17:35'),
(12, 1, 1, '2025-09-05', '09:00:00', '10:00:00', 'Mathématiques', 'completed', NULL, 'Séance de test 12', '2025-09-05 15:17:35', '2025-09-05 15:17:35');

--
-- Déclencheurs `sessions`
--
DELIMITER $$
CREATE TRIGGER `tr_payment_overdue_notification` AFTER INSERT ON `sessions` FOR EACH ROW BEGIN
    DECLARE parent_user_id INT;
    DECLARE unpaid_sessions_count INT;
    
        SELECT p.user_id INTO parent_user_id
    FROM students s
    JOIN parents p ON s.parent_id = p.id
    WHERE s.id = NEW.student_id;
    
        SELECT COUNT(*) INTO unpaid_sessions_count
    FROM sessions s
    JOIN students st ON s.student_id = st.id
    JOIN parents p ON st.parent_id = p.id
    WHERE p.user_id = parent_user_id 
    AND s.payment_id IS NULL
    AND s.status = 'completed';
    
        IF parent_user_id IS NOT NULL AND unpaid_sessions_count > 10 THEN
        INSERT INTO notifications (
            user_id, type_id, title, message, is_urgent,
            related_entity_type, related_entity_id, metadata
        )
        SELECT 
            parent_user_id,
            nt.id,
            'Séances non payées',
            CONCAT('Vous avez ', unpaid_sessions_count, ' séances non payées. Veuillez régulariser votre situation.'),
            TRUE,
            'payment',
            NULL,
            JSON_OBJECT(
                'unpaid_sessions_count', unpaid_sessions_count,
                'student_id', NEW.student_id
            )
        FROM notification_types nt
        WHERE nt.type_name = 'payment_overdue'
        AND NOT EXISTS (
            SELECT 1 FROM notifications n 
            WHERE n.user_id = parent_user_id 
            AND n.type_id = nt.id 
            AND n.is_read = FALSE
            AND n.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
        );
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `sous_dossiers`
--

CREATE TABLE `sous_dossiers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nom du sous-dossier',
  `dossier_id` int(11) NOT NULL COMMENT 'ID du dossier parent (dossiers)',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Description du sous-dossier',
  `sous_dossier_id` int(11) DEFAULT NULL COMMENT 'ID du sous-dossier parent (pour hiérarchie)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sous_dossiers`
--

INSERT INTO `sous_dossiers` (`id`, `name`, `dossier_id`, `description`, `sous_dossier_id`, `created_at`, `updated_at`) VALUES
(1, 'cc', 1, '', NULL, '2025-09-30 17:53:26', '2025-09-30 17:53:26');

-- --------------------------------------------------------

--
-- Structure de la table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `phone_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `class_level` enum('Terminale groupe 1','Terminale groupe 2','Terminale groupe 3','Terminale groupe 4','1ère groupe 1','1ère groupe 2','1ère groupe 3') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` datetime DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `progress_percentage` decimal(5,2) NOT NULL DEFAULT '0.00',
  `total_quiz_attempts` int(11) NOT NULL DEFAULT '0',
  `average_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `last_activity` datetime DEFAULT NULL,
  `paid_sessions` int(11) NOT NULL DEFAULT '0',
  `unpaid_sessions` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `students`
--

INSERT INTO `students` (`id`, `user_id`, `phone_number`, `parent_id`, `class_level`, `birth_date`, `address`, `progress_percentage`, `total_quiz_attempts`, `average_score`, `last_activity`, `paid_sessions`, `unpaid_sessions`) VALUES
(1, 49, '22900603', 1, 'Terminale groupe 3', '2004-01-28 01:00:00', NULL, '0.00', 0, '0.00', NULL, 0, 2);

-- --------------------------------------------------------

--
-- Structure de la table `student_answers`
--

CREATE TABLE `student_answers` (
  `id` int(11) NOT NULL,
  `attempt_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `answer_id` int(11) DEFAULT NULL,
  `answer_text` text,
  `is_correct` tinyint(1) DEFAULT '0',
  `points_earned` decimal(5,2) DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `student_progress`
--

CREATE TABLE `student_progress` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `content_id` int(11) DEFAULT NULL,
  `progress_type` enum('content_viewed','content_completed','quiz_completed','chapter_finished') NOT NULL,
  `progress_value` decimal(5,2) DEFAULT '0.00',
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_encrypted` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `system_settings`
--

INSERT INTO `system_settings` (`id`, `key`, `value`, `category`, `description`, `is_encrypted`, `created_at`, `updated_at`) VALUES
(1, 'site.name', 'Chrono-Carto', 'general', 'Nom du site', 0, '2025-08-25 22:37:19.852545', '2025-08-26 12:26:55.000000'),
(2, 'site.description', 'Plateforme pédagogique pour l\'Histoire-Géographie', 'general', 'Description du site', 0, '2025-08-25 22:37:19.926733', '2025-08-26 11:55:25.000000'),
(3, 'site.url', 'https://chronocarto.fr', 'general', 'URL du site', 0, '2025-08-25 22:37:19.946365', '2025-08-26 11:48:04.000000'),
(4, 'site.admin_email', 'chronocarto7@gmail.com', 'general', 'Email administrateur', 0, '2025-08-25 22:37:19.958828', '2025-08-26 12:30:57.000000'),
(5, 'site.timezone', 'Europe/Paris', 'general', 'Fuseau horaire', 0, '2025-08-25 22:37:19.973427', '2025-08-26 11:48:04.000000'),
(6, 'site.language', 'Français', 'general', 'Langue par défaut', 0, '2025-08-25 22:37:19.993515', '2025-08-26 12:33:21.000000'),
(7, 'site.date_format', 'DD/MM/YYYY', 'general', NULL, 0, '2025-08-25 22:37:20.016081', '2025-08-25 22:37:20.016081'),
(8, 'site.time_format', '24h', 'general', NULL, 0, '2025-08-25 22:37:20.036652', '2025-08-25 22:37:20.036652'),
(9, 'security.enable_two_factor', 'true', 'security', 'Activer l\'authentification à deux facteurs', 0, '2025-08-25 22:37:20.056272', '2025-08-26 11:55:25.000000'),
(10, 'security.session_timeout', '30', 'security', 'Délai d\'expiration de session (minutes)', 0, '2025-08-25 22:37:20.070480', '2025-08-26 11:48:04.000000'),
(11, 'security.max_login_attempts', '5', 'security', 'Nombre maximum de tentatives de connexion', 0, '2025-08-25 22:37:20.085247', '2025-08-26 11:48:04.000000'),
(12, 'security.password_min_length', '8', 'security', 'Longueur minimale du mot de passe', 0, '2025-08-25 22:37:20.104804', '2025-08-26 11:48:04.000000'),
(13, 'security.require_password_change', 'false', 'security', NULL, 0, '2025-08-25 22:37:20.119736', '2025-08-25 22:37:20.119736'),
(14, 'security.allow_registration', 'true', 'security', NULL, 0, '2025-08-25 22:37:20.134471', '2025-08-25 22:37:20.134471'),
(15, 'security.email_verification', 'true', 'security', NULL, 0, '2025-08-25 22:37:20.147493', '2025-08-25 22:37:20.147493'),
(16, 'security.ip_whitelist', '[]', 'security', NULL, 0, '2025-08-25 22:37:20.165170', '2025-08-25 22:37:20.165170'),
(17, 'notifications.email', 'true', 'notifications', 'Activer les notifications par email', 0, '2025-08-25 22:37:20.179029', '2025-08-26 11:48:04.000000'),
(18, 'notifications.sms', 'false', 'notifications', 'Activer les notifications par SMS', 0, '2025-08-25 22:37:20.188980', '2025-08-26 11:48:04.000000'),
(19, 'notifications.push', 'true', 'notifications', 'Activer les notifications push', 0, '2025-08-25 22:37:20.208086', '2025-08-26 11:48:04.000000'),
(20, 'notifications.new_user_registration', 'true', 'notifications', NULL, 0, '2025-08-25 22:37:20.216416', '2025-08-25 22:37:20.216416'),
(21, 'notifications.new_message', 'true', 'notifications', NULL, 0, '2025-08-25 22:37:20.237554', '2025-08-25 22:37:20.237554'),
(22, 'notifications.quiz_completed', 'true', 'notifications', NULL, 0, '2025-08-25 22:37:20.249505', '2025-08-25 22:37:20.249505'),
(23, 'notifications.system_alerts', 'true', 'notifications', NULL, 0, '2025-08-25 22:37:20.265358', '2025-08-25 22:37:20.265358'),
(24, 'notifications.maintenance_mode', 'false', 'notifications', NULL, 0, '2025-08-25 22:37:20.275711', '2025-08-25 22:37:20.275711'),
(25, 'appearance.theme', 'dark', 'appearance', 'Thème par défaut', 0, '2025-08-25 22:37:20.284714', '2025-08-26 12:27:14.000000'),
(26, 'appearance.primary_color', '#3B82F6', 'appearance', 'Couleur primaire', 0, '2025-08-25 22:37:20.305471', '2025-08-26 11:48:04.000000'),
(27, 'appearance.secondary_color', '#6366F1', 'appearance', NULL, 0, '2025-08-25 22:37:20.319840', '2025-08-25 22:37:20.319840'),
(28, 'appearance.accent_color', '#F59E0B', 'appearance', NULL, 0, '2025-08-25 22:37:20.338644', '2025-08-25 22:37:20.338644'),
(29, 'appearance.logo_url', '', 'appearance', NULL, 0, '2025-08-25 22:37:20.362117', '2025-08-25 22:37:20.362117'),
(30, 'appearance.favicon_url', '', 'appearance', NULL, 0, '2025-08-25 22:37:20.388156', '2025-08-25 22:37:20.388156'),
(31, 'appearance.custom_css', '', 'appearance', NULL, 0, '2025-08-25 22:37:20.429962', '2025-08-25 22:37:20.429962'),
(32, 'appearance.show_branding', 'true', 'appearance', NULL, 0, '2025-08-25 22:37:20.460372', '2025-08-25 22:37:20.460372'),
(33, 'storage.max_file_size', '100', 'storage', 'Taille maximale des fichiers (MB)', 0, '2025-08-25 22:37:20.499422', '2025-08-26 11:48:04.000000'),
(34, 'storage.allowed_file_types', '[\"pdf\",\"doc\",\"docx\",\"ppt\",\"pptx\",\"mp4\",\"avi\",\"mov\"]', 'storage', 'Types de fichiers autorisés', 0, '2025-08-25 22:37:20.528161', '2025-08-26 11:48:04.000000'),
(35, 'storage.provider', 'local', 'storage', NULL, 0, '2025-08-25 22:37:20.553951', '2025-08-25 22:37:20.553951'),
(36, 'storage.quota', '10000', 'storage', NULL, 0, '2025-08-25 22:37:20.586405', '2025-08-25 22:37:20.586405'),
(37, 'storage.auto_backup', 'true', 'storage', NULL, 0, '2025-08-25 22:37:20.627960', '2025-08-25 22:37:20.627960'),
(38, 'storage.backup_frequency', 'daily', 'storage', NULL, 0, '2025-08-25 22:37:20.735286', '2025-08-25 22:37:20.735286'),
(39, 'storage.retention_period', '30', 'storage', NULL, 0, '2025-08-25 22:37:20.767131', '2025-08-25 22:37:20.767131'),
(40, 'integrations.google_analytics', '', 'integrations', NULL, 0, '2025-08-25 22:37:20.798341', '2025-08-25 22:37:20.798341'),
(41, 'integrations.google_maps', '', 'integrations', NULL, 0, '2025-08-25 22:37:20.812762', '2025-08-25 22:37:20.812762'),
(42, 'integrations.email_provider', 'smtp', 'integrations', NULL, 0, '2025-08-25 22:37:20.827994', '2025-08-25 22:37:20.827994'),
(43, 'integrations.sms_provider', 'twilio', 'integrations', NULL, 0, '2025-08-25 22:37:20.842277', '2025-08-25 22:37:20.842277'),
(44, 'integrations.payment_provider', 'stripe', 'integrations', NULL, 0, '2025-08-25 22:37:20.859476', '2025-08-25 22:37:20.859476'),
(45, 'integrations.social_login.google', 'false', 'integrations', NULL, 0, '2025-08-25 22:37:20.876264', '2025-08-25 22:37:20.876264'),
(46, 'integrations.social_login.facebook', 'false', 'integrations', NULL, 0, '2025-08-25 22:37:20.901829', '2025-08-25 22:37:20.901829'),
(47, 'integrations.social_login.microsoft', 'false', 'integrations', NULL, 0, '2025-08-25 22:37:20.918140', '2025-08-25 22:37:20.918140');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('admin','teacher','student','parent') NOT NULL DEFAULT 'student',
  `is_active` tinyint(4) NOT NULL DEFAULT '1',
  `is_approved` tinyint(4) NOT NULL DEFAULT '0',
  `email_verified` tinyint(4) NOT NULL DEFAULT '0',
  `verification_token` varchar(255) DEFAULT NULL,
  `verification_token_expiry` datetime DEFAULT NULL,
  `email_verification_code` varchar(6) DEFAULT NULL,
  `email_verification_code_expiry` datetime DEFAULT NULL,
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_token_expiry` datetime DEFAULT NULL,
  `password_reset_code` varchar(6) DEFAULT NULL,
  `password_reset_code_expiry` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `role`, `is_active`, `is_approved`, `email_verified`, `verification_token`, `verification_token_expiry`, `email_verification_code`, `email_verification_code_expiry`, `password_reset_token`, `password_reset_token_expiry`, `password_reset_code`, `password_reset_code_expiry`, `last_login`, `created_at`, `updated_at`) VALUES
(48, 'chronocarto7@gmail.com', '$2b$10$jFSRRrpIYpWJ782Gcu4UiuU8WyVIQvO71augwUYeuiSFESs1RmYxa', 'Samih', 'Jeridi', '29452964', 'admin', 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-08 20:21:49.503050', '2025-09-09 22:30:19.367940'),
(49, 'mehdielabed86@gmail.com', '$2b$10$rULUokX4I6IMknYp1zipuunDE/XPtDZ5uH4cYXEF9.4laFyc1eWmG', 'Mehdi', 'El Abed', '22900603', 'student', 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-28 16:59:56.314843', '2025-09-28 17:02:01.000000'),
(50, 'parent.mehdielabed86@gmail.com', '$2b$10$rULUokX4I6IMknYp1zipuunDE/XPtDZ5uH4cYXEF9.4laFyc1eWmG', 'Parent', 'Temporaire', '95588887', 'parent', 1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-28 16:59:56.514373', '2025-09-28 17:03:28.306618');

-- --------------------------------------------------------

--
-- Structure de la vue `content_by_subject`
--
DROP TABLE IF EXISTS `content_by_subject`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `content_by_subject`  AS  select `c`.`subject` AS `subject`,`c`.`level` AS `level`,count(`co`.`id`) AS `total_content`,count((case when (`co`.`content_type` = 'video') then 1 end)) AS `video_count`,count((case when (`co`.`content_type` = 'pdf') then 1 end)) AS `pdf_count`,count((case when (`co`.`content_type` = 'worksheet') then 1 end)) AS `worksheet_count` from (`courses` `c` left join `content` `co` on((`c`.`id` = `co`.`course_id`))) group by `c`.`subject`,`c`.`level` ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_date` (`student_id`,`session_date`),
  ADD UNIQUE KEY `unique_student_date_clean` (`student_id`,`session_date`),
  ADD KEY `idx_attendance_student_date` (`student_id`,`session_date`),
  ADD KEY `idx_attendance_date` (`session_date`);

--
-- Index pour la table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `conversation`
--
ALTER TABLE `conversation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `groupe_id` (`groupe_id`),
  ADD KEY `FK_conversation_participant1` (`participant1_id`),
  ADD KEY `FK_conversation_participant2` (`participant2_id`);

--
-- Index pour la table `dossiers`
--
ALTER TABLE `dossiers`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `fichiers`
--
ALTER TABLE `fichiers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sous_dossier_id` (`sous_dossier_id`);

--
-- Index pour la table `folders`
--
ALTER TABLE `folders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_parent_id` (`parent_id`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_is_global` (`is_global`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Index pour la table `groupes`
--
ALTER TABLE `groupes`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `idx_parent_id` (`parent_id`),
  ADD KEY `idx_meeting_date` (`meeting_date`),
  ADD KEY `idx_status` (`status`);

--
-- Index pour la table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `recipient_id` (`recipient_id`),
  ADD KEY `groupe_id` (`groupe_id`),
  ADD KEY `conversation_id` (`conversation_id`);

--
-- Index pour la table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `paiement`
--
ALTER TABLE `paiement`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_parent` (`student_id`,`parent_id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_parent_id` (`parent_id`),
  ADD KEY `idx_statut` (`statut`),
  ADD KEY `idx_date_derniere_presence` (`date_derniere_presence`);

--
-- Index pour la table `parents`
--
ALTER TABLE `parents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `REL_c94c3cea9b43a18c81269ded41` (`user_id`),
  ADD UNIQUE KEY `IDX_c94c3cea9b43a18c81269ded41` (`user_id`);

--
-- Index pour la table `parent_student`
--
ALTER TABLE `parent_student`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_56c93c8885d58f23000148c9b27` (`parent_id`),
  ADD KEY `FK_9c2fadef93e1c8a720c428e9969` (`student_id`);

--
-- Index pour la table `pdp`
--
ALTER TABLE `pdp`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_pdp` (`user_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_file_type` (`file_type`);

--
-- Index pour la table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `quiz_results`
--
ALTER TABLE `quiz_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_quiz_id` (`quiz_id`),
  ADD KEY `idx_completed_at` (`completed_at`);

--
-- Index pour la table `rendez_vous`
--
ALTER TABLE `rendez_vous`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `idx_rendez_vous_parent_id` (`parent_id`(250)),
  ADD KEY `idx_rendez_vous_status` (`status`),
  ADD KEY `idx_rendez_vous_timing` (`timing`),
  ADD KEY `idx_rendez_vous_created_at` (`created_at`),
  ADD KEY `idx_rendez_vous_child_id` (`child_id`),
  ADD KEY `idx_rendez_vous_parent_id_int` (`parent_id_int`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_id` (`payment_id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_teacher_id` (`teacher_id`),
  ADD KEY `idx_session_date` (`session_date`),
  ADD KEY `idx_status` (`status`);

--
-- Index pour la table `sous_dossiers`
--
ALTER TABLE `sous_dossiers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_dossier_id` (`dossier_id`),
  ADD KEY `idx_sous_dossier_id` (`sous_dossier_id`);

--
-- Index pour la table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `REL_fb3eff90b11bddf7285f9b4e28` (`user_id`),
  ADD UNIQUE KEY `IDX_fb3eff90b11bddf7285f9b4e28` (`user_id`);

--
-- Index pour la table `student_answers`
--
ALTER TABLE `student_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`),
  ADD KEY `answer_id` (`answer_id`),
  ADD KEY `idx_attempt_question` (`attempt_id`,`question_id`);

--
-- Index pour la table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_b1b5bc664526d375c94ce9ad43` (`key`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;
--
-- AUTO_INCREMENT pour la table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT pour la table `conversation`
--
ALTER TABLE `conversation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;
--
-- AUTO_INCREMENT pour la table `dossiers`
--
ALTER TABLE `dossiers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT pour la table `fichiers`
--
ALTER TABLE `fichiers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT pour la table `folders`
--
ALTER TABLE `folders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT pour la table `groupes`
--
ALTER TABLE `groupes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT pour la table `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT pour la table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
--
-- AUTO_INCREMENT pour la table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;
--
-- AUTO_INCREMENT pour la table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT pour la table `paiement`
--
ALTER TABLE `paiement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT pour la table `parents`
--
ALTER TABLE `parents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT pour la table `parent_student`
--
ALTER TABLE `parent_student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT pour la table `pdp`
--
ALTER TABLE `pdp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
--
-- AUTO_INCREMENT pour la table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;
--
-- AUTO_INCREMENT pour la table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT pour la table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT pour la table `quiz_results`
--
ALTER TABLE `quiz_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT pour la table `rendez_vous`
--
ALTER TABLE `rendez_vous`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;
--
-- AUTO_INCREMENT pour la table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
--
-- AUTO_INCREMENT pour la table `sous_dossiers`
--
ALTER TABLE `sous_dossiers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT pour la table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT pour la table `student_answers`
--
ALTER TABLE `student_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT pour la table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;
--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;
--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `fichiers`
--
ALTER TABLE `fichiers`
  ADD CONSTRAINT `fk_fichiers_sous_dossier` FOREIGN KEY (`sous_dossier_id`) REFERENCES `sous_dossiers` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `folders`
--
ALTER TABLE `folders`
  ADD CONSTRAINT `fk_folders_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_folders_parent` FOREIGN KEY (`parent_id`) REFERENCES `folders` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `paiement`
--
ALTER TABLE `paiement`
  ADD CONSTRAINT `paiement_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `paiement_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `parents`
--
ALTER TABLE `parents`
  ADD CONSTRAINT `FK_c94c3cea9b43a18c81269ded41d` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Contraintes pour la table `parent_student`
--
ALTER TABLE `parent_student`
  ADD CONSTRAINT `FK_56c93c8885d58f23000148c9b27` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_9c2fadef93e1c8a720c428e9969` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Contraintes pour la table `sous_dossiers`
--
ALTER TABLE `sous_dossiers`
  ADD CONSTRAINT `fk_sous_dossiers_dossier` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sous_dossiers_parent` FOREIGN KEY (`sous_dossier_id`) REFERENCES `sous_dossiers` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `FK_fb3eff90b11bddf7285f9b4e281` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Contraintes pour la table `student_answers`
--
ALTER TABLE `student_answers`
  ADD CONSTRAINT `student_answers_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_answers_ibfk_3` FOREIGN KEY (`answer_id`) REFERENCES `answers` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
