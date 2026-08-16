const express = require('express'); const auth = require('../middleware/clinicAuth'); const controller = require('../controllers/events.controller');
const router = express.Router(); router.use(auth); router.get('/next', controller.next); router.post('/:id/ack', controller.acknowledge); module.exports = router;
