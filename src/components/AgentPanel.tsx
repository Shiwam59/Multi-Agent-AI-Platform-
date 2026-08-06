/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

// ============================================================
// AI OS — Agent Panel (Right Sidebar)
// ============================================================

import { useState, useMemo } from 'react';
import { useChat } from '@/context/ChatContext';
import { agents } from '@/lib/agents';
import { AgentCategory, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/types';
import AgentCard from './AgentCard';
import { Search, ChevronRight, Users, X } from 'lucide-react';

const categories: AgentCategory[] = [
  'core', 'content', 'creative', 'developer', 'business',
  'productivity', 'data', 'education', 'entertainment', 'automation',
];

export default function AgentPanel() {
  const { state, toggleAgentPanel } = useChat();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<AgentCategory | 'all'>('all');

  const filteredAgents = useMemo(() => {
    let result = agents;

    if (activeCategory !== 'all') {
      result = result.filter((a) => a.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.capabilities.some((c) => c.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [activeCategory, search]);

  const onlineCount = agents.filter((a) => a.status === 'online').length;

  if (state.isAgentPanelCollapsed) {
    return (
      <button className="agent-panel-collapsed" onClick={toggleAgentPanel}>
        <Users size={20} />
        <span className="agent-panel-collapsed-count">{onlineCount}</span>
      </button>
    );
  }

  return (
    <div className="agent-panel">
      {/* Header */}
      <div className="agent-panel-header">
        <div className="agent-panel-header-left">
          <Users size={18} />
          <h3>Agents</h3>
          <span className="agent-online-badge">{onlineCount} online</span>
        </div>
        <button className="agent-panel-close" onClick={toggleAgentPanel}>
          <X size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="agent-search-wrapper">
        <Search size={14} className="agent-search-icon" />
        <input
          type="text"
          className="agent-search-input"
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="agent-category-tabs">
        <button
          className={`agent-cat-tab ${activeCategory === 'all' ? 'agent-cat-tab-active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`agent-cat-tab ${activeCategory === cat ? 'agent-cat-tab-active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            style={
              activeCategory === cat
                ? { color: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat] }
                : {}
            }
          >
            {CATEGORY_LABELS[cat].split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Agent List */}
      <div className="agent-list">
        {activeCategory === 'all' ? (
          // Grouped by category
          categories.map((cat) => {
            const catAgents = filteredAgents.filter((a) => a.category === cat);
            if (catAgents.length === 0) return null;

            return (
              <div key={cat} className="agent-category-group">
                <div className="agent-category-header">
                  <span
                    className="agent-category-dot"
                    style={{ background: CATEGORY_COLORS[cat] }}
                  />
                  <span className="agent-category-label">{CATEGORY_LABELS[cat]}</span>
                  <span className="agent-category-count">{catAgents.length}</span>
                </div>
                <div className="agent-category-grid">
                  {catAgents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} compact />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="agent-filtered-grid">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}

        {filteredAgents.length === 0 && (
          <div className="agent-empty">
            <Search size={32} className="agent-empty-icon" />
            <p>No agents found</p>
            <span>Try a different search or category</span>
          </div>
        )}
      </div>
    </div>
  );
}
