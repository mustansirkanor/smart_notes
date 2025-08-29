import React from 'react';

const ChatMessage = ({ message, isBot, timestamp }) => {
  return (
    <div className={`chat-message-container ${isBot ? 'bot-container' : 'user-container'}`}>
      <div className={`chat-message ${isBot ? 'bot' : 'user'}`}>
        <div className="message-content">
          {message}
        </div>
        {timestamp && (
          <div className="message-timestamp">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
