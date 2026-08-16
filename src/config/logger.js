const pino = require('pino');
const env = require('./env');
module.exports = pino({ level: env.logLevel, redact: ['req.headers.authorization', 'req.headers.x-clinic-key', 'accessToken', 'token'] });
