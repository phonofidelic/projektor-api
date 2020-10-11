const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Work = require('../models/work.model');
const Task = require('../models/task.model');
const { ACTIVE } = require('../../constants').STATUS;

const ProjectSchema = new Schema(
  {
    // created: { type: Date, default: Date.now },
    // userId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: String, required: true },
    title: { type: String, required: true },
    color: { type: String },
    description: { type: String, default: 'No description provided' },
    startDate: { type: Date },
    deadline: { type: Date },
    client: { type: String },
    budgetedTime: { type: Number },
    timeUsed: { type: Number, default: 0 },
    status: { type: String, default: ACTIVE },
    work: [{ type: Schema.Types.ObjectId, ref: 'Work' }],
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  },
  { timestamps: { createdAt: 'created', updatedAt: 'updated' } }
);

// ProjectSchema.pre('findOneAndDelete', async function (next) {
//   const project = this;
//   console.log('*** PRE REMOVE project:', project);
//   console.log('*** project.userId:', project.userId);
//   console.log('*** project._id:', project._id);

//   /**
//    * Delete all Work items in this Project.
//    */
//   try {
//     // await project.model('Work').deleteMany({
//     await Work.deleteMany({
//       userId: project.userId,
//       project: project._id,
//     });
//   } catch (err) {
//     return next(err);
//   }

//   /**
//    * Remove reference to this Project from all Tasks.
//    */
//   try {
//     // await project.model('Task')
//     await Task.updateMany(
//       { userId: project.userId, projects: { $in: project._id } },
//       { $pull: { projects: project._id } }
//     );
//   } catch (err) {
//     next(err);
//   }

//   return next();
// });

ProjectSchema.index({ title: 'text', description: 'text', client: 'text' });

module.exports = mongoose.model('Project', ProjectSchema);
