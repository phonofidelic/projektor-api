const Project = require('../models/project.model');
const Work = require('../models/work.model');
const mongoose = require('mongoose');

module.exports = async (req, res, next) => {
  /**
   * If userId already exists on request object,
   * continue to next function.
   */
  const { userId } = req;
  // console.log('### normalizeUserId, userId:', userId);
  if (userId) return next();

  /**
   * Otherwise, retreive subscriber from req.user
   * and set it as req.userId.
   */
  const user = req.user;
  // console.log('### normalizeUserId, user:', user);
  const { sub } = user;

  req.userId = sub;

  /**
   * Update userId on Project and Work documents
   * belonging to the current user.
   */
  // const oldUserId = sub.replace('auth0|', '').trim();
  // let projects;
  // try {
  //   projects = await Project.update(
  //     { userId: oldUserId },
  //     { userId: sub },
  //     { multi: true }
  //   );
  //   console.log('### updated projects:', projects);
  // } catch (err) {
  //   return next(
  //     new Error(`Could not update Project documents for user ${sub}:`, err)
  //   );
  // }

  // console.log('### oldUserId as ObjectId:', mongoose.Types.ObjectId(oldUserId));

  // let work;
  // let test_work;
  // try {
  //   test_work = await Work.find({ userId: mongoose.Types.ObjectId(oldUserId) });
  //   work = await Work.updateMany(
  //     // { userId: mongoose.Types.ObjectId(oldUserId) },
  //     { userId: oldUserId },
  //     { $set: { userId: sub } },
  //     { multi: true }
  //   );
  //   console.log('### updated work:', work);
  //   console.log('### test find work:', test_work);
  // } catch (err) {
  //   return next(
  //     new Error(`Could not update Work documents for user ${sub}:`, err)
  //   );
  // }

  next();
};
