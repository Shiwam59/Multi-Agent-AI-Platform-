'use client';

// ============================================================
// AI OS — Chat Context & State Management
// Now uses real OpenRouter API with streaming SSE responses
// ============================================================

import React, { createContext, useContext, useReducer, useCallback, useRef, ReactNode } from 'react';
import { Conversation, Message } from '@/lib/types';
import { sampleConversations } from '@/lib/mock-responses';

// ── Model ID mapping ─────────────────────────────────────────
const MODEL_MAP: Record<string, string> = {
  'llama-3': 'openrouter/free',
  'gemma-2': 'google/gemma-4-31b-it:free',
  'qwen-2': 'openai/gpt-oss-20b:free',
  'phi-3': 'cohere/north-mini-code:free',
  'mistral-7b': 'openrouter/free',
};

// ── State Shape ───────────────────────────────────────────────
interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  selectedModel: string;
  isSidebarCollapsed: boolean;
  isAgentPanelCollapsed: boolean;
  isStreaming: boolean;
}

const initialState: ChatState = {
  conversations: sampleConversations,
  activeConversationId: null,
  selectedModel: 'llama-3',
  isSidebarCollapsed: false,
  isAgentPanelCollapsed: false,
  isStreaming: false,
};

// ── Actions ───────────────────────────────────────────────────
type ChatAction =
  | { type: 'NEW_CONVERSATION' }
  | { type: 'SELECT_CONVERSATION'; id: string }
  | { type: 'ADD_MESSAGE'; conversationId: string; message: Message }
  | { type: 'UPDATE_MESSAGE'; conversationId: string; messageId: string; content: string }
  | { type: 'SET_AGENT_INFO'; conversationId: string; messageId: string; agentId: string; agentName: string }
  | { type: 'FINISH_STREAMING'; conversationId: string; messageId: string }
  | { type: 'SET_MODEL'; model: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_AGENT_PANEL' }
  | { type: 'SET_STREAMING'; isStreaming: boolean }
  | { type: 'PIN_CONVERSATION'; id: string }
  | { type: 'DELETE_CONVERSATION'; id: string };

// ── Reducer ───────────────────────────────────────────────────
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'NEW_CONVERSATION': {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        title: 'New Conversation',
        messages: [],
        activeAgents: [],
        model: state.selectedModel,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return {
        ...state,
        conversations: [newConv, ...state.conversations],
        activeConversationId: newConv.id,
      };
    }

    case 'SELECT_CONVERSATION':
      return { ...state, activeConversationId: action.id };

    case 'ADD_MESSAGE': {
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.conversationId
            ? {
                ...conv,
                messages: [...conv.messages, action.message],
                updatedAt: new Date(),
                // Update title from first user message
                title:
                  conv.messages.length === 0 && action.message.role === 'user'
                    ? action.message.content.slice(0, 50) + (action.message.content.length > 50 ? '...' : '')
                    : conv.title,
              }
            : conv,
        ),
      };
    }

    case 'UPDATE_MESSAGE': {
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.conversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === action.messageId ? { ...msg, content: action.content } : msg,
                ),
              }
            : conv,
        ),
      };
    }

    case 'SET_AGENT_INFO': {
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.conversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === action.messageId
                    ? { ...msg, agentId: action.agentId, agentName: action.agentName }
                    : msg,
                ),
                activeAgents: conv.activeAgents.includes(action.agentId)
                  ? conv.activeAgents
                  : [...conv.activeAgents, action.agentId],
              }
            : conv,
        ),
      };
    }

    case 'FINISH_STREAMING': {
      return {
        ...state,
        isStreaming: false,
        conversations: state.conversations.map((conv) =>
          conv.id === action.conversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === action.messageId ? { ...msg, isStreaming: false } : msg,
                ),
              }
            : conv,
        ),
      };
    }

    case 'SET_MODEL':
      return { ...state, selectedModel: action.model };

    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarCollapsed: !state.isSidebarCollapsed };

    case 'TOGGLE_AGENT_PANEL':
      return { ...state, isAgentPanelCollapsed: !state.isAgentPanelCollapsed };

    case 'SET_STREAMING':
      return { ...state, isStreaming: action.isStreaming };

    case 'PIN_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.id ? { ...conv, isPinned: !conv.isPinned } : conv,
        ),
      };

    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter((conv) => conv.id !== action.id),
        activeConversationId:
          state.activeConversationId === action.id ? null : state.activeConversationId,
      };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────
interface ChatContextType {
  state: ChatState;
  activeConversation: Conversation | null;
  sendMessage: (content: string) => void;
  newConversation: () => void;
  selectConversation: (id: string) => void;
  setModel: (model: string) => void;
  toggleSidebar: () => void;
  toggleAgentPanel: () => void;
  pinConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  startWithPrompt: (prompt: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────
export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const activeConversation =
    state.conversations.find((c) => c.id === state.activeConversationId) ?? null;

  // ── Stream from real OpenRouter API ─────────────────────────
  const streamFromAPI = useCallback(
    async (conversationId: string, messageId: string, messages: { role: string; content: string }[], model: string) => {
      try {
        const openRouterModel = MODEL_MAP[model] || 'nvidia/nemotron-3-ultra-550b-a55b:free';

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages,
            model: openRouterModel,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'API request failed');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        if (!reader) throw new Error('No response body');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

          for (const line of lines) {
            const data = line.slice(6); // Remove 'data: ' prefix

            if (data === '[DONE]') {
              dispatch({ type: 'FINISH_STREAMING', conversationId, messageId });
              return;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'agent') {
                // Update agent info on the message
                dispatch({
                  type: 'SET_AGENT_INFO',
                  conversationId,
                  messageId,
                  agentId: parsed.agentId,
                  agentName: parsed.agentName,
                });
              } else if (parsed.type === 'content') {
                fullContent += parsed.content;
                dispatch({
                  type: 'UPDATE_MESSAGE',
                  conversationId,
                  messageId,
                  content: fullContent,
                });
              } else if (parsed.type === 'error') {
                fullContent += '\n\n⚠️ ' + parsed.error;
                dispatch({
                  type: 'UPDATE_MESSAGE',
                  conversationId,
                  messageId,
                  content: fullContent,
                });
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }

        // If we exit the loop without [DONE], finish anyway
        dispatch({ type: 'FINISH_STREAMING', conversationId, messageId });
      } catch (error: any) {
        console.error('Stream error:', error);
        dispatch({
          type: 'UPDATE_MESSAGE',
          conversationId,
          messageId,
          content: `⚠️ **Error**: ${error.message || 'Failed to connect to the AI service.'}\n\nPlease check that your \`OPENROUTER_API_KEY\` is set in \`.env.local\` and the dev server has been restarted.`,
        });
        dispatch({ type: 'FINISH_STREAMING', conversationId, messageId });
      }
    },
    [],
  );

  const sendMessage = useCallback(
    (content: string) => {
      let convId = stateRef.current.activeConversationId;

      // Create new conversation if none is active
      if (!convId) {
        dispatch({ type: 'NEW_CONVERSATION' });
        // We need to compute the ID the reducer will generate
        convId = `conv-${Date.now()}`;
      }

      // Add user message
      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', conversationId: convId, message: userMsg });

      // Start streaming
      dispatch({ type: 'SET_STREAMING', isStreaming: true });

      // Create placeholder agent message
      const agentMsgId = `msg-${Date.now() + 1}`;
      const agentMsg: Message = {
        id: agentMsgId,
        role: 'agent',
        content: '',
        agentId: 'chat',
        agentName: 'Routing...',
        timestamp: new Date(),
        isStreaming: true,
      };

      // Small delay for UX feel
      setTimeout(() => {
        dispatch({ type: 'ADD_MESSAGE', conversationId: convId!, message: agentMsg });

        // Gather conversation history for context
        const currentConv = stateRef.current.conversations.find((c) => c.id === convId);
        const historyMessages = currentConv
          ? currentConv.messages
              .filter((m) => m.role === 'user' || m.role === 'agent')
              .map((m) => ({ role: m.role === 'agent' ? 'assistant' : 'user', content: m.content }))
          : [];

        // Add the current message
        historyMessages.push({ role: 'user', content });

        // Stream from real API
        streamFromAPI(convId!, agentMsgId, historyMessages, stateRef.current.selectedModel);
      }, 300);
    },
    [streamFromAPI],
  );

  const startWithPrompt = useCallback(
    (prompt: string) => {
      dispatch({ type: 'NEW_CONVERSATION' });

      // Wait a tick for state to update, then send message
      setTimeout(() => {
        sendMessage(prompt);
      }, 50);
    },
    [sendMessage],
  );

  const value: ChatContextType = {
    state,
    activeConversation,
    sendMessage,
    newConversation: () => dispatch({ type: 'NEW_CONVERSATION' }),
    selectConversation: (id) => dispatch({ type: 'SELECT_CONVERSATION', id }),
    setModel: (model) => dispatch({ type: 'SET_MODEL', model }),
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    toggleAgentPanel: () => dispatch({ type: 'TOGGLE_AGENT_PANEL' }),
    pinConversation: (id) => dispatch({ type: 'PIN_CONVERSATION', id }),
    deleteConversation: (id) => dispatch({ type: 'DELETE_CONVERSATION', id }),
    startWithPrompt,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
