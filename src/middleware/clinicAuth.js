const { authenticateClinic } = require('../services/auth.service');
module.exports = async function clinicAuth(req, res, next) {
  try {
    const connection = await authenticateClinic(req.header('x-clinic-id'), req.header('x-clinic-key'));
    if (!connection) return res.status(401).json({ error: 'Credenciales de clínica inválidas' });
    req.connection = connection; next();
  } catch (error) { next(error); }
};
