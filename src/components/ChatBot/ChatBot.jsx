import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { useVoice } from '../../hooks/useVoice';
import axios from 'axios';
import './ChatBot.css';

const ChatBot = ({ 
  isOpen, 
  onToggle, 
  currentTopic, 
  onInsertToNotes
}) => {
  const [messages, setMessages] = useState([
    { 
      text: `Hi! I'm your AI study assistant. ${currentTopic ? `I can help you with "${currentTopic.title}"` : 'What would you like to know about your notes?'}`, 
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'voice'
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ✅ Voice functionality
  const {
    isRecording,
    isListening,
    voiceText,
    currentTranscript,
    isSupported,
    startRecording,
    stopRecording,
    abortRecording,
    speak,
    clearVoiceText
  } = useVoice();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current && inputMode === 'text') {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen, inputMode]);

  // ✅ Handle voice text when it's ready
  useEffect(() => {
    if (voiceText && inputMode === 'voice') {
      console.log('🎤 Received voice text:', voiceText);
      sendVoiceMessage(voiceText);
      clearVoiceText(); // Clear after sending
    }
  }, [voiceText, inputMode]);

  const sendMessage = async (messageText = inputValue) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = { 
      text: messageText, 
      isBot: false, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/ai/chat', {
        message: messageText,
        topicId: currentTopic?._id,
        context: 'Smart Notes Assistant'
      });

      const botMessage = { 
        text: response.data.response, 
        isBot: true, 
        timestamp: new Date(),
        canInsert: true
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMessage = "Sorry, I'm having trouble right now. Please try again!";
      
      if (error.response?.status === 500 && error.response?.data?.error?.includes('429')) {
        errorMessage = "I'm getting too many requests right now. Please wait a moment and try again!";
      }

      const errorMsg = { 
        text: errorMessage, 
        isBot: true, 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendVoiceMessage = async (text) => {
    await sendMessage(text);
  };

  const handleInsertContent = (content) => {
    if (onInsertToNotes) {
      onInsertToNotes(content);
      const confirmMessage = {
        text: "✅ Content inserted into your notes!",
        isBot: true,
        timestamp: new Date(),
        isConfirmation: true
      };
      setMessages(prev => [...prev, confirmMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      { 
        text: `Chat cleared! ${currentTopic ? `How can I help you with "${currentTopic.title}"?` : 'What would you like to know?'}`, 
        isBot: true,
        timestamp: new Date()
      }
    ]);
  };

  const handleVoiceToggle = () => {
    if (inputMode === 'voice') {
      if (isRecording) {
        stopRecording();
      }
      setInputMode('text');
    } else {
      setInputMode('voice');
      if (isSupported) {
        startRecording();
      } else {
        alert('🎤 Voice recording is not supported in your browser. Please use Chrome, Edge, or Safari.');
        setInputMode('text');
      }
    }
  };

  const handleVoiceControl = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSpeakResponse = (text) => {
    speak(text, { language: 'en-US', rate: 0.9 });
  };

  // ✅ Toggle button
  if (!isOpen) {
    return (
      <div 
        className={`chatbot-toggle ${inputMode === 'voice' ? 'voice-mode' : ''}`}
        onClick={onToggle}
        title="💬 AI Assistant"
      >
        {isLoading ? '⏳' : (inputMode === 'voice' && isRecording ? '🎙️' : '💬')}
        {isLoading && <div className="loading-indicator">⏳</div>}
      </div>
    );
  }

  return (
    <div className={`chatbot-container ${inputMode === 'voice' ? 'voice-mode' : ''}`}>
      <div className="chatbot-header">
        <div className="chatbot-title">
          <h3>🤖 AI Study Assistant</h3>
          {currentTopic && (
            <span className="current-topic">
              📝 {currentTopic.title}
            </span>
          )}
          {inputMode === 'voice' && (
            <span className="voice-mode-indicator">
              🎤 Voice Mode {isRecording ? '• Recording...' : '• Ready'}
            </span>
          )}
        </div>
        <div className="chatbot-controls">
          <button 
            className={`mode-toggle-btn ${inputMode === 'voice' ? 'active' : ''}`}
            onClick={handleVoiceToggle}
            title={`Switch to ${inputMode === 'voice' ? 'text' : 'voice'} mode`}
          >
            {inputMode === 'voice' ? '📝' : '🎤'}
          </button>
          <button 
            className="clear-btn" 
            onClick={clearChat}
            title="Clear chat"
          >
            🗑️
          </button>
          <button 
            className="close-btn" 
            onClick={onToggle}
            title="Close chat"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message-wrapper ${msg.isBot ? 'bot-wrapper' : 'user-wrapper'}`}>
            <ChatMessage
              message={msg.text}
              isBot={msg.isBot}
              timestamp={msg.timestamp}
            />
            {msg.isBot && msg.canInsert && !msg.isConfirmation && onInsertToNotes && (
              <div className="message-actions">
                <button 
                  className="insert-content-btn"
                  onClick={() => handleInsertContent(msg.text)}
                  title="Insert this content into your notes"
                >
                  📝 Insert into Notes
                </button>
                <button 
                  className="speak-btn"
                  onClick={() => handleSpeakResponse(msg.text)}
                  title="Read aloud"
                >
                  🔊 Speak
                </button>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* ✅ Voice mode transcript display */}
      {inputMode === 'voice' && (currentTranscript || isListening) && (
        <div className="voice-transcript">
          <div className="transcript-label">
            {isListening ? '🎤 Listening...' : '🎤 Voice Input:'}
          </div>
          <div className="transcript-text">
            {currentTranscript || 'Speak now...'}
          </div>
        </div>
      )}
      
      {/* ✅ Dual input section */}
      <div className="chatbot-input">
        {inputMode === 'text' ? (
          // Text input mode
          <>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              maxLength={500}
            />
            <button 
              onClick={() => sendMessage()}
              disabled={isLoading || !inputValue.trim()}
              className={isLoading ? 'sending' : ''}
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </>
        ) : (
          // Voice input mode
          <div className="voice-input-controls">
            <button 
              className={`voice-control-btn ${isRecording ? 'recording' : ''}`}
              onClick={handleVoiceControl}
              disabled={isLoading}
              title={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? (
                <>
                  <div className="recording-pulse"></div>
                  ⏸️ Stop Recording
                </>
              ) : (
                <>🎙️ Start Recording</>
              )}
            </button>
            
            {isRecording && (
              <button 
                className="voice-abort-btn"
                onClick={abortRecording}
                title="Cancel recording"
              >
                ❌ Cancel
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="chatbot-footer">
        <small>
          {inputMode === 'voice' 
            ? '🎤 Voice mode active • Speak clearly for best results'
            : '💡 Ask me to create content and click "Insert into Notes" to add it!'
          }
        </small>
      </div>
    </div>
  );
};

export default ChatBot;
