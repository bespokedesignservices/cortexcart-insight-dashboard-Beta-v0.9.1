-- MySQL dump 10.13  Distrib 9.3.0, for macos15.2 (arm64)
--
-- Host: localhost    Database: admin_cortexcart
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `social_demographics`
--

LOCK TABLES `social_demographics` WRITE;
/*!40000 ALTER TABLE `social_demographics` DISABLE KEYS */;
INSERT INTO `social_demographics` (`id`, `user_email`, `age_range`, `sex`, `country`, `created_at`, `updated_at`) VALUES (1,'millarsfoods@gmail.com','25-34','male','United States','2025-07-14 07:05:20','2025-07-17 07:24:37');
/*!40000 ALTER TABLE `social_demographics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `social_optimal_times`
--

LOCK TABLES `social_optimal_times` WRITE;
/*!40000 ALTER TABLE `social_optimal_times` DISABLE KEYS */;
INSERT INTO `social_optimal_times` (`id`, `platform`, `age_range`, `sex`, `country`, `optimal_day`, `optimal_times`) VALUES (1,'x','18-24',NULL,'US',3,'9,12,15'),(2,'pinterest','25-34',NULL,'US',6,'14,20'),(3,'x','25-34',NULL,'GB',5,'11,17'),(4,'x','25-34',NULL,'uk',4,'10,14,18'),(5,'pinterest','25-34','female','US',6,'14,20,21'),(6,'x','25-34','female','US',2,'8,10,17'),(7,'pinterest','25-34','female','US',2,'8,10,17');
/*!40000 ALTER TABLE `social_optimal_times` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-19  8:49:58
