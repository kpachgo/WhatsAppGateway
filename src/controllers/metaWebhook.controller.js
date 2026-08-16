const crypto = require('crypto');
const env = require('../config/env');
const db = require('../db/mysql');
const normalize = require('../utils/normalizeMetaEvent');
const queue = require('../services/eventQueue.service');

function validSignature(req) {
  const received = req.header('x-hub-signature-256') || '';
  const expected = `sha256=${crypto.createHmac('sha256', env.meta.appSecret).update(req.body).digest('hex')}`;
  return received.length === expected.length && crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}
async function verify(req, res) {
  if (req.query['hub.verify_token'] !== env.meta.verifyToken) return res.sendStatus(403);
  return res.status(200).send(req.query['hub.challenge']);
}
async function receive(req, res, next) {
  try {
    if (!validSignature(req)) return res.sendStatus(403);
    const body = JSON.parse(req.body.toString('utf8'));
    const events = normalize(body);
    for (const event of events) {
      const [connections] = await db.query('SELECT clinic_id FROM whatsapp_connections WHERE phone_number_id=? AND status=\'active\' LIMIT 1', [event.phoneNumberId]);
      if (connections[0]) await queue.enqueue({ ...event, clinicId: connections[0].clinic_id });
    }
    return res.sendStatus(200);
  } catch (error) { next(error); }
}
module.exports = { verify, receive };
