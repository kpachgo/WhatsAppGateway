const crypto = require('crypto');

function normalizeMetaEvent(body) {
  const result = [];
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      const phoneNumberId = value.metadata?.phone_number_id || null;
      for (const message of value.messages || []) result.push({ externalId: message.id, type: 'message', phoneNumberId, payload: { entry, change, message } });
      for (const status of value.statuses || []) result.push({ externalId: status.id, type: 'status', phoneNumberId, payload: { entry, change, status } });
      if (!value.messages?.length && !value.statuses?.length) {
        const raw = JSON.stringify({ entry, change });
        result.push({ externalId: crypto.createHash('sha256').update(raw).digest('hex'), type: change.field || 'event', phoneNumberId, payload: { entry, change } });
      }
    }
  }
  return result;
}
module.exports = normalizeMetaEvent;
