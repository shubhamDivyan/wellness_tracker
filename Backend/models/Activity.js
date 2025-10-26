const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    maxlength: [200, 'Action cannot exceed 200 characters']
  },
  icon: {
    type: String,
    default: '✨'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto-delete after 30 days
  }
});

// Index for efficient querying
ActivitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
