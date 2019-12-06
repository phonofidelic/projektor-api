const router = require('express').Router();
const passport = require('passport');
const {
  requireAuth,
  registerNewUser,
  login
} = require('../controllers/auth.controller');

const requireLogin = passport.authenticate('local', { session: false });

router.post('/register', registerNewUser);

router.post('/login', requireLogin, login);

module.exports = router;
