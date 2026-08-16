const express = require('express');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const logger = require('./config/logger');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const metaWebhook = require('./routes/metaWebhook.routes');
const events = require('./routes/events.routes');
const messages = require('./routes/messages.routes');
const connections = require('./routes/connection.routes');

const app = express();
app.disable('x-powered-by'); app.use(helmet()); app.use(pinoHttp({ logger }));
app.use('/webhooks/meta', metaWebhook);
app.use(express.json({ limit: '1mb' }));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'clinica-whatsapp-gateway' }));
app.use('/v1/events', events); app.use('/v1/messages', messages); app.use('/v1/connections', connections);
app.use(errorHandler);
app.listen(env.port, () => logger.info({ port: env.port }, 'WhatsApp gateway listening'));
