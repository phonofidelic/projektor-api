const User = require('../models/user.model');

module.exports = async (req, res, next) => {
  let user;

  try {
    user = await User.findById(req.userId);
  } catch (err) {
    return next(err);
  }

  if (!user.isVerified)
    return res
      .status(403)
      .json({ message: 'Users email has not been verified' });

  next();
};
