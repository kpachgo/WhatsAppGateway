const logger = require('../config/logger');
module.exports = (error, req, res, next) => {
  logger.error({ err: error, path: req.path }, 'Request failed');
  if (res.headersSent) return next(error);
  res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : 'Error interno del servidor' });
};
