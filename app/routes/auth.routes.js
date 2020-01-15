const router = require('express').Router();
const passportService = require('../../config/passport_config');
const passport = require('passport');
const {
  // requireAuth,
  registerNewUser,
  login,
  logout,
  getUserInfo,
  verifyUser,
  resendVerification
} = require('../controllers/auth.controller');
const { sendTestEmail } = require('../services/mail.services');
const requireAuth = require('../middlewares/requireAuth');

const requireLogin = passport.authenticate('local', { session: false });

router.post('/register', registerNewUser);
router.post('/login', requireLogin, login);
router.post('/logout', requireAuth, logout);
router.get('/user', requireAuth, getUserInfo);
router.get('/verify/:token', verifyUser);
router.post('/resend', requireAuth, resendVerification);
// router.post('/resend', userController.resendTokenPost);

router.post('/testemail', async (req, res, next) => {
  let response;

  try {
    response = await sendTestEmail();
    res.json({ data: response });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
