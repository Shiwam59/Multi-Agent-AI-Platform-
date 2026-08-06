'use client';

// ============================================================
// AI OS — Chat Input Component
// ============================================================

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useChat } from '@/context/ChatContext';
import { Send, Paperclip, Mic, MicOff, Sparkles } from 'lucide-react';
import ModelSelector from './ModelSelector';

export default function ChatInput() {
  const { sendMessage, state } = useChat();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your current browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || state.isStreaming) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    sendMessage(trimmed);
    setInput('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
    // Regular Enter sends too (without Shift)
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-container">
      <div className={`chat-input-wrapper ${isListening ? 'listening-active' : ''}`}>
        {isListening && (
          <div className="listening-banner">
            <span className="listening-dot" />
            <span>Listening to your voice... Speak now</span>
          </div>
        )}

        <div className="chat-input-top">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder={isListening ? "Listening..." : "Ask anything... AI OS will route to the best agent"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={state.isStreaming}
          />
        </div>

        <div className="chat-input-bottom">
          <div className="chat-input-tools">
            <button className="chat-tool-btn" title="Attach file">
              <Paperclip size={18} />
            </button>
            <button
              className={`chat-tool-btn ${isListening ? 'mic-active' : ''}`}
              onClick={toggleVoiceInput}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? (
                <MicOff size={18} className="text-red-500 animate-pulse" />
              ) : (
                <Mic size={18} />
              )}
            </button>
            <div className="chat-input-divider" />
            <ModelSelector />
          </div>

          <div className="chat-input-right">
            {input.length > 0 && (
              <span className="char-count">{input.length}</span>
            )}
            <button
              className={`chat-send-btn ${input.trim() && !state.isStreaming ? 'chat-send-btn-active' : ''}`}
              onClick={handleSend}
              disabled={!input.trim() || state.isStreaming}
            >
              {state.isStreaming ? (
                <div className="send-loading">
                  <Sparkles size={18} className="send-loading-icon" />
                </div>
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </div>

      <p className="chat-input-hint">
        Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line · Click <Mic size={12} className="inline mx-0.5" /> to speak
      </p>
    </div>
  );
}

