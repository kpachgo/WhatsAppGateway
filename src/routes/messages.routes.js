const express = require('express'); const auth = require('../middleware/clinicAuth'); const controller = require('../controllers/messages.controller');
const router = express.Router(); router.use(auth); router.post('/', controller.send); module.exports = router;
