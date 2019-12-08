const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const { JWT_SECRET, JWT_EXP, JWT_AUD, JWT_ISS } = require('../../config/keys');
const { generateToken } = require('../services/auth.services');

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

    user.save((err, savedUser) => {
      if (err) return next(err);

      let userInfo = setUserInfo(savedUser);

      const refreshToken = uuidv4();
      // TODO: Set refresh token in DB
      refreshTokens[refreshToken] = savedUser._id;

      const token = generateToken(userInfo, refreshToken);
      userInfo.token = token;

      console.log('\n*** refreshTokens:', refreshTokens);

      res.json(userInfo);
    });
  });
};

exports.login = (req, res, next) => {
  const userInfo = setUserInfo(req.user);

  const refreshToken = uuidv4();
  // TODO: Set refresh token in DB
  global.refreshTokens[refreshToken] = req.user._id;

  const token = generateToken(userInfo, refreshToken);
  userInfo.token = token;

  console.log('\n*** refreshTokens:', refreshTokens);

  res.json(userInfo);
};

exports.logout = (req, res, next) => {
  const { userId } = req;

  delete refreshTokens[userId];
  res.status(200).json({ message: 'You are now signed out' });
};
