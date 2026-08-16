const crypto = require('crypto');
const db = require('../db/mysql');
const { hash, timingSafeEqualText } = require('../utils/crypto');

async function authenticateClinic(clinicId, clinicKey) {
  if (!clinicId || !clinicKey) return null;
  const [rows] = await db.query('SELECT * FROM whatsapp_connections WHERE clinic_id = ? AND status = \'active\' LIMIT 1', [clinicId]);
  if (!rows[0] || !timingSafeEqualText(rows[0].clinic_key_hash, hash(clinicKey))) return null;
  await db.query('UPDATE whatsapp_connections SET last_seen_at = CURRENT_TIMESTAMP(3) WHERE clinic_id = ?', [clinicId]);
  return rows[0];
}
function generateClinicKey() { return crypto.randomBytes(32).toString('base64url'); }
module.exports = { authenticateClinic, generateClinicKey, hash };
