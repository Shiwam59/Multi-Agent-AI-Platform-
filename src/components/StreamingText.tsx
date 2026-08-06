'use client';

// ============================================================
// AI OS — Streaming Text (Typewriter Effect)
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { Loader2, Film } from 'lucide-react';

interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
}

export default function StreamingText({ content, isStreaming }: StreamingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Auto-scroll parent when content updates
      const parent = containerRef.current.closest('.chat-messages');
      if (parent) {
        parent.scrollTop = parent.scrollHeight;
      }
    }
  }, [content]);

  // Parse content to separate text and code blocks
  const parts = parseContent(content);

  return (
    <div ref={containerRef} className="streaming-text">
      {parts.map((part, i) => {
        if (part.type === 'code') {
          return (
            <div key={i} className="code-block-wrapper">
              <div className="code-block-header">
                <span className="code-lang">{part.language}</span>
                <button
                  className="code-copy-btn"
                  onClick={() => navigator.clipboard.writeText(part.content)}
                >
                  Copy
                </button>
              </div>
              <pre className="code-block">
                <code>{part.content}</code>
              </pre>
            </div>
          );
        }

        if (part.type === 'table') {
          return <div key={i} className="table-wrapper" dangerouslySetInnerHTML={{ __html: renderTable(part.content) }} />;
        }

        return (
          <span key={i} className="text-content">
            {renderInlineMarkdown(part.content)}
          </span>
        );
      })}
      {isStreaming && <span className="streaming-cursor" />}
    </div>
  );
}

// ── Markdown Parsing Helpers ──────────────────────────────────

interface ContentPart {
  type: 'text' | 'code' | 'table';
  content: string;
  language?: string;
}

function parseContent(text: string): ContentPart[] {
  const parts: ContentPart[] = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Text before code block
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index);
      parts.push(...parseTextForTables(textBefore));
    }

    // Code block
    parts.push({
      type: 'code',
      language: match[1] || 'text',
      content: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    parts.push(...parseTextForTables(remaining));
  }

  if (parts.length === 0) {
    parts.push({ type: 'text', content: text });
  }

  return parts;
}

function parseTextForTables(text: string): ContentPart[] {
  const parts: ContentPart[] = [];
  const tableRegex = /(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)+)/g;
  let lastIndex = 0;
  let match;

  while ((match = tableRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'table', content: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts;
}

function renderTable(tableText: string): string {
  const rows = tableText.trim().split('\n');
  if (rows.length < 2) return '';

  const headers = rows[0].split('|').filter(c => c.trim()).map(c => c.trim());
  const dataRows = rows.slice(2); // skip header and separator

  let html = '<table class="md-table"><thead><tr>';
  headers.forEach(h => { html += `<th>${h}</th>`; });
  html += '</tr></thead><tbody>';

  dataRows.forEach(row => {
    const cells = row.split('|').filter(c => c.trim()).map(c => c.trim());
    html += '<tr>';
    cells.forEach(c => { html += `<td>${c}</td>`; });
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Split by lines for block-level elements
  const lines = text.split('\n');

  lines.forEach((line, lineIdx) => {
    // Headings
    const h3Match = line.match(/^### (.+)/);
    const h2Match = line.match(/^## (.+)/);
    const h1Match = line.match(/^# (.+)/);

    if (h1Match) {
      nodes.push(<h3 key={`h1-${lineIdx}`} className="md-h1">{renderInline(h1Match[1])}</h3>);
      return;
    }
    if (h2Match) {
      nodes.push(<h4 key={`h2-${lineIdx}`} className="md-h2">{renderInline(h2Match[1])}</h4>);
      return;
    }
    if (h3Match) {
      nodes.push(<h5 key={`h3-${lineIdx}`} className="md-h3">{renderInline(h3Match[1])}</h5>);
      return;
    }

    // Horizontal rules
    if (line.match(/^---$/)) {
      nodes.push(<hr key={`hr-${lineIdx}`} className="md-hr" />);
      return;
    }

    // List items
    const ulMatch = line.match(/^[-*] (.+)/);
    const olMatch = line.match(/^(\d+)\. (.+)/);

    if (ulMatch) {
      nodes.push(
        <div key={`li-${lineIdx}`} className="md-li">
          <span className="md-bullet">•</span>
          <span>{renderInline(ulMatch[1])}</span>
        </div>
      );
      return;
    }
    if (olMatch) {
      nodes.push(
        <div key={`li-${lineIdx}`} className="md-li">
          <span className="md-bullet">{olMatch[1]}.</span>
          <span>{renderInline(olMatch[2])}</span>
        </div>
      );
      return;
    }

    // Regular text
    if (line.trim()) {
      nodes.push(
        <span key={`p-${lineIdx}`} className="md-line">
          {renderInline(line)}
        </span>
      );
    } else {
      nodes.push(<br key={`br-${lineIdx}`} />);
    }
  });

  return nodes;
}

// ── Video Generation Player Component ────────────────────────
function VideoPlayerCard({ src, caption }: { src: string; caption: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Attempt to preload/verify the video URL is fully ready
    const checkVideo = async () => {
      try {
        // Poll pollination's endpoint to see if it redirects/is ready
        const res = await fetch(src, { method: 'HEAD' });
        if (res.ok) {
          setLoading(false);
          setError(false);
        } else {
          throw new Error('Not ready yet');
        }
      } catch (err) {
        if (retryCount < 12) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 5000);
        } else {
          setLoading(false);
          setError(true);
        }
      }
    };

    checkVideo();
  }, [src, retryCount]);

  return (
    <span className="chat-video-wrapper">
      {loading ? (
        <span className="video-loader-overlay">
          <Loader2 className="animate-spin video-spinner" size={24} />
          <Film className="video-icon-pulse" size={16} />
          <span className="video-loader-text">
            <span>Generating video frames...</span>
            <span className="video-timer">Est: {Math.max(0, 60 - retryCount * 5)}s remaining</span>
          </span>
        </span>
      ) : error ? (
        <span className="video-error-overlay">
          <span>⚠️ Video Generation Timeout</span>
          <span className="video-error-sub">The prompt might be too complex. Try again later.</span>
        </span>
      ) : (
        <video
          src={src}
          controls
          className="chat-generated-video"
          preload="auto"
        />
      )}
      <span className="chat-video-caption">{caption || "AI Generated Video"}</span>
    </span>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Process videos first, then images, bold, italic, inline code, and links
  const regex = /(\!v\[(.*?)\]\((.*?)\))|(\!\[(.*?)\]\((.*?)\))|(\*\*(.*?)\*\*)|(\*(.*?)\*)|(`(.*?)`)|(\[(.*?)\]\((.*?)\))/g;
  let lastIndex = 0;
  let match;

  const str = text;
  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(str.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // Video
      nodes.push(
        <VideoPlayerCard 
          key={`vid-${match.index}`} 
          src={match[3]} 
          caption={match[2]} 
        />
      );
    } else if (match[4]) {
      // Image
      nodes.push(
        <span key={`img-wrapper-${match.index}`} className="chat-image-wrapper">
          <img
            src={match[6]}
            alt={match[5] || "Generated Asset"}
            className="chat-generated-image"
            loading="lazy"
          />
          <span className="chat-image-caption">{match[5] || "AI Generated"}</span>
        </span>
      );
    } else if (match[7]) {
      // Bold
      nodes.push(<strong key={`b-${match.index}`}>{match[8]}</strong>);
    } else if (match[9]) {
      // Italic
      nodes.push(<em key={`i-${match.index}`}>{match[10]}</em>);
    } else if (match[11]) {
      // Inline code
      nodes.push(<code key={`c-${match.index}`} className="inline-code">{match[12]}</code>);
    } else if (match[13]) {
      // Link
      nodes.push(
        <a key={`a-${match.index}`} href={match[15]} className="md-link" target="_blank" rel="noopener noreferrer">
          {match[14]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < str.length) {
    nodes.push(str.slice(lastIndex));
  }

  return nodes;
}
