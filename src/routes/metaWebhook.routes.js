const express = require('express');
const controller = require('../controllers/metaWebhook.controller');
const router = express.Router();
router.get('/', controller.verify);
router.post('/', express.raw({ type: 'application/json' }), controller.receive);
module.exports = router;
