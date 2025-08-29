import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NoteCard from './NoteCard';
import TopicBlock from './TopicBlock';
import CreateTopicModal from './CreateTopicModal';
import CreateNoteModal from './CreateNoteModal';
import EditNoteModal from './EditNoteModal';
import ChatBot from './ChatBot/ChatBot';
import StudyScheduler from './StudyScheduler/StudyScheduler';
import StudyAnalytics from './StudyAnalytics/StudyAnalytics';
import { useVoice } from '../hooks/useVoice';
import { useStudyAnalytics } from '../hooks/useStudyAnalytics';
import axios from 'axios';
import './NotesView.css';
const NotesView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // States
  const [topic, setTopic] = useState(null);
  const [subtopics, setSubtopics] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Editor states
  const [activeSubtopic, setActiveSubtopic] = useState(null);
  const [subtopicContent, setSubtopicContent] = useState('');
  const [subtopicTitle, setSubtopicTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Feature states
  const [showChatBot, setShowChatBot] = useState(false);
  const [showStudyScheduler, setShowStudyScheduler] = useState(false);
  const [showStudyAnalytics, setShowStudyAnalytics] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [studySession, setStudySession] = useState(null);

  // Voice functionality
  const {
    isRecording,
    voiceText,
    startRecording,
    stopRecording,
    clearVoiceText
  } = useVoice();

  const {
    startStudySession,
    endStudySession
  } = useStudyAnalytics();

  useEffect(() => {
    fetchTopicData();
    initializeStudySession();
  }, [id]);

  useEffect(() => {
    if (voiceText && isVoiceMode) {
      handleVoiceInput(voiceText);
    }
  }, [voiceText, isVoiceMode]);

  const fetchTopicData = async () => {
    try {
      const response = await axios.get(`/api/topics/${id}`);
      setTopic(response.data.topic);
      setSubtopics(response.data.subtopics || []);
      setNotes(response.data.notes || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching topic data:', error);
      setLoading(false);
    }
  };

  const initializeStudySession = async () => {
    try {
      if (id) {
        const session = await startStudySession('user123', id);
        setStudySession(session);
      }
    } catch (error) {
      console.warn('Could not start study session:', error);
    }
  };

  const handleVoiceInput = async (text) => {
    if (activeSubtopic) {
      const newContent = subtopicContent + (subtopicContent ? '\n\n' : '') + `🎤 ${text}`;
      setSubtopicContent(newContent);
      setTimeout(() => {
        saveSubtopicContent();
      }, 1000);
    }
  };

  const saveSubtopicContent = async () => {
    if (!activeSubtopic || !subtopicContent.trim()) return;

    setIsSaving(true);
    try {
      const noteData = {
        title: `${subtopicTitle} - Notes`,
        content: subtopicContent.trim(),
        topic: activeSubtopic._id,
        tags: ['unified', 'continuous'],
        wordCount: subtopicContent.trim().split(/\s+/).length
      };

      const existingResponse = await axios.get(`/api/topics/${activeSubtopic._id}`);
      const existingNotes = existingResponse.data.notes || [];
      const unifiedNote = existingNotes.find(note => note.tags && note.tags.includes('unified'));

      if (unifiedNote) {
        await axios.put(`/api/notes/${unifiedNote._id}`, noteData);
      } else {
        await axios.post('/api/notes', noteData);
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving subtopic content:', error);
      alert('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubtopicClick = async (subtopic) => {
    setActiveSubtopic(subtopic);
    setSubtopicTitle(subtopic.title);

    try {
      const response = await axios.get(`/api/topics/${subtopic._id}`);
      const subtopicNotes = response.data.notes || [];
      
      if (subtopicNotes.length > 0) {
        const combinedContent = subtopicNotes
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map(note => `${note.content}`)
          .join('\n\n---\n\n');
        setSubtopicContent(combinedContent || `Start writing your notes about ${subtopic.title}...`);
      } else {
        setSubtopicContent(`Start writing your notes about ${subtopic.title}...`);
      }
    } catch (error) {
      console.error('Error fetching subtopic notes:', error);
      setSubtopicContent(`Start writing your notes about ${subtopic.title}...`);
    }
  };

  const insertContentToNotes = (content) => {
    if (!activeSubtopic) {
      alert('Please open a subtopic first to insert content');
      return;
    }

    const cleanContent = content.replace(/^(Here's|Here are|I'll|Let me|Sure,|Of course,)/i, '').trim();
    const currentContent = subtopicContent;
    const newContent = currentContent.trim() 
      ? `${currentContent}\n\n${cleanContent}` 
      : cleanContent;
    
    setSubtopicContent(newContent);
    
    setTimeout(() => {
      saveSubtopicContent();
    }, 500);
  };

  if (loading) {
    return (
      <div className="notes-view">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your notes...</p>
        </div>
      </div>
    );
  }
const handleDeleteSubtopic = async (subtopicId) => {
  if (window.confirm('Delete this subtopic?')) {
    try {
      // Make API call to delete the subtopic
      await axios.delete(`/api/topics/${subtopicId}`);
      
      // Update local state to remove the deleted subtopic
      setSubtopics(subtopics.filter(s => s._id !== subtopicId));
      
      // Optional: Show success message or toast notification
      console.log('Subtopic deleted successfully');
    } catch (error) {
      console.error('Error deleting subtopic:', error);
      alert('Failed to delete subtopic. Please try again.');
    }
  }
};

  return (
    <div className="notes-view">
      {activeSubtopic ? (
        // ✨ ENHANCED EDITOR VIEW
        <div>
          <header className="editor-header">
            <div className="container">
              <div className="editor-nav-bar">
                <button 
                  className="back-to-topic-btn"
                  onClick={() => {
                    setActiveSubtopic(null);
                    setSubtopicContent('');
                    setSubtopicTitle('');
                  }}
                >
                  ← Back to {topic?.title}
                </button>
                
                <div className="breadcrumb-nav">
                  <span className="topic-breadcrumb">{topic?.title}</span>
                  <span className="breadcrumb-separator">→</span>
                  <span className="subtopic-breadcrumb">{activeSubtopic.title}</span>
                </div>

                <div className="editor-actions-bar">
                  <div className="feature-buttons">
                    <button 
                      className={`feature-btn ${isVoiceMode ? 'active' : ''}`}
                      onClick={() => {
                        setIsVoiceMode(!isVoiceMode);
                        if (!isVoiceMode) {
                          startRecording();
                        } else {
                          stopRecording();
                        }
                      }}
                    >
                      {isVoiceMode ? (isRecording ? '🎙️ Recording' : '🎤 Voice ON') : '🎤 Voice'}
                    </button>

                    <button 
                      className="feature-btn"
                      onClick={() => setShowStudyAnalytics(true)}
                    >
                      📊 Stats
                    </button>

                    <button 
                      className="feature-btn"
                      onClick={() => setShowStudyScheduler(true)}
                    >
                      📅 Study Plan
                    </button>
                  </div>

                  <div className="save-section">
                    {lastSaved && (
                      <span className="last-saved">
                        ✅ Saved {new Date(lastSaved).toLocaleTimeString()}
                      </span>
                    )}
                    
                    <button 
                      className="save-btn-editor"
                      onClick={saveSubtopicContent}
                      disabled={isSaving}
                    >
                      {isSaving ? '⏳ Saving...' : '💾 Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="main-content">
            <div className="container">
              <div className="obsidian-editor">
                <div className="editor-main-content">
                  <input
                    type="text"
                    className="obsidian-title-input"
                    value={subtopicTitle}
                    onChange={(e) => setSubtopicTitle(e.target.value)}
                    placeholder="Enter your note title..."
                  />

                  <textarea
                    className="obsidian-content-editor"
                    value={subtopicContent}
                    onChange={(e) => setSubtopicContent(e.target.value)}
                    placeholder="Start writing your note here..."
                  />
                </div>

                <div className="editor-sidebar-stats">
                  <div className="stats-section">
                    <h3>📊 Document Statistics</h3>
                    <div className="stat-item">
                      <span className="stat-label">Characters:</span>
                      <span className="stat-number">{subtopicContent.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Words:</span>
                      <span className="stat-number">
                        {subtopicContent.trim() ? subtopicContent.trim().split(/\s+/).length : 0}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Lines:</span>
                      <span className="stat-number">{subtopicContent.split('\n').length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Paragraphs:</span>
                      <span className="stat-number">
                        {subtopicContent.split('\n\n').filter(p => p.trim()).length}
                      </span>
                    </div>
                  </div>

                  <div className="study-tools-section">
                    <h3>🛠️ Study Tools</h3>
                    <button 
                      className="tool-btn"
                      onClick={() => setShowStudyAnalytics(true)}
                    >
                      📊 View Analytics
                    </button>
                    <button 
                      className="tool-btn"
                      onClick={() => setShowStudyScheduler(true)}
                    >
                      📅 Study Planner
                    </button>
                    <button 
                      className="tool-btn"
                      onClick={() => setShowChatBot(true)}
                    >
                      🤖 AI Assistant
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      ) : (
        // ✨ ENHANCED MAIN VIEW
        <div>
          <header className="notes-header">
            <div className="container">
              <div className="notes-header-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button 
                    className="back-button"
                    onClick={() => navigate('/')}
                  >
                    ← Back
                  </button>
                  <h1 className="topic-title-large">{topic?.title}</h1>
                </div>
                <div className="header-actions">
                  <button 
                    className="action-button"
                    onClick={() => setShowCreateTopicModal(true)}
                  >
                    ➕ Add Subtopic
                  </button>
                  <button 
                    className="summary-button"
                    onClick={() => setShowStudyAnalytics(true)}
                  >
                    📊 Analytics
                  </button>
                  <button 
                    className="ai-assistant-btn"
                    onClick={() => setShowChatBot(true)}
                  >
                    🤖 AI Assistant
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="main-content">
            <div className="container">
              {/* Subtopics Section */}
              {subtopics.length > 0 && (
                <section className="section">
                  <h2 className="section-title"> Subtopics</h2>
                  <div className="notes-grid">
                    {subtopics.map((subtopic) => (
                      <TopicBlock
                        key={subtopic._id}
                        topic={subtopic}
                        isSubtopic={true}
                        onClick={() => handleSubtopicClick(subtopic)}
                        onDelete={() => handleDeleteSubtopic(subtopic._id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Notes Section */}
      {/*<section className="section">
                <h2 className="section-title">📝 Notes</h2>
                {notes.length > 0 ? (
                  <div className="notes-grid">
                    {notes.map((note) => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        onEdit={() => {
                          setEditingNote(note);
                          setShowEditNoteModal(true);
                        }}
                        onDelete={() => {
                          if (window.confirm('Delete this note?')) {
                            // Handle delete
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <h3>No notes yet</h3>
                    <p>Create some subtopics to get started with your note-taking journey!</p>
                    <div className="feature-suggestions">
                      <button 
                        className="suggestion-btn"
                        onClick={() => setShowCreateTopicModal(true)}
                      >
                        ➕ Create Subtopic
                      </button>
                      <button 
                        className="suggestion-btn"
                        onClick={() => setShowChatBot(true)}
                      >
                        🤖 Ask AI for Help
                      </button>
                    </div>
                  </div>
                )}
              </section>*/}
            </div>
          </main>
        </div>
      )}

      {/* ChatBot */}
      <ChatBot 
        isOpen={showChatBot}
        onToggle={() => setShowChatBot(!showChatBot)}
        currentTopic={activeSubtopic || topic}
        onInsertToNotes={insertContentToNotes}
      />

      {/* Study Analytics */}
      {showStudyAnalytics && (
        <StudyAnalytics
          isOpen={showStudyAnalytics}
          onClose={() => setShowStudyAnalytics(false)}
          userId="user123"
          currentSession={studySession}
        />
      )}

      {/* Study Scheduler */}
      {showStudyScheduler && (
        <StudyScheduler
          isOpen={showStudyScheduler}
          onClose={() => setShowStudyScheduler(false)}
          topics={subtopics}
          currentTopic={activeSubtopic}
        />
      )}

      {/* All your existing modals remain the same */}
      <CreateTopicModal
        isOpen={showCreateTopicModal}
        onClose={() => setShowCreateTopicModal(false)}
        parentTopicId={id}
        onTopicCreated={(newSubtopic) => {
          setSubtopics([newSubtopic, ...subtopics]);
          setShowCreateTopicModal(false);
        }}
      />

      <CreateNoteModal
        isOpen={showCreateNoteModal}
        onClose={() => setShowCreateNoteModal(false)}
        topicId={id}
        onNoteCreated={(newNote) => {
          setNotes([newNote, ...notes]);
          setShowCreateNoteModal(false);
        }}
      />

      <EditNoteModal
        isOpen={showEditNoteModal}
        onClose={() => {
          setShowEditNoteModal(false);
          setEditingNote(null);
        }}
        note={editingNote}
        onNoteUpdated={(updatedNote) => {
          setNotes(notes.map(note => 
            note._id === updatedNote._id ? updatedNote : note
          ));
          setShowEditNoteModal(false);
          setEditingNote(null);
        }}
      />

      {/* ✨ ENHANCED AI RESPONSE MODAL */}
      {showAiModal && (
        <div className="modal-overlay" onClick={() => setShowAiModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">🤖 AI Assistant Response</h2>
              <button 
                className="close-button"
                onClick={() => setShowAiModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
                {aiResponse}
              </div>
            </div>
            {activeSubtopic && (
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowAiModal(false)}
                >
                  Close
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    insertContentToNotes(aiResponse);
                    setShowAiModal(false);
                  }}
                >
                  📝 Insert into Note
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesView;
