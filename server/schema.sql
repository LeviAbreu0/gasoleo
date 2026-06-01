-- Gasóleo: create database and tables for fuel and oil entries.
-- Run as a user with CREATE privileges, or create the DB manually first:
--   CREATE DATABASE gasoleo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gasoleo;

-- Fuel fill-ups: liters, odometer (km), price paid (BRL)
CREATE TABLE IF NOT EXISTS fuel_entries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  entry_date DATE NOT NULL,
  liters DECIMAL(12, 3) NOT NULL,
  km DECIMAL(12, 2) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fuel_date (entry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Oil changes: type label, optional price, odometer, optional recommended interval (km)
CREATE TABLE IF NOT EXISTS oil_entries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  entry_date DATE NOT NULL,
  km DECIMAL(12, 2) NOT NULL,
  oil_type VARCHAR(128) NOT NULL,
  price DECIMAL(12, 2) NULL,
  km_troca DECIMAL(12, 2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_oil_date (entry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
