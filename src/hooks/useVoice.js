import { useState, useRef, useCallback, useEffect } from 'react';

export const useVoice = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // ✅ CRITICAL: Set proper configuration
      recognitionRef.current.continuous = false; // Don't keep listening indefinitely
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;
      
      recognitionRef.current.onstart = () => {
        console.log('🎤 Voice recognition started');
        setIsListening(true);
        setIsRecording(true);
      };
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setCurrentTranscript(interimTranscript);
        
        if (finalTranscript) {
          console.log('🎤 Final transcript:', finalTranscript);
          setVoiceText(finalTranscript.trim());
        }
      };
      
      recognitionRef.current.onend = () => {
        console.log('🎤 Voice recognition ended');
        setIsListening(false);
        setIsRecording(false);
        setCurrentTranscript('');
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('🎤 Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
        setCurrentTranscript('');
        
        if (event.error === 'no-speech') {
          console.log('🎤 No speech detected');
        } else if (event.error === 'audio-capture') {
          alert('🎤 Microphone not available. Please check permissions.');
        }
      };
    } else {
      console.warn('🎤 Speech recognition not supported');
    }

    if (SpeechSynthesis) {
      synthRef.current = SpeechSynthesis;
    }

    // ✅ Cleanup function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startRecording = useCallback((language = 'en-US') => {
    if (!recognitionRef.current || isRecording) {
      console.warn('🎤 Cannot start: Recognition not available or already recording');
      return;
    }
    
    try {
      // ✅ Clear previous transcript
      setVoiceText('');
      setCurrentTranscript('');
      
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      console.log('🎤 Starting voice recognition...');
    } catch (error) {
      console.error('🎤 Error starting recording:', error);
      alert('Failed to start voice recording. Please try again.');
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) {
      console.warn('🎤 Cannot stop: Recognition not available');
      return;
    }
    
    try {
      recognitionRef.current.stop();
      console.log('🎤 Stopping voice recognition...');
    } catch (error) {
      console.error('🎤 Error stopping recording:', error);
    }
  }, []);

  const abortRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.abort();
      setIsRecording(false);
      setIsListening(false);
      setCurrentTranscript('');
      console.log('🎤 Voice recognition aborted');
    } catch (error) {
      console.error('🎤 Error aborting recording:', error);
    }
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!synthRef.current || !text) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.language || 'en-US';
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    synthRef.current.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  }, []);

  const clearVoiceText = useCallback(() => {
    setVoiceText('');
    setCurrentTranscript('');
  }, []);

  return {
    isRecording,
    isListening,
    voiceText,
    currentTranscript,
    isSupported,
    startRecording,
    stopRecording,
    abortRecording,
    speak,
    stopSpeaking,
    clearVoiceText
  };
};
