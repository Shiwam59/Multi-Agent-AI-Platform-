'use client';

// ============================================================
// AI OS — Message Bubble Component
// ============================================================

import { Message } from '@/lib/types';
import { getAgentById } from '@/lib/agents';
import StreamingText from './StreamingText';
import * as LucideIcons from 'lucide-react';
import { CATEGORY_COLORS } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const agent = message.agentId ? getAgentById(message.agentId) : null;
  const agentColor = agent ? CATEGORY_COLORS[agent.category] : '#06b6d4';

  // Get the Lucide icon component dynamically
  const IconComponent = agent?.icon
    ? (LucideIcons as any)[agent.icon]
    : null;

  const timeStr = message.timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

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
        {/* Agent header */}
        {!isUser && agent && (
          <div className="message-agent-header">
            <span className="agent-name" style={{ color: agentColor }}>
              {message.agentName || agent.name}
            </span>
            <span className="message-model-badge">
              {agent.category}
            </span>
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
