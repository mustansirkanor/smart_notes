import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditNoteModal = ({ isOpen, onClose, note, onNoteUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        tags: note.tags ? note.tags.join(', ') : ''
      });
    }
  }, [note]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const noteData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags
          ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          : []
      };

      const response = await axios.put(`/api/notes/${note._id}`, noteData);
      onNoteUpdated(response.data);
    } catch (error) {
      alert('Failed to update note');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !note) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Note</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
              {isSubmitting ? 'Updating...' : 'Update Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNoteModal;
