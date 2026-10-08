const mongoose = require('mongoose');

const ParseJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumePath: { type: String, required: true },
  status: { type: String, enum: ['pending','processing','done','failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  attempts: { type: Number, default: 0 },
  error: { type: String }
});

ParseJobSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ParseJob', ParseJobSchema);
