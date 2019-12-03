const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  created: { type: Date, default: Date.now },
  // userId: { type: Schema.Types.ObjectId, required: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: 'No description provided' },
  startDate: { type: Date },
  deadline: { type: Date },
  client: { type: String },
  budgetedTime: { type: Number },
  timeUsed: { type: Number, default: 0 },
  work: [{ type: Schema.Types.ObjectId, ref: 'Work' }]
});

module.exports = mongoose.model('Project', ProjectSchema);
