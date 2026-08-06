'use client';

// ============================================================
// AI OS — Message Bubble Component
// ============================================================

import { useState, useEffect } from 'react';
import { Message } from '@/lib/types';
import { getAgentById } from '@/lib/agents';
import StreamingText from './StreamingText';
import * as LucideIcons from 'lucide-react';
import { CATEGORY_COLORS } from '@/lib/types';
import { Volume2, VolumeX, Copy, Check } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const agent = message.agentId ? getAgentById(message.agentId) : null;
  const agentColor = agent ? CATEGORY_COLORS[agent.category] : '#06b6d4';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get the Lucide icon component dynamically
  const IconComponent = agent?.icon
    ? (LucideIcons as any)[agent.icon]
    : null;

  const timeStr = message.timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Handle Text-to-Speech
  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel(); // Stop any previous speech
      // Clean up markdown syntax for cleaner speech
      const cleanText = message.content
        .replace(/```[\s\S]*?```/g, ' Code snippet omitted. ')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\*\*|\*|#|`|_/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className={`message-row ${isUser ? 'message-row-user' : 'message-row-agent'}`}>
      {/* Agent avatar */}
      {!isUser && (
        <div className="agent-avatar" style={{ borderColor: agentColor + '40' }}>
          {IconComponent ? (
            <IconComponent size={18} className="agent-avatar-icon" />
          ) : (
            <LucideIcons.Bot size={18} className="agent-avatar-icon" />
          )}
        </div>
      )}

      <div className={`message-bubble ${isUser ? 'message-user' : 'message-agent'}`}>
        {/* Agent header & controls */}
        {!isUser && (
          <div className="message-agent-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="agent-name" style={{ color: agentColor }}>
                {message.agentName || agent?.name || 'AI OS'}
              </span>
              {agent && (
                <span className="message-model-badge">
                  {agent.category}
                </span>
              )}
            </div>

            {message.content && !message.isStreaming && (
              <div className="message-actions flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <button
                  onClick={toggleSpeech}
                  className={`msg-action-btn ${isSpeaking ? 'speaking-active' : ''}`}
                  title={isSpeaking ? 'Stop reading' : 'Read response aloud'}
                >
                  {isSpeaking ? (
                    <VolumeX size={14} className="text-amber-400 animate-pulse" />
                  ) : (
                    <Volume2 size={14} />
                  )}
                </button>
                <button
                  onClick={handleCopyMessage}
                  className="msg-action-btn"
                  title="Copy response"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Message content */}
        <div className="message-content">
          {isUser ? (
            <p>{message.content}</p>
          ) : !message.content && message.isStreaming ? (
            <div className="agent-loading-container">
              <div className="agent-loading-pulsar">
                <span className="pulsar-core" style={{ backgroundColor: agentColor }} />
                <span className="pulsar-ring" style={{ borderColor: agentColor }} />
              </div>
              <span className="agent-loading-text">
                Routing to {message.agentName || 'Agent'}...
              </span>
            </div>
          ) : (
            <StreamingText
              content={message.content}
              isStreaming={message.isStreaming || false}
            />
          )}
        </div>

        {/* Timestamp */}
        <div className={`message-time ${isUser ? 'message-time-user' : ''}`}>
          {timeStr}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="user-avatar">
          <LucideIcons.User size={18} />
        </div>
      )}
    </div>
  );
}

