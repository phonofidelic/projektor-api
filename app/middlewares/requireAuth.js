const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const { JWT_SECRET, JWT_EXP, JWT_AUD, JWT_ISS } = require('../../config/keys');
const { handleExpiredToken } = require('../services/auth.services');

module.exports = (req, res, next) => {
  const { token } = req.headers;
  // const token = req.cookies.JWT;
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
