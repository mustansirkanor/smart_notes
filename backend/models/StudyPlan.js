import mongoose from 'mongoose';

const { Schema } = mongoose;

const studyPlanSchema = new Schema(
  {
    /* NEW – link plan to the logged-in user */
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    title:       { type: String, required: true },
    description: String,

    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },

    goals: [
      {
        id:          String,
        title:       String,
        description: String,
        targetDate:  Date,
        completed:   { type: Boolean, default: false },
        priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
      }
    ],

    schedule: [
      {
        date:  Date,
        tasks: [
          {
            topicId:       Schema.Types.ObjectId,
            title:         String,
            estimatedTime: Number,                       // minutes
            type:          { type: String, enum: ['study', 'review', 'practice', 'test'], default: 'study' },
            completed:     { type: Boolean, default: false }
          }
        ]
      }
    ],

    preferences: {
      studyHoursPerDay: { type: Number, default: 2 },
      preferredTimes: [
        {
          day:       String,  // 'monday', 'tuesday', …
          startTime: String,  // '09:00'
          endTime:   String   // '11:00'
        }
      ],
      breakDuration:   { type: Number, default: 15 }, // minutes
      sessionDuration: { type: Number, default: 45 }  // minutes
    },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

/* fast look-ups: newest plans for a user */
studyPlanSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model('StudyPlan', studyPlanSchema);
