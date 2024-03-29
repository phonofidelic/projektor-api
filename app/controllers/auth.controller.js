const User = require('../models/user.model');
const Token = require('../models/token.model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const {
  JWT_SECRET,
  JWT_EXP,
  JWT_AUD,
  JWT_ISS,
  DOMAIN,
  CLIENT_DOMAIN,
} = require('../../config/keys');
const { generateToken } = require('../services/auth.services');
const { sendConfirmationEmail } = require('../services/mail.services');
const { auth0Management } = require('../services/auth0.service');

const STRINGS = {
  user_registration_success: 'new user registered',
  user_email_conflict: 'Sorry, that email address is already in use',
};

const setUserInfo = (user) => {
  return {
    _id: user._id,
    email: user.email,
    isVerified: user.isVerified,
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
      password: password,
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
        value: crypto.randomBytes(16).toString('hex'),
      });
      confirmationToken.save(async (err) => {
        if (err) return next(err);
      });

      const emailParams = {
        to: email,
        from: 'team@projektorapp.com',
        subject: 'Welcome to Projektor!',
        message: `<img src="https://projektor-api.herokuapp.com/logo.svg" alt="Projektor logo"/><br/>
        <br/>
        <br/>
        Welcome to Projektor!<br/>
        To verify your email, please visit the link below:<br/>
        <br/>
        <a href="${
          process.env.NODE_ENV === 'production' ? 'https://' : 'http://'
        }${req.headers.host}/auth/verify/${
          confirmationToken.value
        }">Verify Email</a><br/>
        `,
      };

      try {
        await sendConfirmationEmail(emailParams);
      } catch (err) {
        res.next(err);
      }

      res.json(userInfo);
    });
  });
};

// exports.resendVerification = async (req, res, next) => {
//   const { userId } = req;

//   let user;
//   try {
//     user = await User.findById(userId);
//   } catch (err) {
//     return next(err);
//   }

//   /**
//    * Remove any remaining verification token associated with the user
//    */
//   let removedTokens;
//   try {
//     removedTokens = await Token.deleteMany({ userId });
//   } catch (err) {
//     return next(err);
//   }
//   console.log('====================================');
//   console.log('removed verification tokens:', removedTokens);
//   console.log('====================================');

//   /**
//    * Create new verification token
//    */
//   const confirmationToken = new Token({
//     userId: user._id,
//     value: crypto.randomBytes(16).toString('hex')
//   });
//   confirmationToken.save(async err => {
//     if (err) return next(err);
//   });

//   const emailParams = {
//     to: user.email,
//     from: 'team@projektorapp.com',
//     subject: 'New Projektor verification link',
//     message: `<img src="https://projektor-api.herokuapp.com/logo.svg" alt="Projektor logo"/><br/>
//     <br/>
//     <br/>
//     Hello again!<br/>
//     Here is your new verification link.<br/>
//     To verify your email, please visit the link below:<br/>
//     <br/>
//     <a href="${process.env.NODE_ENV === 'production' ? 'https://' : 'http://'}${
//       req.headers.host
//     }/auth/verify/${confirmationToken.value}">Verify Email</a><br/>
//     `
//   };

//   try {
//     await sendConfirmationEmail(emailParams);
//   } catch (err) {
//     return next(err);
//   }

//   res.json({ message: 'Verification email sent' });
// };

exports.resendVerification = async (req, res, next) => {
  const { userId } = req;
  console.log('*** resendVerification, userId:', userId);

  let response;
  try {
    response = await auth0Management.sendEmailVerification({ user_id: userId });
  } catch (err) {
    console.error('Could not resend verification email:', err);
    return next(new Error('Could not resend verification email'));
  }
  console.log('*** resendVerification, response:', response);
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
    res.render('confirmation', {
      user: `${user.email.split('@')[0]}`,
      link: `${CLIENT_DOMAIN}/projects`,
      domain: DOMAIN,
    });
  } catch (err) {
    next(err);
  }
};
