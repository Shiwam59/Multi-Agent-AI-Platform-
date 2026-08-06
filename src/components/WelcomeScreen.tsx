'use client';

// ============================================================
// AI OS — Welcome Screen
// ============================================================

import { useChat } from '@/context/ChatContext';
import { quickActions } from '@/lib/mock-responses';
import * as LucideIcons from 'lucide-react';
import { Sparkles } from 'lucide-react';

export default function WelcomeScreen() {
  const { startWithPrompt } = useChat();

  return (
    <div className="welcome-screen">
      {/* Animated Logo */}
      <div className="welcome-logo-container">
        <div className="welcome-logo-glow" />
        <div className="welcome-logo">
          <Sparkles size={32} className="welcome-logo-icon" />
        </div>
      </div>

      <h1 className="welcome-title">
        Welcome to <span className="welcome-title-gradient">AI OS</span>
      </h1>
      <p className="welcome-subtitle">
        Your unified AI workspace with 50+ specialized agents.
        <br />
        Ask anything — I&apos;ll route it to the best agent automatically.
      </p>

      {/* Quick Action Cards */}
      <div className="welcome-actions">
        {quickActions.map((action) => {
          const IconComponent = (LucideIcons as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[action.icon];

          return (
            <button
              key={action.id}
              className="welcome-action-card"
              onClick={() => startWithPrompt(action.prompt)}
            >
              <div
                className="welcome-action-icon"
                style={{ background: action.gradient }}
              >
                {IconComponent && <IconComponent size={20} className="welcome-action-icon-svg" />}
              </div>
              <div className="welcome-action-text">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom tip */}
      <div className="welcome-tip">
        <LucideIcons.Lightbulb size={14} className="welcome-tip-icon" />
        <span>
          Tip: The Master Router automatically selects the best agent for your task
        </span>
      </div>
    </div>
  );
}
