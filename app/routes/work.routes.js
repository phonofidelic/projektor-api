const router = require('express').Router();
const {
  createWork,
  updateWork,
  removeWork,
  getAllWork,
  getWorkByInterval
} = require('../controllers/work.controller');
const requireAuth = require('../middlewares/requireAuth');

router.post('/create', requireAuth, createWork);
router.post('/update/:workId', requireAuth, updateWork);
router.delete('/delete/:workId', requireAuth, removeWork);
router.get('/', requireAuth, getAllWork);
router.get('/interval/:start/:end', requireAuth, getWorkByInterval);

module.exports = router;
