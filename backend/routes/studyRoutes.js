import express from 'express';
import { authenticateToken } from '../services/authMiddleware.js';
import studyAnalyticsService from '../services/studyAnalytics.js';
import StudyPlan  from '../models/StudyPlan.js';
import Flashcard  from '../models/Flashcard.js';

const router = express.Router();

/* -------------------------------------------------
   Require a valid JWT for every route in this file
--------------------------------------------------*/
router.use(authenticateToken);

/* -------- 1. STUDY-SESSION MANAGEMENT -------- */
router.post('/sessions/start', async (req, res) => {
  try {
    const { topicId, goals } = req.body;
    const session = await studyAnalyticsService.startSession(
      req.user._id,       // owner
      topicId,
      goals
    );
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sessions/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await studyAnalyticsService.endSession(
      sessionId,
      req.body.metrics,
      req.user._id          // owner check inside service
    );
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------- 2. AGGREGATED ANALYTICS -------- */
router.get('/analytics', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'week';
    const analytics = await studyAnalyticsService.getAnalytics(
      req.user._id,
      timeframe
    );
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------- 3. STUDY-PLAN CRUD -------- */
router.post('/plans', async (req, res) => {
  try {
    const plan = new StudyPlan({ ...req.body, owner: req.user._id });
    await plan.save();
    res.json({ plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/plans', async (req, res) => {
  try {
    const plans = await StudyPlan
      .find({ owner: req.user._id, isActive: true })
      .sort({ createdAt: -1 });
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/plans/:planId', async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndUpdate(
      { _id: req.params.planId, owner: req.user._id },
      req.body,
      { new: true }
    );
    res.json({ plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------- 4. FLASHCARD STATISTICS -------- */
router.get('/flashcards/stats', async (req, res) => {
  try {
    const owner = req.user._id;

    const [total, due, mastered] = await Promise.all([
      Flashcard.countDocuments({ owner, isActive: true }),
      Flashcard.countDocuments({
        owner,
        isActive: true,
        'repetitionData.nextReview': { $lte: new Date() }
      }),
      Flashcard.countDocuments({
        owner,
        isActive: true,
        'repetitionData.repetitions': { $gte: 5 }
      })
    ]);

    res.json({
      total,
      due,
      mastered,
      completion: total ? Math.round((mastered / total) * 100) : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
