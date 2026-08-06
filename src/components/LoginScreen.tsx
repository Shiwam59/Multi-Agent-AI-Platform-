'use client';

// ============================================================
// AI OS — Login / Landing Screen with Google Authentication
// ============================================================

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Bot, BrainCircuit, ShieldAlert, Cpu, Network, ArrowRight } from 'lucide-react';

export default function LoginScreen() {
  const { loginWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to sign in. Please try again.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-container">
      {/* Dynamic Ambient Background Lights */}
      <div className="ambient-light cyan-light" />
      <div className="ambient-light violet-light" />
      <div className="ambient-light pink-light" />

      <div className="login-card-wrapper">
        <div className="login-brand-section">
          {/* Animated Glow Logo */}
          <div className="login-logo-container">
            <div className="login-logo-glow" />
            <div className="login-logo">
              <Sparkles size={40} className="login-logo-icon" />
            </div>
          </div>

          <h1 className="login-title">
            AI OS <span className="login-title-highlight">Workspace</span>
          </h1>
          <p className="login-subtitle">
            An AI-native multi-agent operating system designed to orchestrate complex cognitive workflows.
          </p>

          {/* Capabilities Grid */}
          <div className="login-features">
            <div className="login-feature-item">
              <div className="login-feature-icon" style={{ color: '#06b6d4' }}>
                <Bot size={20} />
              </div>
              <div className="login-feature-text">
                <h3>50+ Specialized Agents</h3>
                <p>Domain expert agents for programming, analytics, design, productivity, and education.</p>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="login-feature-icon" style={{ color: '#8b5cf6' }}>
                <Network size={20} />
              </div>
              <div className="login-feature-text">
                <h3>Orchestrated Workflows</h3>
                <p>Parallel agent chaining and automated query routing governed by a Master Router.</p>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="login-feature-icon" style={{ color: '#ec4899' }}>
                <BrainCircuit size={20} />
              </div>
              <div className="login-feature-text">
                <h3>Persistent Context</h3>
                <p>Long-term user preferences and semantic search powered by secure memory namespaces.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Panel */}
        <div className="login-auth-section">
          <div className="login-auth-card">
            <h2>Access Workspace</h2>
            <p>Authenticate with your Google credentials to activate your AI OS environment.</p>

            {error && (
              <div className="login-error">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`google-signin-btn ${isLoggingIn ? 'google-signin-loading' : ''}`}
            >
              {isLoggingIn ? (
                <div className="auth-spinner" />
              ) : (
                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.14-.1.14v3.29h1.1c4.14-3.8 6.54-9.4 6.54-15.28z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.85-2.99c-1.07.72-2.44 1.16-4.08 1.16-3.14 0-5.8-2.11-6.75-4.96H1.31v3.09C3.29 21.23 7.39 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.25 14.3c-.25-.72-.39-1.5-.39-2.3s.14-1.58.39-2.3V6.61H1.31C.47 8.29 0 10.1 0 12s.47 3.71 1.31 5.39l3.94-3.09z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.39 0 3.29 2.77 1.31 6.61l3.94 3.09c.95-2.85 3.61-4.95 6.75-4.95z"
                  />
                </svg>
              )}
              <span>{isLoggingIn ? "Initializing secure session..." : "Continue with Google"}</span>
            </button>

            <div className="login-security-notice">
              <Cpu size={12} />
              <span>Symmetric end-to-end transport encryption enabled.</span>
            </div>
          </div>

          {/* Quick Preview Card */}
          <div className="login-preview-card">
            <div className="preview-card-header">
              <div className="preview-dots">
                <span />
                <span />
                <span />
              </div>
              <div className="preview-address-bar">ai-os.workspace.internal</div>
            </div>
            <div className="preview-card-body">
              <div className="preview-sidebar-stub">
                <span className="stub-logo" />
                <span className="stub-nav" />
                <span className="stub-nav" />
                <span className="stub-nav" />
              </div>
              <div className="preview-chat-stub">
                <div className="stub-message-user">Deploying cluster...</div>
                <div className="stub-message-agent">
                  <span className="stub-agent-badge" />
                  <span className="stub-line" />
                  <span className="stub-line" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
