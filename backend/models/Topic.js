import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  color: { type: String, default: '#00BCD4' },
  noteCount: { type: Number, default: 0 },
  subtopicCount: { type: Number, default: 0 },
  parentTopic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', default: null }, // For subtopics
  isSubtopic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

topicSchema.methods.updateCounts = async function () {
  const Note = mongoose.model('Note');
  const Topic = mongoose.model('Topic');

  this.noteCount = await Note.countDocuments({ topic: this._id });
  this.subtopicCount = await Topic.countDocuments({ parentTopic: this._id });

  return this.save();
};

const Topic = mongoose.model('Topic', topicSchema);

export default Topic;
