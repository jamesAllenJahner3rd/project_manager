const express = require('express')
const router = express.Router();
const columnController = require('../controllers/columnController');

router.post('/createColumn/:id', columnController.createColumn);

module.exports = router;