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
