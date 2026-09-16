-- Online CV & Portfolio - MySQL Tablo Kurulum Dosyasi
-- phpMyAdmin uzerinden 'Ice Aktar' (Import) sekmesinden dogrudan yuklenebilir.

CREATE TABLE IF NOT EXISTS `cv_data` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `profile_key` VARCHAR(64) UNIQUE NOT NULL,
  `data_json` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
