import React, { useState, useEffect } from 'react';
import { useVoice } from '../../hooks/useVoice';
import './VoiceRecorder.css';

const VoiceRecorder = ({ isOpen, onClose, onTranscription, language = 'en-US' }) => {
  const {
    isRecording,
    isListening,
    voiceText,
    isSupported,
    startRecording,
    stopRecording,
    clearVoiceText
  } = useVoice();

  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [transcriptionHistory, setTranscriptionHistory] = useState([]);

  useEffect(() => {
    if (voiceText) {
      setTranscriptionHistory(prev => [...prev, {
        id: Date.now(),
        text: voiceText,
        timestamp: new Date(),
        language: currentLanguage
      }]);
    }
  }, [voiceText, currentLanguage]);

  const handleStartRecording = () => {
    clearVoiceText();
    startRecording(currentLanguage);
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleInsertTranscription = (text) => {
    onTranscription(text);
    onClose();
  };

  const handleClearHistory = () => {
    setTranscriptionHistory([]);
    clearVoiceText();
  };

  if (!isOpen) return null;

  return (
    <div className="voice-recorder-overlay" onClick={onClose}>
      <div className="voice-recorder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="voice-recorder-header">
          <h2>🎤 Voice Recorder</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="voice-recorder-content">
          {!isSupported ? (
            <div className="not-supported">
              <p>❌ Speech recognition is not supported in your browser.</p>
              <p>Please use Chrome, Edge, or Safari for the best experience.</p>
            </div>
          ) : (
            <>
              <div className="language-selector">
                <label>Language:</label>
                <select 
                  value={currentLanguage}
                  onChange={(e) => setCurrentLanguage(e.target.value)}
                  disabled={isRecording}
                >
                  <option value="en-US">🇺🇸 English (US)</option>
                  <option value="es-ES">🇪🇸 Spanish</option>
                  <option value="fr-FR">🇫🇷 French</option>
                  <option value="de-DE">🇩🇪 German</option>
                  <option value="it-IT">🇮🇹 Italian</option>
                  <option value="pt-BR">🇧🇷 Portuguese</option>
                  <option value="ru-RU">🇷🇺 Russian</option>
                  <option value="ja-JP">🇯🇵 Japanese</option>
                  <option value="ko-KR">🇰🇷 Korean</option>
                  <option value="zh-CN">🇨🇳 Chinese</option>
                  <option value="ar-SA">🇸🇦 Arabic</option>
                  <option value="hi-IN">🇮🇳 Hindi</option>
                </select>
              </div>

              <div className="recording-controls">
                <button 
                  className={`record-btn ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                >
                  {isRecording ? (
                    <>
                      <div className="recording-animation"></div>
                      ⏸️ Stop Recording
                    </>
                  ) : (
                    <>🎙️ Start Recording</>
                  )}
                </button>

                <div className="recording-status">
                  {isListening && <span className="status listening">👂 Listening...</span>}
                  {isRecording && <span className="status recording">🔴 Recording</span>}
                </div>
              </div>

              {voiceText && (
                <div className="current-transcription">
                  <h3>Current Transcription:</h3>
                  <div className="transcription-text">"{voiceText}"</div>
                  <button 
                    className="insert-btn"
                    onClick={() => handleInsertTranscription(voiceText)}
                  >
                    📝 Insert into Notes
                  </button>
                </div>
              )}

              {transcriptionHistory.length > 0 && (
                <div className="transcription-history">
                  <div className="history-header">
                    <h3>📋 History</h3>
                    <button 
                      className="clear-history-btn"
                      onClick={handleClearHistory}
                    >
                      🗑️ Clear
                    </button>
                  </div>
                  
                  <div className="history-list">
                    {transcriptionHistory.slice().reverse().map((item) => (
                      <div key={item.id} className="history-item">
                        <div className="history-text">"{item.text}"</div>
                        <div className="history-meta">
                          <span className="history-language">{item.language}</span>
                          <span className="history-time">
                            {item.timestamp.toLocaleTimeString()}
                          </span>
                          <button 
                            className="history-insert-btn"
                            onClick={() => handleInsertTranscription(item.text)}
                          >
                            📝
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;
