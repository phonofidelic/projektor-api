const Project = require('../models/project.model');
const {
  ACTIVE,
  COMPLETE,
  ARCHIVED,
  DELETED
} = require('../../constants').STATUS;

module.exports.createProject = async (req, res, next) => {
  const { userId, token } = req;

  const {
    title,
    description,
    client,
    budgetedTime,
    startDate,
    deadline
  } = req.body;

  let newProject;
  try {
    newProject = await new Project({
      userId,
      created: Date.now(),
      title,
      description,
      client,
      budgetedTime,
      startDate,
      deadline
    }).save();

    res.status(200).json({ data: newProject, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports.getProjects = async (req, res, next) => {
  const { userId, token } = req;
  const { status } = req.query;
  console.log('====================================');
  console.log('getProjects, req.query:', req.query);
  console.log('====================================');

  let projects;
  try {
    projects = await Project.find({ userId, status });

    res.json({ data: projects, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports.getProject = async (req, res, next) => {
  const { userId, token } = req;

  const { projectId } = req.params;

  let project;
  try {
    project = await Project.findOne({ userId, _id: projectId }).populate({
      path: 'work'
    });
    res.json({ data: project, token });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports.setProjectStatus = async (req, res, next) => {
  const { userId, token } = req;
  const { projectId, status } = req.body;

  let project;
  try {
    project = await Project.findOneAndUpdate(
      { _id: projectId, userId },
      { status },
      { new: true }
    );

    res.json({ data: project._id, token });
  } catch (err) {
    return next(err);
  }
};

module.exports.deleteProject = async (req, res, next) => {
  const { userId, token } = req;
  const { projectId } = req.params;

  let project;
  try {
    project = await Project.findOneAndUpdate(
      { _id: projectId, userId },
      { status: DELETED },
      { new: true }
    );

    res.json({ data: project._id, token });
  } catch (err) {
    return next(err);
  }
};

module.exports.deleteAllTrash = async (req, res, next) => {
  const { userId, token } = req;

  console.log('====================================');
  console.log('deleteAllTrash, userId:', userId);
  console.log('====================================');

  let deletedProjects;
  try {
    deletedProjects = await Project.deleteMany({ userId, status: DELETED });

    console.log('====================================');
    console.log('deletedProjects:', deletedProjects);
    console.log('====================================');
    res.json({ data: deletedProjects, token });
  } catch (err) {
    return next(err);
  }
};