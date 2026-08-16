CREATE TABLE IF NOT EXISTS clinic_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  clinic_id VARCHAR(100) NOT NULL,
  token_type VARCHAR(50) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  revoked_at DATETIME(3) NULL,
  UNIQUE KEY uq_clinic_token (clinic_id, token_type),
  CONSTRAINT fk_clinic_token_connection FOREIGN KEY (clinic_id)
    REFERENCES whatsapp_connections(clinic_id) ON DELETE CASCADE
) ENGINE=InnoDB;
