import express from 'express';
import Note from '../models/Note.js';
import Topic from '../models/Topic.js';

const router = express.Router();

// Get single note
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('topic');
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create note
router.post('/', async (req, res) => {
  try {
    const note = new Note(req.body);
    await note.save();

    // Update topic note count
    const topic = await Topic.findById(note.topic);
    if (topic) await topic.updateCounts();

    const populatedNote = await Note.findById(note._id).populate('topic');
    res.status(201).json(populatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('topic');
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Update topic note count
    const topic = await Topic.findById(note.topic);
    if (topic) await topic.updateCounts();

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
