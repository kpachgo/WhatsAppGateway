-- Esquema de Clínica WhatsApp Gateway
-- Ejecutar después de crear la base de datos clinica_whatsapp.

CREATE TABLE IF NOT EXISTS whatsapp_connections (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  clinic_id VARCHAR(100) NOT NULL UNIQUE,
  phone_number_id VARCHAR(100) NOT NULL UNIQUE,
  waba_id VARCHAR(100) NULL,
  access_token_encrypted TEXT NOT NULL,
  clinic_key_hash CHAR(64) NOT NULL,
  status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
  last_seen_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS whatsapp_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  clinic_id VARCHAR(100) NULL,
  phone_number_id VARCHAR(100) NULL,
  external_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  payload JSON NOT NULL,
  status ENUM('pending', 'processing', 'delivered', 'failed')
    NOT NULL DEFAULT 'pending',
  attempts INT UNSIGNED NOT NULL DEFAULT 0,
  available_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  lease_until DATETIME(3) NULL,
  delivered_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_event_external_id (external_id),
  KEY ix_event_delivery (clinic_id, status, available_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clinic_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  clinic_id VARCHAR(100) NOT NULL,
  token_type VARCHAR(50) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  revoked_at DATETIME(3) NULL,
  UNIQUE KEY uq_clinic_token (clinic_id, token_type),
  CONSTRAINT fk_clinic_token_connection
    FOREIGN KEY (clinic_id) REFERENCES whatsapp_connections(clinic_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
