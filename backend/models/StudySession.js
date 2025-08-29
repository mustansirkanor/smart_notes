import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  notesCreated: {
    type: Number,
    default: 0
  },
  wordsWritten: {
    type: Number,
    default: 0
  },
  focusScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  goals: [{
    description: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  mood: {
    type: String,
    enum: ['excellent', 'good', 'neutral', 'poor', 'terrible'],
    default: 'neutral'
  }
}, {
  timestamps: true
});

studySessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('StudySession', studySessionSchema);
