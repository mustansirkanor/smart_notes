import mongoose from 'mongoose';

const { Schema } = mongoose;

const topicSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },   // NEW
  title: { type: String, required: true },
  description: String,
  color: { type: String, default: '#00BCD4' },
  noteCount: { type: Number, default: 0 },
  subtopicCount: { type: Number, default: 0 },
  parentTopic: { type: Schema.Types.ObjectId, ref: 'Topic', default: null },
  isSubtopic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

/*
 * Recalculate noteCount and subtopicCount for THIS topic
 * but only for documents owned by the same user.
 * Call it like:  await topic.updateCounts(req.user._id);
 */
topicSchema.methods.updateCounts = async function (userId) {
  const Note  = mongoose.model('Note');
  const Topic = mongoose.model('Topic');

  // Notes that belong to the same user and this topic
  this.noteCount = await Note.countDocuments({ topic: this._id, owner: userId });

  // Sub-topics that belong to the same user and have this topic as parent
  this.subtopicCount = await Topic.countDocuments({ parentTopic: this._id, owner: userId });

  return this.save();
};

export default mongoose.model('Topic', topicSchema);
