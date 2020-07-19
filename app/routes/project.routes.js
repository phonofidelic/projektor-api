const router = require('express').Router();
const {
  getProjects,
  createProject,
  getProject,
  editProject,
  deleteProject,
  setProjectStatus,
  deleteAllTrash,
  searchProjects,
  findKeyTasks,
} = require('../controllers/project.controller');
const requireAuth = require('../middlewares/requireAuth');
const requireVerification = require('../middlewares/requireVerification');

router.get('/search', requireAuth, requireVerification, searchProjects);
router.get('/', requireAuth, requireVerification, getProjects);
router.post('/create', requireAuth, requireVerification, createProject);
router.get('/:projectId', requireAuth, requireVerification, getProject);
router.put('/:projectId', requireAuth, requireVerification, editProject);
router.put(
  '/:projectId/status/delete',
  requireAuth,
  requireVerification,
  deleteProject
);
router.put(
  '/:projectId/status',
  requireAuth,
  requireVerification,
  setProjectStatus
);
router.delete(
  '/removed/delete/:projectId',
  requireAuth,
  requireVerification,
  deleteProject
);
router.delete(
  '/removed/delete',
  requireAuth,
  requireVerification,
  deleteAllTrash
);

router.get('/keytasks/:projectId', findKeyTasks);

module.exports = router;
