const router = require('express').Router();
const passportService = require('../../config/passport_config');
const passport = require('passport');
const {
  // requireAuth,
  registerNewUser,
  login,
  logout
} = require('../controllers/auth.controller');
const requireAuth = require('../middlewares/requireAuth');

const requireLogin = passport.authenticate('local', { session: false });

router.post('/register', registerNewUser);
router.post('/login', requireLogin, login);
router.post('/logout', requireAuth, logout);

module.exports = router;
