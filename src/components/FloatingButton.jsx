import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const FloatingButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    // If we're in a topic view, create note for that topic
    const topicMatch = location.pathname.match(/\/topic\/(.+)/);
    if (topicMatch) {
      const topicId = topicMatch[1];
      navigate(`/editor/${topicId}`);
    } else if (location.pathname === '/') {
      // On dashboard, show message to select a topic first
      alert('Please select a topic first, then click the + button to add notes');
    } else {
      // Otherwise go to dashboard
      navigate('/');
    }
  };

  // Don't show FAB in editor
  if (location.pathname.includes('/editor/')) {
    return null;
  }

  return (
    <button
      className="floating-button"
      onClick={handleClick}
      title="Create new note"
    >
      +
    </button>
  );
};

export default FloatingButton;
