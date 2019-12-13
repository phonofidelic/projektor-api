const router = require('express').Router();
const {
  getProjects,
  createProject,
  getProject,
  deleteProject,
  setProjectStatus
} = require('../controllers/project.controller');
const requireAuth = require('../middlewares/requireAuth');

router.get('/', requireAuth, getProjects);
router.get('/:projectId', requireAuth, getProject);
router.post('/create', requireAuth, createProject);
router.put('/:projectId/status/delete', requireAuth, deleteProject);
router.put('/:projectId/status', requireAuth, setProjectStatus);

module.exports = router;
