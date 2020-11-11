const { map } = require('p-iteration');

const mongoose = require('mongoose');
const Work = mongoose.model('Work');
const Project = mongoose.model('Project');
const Task = mongoose.model('Task');

const createWork = async (req, res, next) => {
  const { userId } = req;
  const {
    projectId,
    project,
    date,
    start,
    end,
    duration,
    notes,
    tasks,
  } = req.body;

  console.log('\n*** Create new Work ***');

  let newWork;
  try {
    newWork = await new Work({
      userId,
      projectId,
      project,
      date,
      start,
      end,
      duration,
      notes,
    }).save();

    // console.log('\n*** createWork, newWork:', newWork);
  } catch (err) {
    console.error(err);
    return next(err);
  }

  /**
   * Find all Tasks associated with the Work documents Project.
   */
  const addedTasks = await map(tasks, async (task) => {
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
      console.log(
        `* Existing Task found for value "${task.value}", updating reference links`
      );
      try {
        await Task.updateOne(
          { userId, _id: foundTask._id },
          { $addToSet: { work: newWork._id } }
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
    console.log(
      `* No existing Task found for value "${task.value}", creating new Task...`
    );
    let newTask;
    try {
      newTask = await new Task({
        userId,
        work: [newWork._id],
        projects: [newWork.project],
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
          _id: newWork.project,
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
   * Update the new Work doc with the added Tasks.
   */
  let newWorkWithTasks;
  try {
    newWorkWithTasks = await Work.findOneAndUpdate(
      { userId, _id: newWork._id },
      {
        $set: { tasks: addedTasks },
        /**
         * Set default Task allocation as duration of Work
         * devided by number of Tasks.
         */
        taskAlloc: addedTasks.map((task) =>
          Object.fromEntries(
            new Map([
              ['task', task._id],
              ['allocation', newWork.duration / addedTasks.length],
            ])
          )
        ),
      },
      { new: true }
    ).populate('tasks');
  } catch (err) {
    console.error('Could not update new Work doc with Task references:', err);
    return next(err);
  }
  console.log('### newWorkWithTasks:', newWorkWithTasks);

  res.json({ data: newWorkWithTasks });
};

module.exports = createWork;
