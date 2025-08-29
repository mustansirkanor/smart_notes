import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const NoteEditor = () => {
  const { topicId, noteId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [topic, setTopic] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const contentRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    fetchTopic();
    if (noteId) {
      fetchNote();
    } else {
      // Focus on title for new note
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [topicId, noteId]);

  const fetchTopic = async () => {
    try {
      const response = await axios.get(`/api/topics/${topicId}`);
      setTopic(response.data.topic);
    } catch (error) {
      console.error('Error fetching topic:', error);
    }
  };

  const fetchNote = async () => {
    try {
      const response = await axios.get(`/api/notes/${noteId}`);
      const note = response.data;
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags ? note.tags.join(', ') : '');
    } catch (error) {
      console.error('Error fetching note:', error);
    }
  };

  const saveNote = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        topic: topicId,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };

      if (noteId) {
        await axios.put(`/api/notes/${noteId}`, noteData);
      } else {
        const response = await axios.post('/api/notes', noteData);
        // Redirect to edit mode for new note
        navigate(`/editor/${topicId}/${response.data._id}`, { replace: true });
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveNote();
    }
    // Ctrl+Enter to save and go back
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      saveNote();
      setTimeout(() => navigate(`/topic/${topicId}`), 500);
    }
  };

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;
    
    try {
      const response = await axios.post('/api/ai/search', {
        query: aiQuery,
        topicId: topicId
      });
      setAiResponse(response.data.enhancedInfo);
    } catch (error) {
      setAiResponse('Failed to get AI response');
    }
  };

  const insertAIResponse = () => {
    if (aiResponse) {
      const newContent = content + '\n\n' + aiResponse;
      setContent(newContent);
      setShowAI(false);
      setAiResponse('');
      setAiQuery('');
    }
  };

  return (
    <div className="note-editor" onKeyDown={handleKeyDown}>
      {/* Top Bar */}
      <div className="editor-topbar">
        <div className="editor-nav">
          <button 
            className="nav-btn back-btn" 
            onClick={() => navigate(`/topic/${topicId}`)}
          >
            ← Back to {topic?.title}
          </button>
          
          <div className="breadcrumb">
            <span className="topic-name">{topic?.title}</span>
            <span className="separator">/</span>
            <span className="note-name">{title || 'Untitled Note'}</span>
          </div>
        </div>

        <div className="editor-actions">
          <button 
            className="action-btn ai-btn"
            onClick={() => setShowAI(!showAI)}
          >
            🤖 AI Assistant
          </button>
          
          <button 
            className="action-btn save-btn"
            onClick={saveNote}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : '💾 Save'}
          </button>
          
          {lastSaved && (
            <span className="save-status">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* AI Assistant Panel */}
      {showAI && (
        <div className="ai-panel">
          <div className="ai-input-section">
            <input
              type="text"
              className="ai-input"
              placeholder="Ask AI anything about your notes..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAIQuery()}
            />
            <button className="ai-search-btn" onClick={handleAIQuery}>
              Search
            </button>
          </div>
          
          {aiResponse && (
            <div className="ai-response">
              <div className="ai-response-content">
                {aiResponse}
              </div>
              <button className="insert-btn" onClick={insertAIResponse}>
                Insert into Note
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Editor */}
      <div className="editor-main">
        <div className="editor-container">
          {/* Title Input */}
          <input
            ref={titleRef}
            type="text"
            className="title-input"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Tags Input */}
          <input
            type="text"
            className="tags-input"
            placeholder="Tags (comma-separated)..."
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          {/* Content Editor */}
          <textarea
            ref={contentRef}
            className="content-editor"
            placeholder="Start writing your note...

You can use:
• Bullet points
• **Bold text**
• *Italic text*
• # Headers
• And more...

Press Ctrl+S to save
Press Ctrl+Enter to save and return"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Sidebar Stats */}
        <div className="editor-sidebar">
          <div className="stats-card">
            <h3>Statistics</h3>
            <div className="stat">
              <span className="stat-label">Characters:</span>
              <span className="stat-value">{content.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Words:</span>
              <span className="stat-value">
                {content.trim() ? content.trim().split(/\s+/).length : 0}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Lines:</span>
              <span className="stat-value">{content.split('\n').length}</span>
            </div>
          </div>

          <div className="shortcuts-card">
            <h3>Shortcuts</h3>
            <div className="shortcut">
              <kbd>Ctrl</kbd> + <kbd>S</kbd> Save
            </div>
            <div className="shortcut">
              <kbd>Ctrl</kbd> + <kbd>Enter</kbd> Save & Exit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
