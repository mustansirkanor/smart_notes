import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FlashcardGenerator.css';

const FlashcardGenerator = ({ isOpen, onClose, topicId, userId = 'user123' }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyMode, setStudyMode] = useState('review');
  const [error, setError] = useState('');
  const [generationStatus, setGenerationStatus] = useState('');

  useEffect(() => {
    if (isOpen && topicId) {
      fetchFlashcards();
    }
  }, [isOpen, topicId]);

  const fetchFlashcards = async () => {
    if (!topicId || !userId) {
      setError('Missing topic or user information');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('🃏 Fetching flashcards...', { topicId, userId });
      
      const response = await axios.get(`/api/ai/flashcards/${userId}`, {
        params: { topicId }
      });
      
      console.log('🃏 Response:', response.data);
      
      const cards = response.data?.flashcards || [];
      setFlashcards(cards);
      
      if (cards.length === 0) {
        setStudyMode('generate'); // Switch to generate mode if no cards
      }
      
      setCurrentCardIndex(0);
      setShowAnswer(false);
    } catch (error) {
      console.error('🃏 Fetch error:', error);
      setError(`Failed to load flashcards: ${error.response?.data?.error || error.message}`);
      setFlashcards([]);
      setStudyMode('generate');
    } finally {
      setLoading(false);
    }
  };

  const generateNewFlashcards = async () => {
    if (!topicId || !userId) {
      alert('❌ Missing required information');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setGenerationStatus('Analyzing your notes...');
      
      console.log('🃏 Generating flashcards...', { topicId, userId });
      
      const response = await axios.post(`/api/ai/flashcards/generate/${topicId}`, {
        count: 10,
        userId: userId,
        difficulty: 'medium'
      });
      
      console.log('🃏 Generation response:', response.data);
      
      if (response.data?.generated > 0) {
        setGenerationStatus(`✅ Generated ${response.data.generated} flashcards!`);
        setTimeout(() => {
          fetchFlashcards();
          setStudyMode('review');
          setGenerationStatus('');
        }, 2000);
      } else {
        throw new Error('No flashcards were generated');
      }
    } catch (error) {
      console.error('🃏 Generation error:', error);
      const errorMsg = error.response?.data?.error || error.message;
      setError(`Generation failed: ${errorMsg}`);
      setGenerationStatus('');
      
      if (errorMsg.includes('no notes found')) {
        setError('No notes found for this topic. Please add some notes first.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCardReview = async (quality) => {
    if (!flashcards[currentCardIndex]) return;

    try {
      await axios.post(`/api/ai/flashcards/${flashcards[currentCardIndex]._id}/review`, {
        quality
      });

      // Move to next card
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
      } else {
        alert('🎉 Review session complete!');
        onClose();
      }
    } catch (error) {
      console.error('🃏 Review error:', error);
      alert('❌ Failed to save review. Please try again.');
    }
  };

  const currentCard = flashcards[currentCardIndex];

  if (!isOpen) return null;

  return (
    <div className="modern-flashcard-overlay" onClick={onClose}>
      <div className="modern-flashcard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modern-modal-header">
          <h2>📚 Flashcards</h2>
          <div className="mode-selector">
            <button 
              className={`modern-btn ${studyMode === 'review' ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
              onClick={() => setStudyMode('review')}
            >
              📖 Review
            </button>
            <button 
              className={`modern-btn ${studyMode === 'generate' ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
              onClick={() => setStudyMode('generate')}
            >
              ✨ Generate
            </button>
          </div>
          <button className="modern-btn modern-btn-secondary" onClick={onClose}>×</button>
        </div>

        <div className="modern-modal-content">
          {loading ? (
            <div className="loading-state">
              <div className="modern-spinner"></div>
              <p>{generationStatus || 'Loading...'}</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">❌</div>
              <h3>Oops!</h3>
              <p>{error}</p>
              <div className="error-actions">
                <button 
                  className="modern-btn modern-btn-primary"
                  onClick={() => studyMode === 'review' ? fetchFlashcards() : generateNewFlashcards()}
                >
                  🔄 Try Again
                </button>
                {studyMode === 'review' && (
                  <button 
                    className="modern-btn modern-btn-success"
                    onClick={() => setStudyMode('generate')}
                  >
                    ✨ Generate Instead
                  </button>
                )}
              </div>
            </div>
          ) : studyMode === 'generate' ? (
            <div className="generate-mode">
              <div className="generate-info modern-card">
                <h3>✨ Generate New Flashcards</h3>
                <p>Create AI-powered flashcards from your notes to enhance learning.</p>
                
                <div className="generation-details">
                  <div className="detail-item">
                    <span className="detail-label">Topic:</span>
                    <span className="detail-value">{topicId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Cards to generate:</span>
                    <span className="detail-value">10</span>
                  </div>
                </div>

                <button 
                  className="modern-btn modern-btn-success generate-btn"
                  onClick={generateNewFlashcards}
                  disabled={loading}
                >
                  {loading ? '⏳ Generating...' : '🎯 Generate Flashcards'}
                </button>
                
                {flashcards.length > 0 && (
                  <div className="existing-cards">
                    <p>✅ You have {flashcards.length} existing flashcards</p>
                    <button 
                      className="modern-btn modern-btn-secondary"
                      onClick={() => setStudyMode('review')}
                    >
                      📖 Review Existing
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : flashcards.length === 0 ? (
            <div className="no-flashcards">
              <div className="empty-icon">📚</div>
              <h3>No flashcards available</h3>
              <p>Generate your first set of AI-powered flashcards!</p>
              <button 
                className="modern-btn modern-btn-success"
                onClick={() => setStudyMode('generate')}
              >
                ✨ Get Started
              </button>
            </div>
          ) : (
            <div className="review-mode">
              <div className="progress-section">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  Card {currentCardIndex + 1} of {flashcards.length}
                </div>
              </div>

              <div className={`modern-flashcard ${showAnswer ? 'flipped' : ''}`}>
                <div className="card-front">
                  <div className="card-type">❓ Question</div>
                  <div className="card-content">
                    {currentCard?.question}
                  </div>
                  {!showAnswer && (
                    <button 
                      className="modern-btn modern-btn-primary reveal-btn"
                      onClick={() => setShowAnswer(true)}
                    >
                      🔍 Show Answer
                    </button>
                  )}
                </div>

                {showAnswer && (
                  <div className="card-back">
                    <div className="card-type">✅ Answer</div>
                    <div className="card-content">
                      {currentCard?.answer}
                    </div>
                    
                    <div className="difficulty-badge">
                      {currentCard?.difficulty}
                    </div>

                    <div className="review-section">
                      <p>How well did you know this?</p>
                      <div className="quality-buttons">
                        <button 
                          className="modern-btn modern-btn-danger quality-btn"
                          onClick={() => handleCardReview(1)}
                        >
                          😰 Hard
                        </button>
                        <button 
                          className="modern-btn modern-btn-warning quality-btn"
                          onClick={() => handleCardReview(3)}
                        >
                          🤔 Medium
                        </button>
                        <button 
                          className="modern-btn modern-btn-success quality-btn"
                          onClick={() => handleCardReview(5)}
                        >
                          😊 Easy
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="navigation-controls">
                <button 
                  className="modern-btn modern-btn-secondary nav-btn"
                  onClick={() => {
                    if (currentCardIndex > 0) {
                      setCurrentCardIndex(currentCardIndex - 1);
                      setShowAnswer(false);
                    }
                  }}
                  disabled={currentCardIndex === 0}
                >
                  ← Previous
                </button>
                
                <button 
                  className="modern-btn modern-btn-secondary nav-btn"
                  onClick={() => {
                    if (currentCardIndex < flashcards.length - 1) {
                      setCurrentCardIndex(currentCardIndex + 1);
                      setShowAnswer(false);
                    }
                  }}
                  disabled={currentCardIndex === flashcards.length - 1}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardGenerator;
