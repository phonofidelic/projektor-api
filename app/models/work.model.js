const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Project = require('./project.model');

const WorkSchema = new Schema({
  created: { type: Date, default: Date.now, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  projectId: { type: Schema.Types.ObjectId, required: true },
  date: { type: Date, default: Date.now, required: true },
  start: { type: Date, default: Date.now, required: true },
  end: { type: Date },
  duration: { type: Number },
  notes: { type: String }
});

WorkSchema.pre('save', async function(next) {
  try {
    await Project.updateOne(
      { _id: this.projectId, userId: this.userId },
      {
        $inc: { timeUsed: this.duration },
        $push: { work: this._id }
      }
    );
    next();
  } catch (err) {
    next(err);
  }
});

WorkSchema.pre('remove', async function(next) {
  console.log('*** PRE REMOVE');
  try {
    await Project.updateOne(
      { _id: this.projectId, userId: this.userId },
      {
        $inc: { timeUsed: -this.duration },
        $pull: { work: this._id }
      }
    );
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = mongoose.model('Work', WorkSchema);
