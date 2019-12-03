const router = require('express').Router();
const { createWork } = require('../contollers/work.controller');

router.post('/create', createWork);

module.exports = router;
