import React, { useState, useEffect } from 'react';
import { useStudyAnalytics } from '../../hooks/useStudyAnalytics';
import './StudyAnalytics.css';

const StudyAnalytics = ({ isOpen, onClose, userId, currentSession }) => {
  const { getAnalytics, getFlashcardStats, loading } = useStudyAnalytics();
  const [analytics, setAnalytics] = useState(null);
  const [flashcardStats, setFlashcardStats] = useState(null);
  const [timeframe, setTimeframe] = useState('week');

  useEffect(() => {
    if (isOpen && userId) {
      fetchData();
    }
  }, [isOpen, userId, timeframe]);

  const fetchData = async () => {
    try {
      const [analyticsData, flashcardData] = await Promise.all([
        getAnalytics(userId, timeframe),
        getFlashcardStats(userId)
      ]);
      setAnalytics(analyticsData);
      setFlashcardStats(flashcardData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="analytics-overlay" onClick={onClose}>
      <div className="analytics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="analytics-header">
          <h2>📊 Study Analytics</h2>
          <div className="timeframe-selector">
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="analytics-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading analytics...</p>
            </div>
          ) : analytics ? (
            <>
              {/* Current Session */}
              {currentSession && (
                <div className="current-session-card">
                  <h3>🔥 Current Session</h3>
                  <div className="session-stats">
                    <div className="stat">
                      <span className="stat-value">
                        {Math.round((new Date() - new Date(currentSession.startTime)) / 1000 / 60)}
                      </span>
                      <span className="stat-label">Minutes</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{currentSession.goals?.length || 0}</span>
                      <span className="stat-label">Goals</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Cards */}
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="card-icon">⏱️</div>
                  <div className="card-content">
                    <div className="card-value">{analytics.summary.totalTime}</div>
                    <div className="card-label">Minutes Studied</div>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon">📚</div>
                  <div className="card-content">
                    <div className="card-value">{analytics.summary.totalSessions}</div>
                    <div className="card-label">Study Sessions</div>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon">🎯</div>
                  <div className="card-content">
                    <div className="card-value">{analytics.summary.averageFocus}</div>
                    <div className="card-label">Avg Focus Score</div>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon">🔥</div>
                  <div className="card-content">
                    <div className="card-value">{analytics.summary.studyStreak}</div>
                    <div className="card-label">Day Streak</div>
                  </div>
                </div>
              </div>

              {/* Flashcard Statistics */}
              {flashcardStats && (
                <div className="flashcard-stats">
                  <h3>📚 Flashcard Progress</h3>
                  <div className="flashcard-summary">
                    <div className="flashcard-stat">
                      <span className="flashcard-value">{flashcardStats.total}</span>
                      <span className="flashcard-label">Total Cards</span>
                    </div>
                    <div className="flashcard-stat">
                      <span className="flashcard-value">{flashcardStats.due}</span>
                      <span className="flashcard-label">Due Today</span>
                    </div>
                    <div className="flashcard-stat">
                      <span className="flashcard-value">{flashcardStats.mastered}</span>
                      <span className="flashcard-label">Mastered</span>
                    </div>
                    <div className="flashcard-stat">
                      <span className="flashcard-value">{flashcardStats.completion}%</span>
                      <span className="flashcard-label">Completion</span>
                    </div>
                  </div>
                  
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${flashcardStats.completion}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Charts */}
              {analytics.charts && (
                <div className="charts-section">
                  <div className="chart-container">
                    <h3>📈 Daily Study Time</h3>
                    <div className="simple-chart">
                      {analytics.charts.dailyStudyTime.map((day, index) => (
                        <div key={index} className="chart-bar">
                          <div 
                            className="bar"
                            style={{ 
                              height: `${Math.max((day.minutes / 120) * 100, 5)}%` 
                            }}
                            title={`${day.date}: ${day.minutes} minutes`}
                          ></div>
                          <div className="bar-label">
                            {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="chart-container">
                    <h3>🎯 Focus Scores</h3>
                    <div className="focus-chart">
                      {analytics.charts.focusScores.slice(-7).map((score, index) => (
                        <div key={index} className="focus-point">
                          <div 
                            className="focus-dot"
                            style={{ 
                              backgroundColor: score.score >= 7 ? '#22c55e' : 
                                             score.score >= 5 ? '#f59e0b' : '#ef4444'
                            }}
                            title={`${score.date}: ${score.score}/10`}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Insights */}
              {analytics.aiInsights && (
                <div className="ai-insights">
                  <h3>🤖 AI Insights</h3>
                  <div className="insights-content">
                    {analytics.aiInsights.recommendations.map((rec, index) => (
                      <div key={index} className="insight-card">
                        <div className="insight-type">{rec.type}</div>
                        <div className="insight-title">{rec.title}</div>
                        <div className="insight-description">{rec.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Sessions */}
              {analytics.sessions && analytics.sessions.length > 0 && (
                <div className="recent-sessions">
                  <h3>📝 Recent Sessions</h3>
                  <div className="sessions-list">
                    {analytics.sessions.slice(0, 5).map((session) => (
                      <div key={session._id} className="session-item">
                        <div className="session-topic">
                          {session.topicId?.title || 'Unknown Topic'}
                        </div>
                        <div className="session-details">
                          <span className="session-duration">{session.duration} min</span>
                          <span className="session-focus">Focus: {session.focusScore}/10</span>
                          <span className="session-date">
                            {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-data">
              <p>📊 No study data available yet.</p>
              <p>Start studying to see your analytics!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyAnalytics;
