const crypto = require('crypto');
const env = require('../config/env');
const key = Buffer.from(env.encryptionKey, 'hex');

function hash(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function encrypt(value) {
  const iv = crypto.randomBytes(12); const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${data.toString('hex')}`;
}
function decrypt(value) {
  const [ivHex, tagHex, dataHex] = value.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
}
function timingSafeEqualText(a, b) {
  const aa = Buffer.from(a); const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
module.exports = { hash, encrypt, decrypt, timingSafeEqualText };
