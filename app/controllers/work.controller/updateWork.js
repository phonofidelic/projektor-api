const mongoose = require('mongoose');
const { map } = require('p-iteration');

const Work = mongoose.model('Work');
const Project = mongoose.model('Project');
const Task = mongoose.model('Task');

const updateWork = async (req, res, next) => {
  const { userId } = req;
  const { workData } = req.body;

  console.log('\n*** Update Work ***');
  console.log('* work data:');
  console.log(workData);

  /**
   * Find all Tasks associated with the Work documents Project.
   */
  const tasks = await map(workData.tasks, async (task) => {
    let foundTask;
    try {
      foundTask = await Task.findOne({
        userId,
        projects: { $in: task.projects },
        value: task.value,
      });
    } catch (err) {
      console.error('Could not find task:', err);
      return next(err);
    }

    /**
     * If an existing Task is found, add this Work id
     * to its reference array and return the Task id.
     */
    if (foundTask) {
      console.log('* Existing Task found, updating reference links');
      try {
        await Task.updateOne(
          { userId, _id: foundTask._id },
          { $addToSet: { work: workData._id } }
        );
      } catch (err) {
        console.error('Could not add Work id to the Tasks:', err);
        return next(err);
      }
      return foundTask._id;
    }

    /**
     * Otherwise, create a new Task and add this Work id
     * to its reference array and return the Task id.
     */
    console.log('* No existing Task found, creating new Task...');
    let newTask;
    try {
      newTask = await new Task({
        userId,
        work: [workData._id],
        projects: [workData.project],
        displayName: task.displayName,
        value: task.value,
        description: task.description,
      }).save();
    } catch (err) {
      console.error('Could not create new task', err);
      return next(err);
    }

    /**
     * Update project with new Task id
     */
    try {
      await Project.findByIdAndUpdate(
        {
          userId,
          _id: workData.project,
        },
        {
          $addToSet: { tasks: newTask._id },
        }
      );
    } catch (err) {
      console.error('Could not update project with new task id');
      return next(err);
    }

    return newTask._id;
  });

  /**
   * Update all Tasks associated with this Work item.
   * For each Task found, if it is not in the "tasks" list,
   * pull this Work reference from the Task document.
   */
  try {
    await Task.updateMany(
      {
        userId,
        // work: { $in: [workData._id] },
        _id: {
          $nin: tasks,
        },
      },
      { $pull: { work: workData._id } }
    );
  } catch (err) {
    console.error('Could not unlink referenced Task:', err);
    return next(err);
  }

  /**
   * Update Work document
   */
  let updatedWork;
  try {
    updatedWork = await Work.findOneAndUpdate(
      { _id: workData._id, userId },
      {
        ...workData,
        tasks,
        taskAlloc: workData.taskAlloc.map((alloc, i) => ({
          ...alloc,
          task: tasks[i]._id,
        })),
      },
      {
        new: true,
      }
    ).populate('tasks');
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
      { $project: { _id: 0, duration: 1 } },
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
      timeUsed: projectDuration[0].duration,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }

  res.json({ data: updatedWork });
};

module.exports = updateWork;
