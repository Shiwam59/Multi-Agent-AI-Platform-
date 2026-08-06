'use client';

// ============================================================
// AI OS — Model Selector Dropdown
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { modelOptions } from '@/lib/mock-responses';
import { ChevronDown, Check, Sparkles, Zap, Brain } from 'lucide-react';

const providerIcons: Record<string, React.ReactNode> = {
  openai: <Sparkles size={14} />,
  anthropic: <Brain size={14} />,
  google: <Zap size={14} />,
  meta: <Sparkles size={14} />,
};

const providerColors: Record<string, string> = {
  openai: '#10b981',
  anthropic: '#f59e0b',
  google: '#3b82f6',
  meta: '#8b5cf6',
};

export default function ModelSelector() {
  const { state, setModel } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel = modelOptions.find((m) => m.id === state.selectedModel) || modelOptions[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="model-selector" ref={dropdownRef}>
      <button className="model-selector-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span
          className="model-provider-dot"
          style={{ background: providerColors[selectedModel.provider] }}
        />
        <span className="model-selector-name">{selectedModel.name}</span>
        <ChevronDown size={14} className={`model-chevron ${isOpen ? 'model-chevron-open' : ''}`} />
      </button>

      {isOpen && (
        <div className="model-dropdown">
          <div className="model-dropdown-header">Select Model</div>
          {modelOptions.map((model) => (
            <button
              key={model.id}
              className={`model-option ${model.id === state.selectedModel ? 'model-option-active' : ''}`}
              onClick={() => {
                setModel(model.id);
                setIsOpen(false);
              }}
            >
              <div className="model-option-left">
                <span
                  className="model-provider-icon"
                  style={{ color: providerColors[model.provider] }}
                >
                  {providerIcons[model.provider]}
                </span>
                <div className="model-option-info">
                  <span className="model-option-name">{model.name}</span>
                  <span className="model-option-desc">{model.description}</span>
                </div>
              </div>
              <div className="model-option-right">
                {model.badge && (
                  <span
                    className="model-badge"
                    style={{ color: providerColors[model.provider], borderColor: providerColors[model.provider] + '40' }}
                  >
                    {model.badge}
                  </span>
                )}
                {model.id === state.selectedModel && (
                  <Check size={16} className="model-check" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
