const mongoose = require('mongoose');

const Work = mongoose.model('Work');

const startWork = async (req, res, next) => {
  const { userId } = req;
  const { projectId } = req.body;

  console.log('\n*** Start new Work ***');

  let startedWork;
  try {
    startedWork = await new Work({
      userId,
      projectId,
      project: projectId,
    }).save();
  } catch (err) {
    console.error('Could not save new started Work');
    return next(err);
  }

  console.log('* Saved new started Work:', startedWork);

  res.status(200).json({ data: startedWork });
};

module.exports = startWork;
