const express = require('express'); const auth = require('../middleware/adminAuth'); const controller = require('../controllers/connection.controller');
const router = express.Router(); router.use(auth); router.post('/', controller.create); router.get('/', controller.list); module.exports = router;
