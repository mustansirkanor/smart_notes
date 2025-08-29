import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudyScheduler.css';

const StudyScheduler = ({ isOpen, onClose, topics, currentTopic }) => {
  const [studyPlans, setStudyPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    goals: [''],
    preferences: {
      studyHoursPerDay: 2,
      sessionDuration: 45,
      breakDuration: 15,
      preferredTimes: []
    }
  });

  useEffect(() => {
    if (isOpen) {
      fetchStudyPlans();
    }
  }, [isOpen]);

  const fetchStudyPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/study/plans/user123'); // Replace with actual userId
      setStudyPlans(response.data.plans);
    } catch (error) {
      console.error('Error fetching study plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIPlan = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/ai/study-plan/generate', {
        userId: 'user123', // Replace with actual userId
        topicIds: topics.map(t => t._id),
        preferences: newPlan.preferences,
        goals: newPlan.goals.filter(g => g.trim())
      });

      const aiPlan = response.data.studyPlan;
      
      // Create the plan in database
      const planData = {
        userId: 'user123',
        title: newPlan.title || aiPlan.title,
        description: newPlan.description || aiPlan.description || 'AI-generated study plan',
        startDate: new Date(newPlan.startDate),
        endDate: new Date(new Date(newPlan.startDate).getTime() + (14 * 24 * 60 * 60 * 1000)), // 2 weeks
        goals: aiPlan.goals || newPlan.goals.filter(g => g.trim()).map(goal => ({
          id: Date.now().toString(),
          title: goal,
          description: goal,
          targetDate: new Date(new Date(newPlan.startDate).getTime() + (14 * 24 * 60 * 60 * 1000)),
          priority: 'medium'
        })),
        schedule: aiPlan.schedule || [],
        preferences: newPlan.preferences,
        isActive: true
      };

      await axios.post('/api/study/plans', planData);
      await fetchStudyPlans();
      setShowCreatePlan(false);
      alert('✅ AI study plan created successfully!');
    } catch (error) {
      console.error('Error generating AI plan:', error);
      alert('Failed to generate study plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addGoal = () => {
    setNewPlan(prev => ({
      ...prev,
      goals: [...prev.goals, '']
    }));
  };

  const updateGoal = (index, value) => {
    setNewPlan(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => i === index ? value : goal)
    }));
  };

  const removeGoal = (index) => {
    setNewPlan(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="scheduler-overlay" onClick={onClose}>
      <div className="scheduler-modal" onClick={(e) => e.stopPropagation()}>
        <div className="scheduler-header">
          <h2>📅 Study Scheduler</h2>
          <button 
            className="create-plan-btn"
            onClick={() => setShowCreatePlan(!showCreatePlan)}
          >
            ✨ Create Plan
          </button>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="scheduler-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading study plans...</p>
            </div>
          ) : showCreatePlan ? (
            <div className="create-plan-form">
              <h3>✨ Create AI Study Plan</h3>
              
              <div className="form-group">
                <label>Plan Title</label>
                <input
                  type="text"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., React Learning Plan"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your learning objectives..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={newPlan.startDate}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Duration (days)</label>
                  <select onChange={(e) => {
                    const days = parseInt(e.target.value);
                    const endDate = new Date(new Date(newPlan.startDate).getTime() + (days * 24 * 60 * 60 * 1000));
                    setNewPlan(prev => ({ ...prev, endDate: endDate.toISOString().split('T') }));
                  }}>
                    <option value="7">1 Week</option>
                    <option value="14" selected>2 Weeks</option>
                    <option value="30">1 Month</option>
                    <option value="60">2 Months</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Learning Goals</label>
                {newPlan.goals.map((goal, index) => (
                  <div key={index} className="goal-input">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => updateGoal(index, e.target.value)}
                      placeholder="Enter a learning goal..."
                    />
                    {newPlan.goals.length > 1 && (
                      <button 
                        className="remove-goal-btn"
                        onClick={() => removeGoal(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button className="add-goal-btn" onClick={addGoal}>
                  + Add Goal
                </button>
              </div>

              <div className="preferences-section">
                <h4>📊 Study Preferences</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Hours per day</label>
                    <input
                      type="number"
                      min="0.5"
                      max="8"
                      step="0.5"
                      value={newPlan.preferences.studyHoursPerDay}
                      onChange={(e) => setNewPlan(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, studyHoursPerDay: parseFloat(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Session length (min)</label>
                    <input
                      type="number"
                      min="15"
                      max="120"
                      step="15"
                      value={newPlan.preferences.sessionDuration}
                      onChange={(e) => setNewPlan(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, sessionDuration: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Break length (min)</label>
                    <input
                      type="number"
                      min="5"
                      max="30"
                      step="5"
                      value={newPlan.preferences.breakDuration}
                      onChange={(e) => setNewPlan(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, breakDuration: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowCreatePlan(false)}
                >
                  Cancel
                </button>
                <button 
                  className="generate-ai-plan-btn"
                  onClick={generateAIPlan}
                  disabled={loading}
                >
                  {loading ? '⏳ Generating...' : '🤖 Generate AI Plan'}
                </button>
              </div>
            </div>
          ) : studyPlans.length === 0 ? (
            <div className="no-plans">
              <div className="no-plans-icon">📅</div>
              <h3>No study plans yet</h3>
              <p>Create your first AI-powered study plan to get organized!</p>
              <button 
                className="create-first-plan-btn"
                onClick={() => setShowCreatePlan(true)}
              >
                ✨ Create Your First Plan
              </button>
            </div>
          ) : (
            <div className="plans-list">
              {studyPlans.map((plan) => (
                <div key={plan._id} className="plan-card">
                  <div className="plan-header">
                    <h3>{plan.title}</h3>
                    <span className="plan-status active">Active</span>
                  </div>
                  
                  <div className="plan-description">
                    {plan.description}
                  </div>

                  <div className="plan-dates">
                    <span className="plan-date">
                      📅 {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="plan-goals">
                    <h4>🎯 Goals ({plan.goals?.length || 0})</h4>
                    <div className="goals-preview">
                      {plan.goals?.slice(0, 3).map((goal, index) => (
                        <div key={index} className="goal-item">
                          <span className={`goal-status ${goal.completed ? 'completed' : 'pending'}`}>
                            {goal.completed ? '✅' : '⏳'}
                          </span>
                          {goal.title}
                        </div>
                      ))}
                      {plan.goals?.length > 3 && (
                        <div className="more-goals">
                          +{plan.goals.length - 3} more...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="plan-preferences">
                    <div className="pref-item">
                      <span className="pref-label">Daily:</span>
                      <span className="pref-value">{plan.preferences?.studyHoursPerDay}h</span>
                    </div>
                    <div className="pref-item">
                      <span className="pref-label">Sessions:</span>
                      <span className="pref-value">{plan.preferences?.sessionDuration}min</span>
                    </div>
                  </div>

                  <div className="plan-progress">
                    <div className="progress-info">
                      <span>Progress</span>
                      <span>{Math.round((plan.goals?.filter(g => g.completed).length || 0) / (plan.goals?.length || 1) * 100)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(plan.goals?.filter(g => g.completed).length || 0) / (plan.goals?.length || 1) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyScheduler;
