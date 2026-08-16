const axios = require('axios');
const env = require('../config/env');
const { decrypt } = require('../utils/crypto');

async function sendMessage(connection, message) {
  const url = `https://graph.facebook.com/${env.meta.graphVersion}/${connection.phone_number_id}/messages`;
  const body = { messaging_product: 'whatsapp', to: message.to, type: message.type || 'text' };
  if (body.type === 'text') body.text = { preview_url: Boolean(message.previewUrl), body: message.body };
  else if (message.content) body[body.type] = message.content;
  else throw new Error(`Falta content para el tipo ${body.type}`);
  const response = await axios.post(url, body, { headers: { Authorization: `Bearer ${decrypt(connection.access_token_encrypted)}` }, timeout: 15000 });
  return response.data;
}
module.exports = { sendMessage };
