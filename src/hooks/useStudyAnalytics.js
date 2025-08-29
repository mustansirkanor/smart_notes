import { useState, useCallback } from 'react';
import axios from 'axios';

export const useStudyAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startStudySession = useCallback(async (userId, topicId, goals = []) => {
    try {
      const response = await axios.post('/api/study/sessions/start', {
        userId,
        topicId,
        goals
      });
      return response.data.session;
    } catch (error) {
      console.error('Error starting study session:', error);
      throw error;
    }
  }, []);

  const endStudySession = useCallback(async (sessionId, metrics = {}) => {
    try {
      const response = await axios.post(`/api/study/sessions/${sessionId}/end`, {
        metrics
      });
      return response.data.session;
    } catch (error) {
      console.error('Error ending study session:', error);
      throw error;
    }
  }, []);

  const getAnalytics = useCallback(async (userId, timeframe = 'week') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/study/analytics/${userId}`, {
        params: { timeframe }
      });
      setAnalytics(response.data);
      return response.data;
    } catch (error) {
      setError(error.message);
      console.error('Error fetching analytics:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFlashcardStats = useCallback(async (userId) => {
    try {
      const response = await axios.get(`/api/study/flashcards/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching flashcard stats:', error);
      throw error;
    }
  }, []);

  return {
    analytics,
    loading,
    error,
    startStudySession,
    endStudySession,
    getAnalytics,
    getFlashcardStats
  };
};
