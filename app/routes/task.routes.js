const router = require('express').Router();
const requireAuth = require('../middlewares/requireAuth');
const normalizeUserId = require('../middlewares/normalizeUserId');
const requireVerification = require('../middlewares/requireVerification');
const { getTasksByProjectId } = require('../controllers/task.controller');

/**
 * Get tasks by projectId
 */
router.get(
  '/:projectId',
  requireAuth,
  requireVerification,
  normalizeUserId,
  getTasksByProjectId
);

module.exports = router;
