const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WorkSchema = new Schema(
  {
    // created: { type: Date, default: Date.now, required: true },
    // userId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, required: true },
    project: { type: Schema.Types.ObjectId, required: true, ref: 'Project' },
    date: { type: Date, default: Date.now, required: true },
    start: { type: Date, default: Date.now, required: true },
    end: { type: Date },
    duration: { type: Number },
    notes: { type: String },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  },
  { timestamps: { createdAt: 'created', updatedAt: 'updated' } }
);

WorkSchema.pre('save', async function (next) {
  console.log('### Work pre save');
  const work = this;
  try {
    await work.model('Project').updateOne(
      { _id: this.projectId, userId: this.userId },
      {
        $inc: { timeUsed: this.duration },
        $push: { work: this._id },
      }
    );
  } catch (err) {
    next(err);
  }

  next();
});

WorkSchema.pre('remove', async function (next) {
  console.log('*** PRE REMOVE');
  const work = this;
  try {
    await work.model('Project').updateOne(
      { _id: this.projectId, userId: this.userId },
      {
        $inc: { timeUsed: -this.duration },
        $pull: { work: this._id },
      }
    );
    // next();
  } catch (err) {
    console.error(err);
    return next(err);
  }

  try {
    await work
      .model('Task')
      .updateMany({ work: { $in: work._id } }, { $pull: { work: work._id } });
  } catch (err) {
    return next(err);
  }

  next();
});

WorkSchema.index({ notes: 'text' });

module.exports = mongoose.model('Work', WorkSchema);
