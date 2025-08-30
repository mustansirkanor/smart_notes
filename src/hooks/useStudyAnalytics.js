// useStudyAnalytics.js
import { useState, useCallback } from 'react';
import axios from 'axios';

export const useStudyAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  /* JWT header for every request */
  const authHeader = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  };

  /* ────────── 1. START SESSION ────────── */
  const startStudySession = useCallback(
    async (topicId, goals = []) => {
      const { data } = await axios.post(
        '/api/study/sessions/start',
        { topicId, goals },
        authHeader
      );
      return data.session;
    },
    []
  );

  /* ────────── 2. END SESSION ────────── */
  const endStudySession = useCallback(
    async (sessionId, metrics = {}) => {
      const { data } = await axios.post(
        `/api/study/sessions/${sessionId}/end`,
        { metrics },
        authHeader
      );
      return data.session;
    },
    []
  );

  /* ────────── 3. GET AGGREGATE ANALYTICS ────────── */
  const getAnalytics = useCallback(
    async (timeframe = 'week') => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(
          '/api/study/analytics',
          { ...authHeader, params: { timeframe } }
        );
        setAnalytics(data);
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ────────── 4. FLASHCARD STATS ────────── */
  const getFlashcardStats = useCallback(
    async () => {
      const { data } = await axios.get(
        '/api/study/flashcards/stats',
        authHeader
      );
      return data;
    },
    []
  );

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
