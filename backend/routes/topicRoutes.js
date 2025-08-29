import express from 'express';
import Topic from '../models/Topic.js';
import Note from '../models/Note.js';

const router = express.Router();

// Get all main topics (not subtopics)
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find({ isSubtopic: false }).sort({ createdAt: -1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get topic with subtopics and notes
router.get('/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const subtopics = await Topic.find({ parentTopic: req.params.id }).sort({ createdAt: -1 });
    const notes = await Note.find({ topic: req.params.id }).sort({ createdAt: -1 });

    res.json({ topic, subtopics, notes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create topic or subtopic
router.post('/', async (req, res) => {
  try {
    const { title, description, parentTopicId } = req.body;

    const topicData = {
      title,
      description,
      isSubtopic: !!parentTopicId,
      parentTopic: parentTopicId || null
    };

    const topic = new Topic(topicData);
    await topic.save();

    // Update parent topic subtopic count if it's a subtopic
    if (parentTopicId) {
      const parentTopic = await Topic.findById(parentTopicId);
      if (parentTopic) await parentTopic.updateCounts();
    }

    res.status(201).json(topic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete topic
router.delete('/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    // Check for subtopics and notes
    const subtopicCount = await Topic.countDocuments({ parentTopic: req.params.id });
    const noteCount = await Note.countDocuments({ topic: req.params.id });

    // if (subtopicCount > 0 || noteCount > 0) {
    //   return res.status(400).json({
    //     message: `Cannot delete topic with ${subtopicCount} subtopics and ${noteCount} notes`
    //   });
    // }

    await Topic.findByIdAndDelete(req.params.id);

    // Update parent topic count if it was a subtopic
    if (topic.parentTopic) {
      const parentTopic = await Topic.findById(topic.parentTopic);
      if (parentTopic) await parentTopic.updateCounts();
    }

    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
