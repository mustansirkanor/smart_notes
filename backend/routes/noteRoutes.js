import express from 'express';
import { authenticateToken } from '../services/authMiddleware.js';
import Note  from '../models/Note.js';
import Topic from '../models/Topic.js';

const router = express.Router();

/* 🔒 Require a valid token for all note routes */
router.use(authenticateToken);

/* -------------------------------------------------
   GET  /api/notes/:id   – return ONE note (only if I own it)
--------------------------------------------------*/
router.get('/:id', async (req, res) => {
  try {
    const note = await Note
      .findOne({ _id: req.params.id, owner: req.user._id })
      .populate('topic');

    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------------
   POST /api/notes       – create a new note I own
--------------------------------------------------*/
router.post('/', async (req, res) => {
  try {
    /* attach owner → logged-in user */
    const note = new Note({ ...req.body, owner: req.user._id });
    await note.save();

    /* update parent-topic counters for this user */
    const topic = await Topic.findOne({ _id: note.topic, owner: req.user._id });
    if (topic) await topic.updateCounts(req.user._id);

    const populated = await Note
      .findOne({ _id: note._id, owner: req.user._id })
      .populate('topic');

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* -------------------------------------------------
   PUT  /api/notes/:id   – update my note
--------------------------------------------------*/
router.put('/:id', async (req, res) => {
  try {
    const note = await Note
      .findOneAndUpdate(
        { _id: req.params.id, owner: req.user._id },
        req.body,
        { new: true }
      )
      .populate('topic');

    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* -------------------------------------------------
   DELETE /api/notes/:id – delete my note
--------------------------------------------------*/
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note
      .findOneAndDelete({ _id: req.params.id, owner: req.user._id });

    if (!note) return res.status(404).json({ message: 'Note not found' });

    /* refresh parent-topic counters */
    const topic = await Topic.findOne({ _id: note.topic, owner: req.user._id });
    if (topic) await topic.updateCounts(req.user._id);

    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
