/**
 * GENIE STUDIO VIDEO SCRIPT
 * "Your Creative Journey Begins Here"
 * 
 * Total Duration: ~4:30 minutes
 * Structure: Intro (30s) + 7 Products (30s each = 3:30) + Outro (30s)
 * 
 * This script is designed for dialect adaptation, not literal translation.
 * Each section includes cultural context notes for localization.
 */

export interface ScriptSection {
  id: string;
  title: string;
  duration: number; // seconds
  narrative: string;
  visualCues: string[];
  emotionalTone: string;
  dialectNotes: Record<string, string>;
  keyPhrases: string[];
}

export interface ProductChapter extends ScriptSection {
  productId: string;
  tagline: string;
  icon: string;
  primaryBenefit: string;
  pipelineHighlight: string;
}

/**
 * INTRODUCTION SECTION
 * Duration: 30 seconds
 * Goal: Hook the viewer, establish the problem, introduce Genie Studio
 */
export const INTRO_SCRIPT: ScriptSection = {
  id: 'intro',
  title: 'Welcome to Genie Studio',
  duration: 30,
  narrative: `
    Every great idea deserves to be seen. Heard. Felt.
    
    But turning that spark of inspiration into polished content? 
    That's where the magic often fades.
    
    What if you had a creative partner that understood your vision?
    One that could transform your ideas into presentations, videos, 
    podcasts, and global campaigns—in over 140 languages?
    
    Welcome to Genie Studio.
    Your wish is our command.
  `,
  visualCues: [
    'Floating lightbulb transforming into various content types',
    'Globe with connecting nodes lighting up across regions',
    'Genie logo reveal with sparkle particles',
  ],
  emotionalTone: 'Inspiring, hopeful, empowering',
  dialectNotes: {
    'ar': 'Emphasize the concept of "unlocking potential" (إطلاق الإمكانات) rather than wishes/magic to avoid cultural sensitivity',
    'hi': 'Use the concept of "shakti" (power/capability) - हर महान विचार को देखा जाना चाहिए',
    'zh': 'Focus on efficiency and professionalism - 让创意触手可及',
    'ja': 'Emphasize craftsmanship and precision - すべてのアイデアに価値がある',
    'es': 'Use warm, collaborative tone - Tu socio creativo te espera',
    'fr': 'Sophisticated, artistic approach - L\'art de donner vie à vos idées',
    'ko': 'Modern, tech-forward language - 창의력의 새로운 시대',
    'pt': 'Enthusiastic, action-oriented - Transforme ideias em realidade',
    'sw': 'Community-focused messaging - Mawazo yako, ulimwengu wako',
  },
  keyPhrases: [
    'Every idea deserves to shine',
    'Your creative partner',
    '140+ languages',
    'Your wish is our command',
  ],
};

/**
 * PRODUCT CHAPTERS
 * Duration: 30 seconds each
 * Total: 3:30 minutes
 */
export const PRODUCT_CHAPTERS: ProductChapter[] = [
  {
    id: 'chapter-spark',
    productId: 'spark',
    title: 'Chapter 1: Genie Spark',
    tagline: 'Ignite Your Ideas',
    icon: '⚡',
    duration: 30,
    primaryBenefit: 'Transform any input into structured scripts',
    pipelineHighlight: '28 generation pipelines',
    narrative: `
      It starts with a spark.
      
      Maybe it's a voice note on your morning commute.
      A PDF you need to present tomorrow.
      Or just a brilliant thought you scribbled on a napkin.
      
      Genie Spark takes whatever you have—text, audio, documents, 
      even rough ideas—and transforms them into structured, 
      professional scripts ready for any medium.
      
      Your ideas. Ignited.
    `,
    visualCues: [
      'Various input types (voice wave, document, text) flowing into a central spark',
      'Spark icon pulsing with energy',
      'Script pages emerging beautifully formatted',
    ],
    emotionalTone: 'Energetic, possibility-driven',
    dialectNotes: {
      'ar': 'Use "شرارة الإبداع" (spark of creativity) - emphasize the beginning of something great',
      'hi': 'Reference "प्रेरणा की चिंगारी" - the spark that lights the creative fire',
      'zh': 'Focus on efficiency: "将灵感转化为行动"',
    },
    keyPhrases: [
      'It starts with a spark',
      'Any input, any format',
      'Professional scripts in seconds',
    ],
  },
  {
    id: 'chapter-mind',
    productId: 'mind',
    title: 'Chapter 2: Genie Mind',
    tagline: 'AI That Understands',
    icon: '🧠',
    duration: 30,
    primaryBenefit: 'Intelligent enhancement and voice synthesis',
    pipelineHighlight: '30 enhancement pipelines',
    narrative: `
      Great content isn't just written. It's understood.
      
      Genie Mind reads between the lines. It knows when your 
      script needs more punch. When your tone should shift. 
      When your message needs clarity.
      
      With advanced AI that truly comprehends context, industry, 
      and audience—your content doesn't just sound good.
      It resonates.
      
      Intelligence that understands you.
    `,
    visualCues: [
      'Neural network patterns forming around content',
      'Text being refined with subtle glow effects',
      'Understanding indicators highlighting key insights',
    ],
    emotionalTone: 'Thoughtful, intelligent, reassuring',
    dialectNotes: {
      'ar': 'Emphasize "الفهم العميق" (deep understanding) - wisdom over speed',
      'hi': 'Use "समझ" (samajh) - true comprehension beyond surface level',
      'zh': 'Focus on precision: "深度理解，精准表达"',
    },
    keyPhrases: [
      'AI that truly understands',
      'Context-aware enhancement',
      'Content that resonates',
    ],
  },
  {
    id: 'chapter-vibe',
    productId: 'vibe',
    title: 'Chapter 3: Genie Vibe',
    tagline: 'Script to Screen',
    icon: '🎬',
    duration: 30,
    primaryBenefit: 'Full audio and video production suite',
    pipelineHighlight: '74 production pipelines',
    narrative: `
      Now the magic truly begins.
      
      Genie Vibe transforms your scripts into stunning videos, 
      engaging podcasts, and professional audio content.
      
      Record, edit, add music, create animations—all in one place.
      No studio required. No production team needed.
      
      From script to screen, your vision comes alive.
      
      Feel the vibe.
    `,
    visualCues: [
      'Script pages morphing into video frames',
      'Timeline editor with multiple tracks',
      'Audio waveforms dancing to the beat',
    ],
    emotionalTone: 'Creative, dynamic, exciting',
    dialectNotes: {
      'ar': 'Use "من النص إلى الشاشة" - emphasize the transformation journey',
      'hi': 'Reference Bollywood-style production magic: "स्क्रिप्ट से स्क्रीन तक"',
      'zh': 'Focus on professional output: "专业制作，一键生成"',
    },
    keyPhrases: [
      'Script to screen',
      'No studio required',
      'Your vision comes alive',
    ],
  },
  {
    id: 'chapter-deck',
    productId: 'deck',
    title: 'Chapter 4: Genie Deck',
    tagline: 'Ideas to Impact',
    icon: '📊',
    duration: 30,
    primaryBenefit: 'AI-powered presentation generation',
    pipelineHighlight: '34 presentation pipelines',
    narrative: `
      Presentations that tell stories. Not just slides.
      
      Genie Deck understands that every great presentation 
      is a journey. It crafts slides that flow, visuals that 
      captivate, and narratives that persuade.
      
      Whether you're pitching to investors or teaching a class,
      your ideas deserve to make an impact.
      
      From ideas to impact. Every time.
    `,
    visualCues: [
      'Slides assembling themselves with elegant animations',
      'Charts and graphs coming to life',
      'Audience engagement visualization',
    ],
    emotionalTone: 'Confident, professional, impactful',
    dialectNotes: {
      'ar': 'Emphasize persuasion and influence: "من الفكرة إلى التأثير"',
      'hi': 'Focus on storytelling: "विचारों से प्रभाव तक"',
      'zh': 'Professional business context: "从创意到影响力"',
    },
    keyPhrases: [
      'Stories, not just slides',
      'Narratives that persuade',
      'Ideas to impact',
    ],
  },
  {
    id: 'chapter-arc',
    productId: 'arc',
    title: 'Chapter 5: Genie Arc',
    tagline: 'Your Production Journey',
    icon: '🌀',
    duration: 30,
    primaryBenefit: 'Project management and team collaboration',
    pipelineHighlight: '14 workflow pipelines',
    narrative: `
      Complex projects. Simple orchestration.
      
      Genie Arc is your command center. Track every task, 
      manage every deadline, coordinate every team member.
      
      From initial concept to final delivery, see your 
      entire production journey mapped out before you.
      
      Infinite possibilities. One clear path.
    `,
    visualCues: [
      'Orbital paths connecting project elements',
      'Kanban boards with smooth task transitions',
      'Timeline view showing project milestones',
    ],
    emotionalTone: 'Organized, capable, in-control',
    dialectNotes: {
      'ar': 'Use "رحلة الإنتاج" - the journey metaphor resonates well',
      'hi': 'Focus on team harmony: "आपकी उत्पादन यात्रा"',
      'zh': 'Efficiency focus: "项目全程管理"',
    },
    keyPhrases: [
      'Complex projects made simple',
      'Your command center',
      'Infinite possibilities',
    ],
  },
  {
    id: 'chapter-cast',
    productId: 'cast',
    title: 'Chapter 6: Genie Cast',
    tagline: 'Make It. Show It. Scale It.',
    icon: '📡',
    duration: 30,
    primaryBenefit: 'Global distribution and localization',
    pipelineHighlight: '26 distribution pipelines',
    narrative: `
      Your content deserves a global stage.
      
      Genie Cast doesn't just translate—it transcreates. 
      Your message adapted for 14 regions, 140+ languages, 
      with cultural nuance that truly connects.
      
      One creation. Worldwide impact.
      
      Make it once. Show it everywhere. Scale it infinitely.
    `,
    visualCues: [
      'Content radiating outward across a world map',
      'Regional flags with localized content previews',
      'Analytics showing global engagement',
    ],
    emotionalTone: 'Ambitious, global, connected',
    dialectNotes: {
      'ar': 'Emphasize cultural respect: "نصنعها. نعرضها. نوسعها"',
      'hi': 'Focus on reaching every corner: "बनाएं। दिखाएं। बढ़ाएं।"',
      'zh': 'Global ambition: "创作一次，影响世界"',
    },
    keyPhrases: [
      'Transcreation, not translation',
      '140+ languages',
      'Global stage',
    ],
  },
  {
    id: 'chapter-ask-genie',
    productId: 'ask-genie',
    title: 'Chapter 7: Ask Genie',
    tagline: 'Your Wish Is My Command',
    icon: '✨',
    duration: 30,
    primaryBenefit: 'Ecosystem-wide AI assistant',
    pipelineHighlight: 'Universal support across all products',
    narrative: `
      Lost? Stuck? Need guidance?
      
      Ask Genie is your ever-present companion. Available 
      across every product, ready with answers, suggestions, 
      and creative solutions.
      
      Think of it as having an expert by your side—one who 
      knows every feature, every shortcut, every possibility.
      
      Just ask. Your wish is our command.
    `,
    visualCues: [
      'Friendly genie lamp with soft glow',
      'Chat bubbles with helpful suggestions',
      'Seamless transitions between products with Ask Genie present',
    ],
    emotionalTone: 'Friendly, helpful, magical',
    dialectNotes: {
      'ar': 'Use respectful helper concept: "أمرك" (at your service)',
      'hi': 'Magical assistant: "आपकी इच्छा, हमारा आदेश"',
      'zh': 'Professional assistant: "有问必答，随时待命"',
    },
    keyPhrases: [
      'Ever-present companion',
      'Expert by your side',
      'Your wish is our command',
    ],
  },
];

/**
 * UNIQUE VALUE PROPOSITION BRIDGE
 * Duration: Woven throughout, emphasized in transitions
 */
export const VALUE_PROPOSITIONS = {
  unified: 'One platform, infinite possibilities',
  aiPowered: '206 AI pipelines working in harmony',
  global: '140+ languages, true cultural adaptation',
  accessible: 'Enterprise power, intuitive simplicity',
  integrated: 'Every product works together seamlessly',
};

/**
 * OUTRO SECTION
 * Duration: 30 seconds
 * Goal: Call to action, emotional close, memorable ending
 */
export const OUTRO_SCRIPT: ScriptSection = {
  id: 'outro',
  title: 'Your Story Starts Now',
  duration: 30,
  narrative: `
    Seven products. One vision.
    Your ideas, amplified.
    
    Whether you're a solo creator with a dream,
    or an enterprise team with a mission—
    Genie Studio is ready to bring your story to life.
    
    The world is waiting to hear what you have to say.
    
    Genie Studio.
    Your wish is our command.
    
    Start creating today.
  `,
  visualCues: [
    'All seven product icons orbiting together',
    'User success stories flashing briefly',
    'Logo reveal with call-to-action button',
  ],
  emotionalTone: 'Inspirational, inviting, empowering',
  dialectNotes: {
    'ar': 'End with blessing/encouragement: "ابدأ رحلتك الإبداعية اليوم"',
    'hi': 'Aspirational close: "आज ही अपनी कहानी शुरू करें"',
    'zh': 'Action-oriented: "开启您的创作之旅"',
    'ja': 'Respectful invitation: "あなたの物語を、今日から"',
    'es': 'Warm encouragement: "Tu historia comienza ahora"',
    'fr': 'Elegant invitation: "Votre histoire commence maintenant"',
    'ko': 'Modern call: "당신의 이야기를 시작하세요"',
    'pt': 'Enthusiastic: "Sua história começa agora"',
    'sw': 'Community spirit: "Hadithi yako inaanza sasa"',
  },
  keyPhrases: [
    'Seven products, one vision',
    'Your ideas, amplified',
    'The world is waiting',
    'Start creating today',
  ],
};

/**
 * FULL SCRIPT TIMING BREAKDOWN
 */
export const SCRIPT_TIMING = {
  intro: 30,
  chapter1_spark: 30,
  chapter2_mind: 30,
  chapter3_vibe: 30,
  chapter4_deck: 30,
  chapter5_arc: 30,
  chapter6_cast: 30,
  chapter7_ask_genie: 30,
  outro: 30,
  totalSeconds: 270, // 4 minutes 30 seconds
  totalMinutes: 4.5,
};

/**
 * VOICE AND MUSIC DIRECTION
 */
export const PRODUCTION_NOTES = {
  voiceDirection: {
    style: 'Warm, confident narrator with conversational tone',
    pace: 'Moderate with strategic pauses for emphasis',
    emotion: 'Builds from curious to inspired to empowered',
  },
  musicDirection: {
    intro: 'Soft, building anticipation with light electronic elements',
    chapters: 'Subtle, supportive underscore that shifts with each product',
    transitions: 'Gentle whoosh or sparkle sounds between chapters',
    outro: 'Uplifting crescendo with memorable melody',
  },
  visualStyle: {
    aesthetic: 'Clean, modern, with magical sparkle accents',
    colors: 'Genie brand palette with product-specific accent colors',
    animation: 'Smooth, purposeful motion - not distracting',
    icons: 'Non-human, creative representations of each product',
  },
};

/**
 * Get complete script for a specific language
 */
export const getLocalizedScript = (languageCode: string) => {
  return {
    intro: {
      ...INTRO_SCRIPT,
      dialectNote: INTRO_SCRIPT.dialectNotes[languageCode] || null,
    },
    chapters: PRODUCT_CHAPTERS.map(chapter => ({
      ...chapter,
      dialectNote: chapter.dialectNotes[languageCode] || null,
    })),
    outro: {
      ...OUTRO_SCRIPT,
      dialectNote: OUTRO_SCRIPT.dialectNotes[languageCode] || null,
    },
    timing: SCRIPT_TIMING,
    production: PRODUCTION_NOTES,
  };
};

/**
 * Export complete script as formatted text
 */
export const getFormattedScript = (languageCode: string = 'en'): string => {
  const script = getLocalizedScript(languageCode);
  
  let output = `
================================================================================
                        GENIE STUDIO - VIDEO SCRIPT
                     "Your Creative Journey Begins Here"
================================================================================
Total Duration: ${SCRIPT_TIMING.totalMinutes} minutes
Language: ${languageCode.toUpperCase()}
${script.intro.dialectNote ? `\nDialect Note: ${script.intro.dialectNote}` : ''}

--------------------------------------------------------------------------------
                              INTRODUCTION (0:00 - 0:30)
--------------------------------------------------------------------------------
${script.intro.narrative}

[Visual Cues]
${script.intro.visualCues.map(cue => `• ${cue}`).join('\n')}

[Emotional Tone: ${script.intro.emotionalTone}]

`;

  script.chapters.forEach((chapter, index) => {
    const startTime = 30 + (index * 30);
    const endTime = startTime + 30;
    const startFormatted = `${Math.floor(startTime / 60)}:${(startTime % 60).toString().padStart(2, '0')}`;
    const endFormatted = `${Math.floor(endTime / 60)}:${(endTime % 60).toString().padStart(2, '0')}`;
    
    output += `
--------------------------------------------------------------------------------
          ${chapter.title.toUpperCase()} (${startFormatted} - ${endFormatted})
                    "${chapter.tagline}"
--------------------------------------------------------------------------------
${chapter.narrative}

[Visual Cues]
${chapter.visualCues.map(cue => `• ${cue}`).join('\n')}

[Product Highlight: ${chapter.pipelineHighlight}]
[Emotional Tone: ${chapter.emotionalTone}]
${chapter.dialectNote ? `[Dialect Note: ${chapter.dialectNote}]` : ''}

`;
  });

  output += `
--------------------------------------------------------------------------------
                              OUTRO (4:00 - 4:30)
                         "Your Story Starts Now"
--------------------------------------------------------------------------------
${script.outro.narrative}

[Visual Cues]
${script.outro.visualCues.map(cue => `• ${cue}`).join('\n')}

[Emotional Tone: ${script.outro.emotionalTone}]
${script.outro.dialectNote ? `[Dialect Note: ${script.outro.dialectNote}]` : ''}

================================================================================
                           PRODUCTION NOTES
================================================================================

VOICE DIRECTION:
• Style: ${PRODUCTION_NOTES.voiceDirection.style}
• Pace: ${PRODUCTION_NOTES.voiceDirection.pace}
• Emotion Arc: ${PRODUCTION_NOTES.voiceDirection.emotion}

MUSIC DIRECTION:
• Intro: ${PRODUCTION_NOTES.musicDirection.intro}
• Chapters: ${PRODUCTION_NOTES.musicDirection.chapters}
• Transitions: ${PRODUCTION_NOTES.musicDirection.transitions}
• Outro: ${PRODUCTION_NOTES.musicDirection.outro}

VISUAL STYLE:
• Aesthetic: ${PRODUCTION_NOTES.visualStyle.aesthetic}
• Colors: ${PRODUCTION_NOTES.visualStyle.colors}
• Animation: ${PRODUCTION_NOTES.visualStyle.animation}
• Icons: ${PRODUCTION_NOTES.visualStyle.icons}

================================================================================
                         KEY VALUE PROPOSITIONS
================================================================================
• ${VALUE_PROPOSITIONS.unified}
• ${VALUE_PROPOSITIONS.aiPowered}
• ${VALUE_PROPOSITIONS.global}
• ${VALUE_PROPOSITIONS.accessible}
• ${VALUE_PROPOSITIONS.integrated}

================================================================================
                              END OF SCRIPT
================================================================================
`;

  return output;
};

export default {
  INTRO_SCRIPT,
  PRODUCT_CHAPTERS,
  OUTRO_SCRIPT,
  SCRIPT_TIMING,
  PRODUCTION_NOTES,
  VALUE_PROPOSITIONS,
  getLocalizedScript,
  getFormattedScript,
};
