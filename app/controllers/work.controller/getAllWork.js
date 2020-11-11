const { get } = require('mongoose');
const mongoose = require('mongoose');
const Work = mongoose.model('Work');

const getAllWork = async (req, res, next) => {
  const { userId, token } = req;

  let results;
  try {
    results = await Work.find({ userId }).populate('project');
  } catch (err) {
    console.error(err);
    next(err);
  }

  /**
   * Check Work documents for project field and
   * update them if it is not present
   */
  const checkedResults = results.map(async (work) => {
    if (!work.project) {
      let updatedWork;
      try {
        updatedWork = await Work.findOneAndUpdate(
          { userId, _id: work._id },
          { project: work.projectId },
          { new: true }
        ).populate('project');
      } catch (err) {
        console.error(err);
        next(err);
      }
      return updatedWork;
    }

    return work;
  });

  res.json({ data: await Promise.all(checkedResults), token });
};

module.exports = getAllWork;
