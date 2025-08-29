import express from 'express';
import Topic from '../models/Topic.js';
import Note from '../models/Note.js';
import Flashcard from '../models/Flashcard.js';
import aiService from '../services/aiService.js';
import voiceService from '../services/voiceService.js';

const router = express.Router();

// Existing routes...
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Enhanced Smart Notes AI API running' });
});

router.post('/chat', async (req, res) => {
  try {
    const { message, context, userId, topicId, isVoiceInput, targetLanguage } = req.body;
    const response = await aiService.chatWithContext(message, topicId, userId, {
      isVoiceInput,
      targetLanguage
    });
    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/summary/:topicId', async (req, res) => {
  try {
    const notes = await Note.find({ topic: req.params.topicId });
    if (notes.length === 0) return res.status(400).json({ message: 'No notes found' });
    const summary = await aiService.generateSummary(notes);
    res.json({ summary });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/search', async (req, res) => {
  try {
    const { query, topicId } = req.body;
    if (!query) return res.status(400).json({ message: 'Query required' });
    const notes = await Note.find(topicId ? { topic: topicId } : {});
    const enhancedInfo = await aiService.enhancedSearch(query, notes);
    res.json({ enhancedInfo });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate-points/:topicId', async (req, res) => {
  try {
    const { requestType = 'general' } = req.body;
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    const notes = await Note.find({ topic: topic._id });
    const content = notes.map(n => `${n.title}:\n${n.content}`).join('\n\n');
    const smartPoints = await aiService.generateSmartPoints(topic.title, content, requestType);
    res.json({ smartPoints });
  } catch (error) {
    console.error('Generate points error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/custom-prompt/:topicId', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt required' });
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    const notes = await Note.find({ topic: topic._id });
    const content = notes.map(n => `${n.title}:\n${n.content}`).join('\n\n');
    const response = await aiService.generateFromPrompt(prompt, topic.title, content);
    res.json({ response });
  } catch (error) {
    console.error('Custom prompt error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ NEW: Translation endpoint
router.post('/translate', async (req, res) => {
  try {
    const { content, targetLanguage, sourceLanguage } = req.body;
    if (!content || !targetLanguage) {
      return res.status(400).json({ message: 'Content and target language required' });
    }

    const translation = await aiService.translateContent(content, targetLanguage, sourceLanguage);
    res.json({ translation, originalContent: content, targetLanguage });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ NEW: Voice processing endpoints
router.post('/voice/process', async (req, res) => {
  try {
    const { audioData, language } = req.body;
    const result = await voiceService.processVoiceInput(audioData, language);
    res.json(result);
  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/voice/synthesize', async (req, res) => {
  try {
    const { text, options } = req.body;
    if (!text) return res.status(400).json({ message: 'Text required' });
    const result = await voiceService.generateSpeech(text, options);
    res.json(result);
  } catch (error) {
    console.error('Speech synthesis error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/voice/languages', (req, res) => {
  try {
    const languages = voiceService.getSupportedLanguages();
    res.json({ languages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ NEW: Flashcard endpoints
router.post('/flashcards/generate/:topicId', async (req, res) => {
  try {
    const { count = 10, difficulty } = req.body;
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    
    const notes = await Note.find({ topic: topic._id });
    if (notes.length === 0) {
      return res.status(400).json({ message: 'No notes found for flashcard generation' });
    }

    const flashcards = await aiService.generateFlashcards(notes, { count, difficulty });
    
    // Save flashcards to database
    const savedFlashcards = [];
    for (const flashcard of flashcards) {
      const newFlashcard = new Flashcard({
        userId: req.body.userId || 'anonymous',
        topicId: req.params.topicId,
        question: flashcard.question,
        answer: flashcard.answer,
        difficulty: flashcard.difficulty || 'medium',
        tags: flashcard.tags || []
      });
      
      const saved = await newFlashcard.save();
      savedFlashcards.push(saved);
    }

    res.json({ 
      flashcards: savedFlashcards,
      generated: savedFlashcards.length,
      topic: topic.title
    });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/flashcards/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { topicId, due } = req.query;
    
    let query = { userId, isActive: true };
    if (topicId) query.topicId = topicId;
    if (due === 'true') {
      query['repetitionData.nextReview'] = { $lte: new Date() };
    }

    const flashcards = await Flashcard.find(query)
      .populate('topicId', 'title')
      .sort({ 'repetitionData.nextReview': 1 })
      .limit(50);

    res.json({ flashcards });
  } catch (error) {
    console.error('Get flashcards error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/flashcards/:id/review', async (req, res) => {
  try {
    const { quality } = req.body; // 0-5 scale (SuperMemo algorithm)
    const flashcard = await Flashcard.findById(req.params.id);
    
    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    // Update spaced repetition data using SuperMemo algorithm
    const { easeFactor, interval, repetitions } = flashcard.repetitionData;
    
    let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEaseFactor < 1.3) newEaseFactor = 1.3;

    let newRepetitions = repetitions;
    let newInterval = interval;

    if (quality >= 3) {
      if (repetitions === 0) {
        newInterval = 1;
      } else if (repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * newEaseFactor);
      }
      newRepetitions += 1;
    } else {
      newRepetitions = 0;
      newInterval = 1;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    flashcard.repetitionData = {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReview
    };

    await flashcard.save();
    res.json({ flashcard, nextReview });
  } catch (error) {
    console.error('Flashcard review error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ NEW: Study plan endpoints
router.post('/study-plan/generate', async (req, res) => {
  try {
    const { userId, topicIds, preferences, goals } = req.body;
    
    const topics = await Topic.find({ _id: { $in: topicIds } });
    const topicsWithCounts = await Promise.all(topics.map(async topic => {
      const noteCount = await Note.countDocuments({ topic: topic._id });
      return { ...topic.toObject(), noteCount };
    }));

    const studyPlan = await aiService.createStudyPlan(topicsWithCounts, preferences, goals);
    
    res.json({ studyPlan });
  } catch (error) {
    console.error('Study plan generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
