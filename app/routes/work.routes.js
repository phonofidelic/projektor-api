const router = require('express').Router();
const {
  createWork,
  updateWork,
  removeWork
} = require('../controllers/work.controller');
const requireAuth = require('../middlewares/requireAuth');

router.post('/create', requireAuth, createWork);
router.post('/update/:workId', requireAuth, updateWork);
router.delete('/delete/:workId', requireAuth, removeWork);

module.exports = router;
