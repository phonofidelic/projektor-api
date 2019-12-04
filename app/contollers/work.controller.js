const Work = require('../models/work.model');

module.exports.createWork = async (req, res, next) => {
  // const { userId } = req;
  const userId = '0a1e4fdd-28c8-4c84-a7e8-db9e22602ed2'; // Mock userId
  const { projectId, date, start, end, duration } = req.body;

  let newWork;
  try {
    newWork = await new Work({
      userId,
      projectId,
      date,
      start,
      end,
      duration
    }).save();

    res.json(newWork);
  } catch (err) {
    console.error(err);
    next(err);
  }
};
