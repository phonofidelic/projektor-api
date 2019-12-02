const Project = require('../models/project.model');

module.exports.createProject = async (req, res, next) => {
  const { userId } = req;

  console.log('====================================');
  console.log('req.body:', req.body);
  console.log('====================================');

  let newProject;
  try {
    newProject = await Project({
      ...req.body
    }).save();
  } catch (err) {
    console.error(err);
  }
  res.status(200).json({ project: newProject });
};
