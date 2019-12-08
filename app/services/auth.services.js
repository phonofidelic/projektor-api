const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const { JWT_SECRET, JWT_EXP, JWT_AUD, JWT_ISS } = require('../../config/keys');

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
exports.generateToken = generateToken;

exports.handleExpiredToken = (req, res, next) => {
  console.log('\n*** TOKEN EXPIRED ***');
  // const userId = req.userId;
  const { token } = req.headers;
  const decoded = jwt.decode(token);
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
    res.status(401).json({ message: 'Sign-in required' });
  }
};
