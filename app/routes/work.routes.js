const router = require('express').Router();
const { createWork } = require('../controllers/work.controller');

router.post('/create', createWork);

module.exports = router;
