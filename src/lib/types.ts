// ============================================================
// AI OS — Core Type Definitions
// ============================================================

export type AgentCategory =
  | 'core'
  | 'content'
  | 'creative'
  | 'developer'
  | 'business'
  | 'productivity'
  | 'data'
  | 'education'
  | 'entertainment'
  | 'automation';

export type AgentStatus = 'online' | 'busy' | 'offline';

export type MessageRole = 'user' | 'agent' | 'system';

export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'meta';

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  icon: string; // Lucide icon name
  status: AgentStatus;
  model?: string;
  capabilities: string[];
}

export interface ModelOption {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
  badge?: string; // e.g., "Fastest", "Most Capable"
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  agentId?: string;
  agentName?: string;
  timestamp: Date;
  isStreaming?: boolean;
  codeBlocks?: CodeBlock[];
}

export interface CodeBlock {
  language: string;
  code: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  activeAgents: string[]; // agent IDs
  model: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  prompt: string;
  gradient: string; // CSS gradient for card
}

export const CATEGORY_LABELS: Record<AgentCategory, string> = {
  core: 'Core AI',
  content: 'Content Creation',
  creative: 'Creative AI',
  developer: 'Developer',
  business: 'Business',
  productivity: 'Productivity',
  data: 'Data & Intelligence',
  education: 'Education',
  entertainment: 'Entertainment',
  automation: 'Automation',
};

export const CATEGORY_COLORS: Record<AgentCategory, string> = {
  core: '#06b6d4',       // cyan
  content: '#8b5cf6',    // violet
  creative: '#ec4899',   // pink
  developer: '#10b981',  // emerald
  business: '#f59e0b',   // amber
  productivity: '#3b82f6', // blue
  data: '#6366f1',       // indigo
  education: '#14b8a6',  // teal
  entertainment: '#f43f5e', // rose
  automation: '#a855f7', // purple
};
