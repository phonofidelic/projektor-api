const router = require('express').Router();
const {
  getProjects,
  createProject,
  getProject
} = require('../contollers/project.controller');

router.get('/', getProjects);

router.get('/:projectId', getProject);

router.post('/create', createProject);

module.exports = router;
