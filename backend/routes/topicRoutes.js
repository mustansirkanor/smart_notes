import express from 'express';
import { authenticateToken } from '../services/authMiddleware.js';
import Topic from '../models/Topic.js';
import Note  from '../models/Note.js';

const router = express.Router();

/* ------------------------------------------------------------------
   GET  /api/topics  → all main topics for the logged-in user
-------------------------------------------------------------------*/
router.get('/', authenticateToken, async (req, res) => {
  try {
    const topics = await Topic
      .find({ owner: req.user._id, isSubtopic: false })
      .sort({ createdAt: -1 });

    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------------------------------------------------
   GET  /api/topics/:id  → one topic + its sub-topics + its notes
-------------------------------------------------------------------*/
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.id, owner: req.user._id });
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const subtopics = await Topic
      .find({ parentTopic: req.params.id, owner: req.user._id })
      .sort({ createdAt: -1 });

    const notes = await Note
      .find({ topic: req.params.id, owner: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ topic, subtopics, notes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------------------------------------------------
   POST /api/topics  → create main topic or sub-topic
-------------------------------------------------------------------*/
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, parentTopic } = req.body;

    const topic = new Topic({
      title,
      description,
      owner: req.user._id,                 // 🔑 link to current user
      isSubtopic: Boolean(parentTopic),
      parentTopic: parentTopic || null
    });

    await topic.save();

    // if it’s a sub-topic update the parent’s counters
    if (parentTopic) {
      const parent = await Topic.findOne({ _id: parentTopic, owner: req.user._id });
      if (parent) await parent.updateCounts(req.user._id);
    }

    res.status(201).json(topic);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ------------------------------------------------------------------
   DELETE /api/topics/:id  → delete a topic the user owns
-------------------------------------------------------------------*/
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.id, owner: req.user._id });
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    // optional safeguard: check for child docs before deleting
    // const subCount  = await Topic.countDocuments({ parentTopic: topic._id, owner: req.user._id });
    // const noteCount = await Note. countDocuments({ topic: topic._id,        owner: req.user._id });
    // if (subCount || noteCount) { … }

    await Topic.deleteOne({ _id: req.params.id, owner: req.user._id });

    // update parent counters if it was a sub-topic
    if (topic.parentTopic) {
      const parent = await Topic.findOne({ _id: topic.parentTopic, owner: req.user._id });
      if (parent) await parent.updateCounts(req.user._id);
    }

    res.json({ message: 'Topic deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
