import StudySession from '../models/StudySession.js';
import aiService from './aiService.js';

class StudyAnalyticsService {
  // Track a new study session
  async startSession(userId, topicId, goals = []) {
    try {
      const session = new StudySession({
        userId,
        topicId,
        startTime: new Date(),
        goals: goals.map(goal => ({ description: goal, completed: false }))
      });

      await session.save();
      return session;
    } catch (error) {
      throw new Error(`Failed to start study session: ${error.message}`);
    }
  }

  // End a study session with metrics
  async endSession(sessionId, metrics = {}) {
    try {
      const session = await StudySession.findById(sessionId);
      if (!session) {
        throw new Error('Study session not found');
      }

      const endTime = new Date();
      const duration = Math.round((endTime - session.startTime) / 1000 / 60); // minutes

      session.endTime = endTime;
      session.duration = duration;
      session.notesCreated = metrics.notesCreated || 0;
      session.wordsWritten = metrics.wordsWritten || 0;
      session.focusScore = metrics.focusScore || 5;
      session.mood = metrics.mood || 'neutral';

      await session.save();
      return session;
    } catch (error) {
      throw new Error(`Failed to end study session: ${error.message}`);
    }
  }

  // Get study analytics for a user
  async getAnalytics(userId, timeframe = 'week') {
    try {
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const sessions = await StudySession.find({
        userId,
        createdAt: { $gte: startDate }
      }).populate('topicId').sort({ createdAt: -1 });

      // Calculate basic metrics
      const totalSessions = sessions.length;
      const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      const averageFocus = sessions.length > 0 
        ? sessions.reduce((sum, session) => sum + session.focusScore, 0) / sessions.length 
        : 0;
      const totalNotes = sessions.reduce((sum, session) => sum + (session.notesCreated || 0), 0);
      const totalWords = sessions.reduce((sum, session) => sum + (session.wordsWritten || 0), 0);

      // Calculate study streak
      const studyStreak = await this.calculateStudyStreak(userId);

      // Get AI insights
      let aiInsights = null;
      if (sessions.length >= 5) {
        try {
          aiInsights = await aiService.analyzeStudyPatterns(sessions);
        } catch (error) {
          console.warn('AI insights unavailable:', error.message);
        }
      }

      return {
        timeframe,
        summary: {
          totalSessions,
          totalTime,
          averageFocus: Math.round(averageFocus * 10) / 10,
          totalNotes,
          totalWords,
          studyStreak,
          averageSessionLength: totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0
        },
        sessions: sessions.slice(0, 20), // Latest 20 sessions
        aiInsights,
        charts: {
          dailyStudyTime: await this.getDailyStudyTimeChart(userId, startDate),
          focusScores: await this.getFocusScoreChart(userId, startDate),
          topicDistribution: await this.getTopicDistributionChart(userId, startDate)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }

  async calculateStudyStreak(userId) {
    try {
      const sessions = await StudySession.find({ userId })
        .sort({ createdAt: -1 })
        .limit(100);

      if (sessions.length === 0) return 0;

      let streak = 0;
      const today = new Date().toDateString();
      const studyDates = [...new Set(sessions.map(s => s.createdAt.toDateString()))];

      for (let i = 0; i < studyDates.length; i++) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - i);
        const dateStr = currentDate.toDateString();

        if (studyDates.includes(dateStr)) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      return 0;
    }
  }

  async getDailyStudyTimeChart(userId, startDate) {
    try {
      const sessions = await StudySession.aggregate([
        {
          $match: {
            userId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            totalTime: { $sum: "$duration" },
            sessionCount: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      return sessions.map(session => ({
        date: session._id,
        minutes: session.totalTime,
        sessions: session.sessionCount
      }));
    } catch (error) {
      return [];
    }
  }

  async getFocusScoreChart(userId, startDate) {
    try {
      const sessions = await StudySession.find({
        userId,
        createdAt: { $gte: startDate }
      }).select('createdAt focusScore').sort({ createdAt: 1 });

      return sessions.map(session => ({
        date: session.createdAt.toISOString().split('T')[0],
        score: session.focusScore
      }));
    } catch (error) {
      return [];
    }
  }

  async getTopicDistributionChart(userId, startDate) {
    try {
      const sessions = await StudySession.aggregate([
        {
          $match: {
            userId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $lookup: {
            from: 'topics',
            localField: 'topicId',
            foreignField: '_id',
            as: 'topic'
          }
        },
        {
          $unwind: '$topic'
        },
        {
          $group: {
            _id: '$topic.title',
            totalTime: { $sum: '$duration' },
            sessionCount: { $sum: 1 }
          }
        },
        {
          $sort: { totalTime: -1 }
        }
      ]);

      return sessions.map(item => ({
        topic: item._id,
        minutes: item.totalTime,
        sessions: item.sessionCount
      }));
    } catch (error) {
      return [];
    }
  }
}

export default new StudyAnalyticsService();
