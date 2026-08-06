'use client';

// ============================================================
// AI OS — Agent Card Component
// ============================================================

import { Agent, CATEGORY_COLORS } from '@/lib/types';
import * as LucideIcons from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  compact?: boolean;
  onClick?: (agent: Agent) => void;
}

export default function AgentCard({ agent, compact = false, onClick }: AgentCardProps) {
  const color = CATEGORY_COLORS[agent.category];

  const IconComponent = (LucideIcons as any)[agent.icon];

  const statusColor =
    agent.status === 'online' ? '#10b981' : agent.status === 'busy' ? '#f59e0b' : '#6b7280';

  if (compact) {
    return (
      <button
        className="agent-card-compact"
        onClick={() => onClick?.(agent)}
        style={{ '--agent-color': color } as React.CSSProperties}
      >
        <div className="agent-card-compact-icon" style={{ background: color + '15' }}>
          {IconComponent && <IconComponent size={16} style={{ color }} />}
        </div>
        <span className="agent-card-compact-name">{agent.name}</span>
        <span className="agent-status-dot" style={{ background: statusColor }} />
      </button>
    );
  }

  return (
    <button
      className="agent-card"
      onClick={() => onClick?.(agent)}
      style={{ '--agent-color': color } as React.CSSProperties}
    >
      <div className="agent-card-top">
        <div className="agent-card-icon" style={{ background: color + '12' }}>
          {IconComponent && <IconComponent size={20} style={{ color }} />}
        </div>
        <span className="agent-status-dot" style={{ background: statusColor }} />
      </div>
      <h4 className="agent-card-name">{agent.name}</h4>
      <p className="agent-card-desc">{agent.description}</p>
      <div className="agent-card-caps">
        {agent.capabilities.slice(0, 3).map((cap) => (
          <span key={cap} className="agent-cap-tag" style={{ color, borderColor: color + '30' }}>
            {cap}
          </span>
        ))}
      </div>
    </button>
  );
}
