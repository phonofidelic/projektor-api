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
const normalizeUserId = require('../middlewares/normalizeUserId');
const requireVerification = require('../middlewares/requireVerification');

/**
 * Search Projects
 */
router.get(
  '/search',
  requireAuth,
  requireVerification,
  normalizeUserId,
  searchProjects
);

/**
 * Get all Projects
 */
router.get('/', requireAuth, requireVerification, normalizeUserId, getProjects);

/**
 * Create new Project
 */
router.post(
  '/create',
  requireAuth,
  requireVerification,
  normalizeUserId,
  createProject
);

/**
 * Get Project by ID
 */
router.get(
  '/:projectId',
  requireAuth,
  requireVerification,
  normalizeUserId,
  getProject
);

/**
 * Edit Project
 */
router.put(
  '/:projectId',
  requireAuth,
  requireVerification,
  normalizeUserId,
  editProject
);

/**
 * Delete Project
 */
router.put(
  '/:projectId/status/delete',
  requireAuth,
  requireVerification,
  normalizeUserId,
  deleteProject
);

/**
 * Set Pproject status
 */
router.put(
  '/:projectId/status',
  requireAuth,
  requireVerification,
  normalizeUserId,
  setProjectStatus
);

/**
 * Permanently delete removed project
 */
router.delete(
  '/removed/delete/:projectId',
  requireAuth,
  requireVerification,
  normalizeUserId,
  deleteProject
);

/**
 * Permanently delete all removed Projects
 */
router.delete(
  '/removed/delete',
  requireAuth,
  requireVerification,
  normalizeUserId,
  deleteAllTrash
);

router.get('/keytasks/:projectId', findKeyTasks);

module.exports = router;
