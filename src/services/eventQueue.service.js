const db = require('../db/mysql');
const env = require('../config/env');

async function enqueue(event) {
  const [result] = await db.query(`INSERT IGNORE INTO whatsapp_events
    (clinic_id, phone_number_id, external_id, event_type, payload) VALUES (?, ?, ?, ?, ?)`,
    [event.clinicId, event.phoneNumberId, event.externalId, event.type, JSON.stringify(event.payload)]);
  return result.affectedRows === 1;
}
async function next(clinicId) {
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(`SELECT * FROM whatsapp_events
      WHERE clinic_id = ? AND ((status = 'pending' AND available_at <= NOW(3)) OR (status = 'processing' AND lease_until < NOW(3)))
      ORDER BY id LIMIT 1 FOR UPDATE`, [clinicId]);
    if (!rows[0]) { await conn.commit(); return null; }
    const lease = new Date(Date.now() + env.eventLeaseSeconds * 1000);
    await conn.query(`UPDATE whatsapp_events SET status='processing', attempts=attempts+1, lease_until=? WHERE id=?`, [lease, rows[0].id]);
    await conn.commit();
    return { ...rows[0], payload: typeof rows[0].payload === 'string' ? JSON.parse(rows[0].payload) : rows[0].payload };
  } catch (error) { await conn.rollback(); throw error; } finally { conn.release(); }
}
async function acknowledge(id, clinicId) {
  const [result] = await db.query(`UPDATE whatsapp_events SET status='delivered', delivered_at=NOW(3), lease_until=NULL WHERE id=? AND clinic_id=?`, [id, clinicId]);
  return result.affectedRows === 1;
}
module.exports = { enqueue, next, acknowledge };
