const router = require('express').Router();
const {
  getProjects,
  createProject
} = require('../contollers/project.controller');

router.get('/', getProjects);

router.post('/create', createProject);

module.exports = router;
