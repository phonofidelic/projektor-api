const Work = require('../models/work.model');

module.exports.createWork = async (req, res, next) => {
  const { userId, token } = req;
  const { projectId, date, start, end, duration, notes } = req.body;

  let newWork;
  try {
    newWork = await new Work({
      userId,
      projectId,
      date,
      start,
      end,
      duration,
      notes
    }).save();

    res.json({ data: newWork, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports.updateWork = async (req, res, next) => {
  const { userId, token } = req;
  const { workData } = req.body;
  const { workId } = req.params;

  console.log('====================================');
  console.log('updateWork, workData:', workData);
  console.log('====================================');

  let updatedWork;
  try {
    updatedWork = await Work.findOneAndUpdate({ _id: workId }, workData, {
      new: true
    });
    console.log('*** updatedWork:', updatedWork);
    res.json({ data: updatedWork, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports.removeWork = async (req, res, next) => {
  const { userId, token } = req;
  const { workId } = req.body;

  let deletedWork;
  try {
    deletedWork = await Work.findOneAndRemove({ userId, workId });
    res.json({ data: deletedWork, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
