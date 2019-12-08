const router = require('express').Router();
const {
  getProjects,
  createProject,
  getProject,
  deleteProject
} = require('../controllers/project.controller');
const requireAuth = require('../middlewares/requireAuth');

router.get('/', requireAuth, getProjects);
router.get('/:projectId', requireAuth, getProject);
router.post('/create', requireAuth, createProject);
router.put('/:projectId/status/delete', requireAuth, deleteProject);

module.exports = router;
