import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopicBlock from './TopicBlock';
import CreateTopicModal from './CreateTopicModal';
import axios from 'axios';

const Dashboard = () => {
  const [topics, setTopics] = useState([]);      // ✅ Always start as empty array
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  // ✅ Fetch topics safely
  const fetchTopics = async () => {
    try {
      const response = await axios.get('/api/topics');
      console.log("API Response:", response.data);

      // ✅ Ensure topics is always an array
      setTopics(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopics([]); // ✅ Fallback to empty array on error
      setLoading(false);
    }
  };

  // ✅ Add newly created topic at top
  const handleTopicCreated = (newTopic) => {
    setTopics([newTopic, ...topics]);
    setShowCreateModal(false);
  };

  // ✅ Delete topic safely
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

  // ✅ Show loader when fetching data
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
      {/* Header Section */}
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

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {Array.isArray(topics) && topics.length > 0 ? (
            // ✅ Show topics grid if data exists
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
            // ✅ Show empty state when no topics exist
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No topics yet</h3>
              <p>Click "Create Topic" to start organizing your notes</p>
            </div>
          )}
        </div>
      </main>

      {/* Create Topic Modal */}
      <CreateTopicModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTopicCreated={handleTopicCreated}
      />
    </div>
  );
};

export default Dashboard;
