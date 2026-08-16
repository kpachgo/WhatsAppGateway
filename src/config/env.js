require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

const encryptionKey = required('TOKEN_ENCRYPTION_KEY');
if (!/^[0-9a-fA-F]{64}$/.test(encryptionKey)) {
  throw new Error('TOKEN_ENCRYPTION_KEY debe contener exactamente 64 caracteres hexadecimales');
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  logLevel: process.env.LOG_LEVEL || 'info',
  mysql: {
    host: required('MYSQL_HOST'), port: Number(process.env.MYSQL_PORT || 3306),
    database: required('MYSQL_DATABASE'), user: required('MYSQL_USER'), password: required('MYSQL_PASSWORD')
  },
  meta: {
    graphVersion: process.env.META_GRAPH_VERSION || 'v23.0',
    appSecret: required('META_APP_SECRET'),
    verifyToken: required('META_WEBHOOK_VERIFY_TOKEN')
  },
  encryptionKey,
  adminApiToken: required('ADMIN_API_TOKEN'),
  eventLeaseSeconds: Number(process.env.EVENT_LEASE_SECONDS || 60)
};
