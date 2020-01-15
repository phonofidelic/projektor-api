const router = require('express').Router();
const {
  getProjects,
  createProject,
  getProject,
  editProject,
  deleteProject,
  setProjectStatus,
  deleteAllTrash
} = require('../controllers/project.controller');
const requireAuth = require('../middlewares/requireAuth');
const requireVerification = require('../middlewares/requireVerification');

router.get('/', requireAuth, requireVerification, getProjects);
router.post('/create', requireAuth, createProject);
router.get('/:projectId', requireAuth, getProject);
router.put('/:projectId', requireAuth, editProject);
router.put('/:projectId/status/delete', requireAuth, deleteProject);
router.put('/:projectId/status', requireAuth, setProjectStatus);
router.delete('/removed/delete/:projectId', requireAuth, deleteProject);
router.delete('/removed/delete', requireAuth, deleteAllTrash);

module.exports = router;
