// ============================================================
// AI OS — Mock Responses & Simulation Data
// ============================================================

import { ModelOption, QuickAction, Conversation, Message } from './types';

// ── AI Model Options (mapped to free OpenRouter models) ──────
export const modelOptions: ModelOption[] = [
  {
    id: 'llama-3',
    name: 'Meta Llama 3 (8B)',
    provider: 'meta',
    description: 'Best general assistant',
    badge: 'Popular',
  },
  {
    id: 'gemma-2',
    name: 'Google Gemma 2 (9B)',
    provider: 'google',
    description: 'Excellent for conversations',
    badge: 'Chat',
  },
  {
    id: 'qwen-2',
    name: 'Qwen 2 (7B)',
    provider: 'meta',
    description: 'Great speed and multilingual support',
  },
  {
    id: 'phi-3',
    name: 'Microsoft Phi 3 Medium',
    provider: 'openai',
    description: 'Efficient reasoning',
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B Instruct',
    provider: 'openai',
    description: 'Fast responses',
  },
];

// ── Quick Actions for Welcome Screen ──────────────────────────
export const quickActions: QuickAction[] = [
  {
    id: 'write-code',
    title: 'Write Code',
    description: 'Generate code in any language with AI assistance',
    icon: 'Code',
    prompt: 'Help me write a ',
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  },
  {
    id: 'analyze-data',
    title: 'Analyze Data',
    description: 'Extract insights from datasets and create visualizations',
    icon: 'BarChart3',
    prompt: 'Analyze this data and provide insights: ',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  {
    id: 'generate-image',
    title: 'Generate Image',
    description: 'Create stunning images from text descriptions',
    icon: 'Image',
    prompt: 'Generate an image of ',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  },
  {
    id: 'draft-email',
    title: 'Draft Email',
    description: 'Compose professional emails and communications',
    icon: 'Mail',
    prompt: 'Draft a professional email about ',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
  },
  {
    id: 'research-topic',
    title: 'Research Topic',
    description: 'Deep dive into any subject with sourced research',
    icon: 'BookOpen',
    prompt: 'Research the topic of ',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  },
  {
    id: 'create-presentation',
    title: 'Create Presentation',
    description: 'Design professional slide decks and pitch materials',
    icon: 'Presentation',
    prompt: 'Create a presentation about ',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  },
];

// ── Mock Agent Responses ──────────────────────────────────────
const mockResponses: Record<string, { agentId: string; agentName: string; response: string }[]> = {
  code: [
    {
      agentId: 'code-gen',
      agentName: 'Code Generator',
      response: `Here's a React component for a responsive navigation bar:

\`\`\`tsx
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold">
              Logo
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 
                  transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
\`\`\`

This component includes:
- **Responsive design** with mobile hamburger menu
- **TypeScript** interfaces for type safety
- **Smooth transitions** on hover states
- **Accessibility** with semantic HTML elements

Want me to add dark mode support or a dropdown menu?`,
    },
  ],
  data: [
    {
      agentId: 'data-analysis',
      agentName: 'Data Analysis',
      response: `## Data Analysis Report

I've analyzed your dataset and found the following key insights:

### Key Metrics
| Metric | Value | Change |
|--------|-------|--------|
| Total Revenue | $2.4M | +18.5% |
| Active Users | 45,230 | +12.3% |
| Conversion Rate | 3.8% | +0.5% |
| Avg. Session | 4m 32s | -8.2% |

### Top Findings
1. **Revenue growth** is primarily driven by the Enterprise tier (+34% YoY)
2. **User engagement** peaks on Tuesdays and Wednesdays between 10am-2pm
3. **Churn risk** is highest for users who haven't logged in for 7+ days
4. **Mobile traffic** now accounts for 62% of total sessions

### Recommendations
- Implement re-engagement campaigns for inactive users
- Optimize mobile checkout flow (currently 40% drop-off)
- Consider A/B testing the pricing page layout

Would you like me to create visualizations for any of these metrics?`,
    },
  ],
  image: [
    {
      agentId: 'image-gen',
      agentName: 'Image Generator',
      response: `I'll generate that image for you. Here's what I'm creating:

**Prompt**: A futuristic cityscape at sunset with neon lights reflecting off glass buildings, cyberpunk aesthetic, volumetric lighting, 4K resolution

**Settings**:
- Model: DALL-E 3
- Style: Vivid
- Size: 1024x1024
- Quality: HD

🎨 *Generating image...*

The image has been generated successfully! Here's what I created:

A breathtaking cyberpunk city with towering glass skyscrapers reflecting vibrant sunset hues of orange and purple. Neon signs in blue and pink illuminate the streets below, with flying vehicles creating light trails across the sky. The atmospheric volumetric lighting creates a dreamy, cinematic quality.

Would you like me to create variations or edit any aspect of this image?`,
    },
  ],
  email: [
    {
      agentId: 'email',
      agentName: 'Email',
      response: `Here's a professional email draft:

---

**Subject:** Q3 Product Roadmap Review — Meeting Follow-up

Dear Team,

Thank you for the productive discussion during today's roadmap review. I wanted to summarize the key decisions and action items:

**Decisions Made:**
- ✅ Prioritize the new dashboard redesign for Sprint 14
- ✅ Defer the mobile app v2 to Q4
- ✅ Allocate 20% engineering time to tech debt reduction

**Action Items:**
| Owner | Task | Deadline |
|-------|------|----------|
| Sarah | Finalize design specs | July 28 |
| Mike | Set up staging environment | July 25 |
| Team | Sprint planning session | July 30 |

Please review and let me know if I've missed anything. The next sync is scheduled for **August 5 at 2pm EST**.

Best regards,
[Your Name]

---

Would you like me to adjust the tone, add recipients, or modify any section?`,
    },
  ],
  default: [
    {
      agentId: 'chat',
      agentName: 'Chat',
      response: `I'd be happy to help you with that! Let me break this down:

**Understanding your request:**
I've analyzed your question and here's my comprehensive response.

### Key Points

1. **Context Analysis** — I've reviewed the relevant information and identified the core elements of your query.

2. **Approach** — Based on my understanding, here's what I recommend:
   - Start with a clear problem definition
   - Break down the task into manageable steps
   - Iterate and refine based on feedback

3. **Next Steps** — I can help you:
   - Dive deeper into any specific aspect
   - Generate code, documents, or creative content
   - Connect with specialized agents for domain-specific tasks

The AI OS platform has **50 specialized agents** that I can coordinate to help with complex, multi-step tasks. Just let me know what you'd like to focus on!

*Is there a specific area you'd like me to elaborate on?*`,
    },
  ],
};

export function getMockResponse(input: string): { agentId: string; agentName: string; response: string } {
  const lower = input.toLowerCase();

  if (lower.includes('code') || lower.includes('function') || lower.includes('component') || lower.includes('write') || lower.includes('build')) {
    return mockResponses.code[0];
  }
  if (lower.includes('data') || lower.includes('analy') || lower.includes('chart') || lower.includes('metric')) {
    return mockResponses.data[0];
  }
  if (lower.includes('image') || lower.includes('picture') || lower.includes('photo') || lower.includes('generate')) {
    return mockResponses.image[0];
  }
  if (lower.includes('email') || lower.includes('draft') || lower.includes('mail') || lower.includes('message')) {
    return mockResponses.email[0];
  }

  return mockResponses.default[0];
}

// ── Sample Conversation History ───────────────────────────────
export const sampleConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'React Dashboard Component',
    messages: [],
    activeAgents: ['code-gen', 'debugging'],
    model: 'gpt-4o',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    isPinned: true,
  },
  {
    id: 'conv-2',
    title: 'Q3 Revenue Analysis',
    messages: [],
    activeAgents: ['data-analysis', 'visualization'],
    model: 'claude-4-sonnet',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: 'conv-3',
    title: 'Marketing Campaign Copy',
    messages: [],
    activeAgents: ['writing', 'marketing'],
    model: 'gpt-4o',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'conv-4',
    title: 'API Security Audit',
    messages: [],
    activeAgents: ['security', 'code-gen'],
    model: 'claude-4-opus',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isPinned: true,
  },
  {
    id: 'conv-5',
    title: 'Product Launch Email Sequence',
    messages: [],
    activeAgents: ['email', 'marketing'],
    model: 'gemini-2.5-pro',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
];
