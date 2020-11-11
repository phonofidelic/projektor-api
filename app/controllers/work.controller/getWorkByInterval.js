const mongoose = require('mongoose');
const Work = mongoose.model('Work');

const getWorkByInterval = async (req, res, next) => {
  const { userId, token } = req;
  const { start, end } = req.params;

  console.log('====================================');
  // console.log('start:', start);
  // console.log('end:', end);
  console.log('req.params:', req.params);
  console.log('====================================');

  const querry = {
    userId,
    start: { $gte: start, $lte: end },
  };

  let results;
  try {
    results = await Work.find(querry);
    console.log('\n*** getAllWorkByInterval, results:', results);
    res.json({ data: results, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = getWorkByInterval;
