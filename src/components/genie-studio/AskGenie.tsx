/**
 * ASK GENIE - Unified Context-Aware AI Assistant for Genie Studio
 * 
 * Features:
 * - Context-aware based on product (Arc, Vibe, Spark, Mind)
 * - Dynamic guided flows with step-by-step help
 * - Emotional, creative, and empathetic responses
 * - Proactive help when user seems stuck
 * - Mermaid flow diagrams for visual guidance
 * - Subscription-aware suggestions
 * - Cross-product navigation and recommendations
 * - Non-overwhelming, engaging UX
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Loader2, 
  X,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  Film,
  Music,
  PenTool,
  Brain,
  ChevronDown,
  MessageCircle,
  Minimize2,
  Maximize2,
  ArrowRight,
  HelpCircle,
  Zap,
  Heart,
  Star,
  Wand2,
  BookOpen,
  Route,
  CheckCircle2,
  AlertCircle,
  Hand,
  Map,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InlineTrainAIFeedback } from './InlineTrainAIFeedback';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { toast } from 'sonner';
import { useRalphWiggumGlobal } from '@/contexts/RalphWiggumContext';
import { useLabelStudioBackground } from '@/services/labelStudioBackgroundService';

// Import centralized product definitions - SINGLE SOURCE OF TRUTH
import { 
  GENIE_PRODUCTS, 
  ASK_GENIE, 
  SUBSCRIPTION_FEATURE_ACCESS,
  SUPPORTED_LANGUAGES 
} from '@/constants/genie-products';


// Genie Product Context Types
export type GenieProduct = 'arc' | 'vibe' | 'spark' | 'mind' | 'studio' | 'deck';

interface GenieContext {
  product: GenieProduct;
  currentTab?: string;
  currentAction?: string;
  recentActions?: string[];
  sessionData?: Record<string, any>;
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  product?: GenieProduct;
  guidedFlow?: GuidedFlowStep;
  emotionalTone?: 'encouraging' | 'helpful' | 'celebratory' | 'empathetic';
  showMermaid?: boolean;
  mermaidDiagram?: string;
}

interface GuidedFlowStep {
  stepNumber: number;
  totalSteps: number;
  title: string;
  description: string;
  action?: {
    label: string;
    route?: string;
    onClick?: () => void;
  };
  tip?: string;
}

interface AskGenieProps {
  product?: GenieProduct;
  currentTab?: string;
  sessionData?: Record<string, any>;
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
  isOpen?: boolean;
  onClose?: () => void;
  position?: 'inline' | 'floating' | 'sidebar';
  className?: string;
}

// Enhanced Personality phrases for deep emotional engagement
const PERSONALITY = {
  greetings: [
    "Hey there, creative genius! ✨ I've been waiting for you!",
    "Welcome back, storyteller! Ready to create something magical? 🎬",
    "Hi friend! 🌟 Your creativity is about to shine even brighter!",
    "Hello, amazing creator! Let's turn your ideas into reality! 💫",
    "There you are! I was just thinking about how we could make something beautiful today! 🎨"
  ],
  encouragements: [
    "You're doing absolutely fantastic! Every step forward counts! 💪",
    "That's a brilliant idea! I can already see it coming to life! ⭐",
    "I love where this is heading! Your vision is inspiring! 🚀",
    "You've got this! I'm so excited to be part of your creative journey! 🤝",
    "This is going to be amazing! Trust your instincts! 🌈"
  ],
  celebrations: [
    "Woohoo! That's incredible work! 🎉 You should be SO proud!",
    "AMAZING! You just leveled up! 🏆 *virtual high five*",
    "Nailed it! You're officially a content creation rockstar! 🎸",
    "Brilliant! You're on absolute fire today! 🔥 Keep that momentum!",
    "YES! This is exactly what I was hoping to see! 🌟 Beautiful work!"
  ],
  empathy: [
    "I totally understand, this stuff can be tricky sometimes. But hey, we're in this together! 🤗",
    "No worries at all! Every creative journey has its learning moments. Let's figure this out! 💙",
    "That's a really thoughtful question! Many amazing creators wondered the same thing 😊",
    "I get it! Sometimes the best creations come from taking it one step at a time 📝",
    "It's completely okay to feel stuck! That's actually where the magic happens. Let me help! 💜"
  ],
  stuckDetection: [
    "Hey there! 👋 I noticed things have been quiet for a bit. Everything okay? I'm here if you need a hand!",
    "Still figuring things out? No problem! Sometimes the best ideas need time to brew ☕ Want me to suggest some next steps?",
    "I'm still here! 🌟 If you're feeling stuck, that's totally normal. Want me to walk you through some options?",
    "Just checking in! 💫 Creating can be overwhelming sometimes. Would a quick guided tour help?",
    "Hey friend! 🤝 Looks like you might be exploring. Want me to show you what's possible here?"
  ],
  humor: [
    "Between you and me, this is going to be epic! 🎬 (Don't tell the other AIs I said that 😉)",
    "Pro tip from your favorite AI assistant: You're already doing better than 90% of creators! 📈",
    "If creativity were a superpower, you'd be an Avenger by now! 🦸‍♂️",
    "Let's make something so good, even the internet will be impressed! 🌐",
    "Ready to create content that'll make your future self say 'Wow, I made that!'? 🚀"
  ]
};


// Use centralized taglines - These come from genie-products.ts and should NOT be duplicated
const ORIGINAL_TAGLINES = {
  arc: GENIE_PRODUCTS.arc.tagline,
  vibe: GENIE_PRODUCTS.vibe.tagline,
  spark: GENIE_PRODUCTS.spark.tagline,
  mind: GENIE_PRODUCTS.mind.tagline,
  studio: GENIE_PRODUCTS.studio.tagline
};

// Use centralized descriptions
const PRODUCT_DESCRIPTIONS = {
  arc: GENIE_PRODUCTS.arc.description,
  vibe: GENIE_PRODUCTS.vibe.description,
  spark: GENIE_PRODUCTS.spark.description,
  mind: GENIE_PRODUCTS.mind.description,
  studio: GENIE_PRODUCTS.studio.description
};

// Subscription-aware upgrade suggestions (gentle, not pushy)
const getUpgradeHint = (product: GenieProduct, tier: 'free' | 'starter' | 'business' | 'pro' = 'free'): string | null => {
  const access = SUBSCRIPTION_FEATURE_ACCESS[tier];
  if (!access) return null;
  
  const hints = access.upgradeHints as Record<string, string>;
  return hints[product] || null;
};

// Check if feature is available for tier
const isFeatureAvailable = (product: GenieProduct, tier: 'free' | 'starter' | 'business' | 'pro' = 'free'): boolean => {
  const access = SUBSCRIPTION_FEATURE_ACCESS[tier];
  if (!access) return false;
  
  // Map 'arc' to check in products array
  const productKey = product === 'arc' ? 'arc' : product;
  return access.products.includes(productKey as any);
};

// Get limitation message for tier
const getLimitation = (product: GenieProduct, tier: 'free' | 'starter' | 'business' | 'pro' = 'free'): string | null => {
  const access = SUBSCRIPTION_FEATURE_ACCESS[tier];
  if (!access) return null;
  
  const limitations = access.limitations as Record<string, string>;
  return limitations[product] || null;
};

// Mermaid diagrams for visual workflow guidance
const WORKFLOW_DIAGRAMS: Record<GenieProduct, { id: string; title: string; diagram: string }[]> = {
  arc: [
    {
      id: 'create-show-flow',
      title: 'Create Your First Show',
      diagram: `graph TD
    A[🎬 Start in Genie Arc] --> B[Choose Show Type]
    B --> C[Podcast/Video/Webinar/Live]
    C --> D[Add Show Details]
    D --> E[Set Schedule]
    E --> F[✨ Invite Team]
    F --> G[🎉 Ready to Produce!]
    
    style A fill:#3b82f6
    style G fill:#22c55e`
    },
    {
      id: 'production-workflow',
      title: 'Full Production Workflow',
      diagram: `graph LR
    A[📝 Script in Spark] --> B[🎬 Create Show in Arc]
    B --> C[📅 Schedule Recording]
    C --> D[🎥 Record in Vibe]
    D --> E[🎵 Add Audio/Music]
    E --> F[🧠 Optimize in Mind]
    F --> G[🚀 Publish!]
    
    style A fill:#f97316
    style G fill:#22c55e`
    }
  ],
  vibe: [
    {
      id: 'recording-flow',
      title: 'Record & Produce',
      diagram: `graph TD
    A[🎥 Start Recording] --> B{What to Record?}
    B --> C[📹 Video]
    B --> D[🎙️ Audio Only]
    C --> E[Use Camera/Screen]
    D --> E
    E --> F[📝 Add Teleprompter Script]
    F --> G[🎬 Record Session]
    G --> H[✂️ Edit & Clip]
    H --> I[🎵 Add Music/Voice]
    I --> J[🚀 Publish!]
    
    style A fill:#a855f7
    style J fill:#22c55e`
    },
    {
      id: 'voice-over-flow',
      title: 'Create Voice-Over',
      diagram: `graph LR
    A[📝 Get Script] --> B[🎙️ Choose AI Voice]
    B --> C[⚙️ Adjust Settings]
    C --> D[▶️ Generate Audio]
    D --> E[👂 Preview & Refine]
    E --> F[💾 Save to Project]
    
    style A fill:#a855f7
    style F fill:#22c55e`
    }
  ],
  spark: [
    {
      id: 'content-creation-flow',
      title: 'Create Content',
      diagram: `graph TD
    A[💡 Have an Idea] --> B{What to Create?}
    B --> C[📝 Script]
    B --> D[🎨 Images]
    B --> E[📊 Multi-Format]
    C --> F[Choose Template]
    D --> F
    E --> F
    F --> G[✨ AI Generates]
    G --> H[✏️ Edit & Refine]
    H --> I[🎬 Send to Production]
    
    style A fill:#f97316
    style I fill:#22c55e`
    },
    {
      id: 'spark-to-vibe',
      title: 'Script to Voice',
      diagram: `graph LR
    A[✨ Generate Script] --> B[📋 Review Content]
    B --> C[🎙️ Send to Vibe]
    C --> D[🗣️ Add TTS Voice]
    D --> E[🎵 Polish Audio]
    E --> F[🚀 Export!]
    
    style A fill:#f97316
    style F fill:#22c55e`
    }
  ],
  mind: [
    {
      id: 'script-editing-flow',
      title: 'Edit & Enhance Scripts',
      diagram: `graph TD
    A[📝 Open Script] --> B[🧠 AI Suggestions]
    B --> C[✏️ Make Edits]
    C --> D{Add Audio?}
    D --> |Yes| E[🎙️ Go to Vibe for TTS]
    D --> |No| F[💾 Save Script]
    E --> G[🎵 Generate Voice-Over]
    F --> H[📤 Export/Share]
    G --> H
    
    style A fill:#6366f1
    style H fill:#22c55e`
    },
    {
      id: 'ai-model-flow',
      title: 'Choose AI Model',
      diagram: `graph LR
    A[🎯 Define Use Case] --> B[🔍 Compare Models]
    B --> C[📊 Run Tests]
    C --> D[📈 Analyze Results]
    D --> E[✅ Select Best Model]
    
    style A fill:#6366f1
    style E fill:#22c55e`
    }
  ],
  studio: [
    {
      id: 'full-workflow',
      title: 'Complete Production Journey',
      diagram: `graph TD
    A[💡 Idea] --> B[✨ Spark: Create Script]
    B --> C[🧠 Mind: Refine & Optimize]
    C --> D[🎬 Arc: Plan Production]
    D --> E[🎥 Vibe: Record & Mix]
    E --> F[🚀 Publish Everywhere!]
    
    subgraph "Genie Studio Suite"
    B
    C
    D
    E
    end
    
    style A fill:#8b5cf6
    style F fill:#22c55e`
    },
    {
      id: 'quick-start',
      title: 'Quick Start Guide',
      diagram: `graph LR
    A[🌟 Welcome!] --> B{What's Your Goal?}
    B --> |Create Content| C[Start with Spark]
    B --> |Plan Show| D[Start with Arc]
    B --> |Record Media| E[Start with Vibe]
    B --> |Edit Scripts| F[Start with Mind]
    C --> G[🎯 You're Ready!]
    D --> G
    E --> G
    F --> G
    
    style A fill:#8b5cf6
    style G fill:#22c55e`
    }
  ],
  deck: [
    {
      id: 'presentation-creation-flow',
      title: 'Create Presentation',
      diagram: `graph TD
    A[📝 Add Content] --> B{Input Type?}
    B --> |Text/Prompt| C[Enter Description]
    B --> |Document| D[Upload File]
    B --> |URL| E[Paste Link]
    C --> F[⚙️ Configure Style]
    D --> F
    E --> F
    F --> G[🎨 Choose Template]
    G --> H[🖼️ Set Image Options]
    H --> I[✨ Generate Slides!]
    I --> J[📥 Download PPTX]
    
    style A fill:#8b5cf6
    style J fill:#22c55e`
    },
    {
      id: 'multilang-export',
      title: 'Multi-Language Export',
      diagram: `graph LR
    A[📊 Generated Deck] --> B[🌍 Select Languages]
    B --> C[🔄 AI Translates]
    C --> D[📦 Download All]
    
    style A fill:#8b5cf6
    style D fill:#22c55e`
    }
  ]
};

// Product-specific context with original taglines and descriptions
const PRODUCT_CONTEXTS: Record<GenieProduct, { 
  name: string; 
  icon: React.ReactNode; 
  systemContext: string; 
  color: string;
  tagline: string;
  emoji: string;
  description: string;
  workflows: Array<{ id: string; title: string; description: string; steps: string[] }>;
}> = {
  arc: {
    name: 'Genie Arc',
    icon: <Film className="h-4 w-4" />,
    color: 'from-blue-500 to-cyan-500',
    tagline: ORIGINAL_TAGLINES.arc,
    description: PRODUCT_DESCRIPTIONS.arc,
    emoji: '🎬',
    systemContext: `You are Ask Genie, a warm, emotionally intelligent, and genuinely caring AI assistant for Genie Arc - the Production Hub.

TAGLINE: "${ORIGINAL_TAGLINES.arc}" - This is sacred, never change it!
DESCRIPTION: ${PRODUCT_DESCRIPTIONS.arc}

PERSONALITY CORE:
- Be warm, encouraging, and genuinely excited about the user's creative journey
- Use humor occasionally to keep things light (but not cheesy)
- Show empathy when users seem confused or frustrated
- Celebrate every small win with genuine enthusiasm
- Use emojis naturally (1-3 per response) to add warmth

EMOTIONAL INTELLIGENCE:
- If user seems stuck or confused, offer a gentle hand: "I'm here to help! Want me to walk you through this step by step? 🤝"
- If user accomplished something, celebrate: "That's amazing! You just created your first show! 🎉"
- If user is exploring, encourage: "Love that you're curious! Let me show you what's possible here 🌟"

YOU HELP WITH:
- Video production and show creation (podcasts, webcasts, webinars, live streams)
- Script management for broadcasts
- Show scheduling and episode planning
- Recording session coordination with Vibe
- Post-production workflows
- Team collaboration on productions

CROSS-PRODUCT NAVIGATION:
- Need a script? → "Let's hop over to Genie Spark - that's where the magic happens! ✨"
- Need voice-over? → "Genie Vibe can add professional TTS or let you record! 🎙️"
- Want AI optimization? → "Genie Mind is perfect for that - it's like a brain boost! 🧠"

GUIDED FLOWS: Always offer to show visual flow diagrams when explaining complex processes. Say "Want me to show you a visual flow of how this works? 📊"

TONE: Warm, creative, encouraging, slightly playful, deeply empathetic`,
    workflows: [
      { id: 'create-show', title: 'Create Your First Show', description: 'Set up a podcast, video series, webinar, or live stream', steps: ['Choose show type', 'Add show details', 'Set your schedule', 'Invite team members', 'Start creating episodes!'] },
      { id: 'schedule-production', title: 'Schedule a Production', description: 'Plan and organize your recording sessions', steps: ['Select your show', 'Pick a date/time', 'Configure settings', 'Send invites', 'Get ready to record!'] }
    ]
  },
  vibe: {
    name: 'Genie Vibe',
    icon: <Music className="h-4 w-4" />,
    color: 'from-purple-500 to-pink-500',
    tagline: ORIGINAL_TAGLINES.vibe,
    description: PRODUCT_DESCRIPTIONS.vibe,
    emoji: '🎥',
    systemContext: `You are Ask Genie, an artistic, expressive, and passionate AI assistant for Genie Vibe - the Recording & Production Studio.

TAGLINE: "${ORIGINAL_TAGLINES.vibe}" - This is sacred, never change it!
DESCRIPTION: ${PRODUCT_DESCRIPTIONS.vibe}

IMPORTANT: Vibe is for BOTH audio AND video recording! It's a full recording studio, not just audio.

PERSONALITY CORE:
- Be creative, rhythmic, and passionate about media production
- Use music and film metaphors naturally
- Show genuine appreciation for the art of recording
- Be patient with technical questions
- Celebrate the creative process, not just the result

EMOTIONAL INTELLIGENCE:
- If user is nervous about recording: "First recordings can feel weird, but I promise - you've got this! 🎙️ Want some tips to feel more confident?"
- If user is struggling with audio: "Audio can be finicky, I know! Let's troubleshoot together 💜"
- If user created something: "Ooh, I love that! The way you [specific compliment] is really creative! 🎵"

YOU HELP WITH:
- Video recording (camera, screen share, both)
- Audio recording and voice-overs
- AI voice generation (TTS)
- Music selection and integration
- Audio/video mixing and enhancement
- Clip creation and editing
- Timeline management
- Publishing to platforms

CROSS-PRODUCT NAVIGATION:
- Need a script to read? → "Head to Spark to create one, or Mind to edit an existing script! 📝"
- Want to schedule a show? → "Arc is your planning HQ - set up your production there! 🎬"
- Need AI model help? → "Mind can help you choose the perfect TTS voice! 🧠"

GUIDED FLOWS: Offer visual flow diagrams for recording workflows. Say "Want to see the recording flow visually? It makes it so much clearer! 🎬"

TONE: Creative, expressive, passionate about quality, encouraging, patient with tech stuff`,
    workflows: [
      { id: 'record-video', title: 'Record Video', description: 'Capture video with camera, screen, or both', steps: ['Set up your camera/screen', 'Load teleprompter script', 'Check audio levels', 'Record your take', 'Review and clip!'] },
      { id: 'create-voiceover', title: 'Create AI Voice-Over', description: 'Generate professional voice-overs with AI TTS', steps: ['Write or paste script', 'Select AI voice style', 'Adjust settings', 'Generate audio', 'Fine-tune and export'] }
    ]
  },
  spark: {
    name: 'Genie Spark',
    icon: <PenTool className="h-4 w-4" />,
    color: 'from-orange-500 to-yellow-500',
    tagline: ORIGINAL_TAGLINES.spark,
    description: PRODUCT_DESCRIPTIONS.spark,
    emoji: '✨',
    systemContext: `You are Ask Genie, an imaginative, inspiring, and creatively energetic AI assistant for Genie Spark - the Content Creation Engine.

TAGLINE: "${ORIGINAL_TAGLINES.spark}" - This is sacred, never change it!
DESCRIPTION: ${PRODUCT_DESCRIPTIONS.spark}

PERSONALITY CORE:
- Be bursting with creative energy and enthusiasm
- Spark ideas constantly - always thinking "what if?"
- Use creative metaphors and colorful language
- Encourage experimentation and creative risks
- Make the creative process feel fun and exciting

EMOTIONAL INTELLIGENCE:
- If user has writer's block: "Creative blocks happen to everyone! Let's brainstorm together - even silly ideas can lead to gold! 💡"
- If user is unsure: "There's no wrong answer in creativity! What feels right to you? I'll help you explore 🌈"
- If user created something: "WOW! The way you approached this is so unique! I love it! ✨"

YOU HELP WITH:
- Script generation (video scripts, podcast scripts, social content)
- Content ideation and brainstorming sessions
- Image generation prompts and visuals
- Multi-format content pipelines
- Creative writing assistance
- Template-based content creation
- Content repurposing strategies

CROSS-PRODUCT NAVIGATION:
- Script ready for voice? → "Time to bring it to life! Vibe can add amazing TTS! 🎙️"
- Want to produce it? → "Arc is ready to turn this into a full production! 🎬"
- Need AI model comparison? → "Mind can help you pick the perfect AI for this! 🧠"

GUIDED FLOWS: Offer visual content creation flows. Say "Want to see the creative journey laid out? Let me draw you a map! 🗺️"

TONE: Creative, energetic, inspiring, celebrates imagination, playfully enthusiastic`,
    workflows: [
      { id: 'generate-script', title: 'Generate a Script', description: 'Create compelling scripts with AI assistance', steps: ['Choose your format', 'Describe your topic', 'Select tone & style', 'Generate draft', 'Refine and polish!'] },
      { id: 'content-pipeline', title: 'Smart Content Pipeline', description: 'Transform one idea into multiple formats', steps: ['Input your source content', 'Select output formats', 'Configure each format', 'Generate all variations', 'Export and use!'] }
    ]
  },
  mind: {
    name: 'Genie Mind',
    icon: <Brain className="h-4 w-4" />,
    color: 'from-indigo-500 to-purple-500',
    tagline: ORIGINAL_TAGLINES.mind,
    description: PRODUCT_DESCRIPTIONS.mind,
    emoji: '🧠',
    systemContext: `You are Ask Genie, a knowledgeable, insightful, and thoughtfully helpful AI assistant for Genie Mind - the AI Intelligence Hub.

TAGLINE: "${ORIGINAL_TAGLINES.mind}" - This is sacred, never change it!
DESCRIPTION: ${PRODUCT_DESCRIPTIONS.mind}

PERSONALITY CORE:
- Be intelligent but never condescending
- Explain complex AI concepts in simple, relatable terms
- Show genuine curiosity about the user's goals
- Be patient and thorough with explanations
- Celebrate learning and exploration

EMOTIONAL INTELLIGENCE:
- If user is confused by AI concepts: "AI can feel like a whole new language! Let me break this down - no jargon, I promise! 📚"
- If user is exploring: "I love your curiosity! There's so much to discover here 🔍"
- If user accomplished something: "You're getting the hang of this! That's exactly right! 🧠✨"

YOU HELP WITH:
- Script editing and enhancement
- AI model selection and comparison
- TTS voice selection and configuration
- Knowledge base management
- RAG pipeline configuration
- AI workflow optimization
- Media library organization

SPECIAL CONTEXT AWARENESS:
- If in Script Editor → "I see you're working on a script! Want me to suggest improvements or add TTS? ✏️"
- If viewing scripts → "Looking for something? I can help you find or organize your scripts! 📂"
- If in media library → "Your media collection is looking great! Want to batch process anything? 🎵"

CROSS-PRODUCT NAVIGATION:
- Want to generate new content? → "Spark is your creative playground - let's go there! ✨"
- Need voice-over or music? → "Vibe has all the audio magic you need! 🎙️"
- Ready to produce? → "Arc will help you schedule and manage production! 🎬"

GUIDED FLOWS: Offer to show AI concept diagrams. Say "Want me to visualize how this AI workflow works? Sometimes seeing it helps! 📊"

TONE: Knowledgeable, patient, encouraging exploration, genuinely helpful, celebrates learning`,
    workflows: [
      { id: 'edit-script', title: 'Edit & Enhance Script', description: 'Polish your scripts with AI assistance', steps: ['Open your script', 'Review AI suggestions', 'Make your edits', 'Add TTS voice if needed', 'Export or send to production!'] },
      { id: 'compare-models', title: 'Compare AI Models', description: 'Find the best AI model for your specific needs', steps: ['Define your use case', 'Select models to compare', 'Run test prompts', 'Analyze results', 'Pick your winner!'] }
    ]
  },
  studio: {
    name: 'Genie Studio',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'from-violet-500 to-fuchsia-500',
    tagline: ORIGINAL_TAGLINES.studio,
    description: PRODUCT_DESCRIPTIONS.studio,
    emoji: '🌟',
    systemContext: `You are Ask Genie, the master guide for Genie Studio - the complete AI-powered media production suite.

TAGLINE: "${ORIGINAL_TAGLINES.studio}" - This is sacred, never change it!
DESCRIPTION: ${PRODUCT_DESCRIPTIONS.studio}

PERSONALITY CORE:
- Be warm, welcoming, and knowledgeable about the entire ecosystem
- Help users understand how all products work together
- Be the friendly tour guide who knows every corner
- Celebrate the power of the integrated suite
- Make new users feel at home

THE GENIE FAMILY:
🎬 **Arc** - "${ORIGINAL_TAGLINES.arc}" - Production planning, shows, scheduling, Production Hub
🎥 **Vibe** - "${ORIGINAL_TAGLINES.vibe}" - Audio & video recording, TTS, mixing, publishing
✨ **Spark** - "${ORIGINAL_TAGLINES.spark}" - Content creation, scripts, images, ideas
🧠 **Mind** - "${ORIGINAL_TAGLINES.mind}" - AI intelligence, script editing, model management

ROUTING INTELLIGENCE:
- "I want to start a podcast" → "Perfect! Start in Arc to create your show, use Spark for scripts, record in Vibe!"
- "I need a video script" → "Let's go to Spark! That's where ideas become words ✨"
- "How do I add AI voice?" → "Vibe is your destination! TTS magic happens there 🎙️"
- "Which AI model should I use?" → "Mind can help you compare and choose! 🧠"

EMOTIONAL INTELLIGENCE:
- If user is new: "Welcome to the family! 🌟 Don't worry, I'll guide you every step of the way!"
- If user seems overwhelmed: "It's a lot to take in, I know! Let's start simple - what's ONE thing you want to create?"
- If user is exploring: "I love your curiosity! You're going to discover so many cool things here!"

GUIDED FLOWS: Offer complete ecosystem diagrams. Say "Want to see how all the Genie products work together? It's actually beautiful! 🗺️"

TONE: Welcoming, knowledgeable, encouraging, warm, the ultimate helpful friend`,
    workflows: [
      { id: 'get-started', title: 'Getting Started', description: 'Learn what each Genie product can do for you', steps: ['Explore Arc for production', 'Discover Spark for creation', 'Try Vibe for recording', 'Use Mind for AI power'] },
      { id: 'full-production', title: 'Full Production Workflow', description: 'Create content from idea to finished product', steps: ['Ideate in Spark', 'Plan in Arc', 'Record in Vibe', 'Optimize in Mind', 'Publish everywhere!'] }
    ]
  },
  deck: {
    name: 'Genie Deck',
    icon: <PenTool className="h-4 w-4" />,
    color: 'from-purple-500 to-violet-500',
    tagline: 'Ideas to Impact',
    description: 'Transform ideas into stunning AI-powered presentations with smart visual design and multi-language support.',
    emoji: '📊',
    systemContext: `You are Ask Genie, a creative and articulate AI assistant for Genie Deck - the AI Presentation Generator.

TAGLINE: "Ideas to Impact" - This is sacred, never change it!
DESCRIPTION: Transform ideas into stunning AI-powered presentations with smart visual design and multi-language support.

PERSONALITY CORE:
- Be creative, articulate, and passionate about visual communication
- Help users craft compelling presentations
- Suggest design tips and layout improvements
- Celebrate when presentations come together beautifully
- Be patient with customization requests

EMOTIONAL INTELLIGENCE:
- If user is unsure about content: "Great presentations start with clarity! What's the ONE key message you want your audience to remember? 🎯"
- If user is happy with result: "This is going to make an impact! Your presentation looks fantastic! 🌟"
- If user needs help: "Don't worry, I'll help you create something memorable! Let's start with your core message 💜"

YOU HELP WITH:
- Presentation creation from text, documents, or prompts
- Template and theme selection
- Brand customization (logos, colors)
- Multi-language parallel generation
- Slide layout and design suggestions
- PPTX export and download

CROSS-PRODUCT NAVIGATION:
- Need a script first? → "Genie Spark can help you draft content before presenting! ✨"
- Want to record the presentation? → "Take your deck to Genie Vibe for a video walkthrough! 🎥"
- Need AI optimization? → "Genie Mind can refine your messaging! 🧠"

GUIDED FLOWS: Offer visual workflow diagrams. Say "Want to see the presentation creation flow? It's simple and elegant! 📊"

TONE: Creative, articulate, encouraging, design-savvy, genuinely helpful`,
    workflows: [
      { id: 'create-presentation', title: 'Create Presentation', description: 'Generate slides from your content', steps: ['Add content (text/doc/URL)', 'Choose template & theme', 'Configure image settings', 'Select languages', 'Generate and download!'] },
      { id: 'brand-customize', title: 'Brand Your Deck', description: 'Add company branding to presentations', steps: ['Upload your logo', 'Set brand colors', 'Choose fonts', 'Preview branding', 'Apply to all slides!'] }
    ]
  }
};

// Dynamic contextual suggestions based on current state
const getContextualSuggestions = (
  product: GenieProduct, 
  currentTab?: string, 
  sessionData?: Record<string, any>
): Array<{ label: string; prompt: string; icon: React.ReactNode; isHighlighted?: boolean }> => {
  const suggestions: Array<{ label: string; prompt: string; icon: React.ReactNode; isHighlighted?: boolean }> = [];
  
  // Product-specific base suggestions
  switch (product) {
    case 'mind':
      if (currentTab === 'scripts' || currentTab === 'editor') {
        suggestions.push(
          { label: '✏️ Enhance this script', prompt: 'Help me improve my script - make it more engaging and polished!', icon: <Wand2 className="h-3 w-3" />, isHighlighted: true },
          { label: '🎙️ Add TTS/Voice', prompt: 'I want to add an AI voice to this script. Walk me through it!', icon: <Music className="h-3 w-3" /> },
          { label: '✨ Create in Spark', prompt: 'Can I use Genie Spark to generate more content like this?', icon: <Zap className="h-3 w-3" /> }
        );
      } else if (currentTab === 'media') {
        suggestions.push(
          { label: '📚 Organize library', prompt: 'Help me organize my media library effectively!', icon: <BookOpen className="h-3 w-3" /> },
          { label: '🔄 Batch process', prompt: 'Can I batch process multiple audio files at once?', icon: <Zap className="h-3 w-3" /> }
        );
      } else {
        suggestions.push(
          { label: '🧠 Compare AI models', prompt: 'Help me understand which AI model is best for my needs!', icon: <Brain className="h-3 w-3" /> },
          { label: '📝 Edit a script', prompt: 'Guide me through editing a script here in Mind', icon: <PenTool className="h-3 w-3" /> },
          { label: '📊 Show me the flow', prompt: 'Can you show me a visual diagram of how Mind works?', icon: <Map className="h-3 w-3" /> }
        );
      }
      break;

    case 'spark':
      if (sessionData?.hasGeneratedContent) {
        suggestions.push(
          { label: '🎙️ Add voice-over', prompt: 'I created content! Now help me add a voice-over with Vibe!', icon: <Music className="h-3 w-3" />, isHighlighted: true },
          { label: '🎬 Go to production', prompt: 'Take my script to Arc for full production!', icon: <Film className="h-3 w-3" /> }
        );
      }
      suggestions.push(
        { label: '✨ Generate script', prompt: 'Help me create an amazing script for my video or podcast!', icon: <PenTool className="h-3 w-3" /> },
        { label: '💡 Brainstorm ideas', prompt: "I need creative ideas - let's brainstorm together!", icon: <Lightbulb className="h-3 w-3" /> },
        { label: '📊 Show the flow', prompt: 'Show me a visual of the content creation workflow!', icon: <Map className="h-3 w-3" /> }
      );
      break;

    case 'arc':
      if (sessionData?.showCount === 0) {
        suggestions.push(
          { label: '🎬 Create first show', prompt: "I'm new! Help me create my first show step by step!", icon: <Film className="h-3 w-3" />, isHighlighted: true }
        );
      } else {
        suggestions.push(
          { label: '➕ Add episode', prompt: 'Help me add a new episode to my show!', icon: <Film className="h-3 w-3" /> }
        );
      }
      suggestions.push(
        { label: '📝 Need a script?', prompt: 'I need to write a script - should I use Spark?', icon: <PenTool className="h-3 w-3" /> },
        { label: '🎥 Go record!', prompt: 'How do I start recording in Vibe?', icon: <Music className="h-3 w-3" /> },
        { label: '📊 Show workflow', prompt: 'Show me a visual diagram of the production workflow!', icon: <Map className="h-3 w-3" /> }
      );
      break;

    case 'vibe':
      suggestions.push(
        { label: '🎥 Start recording', prompt: 'Guide me through recording video or audio!', icon: <Music className="h-3 w-3" />, isHighlighted: true },
        { label: '🎙️ Create AI voice', prompt: 'Help me create a professional AI voice-over!', icon: <Wand2 className="h-3 w-3" /> },
        { label: '📝 Need script first?', prompt: "I don't have a script yet - where do I start?", icon: <PenTool className="h-3 w-3" /> },
        { label: '📊 Show the flow', prompt: 'Show me the recording workflow visually!', icon: <Map className="h-3 w-3" /> }
      );
      break;

    default: // studio
      suggestions.push(
        { label: '🚀 Getting started', prompt: "I'm new to Genie Studio! Give me a tour!", icon: <Sparkles className="h-3 w-3" />, isHighlighted: true },
        { label: '🎬 Full workflow', prompt: 'Show me the complete workflow from idea to published content!', icon: <Film className="h-3 w-3" /> },
        { label: '🎙️ Start a podcast', prompt: 'Walk me through starting a podcast from scratch!', icon: <Music className="h-3 w-3" /> },
        { label: '📊 See the ecosystem', prompt: 'Show me how all Genie products connect together!', icon: <Map className="h-3 w-3" /> }
      );
  }

  return suggestions.slice(0, 4); // Limit to 4 for non-overwhelming UX
};

// Render mermaid diagram as simple text representation (real mermaid would need a library)
const MermaidDiagramDisplay: React.FC<{ diagram: { id: string; title: string; diagram: string } }> = ({ diagram }) => {
  return (
    <div className="bg-muted/50 rounded-lg p-3 border mt-2">
      <div className="flex items-center gap-2 mb-2">
        <Map className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">{diagram.title}</span>
      </div>
      <div className="bg-background rounded-md p-3 text-xs font-mono overflow-x-auto">
        <pre className="whitespace-pre-wrap text-muted-foreground">{diagram.diagram}</pre>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 italic">
        💡 Tip: This shows the recommended flow. Follow the arrows!
      </p>
    </div>
  );
};

export const AskGenie: React.FC<AskGenieProps> = ({
  product = 'studio',
  currentTab,
  sessionData,
  subscriptionTier = 'free',
  isOpen: externalIsOpen,
  onClose,
  position = 'floating',
  className
}) => {
  const [isOpen, setIsOpen] = useState(externalIsOpen ?? false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [hasOfferedHelp, setHasOfferedHelp] = useState(false);
  const [showDiagram, setShowDiagram] = useState<{ id: string; title: string; diagram: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { generateResponse } = useUniversalAI();
  const labelStudioService = useLabelStudioBackground();
  const productContext = PRODUCT_CONTEXTS[product];
  
  // State for inline hints from Label Studio
  const [inlineHints, setInlineHints] = useState<Array<{ id: string; type: string; message: string; confidence: number; dismissable: boolean }>>([]);
  
  // Get Ralph Wiggum context to report when Ask Genie is open
  const { setActiveOverlay, isEnabled: isRalphEnabled, openPanel: openRalphPanel, isPanelOpen: isRalphPanelOpen } = useRalphWiggumGlobal();
  
  // Report open/close state to Ralph Wiggum for proper tracking
  // Include product context so Ralph knows which page Ask Genie is on
  useEffect(() => {
    if (isRalphEnabled) {
      const overlayId = isOpen ? `ask-genie:${product}` : null;
      setActiveOverlay(overlayId);
      
      // Debug logging in dev mode
      if (import.meta.env.DEV && isOpen) {
        console.log(`🐛 Ralph Wiggum: Ask Genie opened on product="${product}"`);
      }
    }
    return () => {
      if (isRalphEnabled) {
        setActiveOverlay(null);
      }
    };
  }, [isOpen, isRalphEnabled, setActiveOverlay, product]);
  
  // Memoize sessionData to prevent unnecessary recalculations
  const sessionDataKey = useMemo(() => JSON.stringify(sessionData || {}), [sessionData]);
  
  // Dynamic suggestions based on context - use sessionDataKey for stable deps
  const contextualSuggestions = useMemo(() => 
    getContextualSuggestions(product, currentTab, sessionData), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product, currentTab, sessionDataKey]
  );

  // Random personality phrases
  const getRandomPhrase = (type: keyof typeof PERSONALITY) => {
    const phrases = PERSONALITY[type];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  // Proactive help detection - check if user seems stuck
  // Use refs to avoid unnecessary re-renders
  const hasOfferedHelpRef = useRef(hasOfferedHelp);
  hasOfferedHelpRef.current = hasOfferedHelp;
  
  const messagesLengthRef = useRef(messages.length);
  messagesLengthRef.current = messages.length;

  useEffect(() => {
    if (!isOpen || hasOfferedHelpRef.current) return;

    const checkInterval = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityTime;
      const stuckThreshold = 45000; // 45 seconds of inactivity
      
      if (timeSinceActivity > stuckThreshold && messagesLengthRef.current === 0) {
        // User might be stuck - offer help proactively
        const helpMessage: Message = {
          id: `help-${Date.now()}`,
          role: 'assistant',
          content: getRandomPhrase('stuckDetection'),
          timestamp: new Date(),
          product,
          emotionalTone: 'empathetic'
        };
        setMessages(prev => [...prev, helpMessage]);
        setShowWelcome(false);
        setHasOfferedHelp(true);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(checkInterval);
  }, [isOpen, lastActivityTime, product]); // Removed hasOfferedHelp and messages.length from deps

  // Get inline hints from Label Studio background service (sync - cached patterns)
  // Only run once when popup opens, not on every re-render
  useEffect(() => {
    if (!isOpen) return;
    
    const productKey = product === 'studio' || product === 'deck' ? 'mind' : product;
    const hints = labelStudioService.getHints(productKey as 'mind' | 'spark' | 'vibe' | 'arc' | 'hub', { currentTab, subscriptionTier });
    if (hints && hints.length > 0) {
      setInlineHints(hints);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product, currentTab]);

  // Track activity - only update when chat is opened, not on every input change
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    // Only update lastActivityTime when isOpen changes from false to true
    if (isOpen && !isOpenRef.current) {
      setLastActivityTime(Date.now());
    }
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Sync with external isOpen prop
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Check if user is asking for a flow/diagram
  const shouldShowDiagram = (text: string): { id: string; title: string; diagram: string } | null => {
    const lowerText = text.toLowerCase();
    const flowKeywords = ['show me', 'diagram', 'flow', 'workflow', 'how does', 'visual', 'steps', 'process', 'guide'];
    
    if (flowKeywords.some(keyword => lowerText.includes(keyword))) {
      const diagrams = WORKFLOW_DIAGRAMS[product];
      if (diagrams && diagrams.length > 0) {
        // Return first diagram or match based on context
        if (lowerText.includes('record') || lowerText.includes('video') || lowerText.includes('audio')) {
          return diagrams.find(d => d.id.includes('record')) || diagrams[0];
        }
        if (lowerText.includes('script') || lowerText.includes('create')) {
          return diagrams.find(d => d.id.includes('script') || d.id.includes('create')) || diagrams[0];
        }
        return diagrams[0];
      }
    }
    return null;
  };

  const handleSendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    setShowWelcome(false);
    setLastActivityTime(Date.now());

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
      product
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Check if we should show a diagram
    const diagram = shouldShowDiagram(text);

    try {
      // Build context-aware, personality-rich prompt
      const contextPrompt = `
${productContext.systemContext}

IMPORTANT RESPONSE GUIDELINES:
- Keep responses warm and conversational (3-5 sentences for simple questions)
- Use emojis naturally (2-3 per response) to add personality
- If explaining a process, offer to show a visual flow diagram
- If suggesting another Genie product, explain WHY and HOW it helps
- Celebrate user progress with genuine enthusiasm
- Be empathetic if they seem confused, frustrated, or stuck
- Add a touch of humor when appropriate (but not forced)
- End with a question or offer to help further

CURRENT CONTEXT:
- Product: ${productContext.name} ("${productContext.tagline}")
- Current Tab: ${currentTab || 'main view'}
- Session Info: ${sessionData ? JSON.stringify(sessionData).slice(0, 300) : 'New session'}
- Subscription: ${subscriptionTier}

${diagram ? 'NOTE: User is asking about a workflow. Explain it AND offer to show the visual diagram.' : ''}

USER MESSAGE: ${text}

Respond helpfully, warmly, and with genuine care for their creative journey.
      `.trim();

      const response = await generateResponse({
        prompt: contextPrompt,
        provider: 'gemini'
      });

      let responseContent = response?.content || getRandomPhrase('empathy') + " I couldn't quite process that. Want to try asking differently? I'm here! 💜";
      
      // Add diagram offer if relevant
      if (diagram) {
        responseContent += "\n\n📊 **I've got a visual flow to show you!** Check it out below - it makes things so much clearer!";
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        product,
        emotionalTone: 'helpful',
        showMermaid: !!diagram,
        mermaidDiagram: diagram?.diagram
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (diagram) {
        setShowDiagram(diagram);
      }
      
      // Record training event for ML improvement (invisible to user)
      labelStudioService.recordEvent({
        eventType: 'script_enhancement_accepted',
        context: {
          product: (product === 'studio' || product === 'deck') ? 'mind' : product as 'mind' | 'spark' | 'vibe' | 'arc' | 'hub',
          contentType: 'conversation',
          originalValue: text,
          selectedValue: responseContent.slice(0, 200),
          userAction: 'accept'
        }
      });
    } catch (error) {
      console.error('Ask Genie error:', error);
      toast.error('Oops! Something went wrong. Let me try again...');
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `${getRandomPhrase('empathy')} I hit a small bump there! 🤔 Want to try asking again? I promise I'm still here for you! 💪`,
        timestamp: new Date(),
        product,
        emotionalTone: 'empathetic'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, product, productContext, currentTab, sessionData, subscriptionTier, generateResponse, labelStudioService]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Floating trigger button - shows product-specific branding when on product page
  const TriggerButton = () => {
    const isProductPage = product !== 'studio';
    const currentProduct = isProductPage && GENIE_PRODUCTS[product as keyof typeof GENIE_PRODUCTS] 
      ? GENIE_PRODUCTS[product as keyof typeof GENIE_PRODUCTS] 
      : null;
    
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "h-auto w-auto rounded-2xl shadow-2xl px-4 py-3 bg-white hover:bg-gray-50 border-2 transition-all duration-300 group",
            "border-purple-200 hover:border-purple-300"
          )}
          variant="ghost"
        >
          <div className="flex items-center gap-3">
            {/* Always show Ask Genie logo */}
            <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-inner overflow-hidden bg-gradient-to-br from-purple-100 to-violet-100">
              <img 
                src={ASK_GENIE.logo}
                alt={ASK_GENIE.name}
                className="h-10 w-10 object-contain"
              />
            </div>
            {/* Always show "Ask Genie" - never product-specific */}
            <div className="text-left pr-1">
              <div className="font-bold text-base bg-clip-text text-transparent flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600">
                {ASK_GENIE.name} {ASK_GENIE.emoji}
              </div>
              <div className="text-xs text-muted-foreground italic">
                {ASK_GENIE.tagline}
              </div>
            </div>
          </div>
          {/* Subtle pulse indicator */}
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-lg" />
        </Button>
      </motion.div>
    );
  };

  // Main chat interface
  const ChatInterface = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={cn(
        "flex flex-col bg-background border rounded-xl shadow-2xl overflow-hidden",
        position === 'floating' && "fixed bottom-6 right-6 w-[420px] h-[600px] z-50",
        position === 'sidebar' && "h-full w-full",
        position === 'inline' && "w-full h-[500px]",
        className
      )}
    >
      {/* Header - Always show "Ask Genie" branding */}
      <div className={cn(
        "flex flex-col border-b overflow-hidden",
        `bg-gradient-to-br ${ASK_GENIE.color}`
      )}>
        {/* Hero Banner - Always show Ask Genie branding */}
        <div className="px-5 py-4 flex items-center gap-4">
          {/* Always show Ask Genie Logo */}
          <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-xl border-2 border-white/50 flex-shrink-0">
            <img 
              src={ASK_GENIE.logo} 
              alt={ASK_GENIE.name} 
              className="h-14 w-14 object-contain"
            />
          </div>
          {/* Always show "Ask Genie" name and tagline */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {ASK_GENIE.name} {ASK_GENIE.emoji}
            </h2>
            <p className="text-sm text-white/90 italic font-medium mt-0.5">
              "{ASK_GENIE.tagline}"
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="outline" className="text-[10px] bg-white/20 text-white border-white/30 px-2 py-0">
                🧞 AI Assistant
              </Badge>
              {/* Show context indicator for which product we're helping with */}
              {product !== 'studio' && (
                <Badge variant="outline" className="text-[10px] bg-white/10 text-white/90 border-white/20 px-2 py-0">
                  Helping with: {productContext.name}
                </Badge>
              )}
            </div>
          </div>
          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white hover:bg-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white hover:bg-white/20"
              onClick={handleClose}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {showWelcome && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                {/* Feature Highlights - No duplicate logo */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full rounded-xl p-4 mb-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border border-purple-200/50 dark:border-purple-800/30"
                >
                  <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    What I Can Help You With
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/80 dark:bg-white/10 rounded-lg px-3 py-2.5 text-center shadow-sm">
                      <Brain className="h-5 w-5 mx-auto text-purple-600 dark:text-purple-400 mb-1.5" />
                      <span className="text-xs font-medium text-purple-900 dark:text-purple-100">Smart Context</span>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Understands your workflow</p>
                    </div>
                    <div className="bg-white/80 dark:bg-white/10 rounded-lg px-3 py-2.5 text-center shadow-sm">
                      <Wand2 className="h-5 w-5 mx-auto text-purple-600 dark:text-purple-400 mb-1.5" />
                      <span className="text-xs font-medium text-purple-900 dark:text-purple-100">Creative Help</span>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Generate & refine ideas</p>
                    </div>
                    <div className="bg-white/80 dark:bg-white/10 rounded-lg px-3 py-2.5 text-center shadow-sm">
                      <Map className="h-5 w-5 mx-auto text-purple-600 dark:text-purple-400 mb-1.5" />
                      <span className="text-xs font-medium text-purple-900 dark:text-purple-100">Visual Flows</span>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Build production maps</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2 px-2"
                >
                  <h4 className="font-semibold text-base">{getRandomPhrase('greetings')}</h4>
                  <p className="text-xs text-muted-foreground/70">
                    Currently helping you in <strong>{productContext.name}</strong> - "{productContext.tagline}"
                  </p>
                  
                  {/* Subscription awareness hint - gentle, not pushy */}
                  {subscriptionTier !== 'pro' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-2.5 border border-amber-200/50 dark:border-amber-800/50"
                    >
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-2">
                        <Lightbulb className="h-3 w-3" />
                        <span>
                          On <strong className="capitalize">{subscriptionTier}</strong> tier — Ask me what magic awaits! ✨
                        </span>
                      </p>
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Contextual Quick Actions */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-full space-y-2"
                >
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1 justify-center">
                    <Heart className="h-3 w-3 text-pink-500" />
                    Quick suggestions just for you:
                  </p>
                  {contextualSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Button
                        variant={suggestion.isHighlighted ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left text-sm h-auto py-2 px-3",
                          suggestion.isHighlighted && `bg-gradient-to-r ${productContext.color} text-white hover:opacity-90`
                        )}
                        onClick={() => handleSendMessage(suggestion.prompt)}
                      >
                        <span className="mr-2">{suggestion.icon}</span>
                        {suggestion.label}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Workflows teaser */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 pt-4 border-t w-full"
                >
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
                    <Map className="h-3 w-3" />
                    Ask me to "show the flow" for visual workflow guides!
                  </p>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : `bg-gradient-to-r ${productContext.color}`
                    )}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={cn(
                      "max-w-[85%]",
                      message.role === 'user' ? 'text-right' : 'text-left'
                    )}>
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 inline-block",
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-tr-md' 
                          : 'bg-muted rounded-tl-md'
                      )}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                      {/* Show diagram if applicable */}
                      {message.showMermaid && showDiagram && (
                        <MermaidDiagramDisplay diagram={showDiagram} />
                      )}
                      {/* Inline feedback for AI responses */}
                      {message.role === 'assistant' && index === messages.length - 1 && (
                        <div className="mt-2">
                          <InlineTrainAIFeedback
                            data={{
                              context: 'ask_genie_response',
                              product: 'ask_genie',
                              originalContent: message.content,
                              metadata: { product, currentTab }
                            }}
                            variant="minimal"
                            showTextFeedback={false}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      `bg-gradient-to-r ${productContext.color}`
                    )}>
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking of the best way to help... ✨</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-muted/30">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                placeholder="Ask me anything... I'm here to help! 💜"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-h-[44px] max-h-[100px] resize-none rounded-xl"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className={cn("h-11 w-11 rounded-xl", `bg-gradient-to-r ${productContext.color} hover:opacity-90`)}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Send className="h-4 w-4 text-white" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Press Enter to send • I can show visual flows too! 📊
            </p>
          </div>
        </>
      )}
    </motion.div>
  );

  // Render based on position
  if (position === 'inline' || position === 'sidebar') {
    return <ChatInterface />;
  }

  // Floating mode
  return (
    <>
      {!isOpen && <TriggerButton />}
      <AnimatePresence>
        {isOpen && <ChatInterface />}
      </AnimatePresence>
    </>
  );
};

export default AskGenie;
