const router = require('express').Router();
const {
  getProjects,
  createProject,
  getProject,
  deleteProject
} = require('../contollers/project.controller');

router.get('/', getProjects);

router.get('/:projectId', getProject);

router.post('/create', createProject);

router.put('/:projectId/status/delete', deleteProject);

module.exports = router;
