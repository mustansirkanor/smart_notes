import React, { useState } from 'react';

const getTopicIcon = (title) => {
  const iconMap = {
    'javascript': '🚀', 'react': '⚛️', 'node.js': '🟢', 'nodejs': '🟢',
    'mongodb': '🍃', 'database': '🗄️', 'css': '🎨', 'html': '📄',
    'git': '🌿', 'api': '🔌', 'web': '🌐', 'mobile': '📱',
    'design': '🎨', 'typescript': '📘', 'python': '🐍', 'java': '☕',
    'usehook': '⚡', 'hooks': '⚡', 'custom': '⚙️',
    'default': '📝'
  };
  
  const key = title.toLowerCase();
  return iconMap[key] || iconMap['default'];
};

const TopicBlock = ({ topic, onClick, onDelete, isSubtopic = false }) => {
  const [showActions, setShowActions] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowActions(false);
    onDelete();
  };

  const handleMainClick = () => {
    onClick(topic);
  };

  return (
    <div 
      className={`topic-block ${isSubtopic ? 'subtopic-block clickable-subtopic' : ''}`} 
      onClick={handleMainClick}
      title={isSubtopic ? 'Click to start writing notes' : 'Click to view topic'}
    >
      <div className="topic-header">
        <div className="topic-icon">
          {getTopicIcon(topic.title)}
        </div>
        <div className="topic-counts">
          {topic.noteCount > 0 && (
            <div className="count-badge">
              📝 {topic.noteCount}
            </div>
          )}
          {topic.subtopicCount > 0 && (
            <div className="count-badge">
              📁 {topic.subtopicCount}
            </div>
          )}
        </div>
      </div>
      
      <div className="topic-content">
        <h3 className="topic-title">{topic.title}</h3>
        {topic.description && (
          <p className="topic-description">{topic.description}</p>
        )}
        
        {/* Show different hints based on type */}
        {isSubtopic && (
          <div className="subtopic-hint">
            <small>Click to start writing →</small>
          </div>
        )}
      </div>

      <div 
        className="topic-actions"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="action-btn"
          onClick={() => setShowActions(!showActions)}
          title="More options"
        >
          ⋯
        </button>
        {showActions && (
          <div className="actions-menu">
            <button onClick={handleDelete} className="delete-btn">
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicBlock;
