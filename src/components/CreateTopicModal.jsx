import React, { useState } from 'react';
import axios from 'axios';

const CreateTopicModal = ({
  isOpen,
  onClose,
  onTopicCreated,
  parentTopicId = null   // ← if this prop is passed we’re making a sub-topic
}) => {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    const topicData = {
      title:       formData.title.trim(),
      description: formData.description.trim(),
      parentTopic: parentTopicId,             // ✔ correct key name
      isSubtopic:  Boolean(parentTopicId)     // ✔ tell API it’s a sub-topic
    };

    setIsSubmitting(true);
    try {
      const res = await axios.post('/api/topics', topicData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onTopicCreated(res.data);               // update parent component
      setFormData({ title: '', description: '' });
    } catch (err) {
      alert('Failed to create topic');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            Create New {parentTopicId ? 'Subtopic' : 'Topic'}
          </h2>
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
                placeholder="Enter topic title"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter topic description (optional)"
                className="form-textarea"
                style={{ minHeight: '100px' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTopicModal;
