const mongoose = require('mongoose');
const Schema = mongoose.Schema;
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

ProjectSchema.pre('remove', async function (next) {
  const project = this;
  try {
    await project
      .model('Task')
      .updateMany(
        { projects: { $in: project._id } },
        { $pull: { projects: work._id } }
      );
  } catch (err) {
    next(err);
  }

  next();
});

ProjectSchema.index({ title: 'text', description: 'text', client: 'text' });

module.exports = mongoose.model('Project', ProjectSchema);
