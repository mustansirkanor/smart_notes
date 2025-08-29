import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  repetitionData: {
    easeFactor: {
      type: Number,
      default: 2.5
    },
    interval: {
      type: Number,
      default: 1
    },
    repetitions: {
      type: Number,
      default: 0
    },
    nextReview: {
      type: Date,
      default: Date.now
    }
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  source: {
    noteId: mongoose.Schema.Types.ObjectId,
    excerpt: String
  }
}, {
  timestamps: true
});

flashcardSchema.index({ userId: 1, 'repetitionData.nextReview': 1 });

export default mongoose.model('Flashcard', flashcardSchema);
