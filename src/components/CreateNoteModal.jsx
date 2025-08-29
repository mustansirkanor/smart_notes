import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateNoteModal = ({ isOpen, onClose, onNoteCreated }) => {
  const [topics, setTopics] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    topic: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTopics();
    }
  }, [isOpen]);

  const fetchTopics = async () => {
    try {
      const response = await axios.get('/api/topics');
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.topic) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const noteData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        topic: formData.topic,
        tags: formData.tags
          ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          : []
      };

      const response = await axios.post('/api/notes', noteData);
      
      if (onNoteCreated) {
        onNoteCreated(response.data);
      }
      
      setFormData({ title: '', content: '', topic: '', tags: '' });
      onClose();
    } catch (error) {
      alert('Failed to create note');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Note</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="topic">Topic *</label>
              <select
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select a topic</option>
                {topics.map(topic => (
                  <option key={topic._id} value={topic._id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="title">Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter note title"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="content">Content *</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write your note content here..."
                className="form-textarea"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tags">Tags (comma-separated)</label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., programming, react, tutorial"
                className="form-input"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNoteModal;
