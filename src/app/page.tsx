'use client';

// ============================================================
// AI OS — Root Router Page (Login / Dashboard Switcher)
// ============================================================

import { useAuth } from '@/context/AuthContext';
import { ChatProvider } from '@/context/ChatContext';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import AgentPanel from '@/components/AgentPanel';
import LoginScreen from '@/components/LoginScreen';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();

  // Premium loading / session initialization splash screen
  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-glow" />
        <div className="auth-loading-logo">
          <Sparkles size={36} className="auth-loading-icon" />
        </div>
        <div className="auth-loading-spinner" />
        <p className="auth-loading-text">Initializing AI OS Workspace...</p>
      </div>
    );
  }

  // Route to Login Screen if session is inactive
  if (!user) {
    return <LoginScreen />;
  }

  // Render secured Workspace Dashboard
  return (
    <ChatProvider>
      <div className="dashboard">
        <Sidebar />
        <ChatArea />
        <AgentPanel />
      </div>
    </ChatProvider>
  );
}
