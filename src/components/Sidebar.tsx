'use client';

// ============================================================
// AI OS — Sidebar (Left Navigation)
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import {
  MessageSquarePlus,
  Search,
  Pin,
  Trash2,
  Sparkles,
  LayoutDashboard,
  Users,
  BrainCircuit,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Crown,
  MessageCircle,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'agents', icon: Users, label: 'Agents' },
  { id: 'memory', icon: BrainCircuit, label: 'Memory' },
  { id: 'files', icon: FolderOpen, label: 'Files' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const {
    state,
    toggleSidebar,
    selectConversation,
    newConversation,
    pinConversation,
    deleteConversation,
    activeConversation,
  } = useChat();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const collapsed = state.isSidebarCollapsed;

  // Close user menu on clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and sort conversations
  const filteredConversations = state.conversations
    .filter((c) =>
      searchQuery ? c.title.toLowerCase().includes(searchQuery.toLowerCase()) : true,
    )
    .sort((a, b) => {
      // Pinned first, then by date
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Get initial or avatar
  const userDisplayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  return (
    <div className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Sparkles size={20} />
        </div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <span className="sidebar-brand">AI OS</span>
            <span className="sidebar-version">v1.0</span>
          </div>
        )}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New Chat Button */}
      <button className="sidebar-new-chat" onClick={newConversation}>
        <MessageSquarePlus size={18} />
        {!collapsed && <span>New Chat</span>}
      </button>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activeNav === item.id ? 'sidebar-nav-active' : ''}`}
            onClick={() => setActiveNav(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Conversation History */}
      {!collapsed && (
        <div className="sidebar-conversations">
          <div className="sidebar-section-header">
            <span>History</span>
            <span className="sidebar-section-count">{state.conversations.length}</span>
          </div>

          {/* Search */}
          <div className="sidebar-search">
            <Search size={14} className="sidebar-search-icon" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sidebar-search-input"
            />
          </div>

          {/* Conversation List */}
          <div className="sidebar-conv-list">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                role="button"
                tabIndex={0}
                className={`sidebar-conv-item ${
                  activeConversation?.id === conv.id ? 'sidebar-conv-active' : ''
                }`}
                onClick={() => selectConversation(conv.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectConversation(conv.id);
                  }
                }}
              >
                <div className="sidebar-conv-main">
                  <div className="sidebar-conv-title-row">
                    <MessageCircle size={14} className="sidebar-conv-icon" />
                    <span className="sidebar-conv-title">{conv.title}</span>
                  </div>
                  <span className="sidebar-conv-time">{formatTime(conv.updatedAt)}</span>
                </div>
                <div className="sidebar-conv-actions">
                  <button
                    className={`sidebar-conv-action ${conv.isPinned ? 'sidebar-conv-pinned' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      pinConversation(conv.id);
                    }}
                    title={conv.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin size={12} />
                  </button>
                  <button
                    className="sidebar-conv-action sidebar-conv-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Section with Dropdown Menu */}
      <div className="sidebar-user-container" ref={userMenuRef}>
        <button
          className="sidebar-user"
          onClick={() => setShowUserMenu(!showUserMenu)}
          title={collapsed ? userDisplayName : undefined}
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt={userDisplayName} className="sidebar-user-avatar-img" />
          ) : (
            <div className="sidebar-user-avatar">
              <span>{userInitial}</span>
            </div>
          )}
          {!collapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{userDisplayName}</span>
              <span className="sidebar-user-plan">
                <Crown size={10} />
                Pro Plan
              </span>
            </div>
          )}
        </button>

        {/* User Settings Dropdown */}
        {showUserMenu && (
          <div className={`user-dropdown ${collapsed ? 'user-dropdown-collapsed' : ''}`}>
            <div className="user-dropdown-header">
              <span className="user-dropdown-email">{user?.email || ''}</span>
            </div>
            <button className="user-dropdown-item">
              <Settings size={14} />
              <span>Workspace Settings</span>
            </button>
            <div className="user-dropdown-divider" />
            <button className="user-dropdown-item user-dropdown-logout" onClick={() => logout()}>
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
