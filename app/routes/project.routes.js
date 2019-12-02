const router = require('express').Router();
const { createProject } = require('../contollers/project.controller');

router.post('/create', createProject);

module.exports = router;
