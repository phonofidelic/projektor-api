// const jwt = require('jsonwebtoken');
// const uuidv4 = require('uuid/v4');
// const { JWT_SECRET, JWT_EXP, JWT_AUD, JWT_ISS } = require('../../config/keys');
// const { handleExpiredToken } = require('../services/auth.services');

// module.exports = (req, res, next) => {
//   const { token } = req.headers;
//   // const token = req.cookies.JWT;
//   console.log('====================================');
//   console.log('token:', token);
//   console.log('====================================');

//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return err.name === 'TokenExpiredError'
//         ? handleExpiredToken(req, res, next)
//         : res.status(401).json('new login required');
//     }
//     // Token is valid, get user ID and attach it to the request object
//     console.log('*** TOKEN IS VALID ***\n decoded:\n', decoded);
//     req.userId = decoded._id;
//     req.refreshToken = decoded.rt;

//     return next();
//   });
// };

/**
 * Auth0 authentication check
 */
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');

const { AUTH0_API_IDENTIFIER, AUTH0_DOMAIN } = require('../../config/keys');

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
module.exports = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),

  // Validate the audience and the issuer.
  audience: AUTH0_API_IDENTIFIER,
  issuer: `https://${AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});
