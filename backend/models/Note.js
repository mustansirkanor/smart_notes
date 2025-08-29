import { Schema, model } from 'mongoose';

const noteSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default model('Note', noteSchema);
