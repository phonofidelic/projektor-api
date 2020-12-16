const mongoose = require('mongoose');
const Task = require('../models/task.model');

module.exports.getTasksByProjectId = async (req, res, next) => {
  const { userId } = req;
  const { projectId } = req.params;

  let tasks;

  try {
    tasks = await Task.find({
      userId,
      projects: { $in: [projectId] },
    }).populate('projects work');
  } catch (err) {
    console.error('Could not get tasks by projectId:', err);
    return next(err);
  }

  res.status(200).json({ tasks });
};

module.exports.createTask = async (req, res, next) => {
  console.log('*** Creating new Task');
  const { userId } = req;
  const { projectId, workId, taskName, keywords, description } = req.body;

  let createdTask;
  try {
    createdTask = await new Task({
      userId,
      work: workId ? [workId] : [],
      projects: [projectId],
      displayName: taskName,
      value: keywords,
      description,
    }).save();
  } catch (err) {
    console.error('Could not create new Task:', err);
    return next(err);
  }

  // if (workId) {
  //   mongoose.model('Work').findOneAndUpdate(
  //     { userId, _id: workId },
  //     {

  //     }
  //   )
  // }

  console.log('* New Task created:', createdTask);

  res.status(200).json({ createdTask });
};
