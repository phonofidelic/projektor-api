const mongoose = require('mongoose');
const Work = mongoose.model('Work');

const searchWork = async (req, res, next) => {
  const { userId, token } = req;
  const { q, projectId } = req.query;
  // console.log('\n### searchWork, userId:', userId);

  if (!q) {
    let allWork;
    try {
      allWork = await Work.find({ userId, projectId });
    } catch (err) {
      return next(err);
    }
    console.log('empty search:', allWork);
    return res.status(200).json({ data: allWork, token });
  }

  let matches;
  try {
    matches = await Work.find({ userId, projectId, $text: { $search: q } });
  } catch (err) {
    return next(err);
  }

  res.status(200).json({ data: matches, token });
};

module.exports = searchWork;
