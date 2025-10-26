const mongoose = require('mongoose');

const AISuggestionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habitName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  timeCommitment: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  category: {
    type: String,
    enum: ['health', 'fitness', 'mindfulness', 'productivity', 'social', 'other'],
    default: 'other'
  },
  accepted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
AISuggestionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AISuggestion', AISuggestionSchema);
