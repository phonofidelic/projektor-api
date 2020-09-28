const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema(
  {
    userId: { type: String, required: true },
    work: [{ type: Schema.Types.ObjectId, ref: 'Work' }],
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    displayName: { type: String, required: true },
    value: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: { createdAt: 'created', updatedAt: 'updated' } }
);

TaskSchema.pre('save', async function (next) {
  const task = this;

  /**
   * Save Task to Project
   */
  try {
    await task.model('Project').updateOne(
      {
        userId: task.userId,
        _id: { $in: task.projects },
      },
      { $push: { tasks: task._id } }
    );
    // .save();
  } catch (err) {
    return next(err);
  }

  /**
   * Save Task to Work
   */
  try {
    await task.model('Work').updateOne(
      {
        userId: task.userId,
        _id: { $in: task.work },
      },
      { $push: { tasks: task._id } }
    );
    // .save();
  } catch (err) {
    return next(err);
  }

  next();
});

TaskSchema.pre('remove', async function (next) {
  const task = this;

  console.log('\n* Cleaning up after removed Task:', task._id);
  /**
   * Remove Task references from Projects
   */
  try {
    await task.model('Project').updateMany(
      {
        userId: task.userId,
        _id: { $in: task.projects },
      },
      { $pull: { tasks: task._id } }
    );
    console.log('* Task references removed from associated Projects');
  } catch (err) {
    return next(err);
  }

  /**
   * Remove Task references from Work
   */
  try {
    await task.model('Work').updateMany(
      {
        userId: task.userId,
        _id: { $in: task.work },
      },
      { $pull: { tasks: task._id } }
    );
    console.log('* Task references removed from associated Work');
  } catch (err) {
    return next(err);
  }

  next();
});

TaskSchema.index({ description: 'text' });

module.exports = mongoose.model('Task', TaskSchema);
