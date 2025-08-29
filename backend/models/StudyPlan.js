import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  goals: [{
    id: String,
    title: String,
    description: String,
    targetDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  schedule: [{
    date: Date,
    tasks: [{
      topicId: mongoose.Schema.Types.ObjectId,
      title: String,
      estimatedTime: Number, // in minutes
      type: {
        type: String,
        enum: ['study', 'review', 'practice', 'test'],
        default: 'study'
      },
      completed: {
        type: Boolean,
        default: false
      }
    }]
  }],
  preferences: {
    studyHoursPerDay: {
      type: Number,
      default: 2
    },
    preferredTimes: [{
      day: String, // 'monday', 'tuesday', etc.
      startTime: String, // '09:00'
      endTime: String    // '11:00'
    }],
    breakDuration: {
      type: Number,
      default: 15
    },
    sessionDuration: {
      type: Number,
      default: 45
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('StudyPlan', studyPlanSchema);
