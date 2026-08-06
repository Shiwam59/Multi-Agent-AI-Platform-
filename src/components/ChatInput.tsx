'use client';

// ============================================================
// AI OS — Chat Input Component
// ============================================================

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useChat } from '@/context/ChatContext';
import { Send, Paperclip, Mic, Sparkles } from 'lucide-react';
import ModelSelector from './ModelSelector';

export default function ChatInput() {
  const { sendMessage, state } = useChat();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || state.isStreaming) return;
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
      <div className="chat-input-wrapper">
        <div className="chat-input-top">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Ask anything... AI OS will route to the best agent"
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
            <button className="chat-tool-btn" title="Voice input">
              <Mic size={18} />
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
        Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
