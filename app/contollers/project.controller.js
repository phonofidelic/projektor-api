const Project = require('../models/project.model');

module.exports.createProject = async (req, res, next) => {
  // const { userId } = req;
  const userId = '0a1e4fdd-28c8-4c84-a7e8-db9e22602ed2'; // Mock userId

  const {
    title,
    description,
    client,
    budgetedTime,
    startDate,
    deadline
  } = req.body;

  console.log('====================================');
  console.log('req.body:', req.body);
  console.log('====================================');

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

    res.status(200).json(newProject);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports.getProjects = async (req, res, next) => {
  // const { userId } = req;
  const userId = '0a1e4fdd-28c8-4c84-a7e8-db9e22602ed2'; // Mock userId

  let projects;
  try {
    projects = await Project.find({ userId, status: 'active' }); // TODO: find by userId

    res.json(projects);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports.getProject = async (req, res, next) => {
  // const { userId } = req;
  const userId = '0a1e4fdd-28c8-4c84-a7e8-db9e22602ed2'; // Mock userId
  const { projectId } = req.params;

  let project;
  try {
    project = await Project.findOne({ userId, _id: projectId }).populate({
      path: 'work'
    });
    res.json(project);
  } catch (err) {
    console.error(err);
    next(err);
  }
};
