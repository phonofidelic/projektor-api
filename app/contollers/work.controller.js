const Work = require('../models/work.model');

module.exports.createWork = async (req, res, next) => {
  // const { userId } = req;
  const userId = '0a1e4fdd-28c8-4c84-a7e8-db9e22602ed2'; // Mock userId
  const { projectId } = req.body;

  let newWork;
  try {
    newWork = await new Work({
      userId,
      projectId
    }).save();

    res.json({ work: newWork });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
