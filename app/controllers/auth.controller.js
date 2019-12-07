const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const { JWT_SECRET, JWT_EXP, JWT_AUD, JWT_ISS } = require('../../config/keys');

const STRINGS = {
  user_registration_success: 'new user registered',
  user_email_conflict: 'Sorry, that email address is already in use'
};

// TODO: Create DB or momory store (Redis?)
let refreshTokens = {};

const generateToken = (user, refreshToken) => {
  return jwt.sign({ ...user, rt: refreshToken }, JWT_SECRET, {
    expiresIn: JWT_EXP,
    // expiresIn: '2s',
    audience: JWT_AUD,
    issuer: JWT_ISS,
    jwtid: uuidv4(),
    subject: String(user._id)
  });
};

const handleExpiredToken = (req, res, next) => {
  console.log('\n*** TOKEN EXPIRED ***');
  // const userId = req.userId;
  const decoded = jwt.decode(req.cookies.JWT);
  // console.log('====================================');
  // console.log('decoded token:', decoded);
  // console.log('====================================');
  const userId = decoded._id;
  const refreshToken = decoded.rt;

  // Check refresh token store
  if (refreshToken in refreshTokens && refreshTokens[refreshToken] == userId) {
    console.log('\n*** VALID REFRESH ***');

    delete refreshTokens[refreshToken];
    const newRefreshToken = uuidv4();
    refreshTokens[newRefreshToken] = userId;

    const token = generateToken({ _id: userId }, newRefreshToken);

    res.cookie('JWT', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    req.userId = userId;
    return next();
  } else {
    console.log('\n*** NO VALID REFRESH TOKEN FOUND, NEW LOGIN REQUIRED ***');
    // TODO: Redirect to login?
    // 			 and/or:
    //			 delete refreshTokens[req.cookies.RT];
    res.status(401).json({ message: 'Sign-in required' });
  }
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

      console.log('\n*** refreshTokens:', refreshTokens);

      res.cookie('JWT', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });

      res.json(userInfo);
    });
  });
};

exports.login = (req, res, next) => {
  const userInfo = setUserInfo(req.user);

  const refreshToken = uuidv4();
  // TODO: Set refresh token in DB
  refreshTokens[refreshToken] = req.user._id;

  const token = generateToken(userInfo, refreshToken);

  console.log('\n*** refreshTokens:', refreshTokens);

  res.cookie('JWT', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  res.json(userInfo);
};

exports.requireAuth = (req, res, next) => {
  // const { token } = req.headers;
  const token = req.cookies.JWT;
  console.log('====================================');
  console.log('token:', token);
  console.log('====================================');

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return err.name === 'TokenExpiredError'
        ? handleExpiredToken(req, res, next)
        : // : next(err);
          res.status(401).json('new login required');
    }
    // Token is valid, get user ID and attach it to the request object
    console.log('*** TOKEN IS VALID ***\n decoded:\n', decoded);
    req.userId = decoded._id;
    return next();
  });
};
