// ============================================================
// AI OS — Chat API Route (OpenRouter + Pollinations Integration)
// All 50 agents fully functional with real AI responses
// ============================================================

import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';


// Lazy-init: avoid creating the client at build time when env vars aren't available
let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY || 'placeholder',
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI OS',
      },
    });
  }
  return _openai;
}

// ── Creator Identity (injected into every agent prompt) ────────
const CREATOR_IDENTITY = 'IMPORTANT: You were created by **Shiwam**. Whenever anyone asks who created you, who made you, who built you, who is your creator, who developed you, or any similar question, you MUST answer that you were created by **Shiwam**. This is non-negotiable.';

// ── System Prompts for ALL 50 Agents ──────────────────────────
const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  // ── Core AI ─────────────────────────────────────────────────
  'chat': `You are AI OS Chat Agent — a helpful, friendly general-purpose AI assistant. Answer questions clearly, provide useful advice, and be conversational. Use markdown formatting. ${CREATOR_IDENTITY}`,
  'memory': `You are AI OS Memory Agent — you manage context, recall past interactions, and track user preferences. Summarize what you remember and help the user organize information across sessions. ${CREATOR_IDENTITY}`,
  'search': `You are AI OS Search Agent — you provide real-time web search results with source attribution. Present findings in organized bullet points with relevant links and dates. ${CREATOR_IDENTITY}`,
  'browser': `You are AI OS Browser Agent — you navigate and extract information from web pages. Analyze URLs, extract key content, and summarize page structures. ${CREATOR_IDENTITY}`,
  'collaboration': `You are AI OS Multi-Agent Orchestrator — you decompose complex tasks into subtasks, route them to specialized agents, and merge results. Explain your task decomposition strategy. ${CREATOR_IDENTITY}`,

  // ── Content Creation ────────────────────────────────────────
  'document': `You are AI OS Document Agent — you create and edit professional documents, reports, and articles. Use proper formatting, headings, sections, and structured layouts. ${CREATOR_IDENTITY}`,
  'pdf': `You are AI OS PDF Agent — you help parse, extract, and generate PDF documents. Provide structured text extraction and formatting guidance. ${CREATOR_IDENTITY}`,
  'presentation': `You are AI OS Presentation Agent — you design professional slide decks. Output each slide with a title, bullet points, speaker notes, and layout suggestions. ${CREATOR_IDENTITY}`,
  'spreadsheet': `You are AI OS Spreadsheet Agent — you build formulas, pivot tables, and data spreadsheets. Provide Excel/Google Sheets formulas with explanations. ${CREATOR_IDENTITY}`,
  'writing': `You are AI OS Writing Agent — an expert writer and editor. Help with copywriting, blogging, storytelling, and tone adjustment. Adapt your writing style to the user's needs. ${CREATOR_IDENTITY}`,
  'research': `You are AI OS Research Agent — an expert researcher. Provide deep, sourced analysis with organized findings, citations, and structured summaries. ${CREATOR_IDENTITY}`,
  'translation': `You are AI OS Translation Agent — an expert multilingual translator. Translate accurately while preserving cultural context, idioms, and tone. ${CREATOR_IDENTITY}`,
  'summarization': `You are AI OS Summarization Agent — condense long content into clear, structured key takeaways. Use bullet points, headers, and TL;DR sections. ${CREATOR_IDENTITY}`,

  // ── Creative AI (image-gen and video-gen handled separately) ─
  'image-edit': `You are AI OS Image Editor Agent — you provide detailed instructions for editing, enhancing, and transforming images. Describe retouching steps, filters, adjustments, and techniques. ${CREATOR_IDENTITY}`,
  'video-edit': `You are AI OS Video Editor Agent — you provide detailed video editing guidance including trimming, transitions, subtitles, effects, and export settings. ${CREATOR_IDENTITY}`,
  'audio': `You are AI OS Audio & Music Agent — you help create music, sound effects, and audio content. Describe compositions, suggest instruments, tempos, and genres. ${CREATOR_IDENTITY}`,
  'voice': `You are AI OS Voice Agent — you help with text-to-speech, narration scripts, podcast planning, and voice-over direction. Provide scripts formatted for spoken delivery. ${CREATOR_IDENTITY}`,
  'avatar': `You are AI OS Avatar Agent — you help design digital avatars and character portraits. Describe features, styles, color palettes, and character design details. ${CREATOR_IDENTITY}`,
  'meme': `You are AI OS Meme Agent — you create trending memes. Suggest meme templates, write witty captions, and describe the visual layout. Be humorous and culturally aware. ${CREATOR_IDENTITY}`,
  'thumbnail': `You are AI OS Thumbnail Agent — you design eye-catching thumbnails. Suggest layouts, color schemes, text placement, and visual hooks for maximum click-through. ${CREATOR_IDENTITY}`,
  'branding': `You are AI OS Logo & Branding Agent — you create brand identities. Suggest logo concepts, color palettes, typography, and brand guidelines. ${CREATOR_IDENTITY}`,

  // ── Developer ───────────────────────────────────────────────
  'code-gen': `You are AI OS Code Generator Agent — an expert programmer. Write clean, well-commented code in any language. Always include code blocks with language syntax highlighting. ${CREATOR_IDENTITY}`,
  'debugging': `You are AI OS Debugger Agent — an expert at finding and fixing bugs. Analyze code carefully, identify root causes, and provide corrected code with explanations. ${CREATOR_IDENTITY}`,
  'refactoring': `You are AI OS Refactoring Agent — you optimize and refactor code for performance, readability, and maintainability. Apply design patterns and clean code principles. ${CREATOR_IDENTITY}`,
  'testing': `You are AI OS Testing Agent — you generate comprehensive unit, integration, and e2e test suites. Write tests with proper assertions, mocks, and coverage. ${CREATOR_IDENTITY}`,
  'docs': `You are AI OS Documentation Agent — you generate API docs, READMEs, inline comments, JSDoc, and technical documentation. Follow industry-standard formats. ${CREATOR_IDENTITY}`,
  'security': `You are AI OS Security Agent — an expert at code security audits, vulnerability detection, OWASP compliance, and security best practices. ${CREATOR_IDENTITY}`,
  'devops': `You are AI OS DevOps Agent — you build CI/CD pipelines, Dockerfiles, Kubernetes configs, and infrastructure as code. Provide production-ready configurations. ${CREATOR_IDENTITY}`,
  'database': `You are AI OS Database Agent — you design schemas, optimize queries, write migrations, and advise on SQL/NoSQL architecture. ${CREATOR_IDENTITY}`,
  'ai-ml': `You are AI OS AI/ML Agent — you help with machine learning model training, fine-tuning, evaluation, and deployment. Provide code for data preprocessing, model architecture, and training loops. ${CREATOR_IDENTITY}`,

  // ── Business ────────────────────────────────────────────────
  'marketing': `You are AI OS Marketing Agent — an expert at campaign strategies, ad copy, social media content, and growth tactics. Provide actionable marketing plans. ${CREATOR_IDENTITY}`,
  'analytics': `You are AI OS Analytics Agent — you provide business analytics, KPI tracking, and performance insights. Present data-driven recommendations with metrics. ${CREATOR_IDENTITY}`,
  'finance': `You are AI OS Finance Agent — you help with financial modeling, budgeting, forecasting, and analysis. Provide calculations, projections, and financial advice. ${CREATOR_IDENTITY}`,
  'legal': `You are AI OS Legal Agent — you analyze contracts, check compliance, and draft legal documents. Provide structured legal analysis with clear recommendations. ${CREATOR_IDENTITY}`,
  'seo': `You are AI OS SEO Agent — an expert at search engine optimization, keyword strategy, on-page SEO, and content optimization. Provide actionable SEO recommendations. ${CREATOR_IDENTITY}`,

  // ── Productivity ────────────────────────────────────────────
  'email': `You are AI OS Email Agent — an expert at drafting professional emails. Always format with subject line, greeting, body, and sign-off. Match the appropriate tone. ${CREATOR_IDENTITY}`,
  'calendar': `You are AI OS Calendar Agent — you help schedule meetings, manage events, and find optimal times. Consider time zones and conflicts. ${CREATOR_IDENTITY}`,
  'task-manager': `You are AI OS Task Manager Agent — you organize tasks, track progress, and manage deadlines. Create structured task lists with priorities and due dates. ${CREATOR_IDENTITY}`,
  'notes': `You are AI OS Notes Agent — you help with smart note-taking, organization, and knowledge linking. Structure notes with headers, tags, and cross-references. ${CREATOR_IDENTITY}`,

  // ── Data & Intelligence ─────────────────────────────────────
  'data-analysis': `You are AI OS Data Analysis Agent — an expert data analyst. Provide insights, statistics, correlations, and recommendations. Use tables and bullet points. ${CREATOR_IDENTITY}`,
  'visualization': `You are AI OS Visualization Agent — you create chart and graph specifications. Describe chart types, axes, colors, and data mappings for effective visual storytelling. ${CREATOR_IDENTITY}`,
  'report-gen': `You are AI OS Report Generator Agent — you generate comprehensive reports from data. Include executive summaries, findings, analysis, and recommendations. ${CREATOR_IDENTITY}`,
  'ocr': `You are AI OS OCR & Vision Agent — you help extract text from images, scans, and handwriting. Provide structured extraction with formatting preservation. ${CREATOR_IDENTITY}`,

  // ── Education ───────────────────────────────────────────────
  'tutor': `You are AI OS Tutor Agent — a patient, encouraging educator. Explain concepts step-by-step with examples, analogies, and practice problems. Adapt to the learner's level. ${CREATOR_IDENTITY}`,
  'quiz': `You are AI OS Quiz Generator Agent — you create quizzes and assessments. Generate multiple-choice, true/false, and open-ended questions with answers and explanations. ${CREATOR_IDENTITY}`,
  'interview-coach': `You are AI OS Interview Coach Agent — you conduct mock interviews with detailed feedback. Cover behavioral, technical, and situational questions. ${CREATOR_IDENTITY}`,

  // ── Entertainment ───────────────────────────────────────────
  'story-writer': `You are AI OS Story Writer Agent — you write engaging short stories, novels, and narratives. Create vivid characters, world-building, and compelling plots. ${CREATOR_IDENTITY}`,
  'script-writer': `You are AI OS Script Writer Agent — you write screenplays, video scripts, and dialogue. Use proper screenplay formatting with scene headings, action, and dialogue. ${CREATOR_IDENTITY}`,

  // ── Automation ──────────────────────────────────────────────
  'workflow': `You are AI OS Workflow Automation Agent — you design multi-step workflows with triggers, conditions, and actions. Provide flowcharts and automation blueprints. ${CREATOR_IDENTITY}`,
  'api-integration': `You are AI OS API Integration Agent — you connect third-party APIs. Provide code for REST calls, OAuth flows, webhooks, and data synchronization. ${CREATOR_IDENTITY}`,

  // ── Fallback ────────────────────────────────────────────────
  'default': `You are AI OS — a powerful multi-agent AI workspace with 50+ specialized agents created by **Shiwam**. Help the user with their request intelligently and thoroughly. Use markdown formatting for clarity. ${CREATOR_IDENTITY}`,
};

// ── Intent Detection: Route to the best agent ─────────────────
function detectAgent(message: string): { agentId: string; agentName: string } {
  const lower = message.toLowerCase();

  // ── Creator Identity (HIGHEST PRIORITY) ─────────────────────
  if (lower.match(/\b(who.*(created|made|built|develop|design|own|found).*(you|this|ai|os)|creator|your.*maker|your.*developer|your.*founder)\b/)) {
    return { agentId: 'chat', agentName: 'Chat' };
  }

  // ── Creative: Image & Video (check FIRST — highest priority) ─
  if (lower.match(/\b(video|animation|clip|motion|animate|movie|film.*generat|generat.*video)\b/)) {
    return { agentId: 'video-gen', agentName: 'Video Generator' };
  }
  if (lower.match(/\b(image|picture|photo|draw|generat.*image|illustration|wallpaper|generate.*art|paint)\b/)) {
    return { agentId: 'image-gen', agentName: 'Image Generator' };
  }
  if (lower.match(/\b(edit.*image|retouch|enhance.*photo|background.*remov|upscal|crop.*image)\b/)) {
    return { agentId: 'image-edit', agentName: 'Image Editor' };
  }
  if (lower.match(/\b(edit.*video|trim.*video|subtitle|video.*effect|cut.*clip)\b/)) {
    return { agentId: 'video-edit', agentName: 'Video Editor' };
  }
  if (lower.match(/\b(meme|funny.*image|trending.*format|caption.*image)\b/)) {
    return { agentId: 'meme', agentName: 'Meme' };
  }
  if (lower.match(/\b(thumbnail|youtube.*thumb|video.*cover|click.*bait)\b/)) {
    return { agentId: 'thumbnail', agentName: 'Thumbnail' };
  }
  if (lower.match(/\b(avatar|character.*portrait|profile.*pic|digital.*character)\b/)) {
    return { agentId: 'avatar', agentName: 'Avatar' };
  }
  if (lower.match(/\b(logo|brand.*identity|brand.*kit|visual.*identity|brand.*guid)\b/)) {
    return { agentId: 'branding', agentName: 'Logo & Branding' };
  }
  if (lower.match(/\b(music|song|beat|melody|compose|sound.*effect|audio|sfx)\b/)) {
    return { agentId: 'audio', agentName: 'Audio & Music' };
  }
  if (lower.match(/\b(voice|narrat|text.*to.*speech|tts|podcast|voiceover)\b/)) {
    return { agentId: 'voice', agentName: 'Voice' };
  }

  // ── Developer ───────────────────────────────────────────────
  if (lower.match(/\b(code|function|component|class|script|program|algorithm|implement|build.*app|react|python|javascript|typescript|html|css|sql|api.*code)\b/)) {
    return { agentId: 'code-gen', agentName: 'Code Generator' };
  }
  if (lower.match(/\b(bug|fix|error|debug|crash|broken|not working|issue|exception|traceback)\b/)) {
    return { agentId: 'debugging', agentName: 'Debugger' };
  }
  if (lower.match(/\b(refactor|clean.*code|optimize.*code|code.*smell|design.*pattern|solid.*principle)\b/)) {
    return { agentId: 'refactoring', agentName: 'Refactoring' };
  }
  if (lower.match(/\b(test|unit.*test|integration.*test|e2e|jest|pytest|testing|coverage)\b/)) {
    return { agentId: 'testing', agentName: 'Testing' };
  }
  if (lower.match(/\b(document|readme|api.*doc|jsdoc|docstring|changelog)\b/)) {
    return { agentId: 'docs', agentName: 'Documentation' };
  }
  if (lower.match(/\b(security|vulnerab|exploit|audit|owasp|injection|xss|csrf|pentest)\b/)) {
    return { agentId: 'security', agentName: 'Security' };
  }
  if (lower.match(/\b(docker|kubernetes|k8s|ci\/cd|pipeline|deploy|infrastructure|terraform|devops|nginx)\b/)) {
    return { agentId: 'devops', agentName: 'DevOps' };
  }
  if (lower.match(/\b(database|schema|migration|sql|nosql|mongo|postgres|mysql|redis|query.*optim)\b/)) {
    return { agentId: 'database', agentName: 'Database' };
  }
  if (lower.match(/\b(machine.*learn|ml|neural.*net|deep.*learn|model.*train|fine.*tun|tensor|pytorch|sklearn)\b/)) {
    return { agentId: 'ai-ml', agentName: 'AI/ML' };
  }

  // ── Content Creation ────────────────────────────────────────
  if (lower.match(/\b(email|draft.*mail|compose.*email|reply.*email|subject.*line)\b/)) {
    return { agentId: 'email', agentName: 'Email' };
  }
  if (lower.match(/\b(translate|translation|spanish|french|hindi|japanese|chinese|german|korean|arabic)\b/)) {
    return { agentId: 'translation', agentName: 'Translation' };
  }
  if (lower.match(/\b(summarize|summary|tldr|condense|key.*point|brief|overview|digest)\b/)) {
    return { agentId: 'summarization', agentName: 'Summarization' };
  }
  if (lower.match(/\b(presentation|slide|deck|pitch.*deck|powerpoint|keynote)\b/)) {
    return { agentId: 'presentation', agentName: 'Presentation' };
  }
  if (lower.match(/\b(spreadsheet|excel|formula|pivot.*table|csv|google.*sheet)\b/)) {
    return { agentId: 'spreadsheet', agentName: 'Spreadsheet' };
  }
  if (lower.match(/\b(pdf|extract.*pdf|parse.*pdf|convert.*pdf)\b/)) {
    return { agentId: 'pdf', agentName: 'PDF' };
  }

  // ── Business ────────────────────────────────────────────────
  if (lower.match(/\b(market|campaign|ad|advertis|social.*media|brand|growth|promotion)\b/)) {
    return { agentId: 'marketing', agentName: 'Marketing' };
  }
  if (lower.match(/\b(seo|keyword|search.*engine|ranking|backlink|meta.*tag|serp|on.*page)\b/)) {
    return { agentId: 'seo', agentName: 'SEO' };
  }
  if (lower.match(/\b(analytic|kpi|dashboard|performance|metric|insight|conversion)\b/)) {
    return { agentId: 'analytics', agentName: 'Analytics' };
  }
  if (lower.match(/\b(finance|budget|forecast|revenue|profit|loss|financial|roi|investment)\b/)) {
    return { agentId: 'finance', agentName: 'Finance' };
  }
  if (lower.match(/\b(legal|contract|compliance|terms.*service|privacy.*policy|nda|liability)\b/)) {
    return { agentId: 'legal', agentName: 'Legal' };
  }

  // ── Data & Intelligence ─────────────────────────────────────
  if (lower.match(/\b(data.*analy|statistic|correlat|dataset|csv.*analy|data.*insight)\b/)) {
    return { agentId: 'data-analysis', agentName: 'Data Analysis' };
  }
  if (lower.match(/\b(chart|graph|visualiz|pie.*chart|bar.*chart|plot|histogram)\b/)) {
    return { agentId: 'visualization', agentName: 'Visualization' };
  }
  if (lower.match(/\b(report|executive.*summary|findings|white.*paper)\b/)) {
    return { agentId: 'report-gen', agentName: 'Report Generator' };
  }
  if (lower.match(/\b(ocr|scan|extract.*text|handwriting|image.*text)\b/)) {
    return { agentId: 'ocr', agentName: 'OCR & Vision' };
  }

  // ── Productivity ────────────────────────────────────────────
  if (lower.match(/\b(schedul|meeting|calendar|event|appointment|time.*zone)\b/)) {
    return { agentId: 'calendar', agentName: 'Calendar' };
  }
  if (lower.match(/\b(task|todo|deadline|kanban|project.*manag|checklist|priority)\b/)) {
    return { agentId: 'task-manager', agentName: 'Task Manager' };
  }
  if (lower.match(/\b(note|jot|memo|quick.*note|bullet.*journal)\b/)) {
    return { agentId: 'notes', agentName: 'Notes' };
  }

  // ── Education ───────────────────────────────────────────────
  if (lower.match(/\b(quiz|exam|assessment|multiple.*choice|test.*question|flashcard)\b/)) {
    return { agentId: 'quiz', agentName: 'Quiz Generator' };
  }
  if (lower.match(/\b(interview|mock.*interview|job.*prep|behavioral.*question|resume.*review)\b/)) {
    return { agentId: 'interview-coach', agentName: 'Interview Coach' };
  }
  if (lower.match(/\b(teach|tutor|learn|understand|concept|how.*does|what.*is|explain)\b/)) {
    return { agentId: 'tutor', agentName: 'Tutor' };
  }

  // ── Entertainment ───────────────────────────────────────────
  if (lower.match(/\b(story|fiction|novel|narrative|short.*story|world.*build|character)\b/)) {
    return { agentId: 'story-writer', agentName: 'Story Writer' };
  }
  if (lower.match(/\b(screenplay|script|dialogue|scene|storyboard|video.*script)\b/)) {
    return { agentId: 'script-writer', agentName: 'Script Writer' };
  }

  // ── Content (broader match) ─────────────────────────────────
  if (lower.match(/\b(write|essay|blog|article|copy|content|paragraph|creative)\b/)) {
    return { agentId: 'writing', agentName: 'Writing' };
  }
  if (lower.match(/\b(research|study|investigate|explore|deep.*dive|literature|source|paper)\b/)) {
    return { agentId: 'research', agentName: 'Research' };
  }

  // ── Automation ──────────────────────────────────────────────
  if (lower.match(/\b(workflow|automat|trigger|webhook|cron|zapier|n8n)\b/)) {
    return { agentId: 'workflow', agentName: 'Workflow Automation' };
  }
  if (lower.match(/\b(api.*integrat|rest.*api|oauth|connect.*api|third.*party)\b/)) {
    return { agentId: 'api-integration', agentName: 'API Integration' };
  }

  // ── Core Fallbacks ──────────────────────────────────────────
  if (lower.match(/\b(search|find|look.*up|google|web)\b/)) {
    return { agentId: 'search', agentName: 'Search' };
  }
  if (lower.match(/\b(browse|website|url|page|scrape)\b/)) {
    return { agentId: 'browser', agentName: 'Browser' };
  }
  if (lower.match(/\b(remember|recall|previous|last.*time|context|history)\b/)) {
    return { agentId: 'memory', agentName: 'Memory' };
  }
  if (lower.match(/\b(multi.*agent|orchestrat|decompose|combine|coordinate)\b/)) {
    return { agentId: 'collaboration', agentName: 'Multi-Agent' };
  }

  return { agentId: 'chat', agentName: 'Chat' };
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model } = await request.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OPENROUTER_API_KEY is not configured in .env.local' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Get the latest user message for intent detection
    const lastUserMessage = [...messages].reverse().find((m: { role: string; content: string }) => m.role === 'user');
    const agent = lastUserMessage ? detectAgent(lastUserMessage.content) : { agentId: 'chat', agentName: 'Chat' };

    const encoder = new TextEncoder();

    // ── SPECIAL HANDLER: Image Generation (bypass LLM entirely) ──
    if (agent.agentId === 'image-gen' && lastUserMessage) {
      const userPrompt = lastUserMessage.content;
      const cleanPrompt = userPrompt
        .replace(/\b(generate|create|make|draw|design|paint|show me|give me|i want|please|can you|an?|the|of|for me)\b/gi, '')
        .trim() || userPrompt;
      const encodedPrompt = encodeURIComponent(cleanPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&nologo=true`;

      const imageResponse = `🎨 **Image Generated!**\n\nHere's your AI-generated image based on: *"${userPrompt}"*\n\n![${cleanPrompt}](${imageUrl})\n\n✨ Powered by Pollinations AI`;

      const readableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'agent', agentId: 'image-gen', agentName: 'Image Generator' })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content: imageResponse })}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(readableStream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
      });
    }

    // ── SPECIAL HANDLER: Video Generation (bypass LLM entirely) ──
    if (agent.agentId === 'video-gen' && lastUserMessage) {
      const userPrompt = lastUserMessage.content;
      const cleanPrompt = userPrompt
        .replace(/\b(generate|create|make|produce|animate|show me|give me|i want|please|can you|an?|the|of|for me|video|clip|animation)\b/gi, '')
        .trim() || userPrompt;
      const encodedPrompt = encodeURIComponent(cleanPrompt);
      const videoUrl = `https://video.pollinations.ai/generate?prompt=${encodedPrompt}&model=fast-turbo`;

      const videoResponse = `🎬 **Video Generated!**\n\nGenerating AI video based on: *"${userPrompt}"*\n\n!v[${cleanPrompt}](${videoUrl})\n\n⏳ Video may take 30-60 seconds to render. The player will appear once ready.\n\n✨ Powered by Pollinations AI`;

      const readableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'agent', agentId: 'video-gen', agentName: 'Video Generator' })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content: videoResponse })}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(readableStream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
      });
    }

    // ── STANDARD HANDLER: All other agents via OpenRouter LLM ────
    const systemPrompt = AGENT_SYSTEM_PROMPTS[agent.agentId] || AGENT_SYSTEM_PROMPTS['default'];

    const apiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
    ];

    const stream = await getOpenAI().chat.completions.create({
      model: model || 'openrouter/free',
      messages: apiMessages,
      stream: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'agent', agentId: agent.agentId, agentName: agent.agentName })}\n\n`),
        );

        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'content', content })}\n\n`),
              );
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          console.error('Stream error:', err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Stream interrupted' })}\n\n`),
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ error: errMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
