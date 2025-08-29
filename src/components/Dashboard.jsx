import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopicBlock from './TopicBlock';
import CreateTopicModal from './CreateTopicModal';
import axios from 'axios';

const Dashboard = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await axios.get('/api/topics');
      setTopics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setLoading(false);
    }
  };

  const handleTopicCreated = (newTopic) => {
    setTopics([newTopic, ...topics]);
    setShowCreateModal(false);
  };

  const handleDeleteTopic = async (topicId) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await axios.delete(`/api/topics/${topicId}`);
        setTopics(topics.filter(topic => topic._id !== topicId));
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete topic');
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="container">
          
          <h1>Smart Notes</h1>
          <p>Organize your knowledge with AI-powered insights</p>
          <button 
            className="header-add-btn"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Topic
          </button>
          
        </div>
      </header>
      <main className="main-content">
        <div className="container">
          {topics.length > 0 ? (
            <div className="topics-grid">
              {topics.map((topic) => (
                <TopicBlock
                  key={topic._id}
                  topic={topic}
                  onClick={() => navigate(`/topic/${topic._id}`)}
                  onDelete={() => handleDeleteTopic(topic._id)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No topics yet</h3>
              <p>Click "Create Topic" to start organizing your notes</p>
            </div>
          )}
        </div>
      </main>

      <CreateTopicModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTopicCreated={handleTopicCreated}
      />
    </div>
  );
};

export default Dashboard;
