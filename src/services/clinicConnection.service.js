const db = require('../db/mysql');
const { encrypt } = require('../utils/crypto');
const { generateClinicKey, hash } = require('./auth.service');

async function createConnection({ clinicId, phoneNumberId, wabaId, accessToken }) {
  const clinicKey = generateClinicKey();
  await db.query(`INSERT INTO whatsapp_connections
    (clinic_id, phone_number_id, waba_id, access_token_encrypted, clinic_key_hash)
    VALUES (?, ?, ?, ?, ?)`, [clinicId, phoneNumberId, wabaId || null, encrypt(accessToken), hash(clinicKey)]);
  return { clinicId, phoneNumberId, wabaId: wabaId || null, clinicKey };
}
async function listConnections() {
  const [rows] = await db.query('SELECT clinic_id, phone_number_id, waba_id, status, last_seen_at, created_at FROM whatsapp_connections ORDER BY created_at DESC');
  return rows;
}
module.exports = { createConnection, listConnections };
