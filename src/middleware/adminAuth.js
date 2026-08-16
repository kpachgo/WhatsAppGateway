const env = require('../config/env');
const { timingSafeEqualText } = require('../utils/crypto');
module.exports = (req, res, next) => {
  if (!timingSafeEqualText(req.header('x-admin-token') || '', env.adminApiToken)) return res.status(401).json({ error: 'No autorizado' });
  next();
};
