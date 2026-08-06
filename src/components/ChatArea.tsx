'use client';

// ============================================================
// AI OS — Main Chat Area
// ============================================================

import { useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';
import { Bot, Sparkles } from 'lucide-react';
import { modelOptions } from '@/lib/mock-responses';

export default function ChatArea() {
  const { state, activeConversation } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedModel = modelOptions.find((m) => m.id === state.selectedModel);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const hasMessages = activeConversation && activeConversation.messages.length > 0;

  return (
    <div className="chat-area">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-header-icon">
            <Bot size={18} />
          </div>
          <div className="chat-header-info">
            <h2 className="chat-header-title">
              {activeConversation?.title || 'AI OS'}
            </h2>
            <div className="chat-header-meta">
              <span className="chat-header-status">
                <span className="status-dot status-dot-online" />
                Master Router Active
              </span>
              {selectedModel && (
                <>
                  <span className="chat-header-sep">·</span>
                  <span className="chat-header-model">
                    <Sparkles size={12} />
                    {selectedModel.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages or Welcome */}
      <div className="chat-messages">
        {hasMessages ? (
          <>
            {activeConversation.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Streaming indicator */}
            {state.isStreaming && (
              <div className="streaming-indicator">
                <div className="streaming-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="streaming-label">Agent is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        ) : (
          <WelcomeScreen />
        )}
      </div>

      {/* Input */}
      <ChatInput />
    </div>
  );
}
