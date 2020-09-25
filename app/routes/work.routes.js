const router = require('express').Router();
const {
  createWork,
  updateWork,
  removeWork,
  getAllWork,
  getWorkByInterval,
  searchWork,
  analyzeWorkNotes,
} = require('../controllers/work.controller');
const requireAuth = require('../middlewares/requireAuth');
const normalizeUserId = require('../middlewares/normalizeUserId');

router.get('/search', requireAuth, normalizeUserId, searchWork);
router.post('/create', requireAuth, normalizeUserId, createWork);
router.put('/update/:workId', requireAuth, normalizeUserId, updateWork);
router.delete('/delete/:workId', requireAuth, normalizeUserId, removeWork);
router.get('/', requireAuth, normalizeUserId, getAllWork);
router.get(
  '/interval/:start/:end',
  requireAuth,
  normalizeUserId,
  getWorkByInterval
);
router.post('/analyze', requireAuth, normalizeUserId, analyzeWorkNotes);
module.exports = router;
