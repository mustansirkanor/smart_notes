import React from 'react';

const NoteCard = ({ note, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="note-card">
      <div className="note-card-header">
        <h3 className="note-title">{note.title}</h3>
        <div className="note-actions">
          <button
            className="note-action-btn"
            onClick={() => onEdit(note)}
            title="Edit note"
          >
            ✏️
          </button>
          <button
            className="note-action-btn"
            onClick={() => onDelete(note._id)}
            title="Delete note"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="note-content">
        {note.content.length > 200
          ? `${note.content.substring(0, 200)}...`
          : note.content}
      </div>

      <div className="note-footer">
        <div className="note-tags">
          {note.tags?.slice(0, 3).map((tag, index) => (
            <span key={index} className="note-tag">
              {tag}
            </span>
          ))}
          {note.tags?.length > 3 && (
            <span className="note-tag">+{note.tags.length - 3} more</span>
          )}
        </div>
        <span className="note-date">
          {formatDate(note.updatedAt || note.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default NoteCard;
