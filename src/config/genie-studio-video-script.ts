/**
 * GENIE STUDIO VIDEO SCRIPT - LANDING PAGE PRODUCTION
 * 
 * A comprehensive, narrative-driven script featuring:
 * - Genie Lamp & Character introduction
 * - 7 Product deep-dives with live demos
 * - Multi-language dialect support (not translation)
 * - Humor and engagement throughout
 * 
 * Total Runtime: ~5-6 minutes
 * Format: Mixed media (3D, Avatar, PPT, Animated, Immersive)
 */

// ============================================================================
// CHAPTER DEFINITIONS
// ============================================================================

export interface SceneVisual {
  type: '3d_animated' | 'avatar_presenter' | 'ppt_slide' | 'immersive' | 'live_demo' | 'full_body_avatar';
  background: string;
  elements: string[];
  transitions: string[];
  livePreview?: string;
}

export interface VoiceDirection {
  tone: string;
  pace: string;
  emotion: string;
  humor?: string;
}

export interface ChapterScript {
  id: string;
  title: string;
  duration: string;
  visual: SceneVisual;
  voiceover: {
    en: string;
    dialectNotes: Record<string, string>;
  };
  technicalHighlights: string[];
  modelsShowcased: string[];
  voiceDirection: VoiceDirection;
  musicCue: string;
}

// ============================================================================
// OPENING: GENIE LAMP EMERGENCE
// ============================================================================

export const OPENING_SCENE: ChapterScript = {
  id: 'opening',
  title: 'The Genie Awakens',
  duration: '45 seconds',
  visual: {
    type: '3d_animated',
    background: 'Deep purple gradient with floating stars and cosmic dust',
    elements: [
      'Golden Genie Lamp (ornate, glowing)',
      'Magical smoke/mist emerging',
      'Genie character forming from smoke (friendly, non-human, ethereal)',
      'Sparkles and particle effects',
      'Floating product logos orbiting the Genie'
    ],
    transitions: [
      'Lamp wobbles → smoke emerges → Genie forms',
      'Genie stretches, yawns playfully',
      'Product logos materialize one by one around Genie'
    ]
  },
  voiceover: {
    en: `*lamp wobbles*

"Ahhh... finally! Someone rubbed the lamp! I've been waiting for centuries... well, actually just since 2024, but who's counting?

*stretches dramatically*

I am the Genie of Genie Suite, and unlike my cousin who grants only THREE wishes... I grant UNLIMITED creative powers!

*gestures grandly as logos appear*

Behold! Seven magical products. 206 transformation pipelines. 19 world-class AI providers. Support for 140+ languages in their TRUE dialects – not that robotic translation nonsense.

Whether you're in Tokyo, Dubai, São Paulo, or anywhere in between... your wish is LITERALLY my command.

Let me show you the magic..."`,
    dialectNotes: {
      ar: 'Use Egyptian Arabic warmth, reference "ألف ليلة وليلة" (1001 Nights), playful tone like a friendly uncle',
      hi: 'Bollywood-style dramatic flair, use "जादू" (jaadu) for magic, reference "Aladdin ki kahani"',
      zh: 'Reference Chinese mythology spirits, use 神灯 (shéndēng), warm storyteller tone',
      ja: 'Gentle anime-style character energy, reference ランプの精 (ranpu no sei), polite but playful',
      ko: 'K-drama style introduction, reference 지니 (jini), energetic and modern',
      es: 'Latin warmth, reference "lámpara mágica", theatrical and passionate',
      fr: 'Elegant Parisian charm, reference "génie de la lampe", sophisticated wit',
      pt: 'Brazilian energy and warmth, reference "gênio da lâmpada", carnival-like enthusiasm',
      sw: 'East African storytelling style, reference "taa ya Aladini", community-focused warmth'
    }
  },
  technicalHighlights: [
    '7 Products: Spark, Mind, Vibe, Deck, Arc, Cast, Ask Genie',
    '206 AI Pipelines across 21 categories',
    '12 Core AI Providers: OpenAI, Claude, Gemini, DeepSeek, Alibaba, Azure, ModelsLab, Meshy, ElevenLabs, DeepL, Replicate, GCP',
    '70+ Languages with dialect support',
    '25+ Industries supported',
    '101+ Frameworks and templates'
  ],
  modelsShowcased: ['Overview only - all providers shown as orbiting icons'],
  voiceDirection: {
    tone: 'Magical, warm, slightly mischievous',
    pace: 'Starts slow and mysterious, builds to energetic',
    emotion: 'Wonder, excitement, friendliness',
    humor: 'Self-deprecating about being "new" Genie, playful comparisons to traditional genies'
  },
  musicCue: 'Mystical orchestral → builds to uplifting electronic fusion'
};

// ============================================================================
// CHAPTER 1: GENIE SPARK - "Ignite Your Ideas"
// ============================================================================

export const SPARK_CHAPTER: ChapterScript = {
  id: 'spark',
  title: 'Genie Spark - Ignite Your Ideas',
  duration: '50 seconds',
  visual: {
    type: 'live_demo',
    background: 'Warm orange/yellow gradient with spark particles',
    elements: [
      'Genie Spark logo (animated flame)',
      'Split screen: Input area (left) + Live generation preview (right)',
      'Multiple input types floating: document, video, audio, URL, screenshot',
      'Script text appearing word-by-word with typing animation',
      'Language pairing indicator with confidence scores',
      'AI model badges (Claude, GPT-4o, Gemini) cycling'
    ],
    transitions: [
      'User drops a document → extraction animation',
      'Script generates in real-time with syntax highlighting',
      'Confidence meter fills up (95%+)',
      'Language pair shows: English → Arabic (Gulf dialect)'
    ],
    livePreview: 'Show actual script generation with words appearing progressively'
  },
  voiceover: {
    en: `*Genie gestures to Spark logo*

"First, meet Spark – where imagination becomes... well, actual words!

*demo starts*

Watch this magic: Drop a video, paste a URL, upload a document, record your screen, or even just SPEAK your idea...

*script starts generating*

See? The script writes itself! Not just any script – a SMART script that knows your industry, your audience, your vibe.

*points to confidence score*

That 96% confidence? That means Claude, GPT-4o, and Gemini all agreed this is EXACTLY what you meant. 

And look – it's automatically paired for Arabic Gulf dialect. Not 'formal Arabic that sounds like a textbook'... REAL Arabic that your Dubai audience will love.

From chaos to clarity... that's Spark magic!"`,
    dialectNotes: {
      ar: 'Emphasize "لهجة خليجية" (Gulf dialect) pride, show Arabic script generation flowing right-to-left beautifully',
      hi: 'Reference "Hindi-English code-switching" (Hinglish) understanding, show Devanagari script generation',
      zh: 'Highlight Simplified/Traditional switching, show Chinese character generation with stroke animations',
      ja: 'Show Kanji/Hiragana/Katakana mixed generation, reference Japanese business communication precision',
      ko: 'Emphasize formal/informal Korean switching (존댓말/반말), show Hangul generation',
      es: 'Show Latin American vs Castilian Spanish options, emphasize natural expressions',
      fr: 'Reference Parisian vs Quebec French, show elegant French script generation',
      pt: 'Emphasize Brazilian Portuguese naturalness, show Portuguese script with proper accents',
      sw: 'Show Swahili script with proper noun classes, reference East African market understanding'
    }
  },
  technicalHighlights: [
    '28 Spark-specific pipelines',
    'Multi-modal input: Video, Audio, Document, URL, Screen Recording, Voice',
    'Real-time extraction with OCR (Azure, Google Vision)',
    'Automatic language detection and confidence scoring',
    'Industry-aware script templates (50+ industries)',
    '6-zone regional LLM routing for optimal quality'
  ],
  modelsShowcased: [
    'Claude (Western/EU zone)',
    'GPT-4o (Arabic/Complex reasoning)',
    'Gemini (India/SEA zone)',
    'Alibaba Qwen-Max (CJK zone)',
    'DeepSeek-V3 (Fallback/Cost optimization)',
    'Azure OCR (Document extraction)',
    'Google Vision (Image analysis)'
  ],
  voiceDirection: {
    tone: 'Excited, demonstrative',
    pace: 'Fast during demo, pauses for emphasis on key features',
    emotion: 'Pride, wonder at the technology',
    humor: 'Light jokes about "textbook Arabic" and robotic translations'
  },
  musicCue: 'Upbeat electronic with spark/ignition sound effects'
};

// ============================================================================
// CHAPTER 2: GENIE MIND - "AI That Understands"
// ============================================================================

export const MIND_CHAPTER: ChapterScript = {
  id: 'mind',
  title: 'Genie Mind - AI That Understands',
  duration: '50 seconds',
  visual: {
    type: 'ppt_slide',
    background: 'Deep blue gradient with neural network patterns',
    elements: [
      'Genie Mind logo (glowing brain)',
      'PPT-style slide layout with animated bullet points',
      'Side panel showing script editor with tracked changes',
      'TTS waveform visualization',
      'Regional provider badges: ElevenLabs, Azure Neural, Alibaba Qwen3-TTS',
      'Before/After comparison: Original text → Enhanced text'
    ],
    transitions: [
      'Script appears → enhancement suggestions highlight',
      'User accepts suggestion → text transforms',
      'Voice selection → waveform plays sample',
      'Regional map lights up showing provider selection'
    ]
  },
  voiceover: {
    en: `*Genie points to Mind logo*

"Now, Spark gave you words. But Mind... Mind gives you UNDERSTANDING.

*slide transitions to editor view*

Watch: Here's a script that's... okay. But with Mind, it becomes BRILLIANT.

*enhancement animation*

See those purple highlights? Those are AI-powered suggestions – not just grammar fixes, but actual CONTENT improvements. Mind understands your message and makes it clearer.

*TTS section activates*

And the voice? Listen to this...

*plays Arabic sample*

That's not a 'translated robot.' That's Qwen3-TTS for Arabic, ElevenLabs for English, Azure Neural for Hindi – each region gets its BEST voice.

*dialect comparison appears*

We don't translate. We TRANSCREATE. Egyptian Arabic sounds Egyptian. Hinglish sounds like Mumbai. Brazilian Portuguese sounds like Rio.

That's Mind – it doesn't just hear you... it GETS you."`,
    dialectNotes: {
      ar: 'Demonstrate Egyptian vs Gulf vs Levantine Arabic TTS differences, show how "مرحبا" sounds different in each',
      hi: 'Show Hinglish (Hindi-English mix) TTS, demonstrate formal Hindi vs conversational Hinglish',
      zh: 'Demonstrate Mandarin vs Cantonese TTS options, show tone accuracy importance',
      ja: 'Show keigo (formal) vs casual Japanese TTS, demonstrate pitch accent accuracy',
      ko: 'Demonstrate Seoul vs regional Korean accents, show honorific level switching',
      es: 'Compare Mexican vs Argentinian vs Spanish TTS, demonstrate voseo/tuteo differences',
      fr: 'Compare Parisian vs Quebec French TTS, show liaison and accent differences',
      pt: 'Compare Brazilian vs European Portuguese TTS, demonstrate different rhythms',
      sw: 'Show Tanzanian vs Kenyan Swahili differences, demonstrate proper noun class pronunciation'
    }
  },
  technicalHighlights: [
    '30 Mind-specific pipelines',
    'Script enhancement with AI suggestions',
    'Multi-provider TTS: ElevenLabs, Azure Neural, Alibaba Qwen3-TTS, Google TTS',
    'STT: Whisper, Azure Speech, Google Speech',
    'Voice cloning capabilities',
    'Dialect-aware transcreation (not translation)',
    '7 Arabic dialects, 22 Indian languages, 10 African languages supported'
  ],
  modelsShowcased: [
    'ElevenLabs (Premium TTS, Voice Cloning)',
    'Azure Neural TTS (Hindi, Arabic Neural voices)',
    'Alibaba Qwen3-TTS (CJK native voices)',
    'OpenAI Whisper (STT)',
    'DeepL (Translation context)',
    'Claude (Enhancement suggestions)'
  ],
  voiceDirection: {
    tone: 'Thoughtful, educational',
    pace: 'Measured, with pauses for audio samples',
    emotion: 'Appreciation for nuance, pride in quality',
    humor: 'Playful comparison of "robot voice" vs natural voices'
  },
  musicCue: 'Ambient electronic with neural/synaptic sound effects'
};

// ============================================================================
// CHAPTER 3: GENIE VIBE - "Script to Screen"
// ============================================================================

export const VIBE_CHAPTER: ChapterScript = {
  id: 'vibe',
  title: 'Genie Vibe - Script to Screen',
  duration: '55 seconds',
  visual: {
    type: '3d_animated',
    background: '3D studio environment with floating screens and equipment',
    elements: [
      'Genie Vibe logo (film reel with play button)',
      '3D video timeline floating in space',
      'Multiple floating screens showing: teleprompter, video preview, audio waveforms',
      '3D avatar model rotating',
      'Lip-sync visualization (mouth matching audio)',
      'Mobile phone mockup showing offline editing',
      'Music/SFX layer visualization'
    ],
    transitions: [
      'Script flows into teleprompter',
      'Video generates segment by segment',
      '3D avatar speaks with lip-sync animation',
      'Music layer slides in underneath',
      'Export options appear as floating buttons'
    ]
  },
  voiceover: {
    en: `*Genie enters a 3D studio environment*

"Welcome to my FAVORITE place... the Vibe Studio!

*gestures to floating screens*

This is where scripts become VIDEOS. And not just any videos...

*teleprompter activates*

See the teleprompter? It's AI-powered – it follows YOUR pace, not the other way around.

*3D avatar appears*

And THIS beauty? A 3D avatar that looks like a PERSON, not a video game character. Watch the lips...

*lip-sync demo*

Perfect sync. Every. Single. Time. In ANY language.

*music layer appears*

Add music, sound effects, background audio – all AI-generated, royalty-free.

*mobile phone appears*

And here's the magic for creators on the go: MOBILE-FIRST editing. Even OFFLINE. Edit on the subway, the beach, anywhere.

*export options appear*

74 video pipelines. 4K quality. From your phone to the world."`,
    dialectNotes: {
      ar: 'Emphasize right-to-left teleprompter support, show Arabic lip-sync accuracy',
      hi: 'Show Bollywood-style avatar options, demonstrate Hindi lip-sync with proper mouth shapes',
      zh: 'Demonstrate Chinese lip-sync (tone-accurate mouth movements), show Douyin/WeChat format options',
      ja: 'Show anime-style avatar options, demonstrate Japanese lip-sync precision',
      ko: 'Reference K-pop style production quality, show Korean lip-sync accuracy',
      es: 'Show Latin American style options, demonstrate Spanish rapid-speech lip-sync',
      fr: 'Emphasize cinematic quality options, show French liaison lip-sync',
      pt: 'Show Brazilian social media format options, demonstrate Portuguese rhythm lip-sync',
      sw: 'Show African representation in avatars, demonstrate Swahili lip-sync'
    }
  },
  technicalHighlights: [
    '74 Vibe-specific pipelines (largest product)',
    'AI Teleprompter with pace adaptation',
    '3D Avatar generation (Meshy AI, Alibaba WAN 2.2)',
    'Lip-sync (Azure Visemes, HeyGen-style)',
    'Multi-track audio: Voice, Music, SFX',
    'Music generation: ElevenLabs Music',
    'SFX generation: ElevenLabs SFX',
    'Mobile-first PWA with offline support',
    'Export: MP4, WebM, MOV, vertical/horizontal formats'
  ],
  modelsShowcased: [
    'ModelsLab (Text-to-Video, AnimateDiff)',
    'Meshy AI (3D Avatar/Object generation)',
    'Alibaba WAN 2.2 (Video generation)',
    'Azure Visemes (Lip-sync)',
    'ElevenLabs (Music & SFX generation)',
    'FFmpeg pipelines (Video editing)'
  ],
  voiceDirection: {
    tone: 'Energetic, excited, proud',
    pace: 'Fast and dynamic, matching video energy',
    emotion: 'Joy, creative excitement',
    humor: 'Jokes about "video game character" avatars, editing on the subway'
  },
  musicCue: 'High-energy cinematic electronic with production studio sounds'
};

// ============================================================================
// CHAPTER 4: GENIE DECK - "Ideas to Impact"
// ============================================================================

export const DECK_CHAPTER: ChapterScript = {
  id: 'deck',
  title: 'Genie Deck - Ideas to Impact',
  duration: '45 seconds',
  visual: {
    type: 'avatar_presenter',
    background: 'Professional presentation room with floating slides',
    elements: [
      'Genie Deck logo (presentation screen)',
      'AI Avatar presenter (professional, non-human, friendly)',
      'Floating PPT slides appearing one by one',
      '3D chart/graph elements',
      'Template gallery preview',
      'One-click generation animation'
    ],
    transitions: [
      'Avatar gestures → slide appears',
      'Simple text → transforms into designed slide',
      '2D chart → morphs into 3D visualization',
      'Single slide → full deck fans out'
    ]
  },
  voiceover: {
    en: `*Avatar presenter appears*

"Presentations. Everyone needs them. Nobody wants to make them.

*gestures to empty slide*

What if you could go from THIS... 

*slide transforms*

...to THIS? In SECONDS?

*deck fans out*

That's Genie Deck. One prompt. One click. A full professional presentation.

*3D elements appear*

And not boring flat slides – ALIVE slides! 3D charts that rotate. Avatars that present FOR you. Animations that actually make sense.

*template gallery appears*

101 frameworks. 25 industries. From McKinsey-style strategy decks to creative TikTok pitch decks.

*export options appear*

Export as PPTX, PDF, Video, or... let your AI avatar present it LIVE.

Your ideas. Maximum impact. Zero PowerPoint pain."`,
    dialectNotes: {
      ar: 'Reference Gulf business presentation style, show RTL slide layouts',
      hi: 'Reference Indian corporate presentation culture, show bilingual slides',
      zh: 'Show Chinese business presentation style, reference WeChat/Feishu integration',
      ja: 'Reference Japanese precision in presentations, show vertical text options',
      ko: 'Reference Korean chaebols presentation style, show Korean corporate templates',
      es: 'Reference Latin American presentation warmth, show colorful template options',
      fr: 'Reference French elegance in design, show sophisticated templates',
      pt: 'Reference Brazilian creative presentation style, show vibrant templates',
      sw: 'Reference African business growth, show Pan-African template options'
    }
  },
  technicalHighlights: [
    '34 Deck-specific pipelines',
    'One-click presentation generation',
    '3D chart/graph generation',
    'AI Avatar presenter integration',
    '101+ frameworks (McKinsey, BCG, Academic, Creative)',
    '25+ industry templates',
    'Export: PPTX, PDF, Video, HTML5, Live Avatar Presentation',
    'Real-time collaboration'
  ],
  modelsShowcased: [
    'Claude/GPT-4o (Content generation)',
    'Meshy AI (3D elements)',
    'ModelsLab (Background generation)',
    'Alibaba OmniAvatar (Presenter avatar)',
    'pptxgenjs (PPTX generation)'
  ],
  voiceDirection: {
    tone: 'Confident, problem-solving',
    pace: 'Punchy, with dramatic pauses for transformations',
    emotion: 'Relief, empowerment',
    humor: 'Relateable jokes about hating PowerPoint, "boring flat slides"'
  },
  musicCue: 'Corporate upbeat with transformation sound effects'
};

// ============================================================================
// CHAPTER 5: GENIE HUB - "Your Creative Command Center"
// ============================================================================

export const ARC_CHAPTER: ChapterScript = {
  id: 'arc',
  title: 'Genie Hub - Your Creative Command Center',
  duration: '50 seconds',
  visual: {
    type: 'full_body_avatar',
    background: 'Production studio with multiple screens and calendar views',
    elements: [
      'Genie Hub logo (orbital rings)',
      'Full-body AI avatar (project manager style)',
      'Floating Kanban board',
      'Calendar with scheduled content',
      'Social media platform icons (TikTok, Instagram, YouTube, LinkedIn)',
      'Template previews for each platform',
      'Recording studio setup'
    ],
    transitions: [
      'Avatar walks through virtual studio',
      'Kanban cards move between columns',
      'Calendar events populate automatically',
      'Platform templates switch on command',
      'Recording countdown animation'
    ]
  },
  voiceover: {
    en: `*Full-body avatar walks into production studio*

"Creating content is one thing. MANAGING it? That's where creators BURN OUT.

*gestures to Kanban board*

Enter Arc – your production command center.

*Kanban animates*

See this? Every project, every deadline, every team member – all in one view. Drag, drop, done.

*calendar populates*

Podcast on Monday. Webcast on Wednesday. TikTok series on Friday. Arc schedules it ALL.

*platform templates appear*

And look – OPTIMIZED templates for every platform. TikTok? Vertical, punchy, 60 seconds. LinkedIn? Professional, horizontal, 3 minutes. YouTube? Full production value.

*recording studio activates*

When it's time to record – teleprompter, lighting cues, countdown timer – Arc runs your studio.

*publishing animation*

Record. Edit. Schedule. Publish. From one place.

Because your JOB is creating... not project managing."`,
    dialectNotes: {
      ar: 'Reference regional content calendars (Ramadan, Eid), show Arabic social platforms',
      hi: 'Reference Indian festival content calendars, show regional platform options',
      zh: 'Reference Chinese social ecosystem (Douyin, WeChat, Weibo), show different content rhythms',
      ja: 'Reference Japanese content culture (precision, seasonal), show Japan-specific platforms',
      ko: 'Reference K-content production style, show Korean platform optimization',
      es: 'Reference Latin American content culture, show regional platform differences',
      fr: 'Reference French content style, show European platform options',
      pt: 'Reference Brazilian content energy, show Brazilian social platforms',
      sw: 'Reference African content creation growth, show Pan-African platforms'
    }
  },
  technicalHighlights: [
    '14 Arc-specific pipelines',
    'Kanban project management',
    'Content calendar with AI scheduling',
    'Multi-platform templates (TikTok, Instagram, YouTube, LinkedIn, etc.)',
    'Integrated recording studio with teleprompter',
    'Screen recording and webcam capture',
    'Team collaboration and assignments',
    'Auto-publishing to platforms',
    'Analytics dashboard'
  ],
  modelsShowcased: [
    'AI Scheduling (Optimal posting times)',
    'Template Engine (Platform-specific)',
    'Recording Pipeline (FFmpeg-based)',
    'Publishing APIs (Social platforms)'
  ],
  voiceDirection: {
    tone: 'Organized, efficient, supportive',
    pace: 'Methodical but energetic',
    emotion: 'Relief from chaos, empowerment',
    humor: 'Jokes about creator burnout and project management nightmares'
  },
  musicCue: 'Productive, organized electronic with satisfying completion sounds'
};

// ============================================================================
// CHAPTER 6: ASK GENIE - "Your Wish is My Command"
// ============================================================================

export const ASK_GENIE_CHAPTER: ChapterScript = {
  id: 'ask-genie',
  title: 'Ask Genie - Your Wish is My Command',
  duration: '40 seconds',
  visual: {
    type: 'immersive',
    background: 'Floating in cosmic space with the Genie lamp nearby',
    elements: [
      'Ask Genie logo (speech bubble with sparkle)',
      'Immersive chat interface floating in space',
      'Question bubbles appearing and being answered',
      'Workflow visualizations appearing from answers',
      'Product icons lighting up as they are discussed',
      'Help articles materializing as floating cards'
    ],
    transitions: [
      'User question appears → Genie thinks → answer materializes',
      'Answer includes visual workflow → workflow animates',
      'Related products glow when mentioned',
      'Deep dive cards float into view'
    ]
  },
  voiceover: {
    en: `*Genie floats in cosmic space near lamp*

"Sometimes... you just need to ASK.

*chat interface appears*

'Hey Genie, how do I make a TikTok from my podcast?'

*workflow appears*

And just like THAT – I show you the exact steps, the exact tools, the exact settings.

*product icons glow*

'Which product should I use for my investor pitch?'

*Deck and Spark light up*

Spark for the script. Deck for the slides. Vibe if you want video. I'll guide you through ALL of it.

*help cards appear*

I know 206 pipelines. I know every feature. I've read every document.

Ask me anything. Seriously. Anything about creating, editing, publishing, collaborating...

*winks*

Your wish... is my command."`,
    dialectNotes: {
      ar: 'Use warm, helpful Arabic tone, reference Genie mythology',
      hi: 'Use friendly Hindi assistant tone, reference helpful guide character',
      zh: 'Use knowledgeable Chinese assistant tone, reference wise helper',
      ja: 'Use polite Japanese concierge tone, reference おもてなし service',
      ko: 'Use helpful Korean customer service tone, reference 친절한 안내',
      es: 'Use warm Spanish helper tone, reference amigo assistance',
      fr: 'Use elegant French concierge tone, reference service excellence',
      pt: 'Use friendly Brazilian helper tone, reference jeitinho assistance',
      sw: 'Use Ubuntu-inspired community help tone, reference collective support'
    }
  },
  technicalHighlights: [
    'Natural language understanding',
    'Workflow recommendations based on user goals',
    'Product and feature navigation',
    '206 pipeline knowledge base',
    'Multi-language support',
    'Context-aware suggestions',
    'Step-by-step guidance',
    'Integration with all 7 products'
  ],
  modelsShowcased: [
    'Claude (Conversational AI)',
    'GPT-4o (Complex reasoning)',
    'RAG Pipeline (Knowledge retrieval)',
    'Universal Knowledge Base'
  ],
  voiceDirection: {
    tone: 'Warm, helpful, all-knowing but humble',
    pace: 'Conversational, patient',
    emotion: 'Genuine desire to help, wisdom',
    humor: 'Playful callback to traditional Genie mythology'
  },
  musicCue: 'Ambient, cosmic, with magical chime accents'
};

// ============================================================================
// CHAPTER 7: GENIE CAST - "Make It. Show It. Scale It."
// ============================================================================

export const CAST_CHAPTER: ChapterScript = {
  id: 'cast',
  title: 'Genie Cast - Make It. Show It. Scale It.',
  duration: '50 seconds',
  visual: {
    type: 'avatar_presenter',
    background: 'Global distribution center with world map and streaming lines',
    elements: [
      'Genie Cast logo (broadcast tower with waves)',
      'AI Avatar presenter revealing the "meta" moment',
      'World map with 14 regional nodes lighting up',
      'Platform distribution visualization',
      'This video playing within the demo (meta loop)',
      'All 7 product logos arranged together',
      'All 12 AI provider logos showcased'
    ],
    transitions: [
      'Avatar reveals "I was made WITH Genie Cast"',
      'World map lights up region by region',
      'Platforms populate: YouTube, LinkedIn, TikTok, Instagram',
      'Current video appears as "exhibit A"',
      'Full ecosystem visualization'
    ]
  },
  voiceover: {
    en: `*Avatar presenter smiles knowingly*

"Now here's the fun part...

*gestures to self*

This video you're watching? The avatar presenting it? The voices in every language?

*reveals behind the scenes*

ALL made with Genie Cast.

*world map lights up*

Cast is our distribution engine. 14 global regions. 6 major platforms. Automatic localization.

*meta moment*

We don't just TELL you what we can do... we SHOW you by DOING it.

*current video appears in demo*

This exact video exists in Arabic, Hindi, Chinese, Japanese, Spanish, French, Korean, Portuguese, and more – each one LOCALLY authentic, not translated.

*ecosystem appears*

Spark wrote it. Mind enhanced it. Vibe produced it. Deck created supporting materials. Arc scheduled it. I answered your questions. And Cast... Cast sent it to the WORLD.

That's dogfooding. That's proof. That's Genie Cast."`,
    dialectNotes: {
      ar: 'Emphasize reaching the Arab world authentically, reference regional distribution',
      hi: 'Emphasize reaching Bharat in its languages, reference local platform distribution',
      zh: 'Emphasize reaching China through proper channels, reference local platform requirements',
      ja: 'Emphasize reaching Japan with cultural precision, reference Japanese market approach',
      ko: 'Emphasize reaching Korea with K-quality production, reference Korean market',
      es: 'Emphasize reaching LATAM with local flavor, reference Spanish-speaking world',
      fr: 'Emphasize reaching Francophone markets, reference French cultural precision',
      pt: 'Emphasize reaching Brazil and Lusophone markets, reference Brazilian authenticity',
      sw: 'Emphasize reaching Africa with representation, reference Pan-African growth'
    }
  },
  technicalHighlights: [
    '26 Cast-specific pipelines',
    '14 Regional distribution bundles',
    '6 Platform integrations (YouTube, LinkedIn, TikTok, Instagram, Twitter, Blog)',
    'Automatic localization (dialect-based, not translation)',
    'Content scheduling and automation',
    'Marketing analytics',
    'Dogfooding demonstration (this video is the proof)',
    'Full ecosystem integration showcase'
  ],
  modelsShowcased: [
    'All 12 Core Providers working together:',
    'OpenAI, Claude, Gemini, DeepSeek, Alibaba',
    'Azure, ModelsLab, Meshy AI, ElevenLabs',
    'DeepL, Replicate, GCP'
  ],
  voiceDirection: {
    tone: 'Proud, meta-aware, triumphant',
    pace: 'Building to reveal, then celebratory',
    emotion: 'Pride, accomplishment, invitation',
    humor: 'Meta-joke about "dogfooding" and self-demonstration'
  },
  musicCue: 'Epic orchestral building to triumphant crescendo'
};

// ============================================================================
// CLOSING: CALL TO ACTION
// ============================================================================

export const CLOSING_SCENE: ChapterScript = {
  id: 'closing',
  title: 'Your Story Awaits',
  duration: '35 seconds',
  visual: {
    type: '3d_animated',
    background: 'Return to Genie lamp scene, now with all products orbiting',
    elements: [
      'Genie back at lamp, all 7 products orbiting',
      'Animated "click here" character (small, cute, bouncy)',
      'Registration button glowing',
      'Free trial badge',
      'All language options displayed',
      'Final tagline: "Your Wish is Our Command"'
    ],
    transitions: [
      'Genie gestures to registration',
      'Cute character bounces toward button',
      'Button pulses with invitation',
      'Language options fan out',
      'Final magical flourish'
    ]
  },
  voiceover: {
    en: `*Genie gestures warmly*

"So... that's the magic.

*products orbit around*

Seven products. 206 pipelines. 12 AI partners. 70+ languages. One ecosystem.

*small animated character appears*

But don't take MY word for it...

*character bounces toward button*

Click here. Try it FREE. Create something amazing.

*final flourish*

Whether you're a solo creator, a startup founder, or an enterprise team – Genie Suite is ready to serve.

*winks and bows*

After all... your wish is our command.

*lamp glows*

Now go make some magic."`,
    dialectNotes: {
      ar: 'End with traditional Arabic blessing for success, warm invitation',
      hi: 'End with Hinglish encouragement, reference creating your story',
      zh: 'End with Chinese prosperity wishes, reference building success',
      ja: 'End with Japanese encouragement for trying, reference making quality content',
      ko: 'End with Korean fighting spirit (화이팅), reference creating success',
      es: 'End with Latin warmth and encouragement, reference your creative journey',
      fr: 'End with French elegance and invitation, reference artistic creation',
      pt: 'End with Brazilian enthusiasm, reference making magic happen',
      sw: 'End with Swahili unity blessing, reference community and creation'
    }
  },
  technicalHighlights: [
    'Clear CTA: Free trial registration',
    'Multi-language accessibility',
    'Animated interaction prompt',
    'Ecosystem summary',
    'Emotional close connecting to opening'
  ],
  modelsShowcased: [],
  voiceDirection: {
    tone: 'Warm, inviting, magical',
    pace: 'Slowing down, giving space',
    emotion: 'Invitation, warmth, magic',
    humor: 'Callback to opening Genie jokes, playful wink'
  },
  musicCue: 'Reprise of opening mystical theme, ending on magical note'
};

// ============================================================================
// FULL SCRIPT COMPILATION
// ============================================================================

export const GENIE_STUDIO_FULL_SCRIPT = {
  metadata: {
    title: 'Genie Studio - The Complete Creative Ecosystem',
    version: '2.0',
    totalDuration: '5:30 - 6:00 minutes',
    targetAudience: 'Creators, Marketers, Enterprises, Educators',
    productionStyle: 'Mixed media: 3D Animation, Avatar Presenters, PPT, Live Demos, Immersive',
    languages: ['en', 'ar', 'hi', 'zh', 'ja', 'ko', 'es', 'fr', 'pt', 'sw'],
    localizationApproach: 'Dialect-based transcreation, NOT translation'
  },
  chapters: [
    OPENING_SCENE,
    SPARK_CHAPTER,
    MIND_CHAPTER,
    VIBE_CHAPTER,
    DECK_CHAPTER,
    ARC_CHAPTER,
    ASK_GENIE_CHAPTER,
    CAST_CHAPTER,
    CLOSING_SCENE
  ],
  globalProduction: {
    voiceArtistGuidelines: {
      character: 'Friendly Genie - warm, magical, slightly mischievous but professional',
      energy: 'High but not hyperactive, enthusiastic but not pushy',
      humor: 'Light, self-aware, relatable tech humor',
      pacing: 'Varied - slow for wonder, fast for excitement, pauses for emphasis'
    },
    musicDirection: {
      overall: 'Mystical electronic fusion with orchestral elements',
      moodProgression: 'Wonder → Excitement → Pride → Invitation',
      keyMoments: [
        'Lamp opening: Mysterious, building',
        'Product demos: Energetic, matching each product vibe',
        'Closing: Warm, magical callback to opening'
      ]
    },
    visualStyle: {
      colorPalette: {
        primary: 'Deep purple (#7c3aed), Gold (#f59e0b)',
        secondary: 'Sky blue (#0ea5e9), Emerald (#10b981)',
        accent: 'Rose (#f43f5e), Amber (#f59e0b)'
      },
      avatarStyle: 'Non-human but friendly, ethereal, approachable',
      animationStyle: 'Smooth, magical particles, floating elements',
      consistency: 'All products share visual language but have unique accents'
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get script for a specific chapter
 */
export function getChapterScript(chapterId: string): ChapterScript | undefined {
  return GENIE_STUDIO_FULL_SCRIPT.chapters.find(ch => ch.id === chapterId);
}

/**
 * Get all voiceovers in a specific language
 */
export function getLocalizedVoiceovers(languageCode: string): Array<{
  chapterId: string;
  title: string;
  voiceover: string;
  dialectNote: string;
}> {
  return GENIE_STUDIO_FULL_SCRIPT.chapters.map(chapter => ({
    chapterId: chapter.id,
    title: chapter.title,
    voiceover: languageCode === 'en' 
      ? chapter.voiceover.en 
      : chapter.voiceover.en, // Base script, to be transcreated
    dialectNote: chapter.voiceover.dialectNotes[languageCode] || 
                 chapter.voiceover.dialectNotes.en || 
                 'Standard localization'
  }));
}

/**
 * Get production-ready script with timing
 */
export function getProductionScript(): string {
  let script = '# GENIE STUDIO - PRODUCTION SCRIPT\n';
  script += `# Version: ${GENIE_STUDIO_FULL_SCRIPT.metadata.version}\n`;
  script += `# Total Duration: ${GENIE_STUDIO_FULL_SCRIPT.metadata.totalDuration}\n\n`;
  
  GENIE_STUDIO_FULL_SCRIPT.chapters.forEach((chapter, index) => {
    script += `## ${index}. ${chapter.title.toUpperCase()}\n`;
    script += `Duration: ${chapter.duration}\n`;
    script += `Visual Type: ${chapter.visual.type}\n\n`;
    script += `### VOICEOVER:\n${chapter.voiceover.en}\n\n`;
    script += `### VOICE DIRECTION:\n`;
    script += `- Tone: ${chapter.voiceDirection.tone}\n`;
    script += `- Pace: ${chapter.voiceDirection.pace}\n`;
    script += `- Emotion: ${chapter.voiceDirection.emotion}\n`;
    if (chapter.voiceDirection.humor) {
      script += `- Humor: ${chapter.voiceDirection.humor}\n`;
    }
    script += `\n### MUSIC: ${chapter.musicCue}\n\n`;
    script += `---\n\n`;
  });
  
  return script;
}

/**
 * Get technical highlights across all chapters
 */
export function getAllTechnicalHighlights(): string[] {
  const highlights: string[] = [];
  GENIE_STUDIO_FULL_SCRIPT.chapters.forEach(chapter => {
    highlights.push(...chapter.technicalHighlights);
  });
  return [...new Set(highlights)]; // Remove duplicates
}

export default GENIE_STUDIO_FULL_SCRIPT;
