import express from 'express';
import studyAnalyticsService from '../services/studyAnalytics.js';
import StudyPlan from '../models/StudyPlan.js';
import Flashcard from '../models/Flashcard.js';

const router = express.Router();

// Study session management
router.post('/sessions/start', async (req, res) => {
  try {
    const { userId, topicId, goals } = req.body;
    const session = await studyAnalyticsService.startSession(userId, topicId, goals);
    res.json({ session });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/sessions/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { metrics } = req.body;
    const session = await studyAnalyticsService.endSession(sessionId, metrics);
    res.json({ session });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analytics endpoints
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = 'week' } = req.query;
    const analytics = await studyAnalyticsService.getAnalytics(userId, timeframe);
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Study plan management
router.post('/plans', async (req, res) => {
  try {
    const planData = req.body;
    const plan = new StudyPlan(planData);
    await plan.save();
    res.json({ plan });
  } catch (error) {
    console.error('Create study plan error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/plans/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const plans = await StudyPlan.find({ userId, isActive: true })
      .sort({ createdAt: -1 });
    res.json({ plans });
  } catch (error) {
    console.error('Get study plans error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/plans/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const updateData = req.body;
    const plan = await StudyPlan.findByIdAndUpdate(planId, updateData, { new: true });
    res.json({ plan });
  } catch (error) {
    console.error('Update study plan error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Flashcard statistics
router.get('/flashcards/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const totalCards = await Flashcard.countDocuments({ userId, isActive: true });
    const dueCards = await Flashcard.countDocuments({ 
      userId, 
      isActive: true,
      'repetitionData.nextReview': { $lte: new Date() }
    });
    const masteredCards = await Flashcard.countDocuments({ 
      userId, 
      isActive: true,
      'repetitionData.repetitions': { $gte: 5 }
    });

    res.json({
      total: totalCards,
      due: dueCards,
      mastered: masteredCards,
      completion: totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0
    });
  } catch (error) {
    console.error('Flashcard stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
