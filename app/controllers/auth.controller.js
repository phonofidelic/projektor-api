const User = require('../models/user.model');
const Token = require('../models/token.model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const { JWT_SECRET, JWT_EXP, JWT_AUD, JWT_ISS } = require('../../config/keys');
const { generateToken } = require('../services/auth.services');
const { sendContfirmationEmail } = require('../services/mail.services');

const STRINGS = {
  user_registration_success: 'new user registered',
  user_email_conflict: 'Sorry, that email address is already in use'
};

const setUserInfo = user => {
  return {
    _id: user._id,
    email: user.email
  };
};

exports.registerNewUser = (req, res, next) => {
  console.log('registerNewUser:', req.body);
  const { email, password } = req.body;
  // TODO: Validate registration data before writing to DB

  User.findOne({ email }, (err, existingUser) => {
    if (err) return next(err);
    if (existingUser)
      return res.status(422).json({ message: STRINGS.user_email_conflict });

    const user = new User({
      email: email,
      password: password
    });

    user.save(async (err, savedUser) => {
      if (err) return next(err);

      let userInfo = setUserInfo(savedUser);

      const refreshToken = uuidv4();
      // TODO: Set refresh token in DB
      refreshTokens[refreshToken] = savedUser._id;

      const token = generateToken(userInfo, refreshToken);
      userInfo.token = token;

      const confirmationToken = new Token({
        userId: user._id,
        value: crypto.randomBytes(16).toString('hex')
      });
      confirmationToken.save(async err => {
        if (err) return next(err);
      });

      const emailParams = {
        to: email,
        from: 'team@projektorapp.com',
        subject: 'Welcom to Projektor!',
        message: `Welcom to Projektor!
        <img src="https://www.projektorapp.com/static/media/logo.88c4103b.svg" alt="Projektor logo"/>
        <br/>
        <br/>
        To verify your email, plese visit the link below:<br/>
        <br/>
        <a href="${
          process.env.NODE_ENV === 'production' ? 'https://' : 'http://'
        }${req.headers.host}/auth/confirmation/${
          confirmationToken.value
        }">Verify Email</a>`
      };

      try {
        await sendContfirmationEmail(emailParams);
      } catch (err) {
        res.next(err);
      }

      res.json(userInfo);
    });
  });
};

exports.login = (req, res, next) => {
  // if (!req.user.isVerified)
  //   res.status(418).json({ message: 'User is not verified' });

  const userInfo = setUserInfo(req.user);

  const refreshToken = uuidv4();
  // TODO: Set refresh token in DB
  refreshTokens[refreshToken] = req.user._id;

  const token = generateToken(userInfo, refreshToken);
  userInfo.token = token;

  console.log('\n*** refreshTokens:', refreshTokens);

  res.json(userInfo);
};

exports.logout = (req, res, next) => {
  const { userId, refreshToken } = req;

  delete refreshTokens[refreshToken];
  console.log('====================================');
  console.log('refreshTokens after logout:', refreshTokens);
  console.log('====================================');
  res.status(200).json({ message: 'You are now signed out' });
};

exports.getUserInfo = async (req, res, next) => {
  const { userId, token } = req;

  let userInfo;
  try {
    userInfo = await User.findById(userId, 'email');
    res.json({ data: userInfo, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.verifyUser = async (req, res, next) => {
  const { token } = req.params;

  let tokenResult;
  let user;

  try {
    tokenResult = await Token.findOne({ value: token });
  } catch (err) {
    next(err);
  }

  if (!tokenResult)
    return res
      .status(400)
      .json({ data: 'Unable to find valid token. Token may have expired' });

  console.log('====================================');
  console.log('tokenResult:', tokenResult);
  console.log('====================================');

  try {
    user = await User.findOne({ _id: tokenResult.userId });
  } catch (err) {
    next(err);
  }

  user.isVerified = true;

  try {
    await user.save();
    // res.status(200).json({ data: 'User is verified' });
    res.render('confirmation', { user: `${user.email.split('@')[0]}` });
  } catch (err) {
    next(err);
  }
};
