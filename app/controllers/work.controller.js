const Work = require('../models/work.model');

module.exports.createWork = async (req, res, next) => {
  const { userId, token } = req;
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

    res.json({ data: newWork, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
