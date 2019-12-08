const router = require('express').Router();
const { createWork } = require('../controllers/work.controller');
const requireAuth = require('../middlewares/requireAuth');

router.post('/create', requireAuth, createWork);

module.exports = router;
