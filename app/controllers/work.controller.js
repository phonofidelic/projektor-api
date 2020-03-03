const mongoose = require('mongoose');
const Work = require('../models/work.model');
const Project = require('../models/project.model');

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

  let updatedWork;
  try {
    updatedWork = await Work.findOneAndUpdate(
      { _id: workId, userId },
      workData,
      {
        new: true
      }
    );
  } catch (err) {
    console.error(err);
    next(err);
  }

  /**
   * Use aggregate pipeline to get total timeUsed
   * for Project
   */
  let projectDuration;
  try {
    projectDuration = await Work.aggregate([
      { $match: { projectId: mongoose.Types.ObjectId(workData.projectId) } },
      { $group: { _id: null, duration: { $sum: '$duration' } } },
      { $project: { _id: 0, duration: 1 } }
    ]);
  } catch (err) {
    console.error(err);
    next(err);
  }

  /**
   * Update Project with new timeUsed value
   */
  try {
    await Project.findByIdAndUpdate(workData.projectId, {
      timeUsed: projectDuration[0].duration
    });
  } catch (err) {
    console.error(err);
    next(err);
  }

  res.json({ data: updatedWork, token });
};

module.exports.removeWork = async (req, res, next) => {
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

module.exports.getAllWork = async (req, res, next) => {
  const { userId, token } = req;

  let results;
  try {
    results = await Work.find({ userId });
  } catch (err) {
    console.error(err);
    next(err);
  }
  res.json({ data: results, token });
};

module.exports.getWorkByInterval = async (req, res, next) => {
  const { userId, token } = req;
  const { start, end } = req.params;

  console.log('====================================');
  // console.log('start:', start);
  // console.log('end:', end);
  console.log('req.params:', req.params);
  console.log('====================================');

  const querry = {
    userId,
    start: { $gte: start, $lte: end }
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
