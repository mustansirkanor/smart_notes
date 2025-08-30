import mongoose from 'mongoose';

const { Schema } = mongoose;

const studySessionSchema = new Schema(
  {
    // each session now belongs to one user
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },

    startTime: { type: Date, required: true },
    endTime:   { type: Date },

    duration:      { type: Number, default: 0 },   // minutes
    notesCreated:  { type: Number, default: 0 },
    wordsWritten:  { type: Number, default: 0 },

    focusScore: { type: Number, min: 1, max: 10, default: 5 },

    goals: [
      {
        description: String,
        completed:   { type: Boolean, default: false }
      }
    ],

    mood: {
      type: String,
      enum: ['excellent', 'good', 'neutral', 'poor', 'terrible'],
      default: 'neutral'
    }
  },
  { timestamps: true }
);

// sort queries by newest session for a given user
studySessionSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model('StudySession', studySessionSchema);
