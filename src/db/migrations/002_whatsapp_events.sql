CREATE TABLE IF NOT EXISTS whatsapp_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  clinic_id VARCHAR(100) NULL,
  phone_number_id VARCHAR(100) NULL,
  external_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  payload JSON NOT NULL,
  status ENUM('pending','processing','delivered','failed') NOT NULL DEFAULT 'pending',
  attempts INT UNSIGNED NOT NULL DEFAULT 0,
  available_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  lease_until DATETIME(3) NULL,
  delivered_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_event_external_id (external_id),
  KEY ix_event_delivery (clinic_id, status, available_at)
) ENGINE=InnoDB;
