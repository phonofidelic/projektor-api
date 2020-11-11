const mongoose = require('mongoose');
const Work = mongoose.model('Work');

const removeWork = async (req, res, next) => {
  const { userId, token } = req;
  const { workId } = req.params;

  let workToRemove;
  try {
    workToRemove = await Work.findOne({ _id: workId, userId });
    console.log('*** workToRemove:', workToRemove);
    await workToRemove.remove();
    res.json({ data: workToRemove, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = removeWork;
