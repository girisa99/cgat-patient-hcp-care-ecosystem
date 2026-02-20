/**
 * Cast End-to-End Prompt Engine
 *
 * From a single prompt → full production-ready video.
 * Handles: script → scenes → visuals → audio → characters → lip-sync → assembly.
 *
 * Supports two modes:
 * 1. PLAN mode — Generate a full production plan, user reviews/approves each scene
 * 2. GENERATE mode — Execute the plan, generate assets for each scene
 *
 * Works with ALL creative styles (Pixar, Disney, Anime, Regional)
 * and ALL input types (text, image, video, URL, screenshot, mixed).
 */

import type { CreativeStyleFamily, CreativeStyleProfile, CharacterDesign } from './castCreativeStylesRegistry';
import { enrichPromptWithRegion, getRegionalMusicPrompt, getRegionalNarrativeStyle, CREATIVE_STYLES } from './castCreativeStylesRegistry';
import type {
  ProductionPlan,
  ProductionScene,
  PipelineInput,
  AssetHandling,
  ProductionMode,
  ProductionUseCase,
  QualityTier,
  PipelineStep,
  OutputDeliverable,
} from './creativeProductionPipeline';
import type { BrandIntelligenceProfile, BusinessTier } from './brandIntelligenceEngine';

// ─── Prompt Engine Configuration ─────────────────────────────────────────────

export interface CastPromptConfig {
  // Core
  prompt: string;                     // User's main prompt / description
  language: string;                   // Primary language
  regionCode: string;                 // Target region

  // Style
  styleFamily: CreativeStyleFamily;   // Pixar, Disney, Anime, etc.
  styleIntensity: 1 | 2 | 3 | 4 | 5; // 1=subtle style, 5=full style immersion

  // Characters
  characterCount: number;             // 0 = narrator only, 1+ = characters
  characterStyle: 'human' | 'animal' | 'mascot' | 'robot' | 'cultural' | 'auto';
  includeCompanionCreature: boolean;  // Regional companion creature
  lipSyncEnabled: boolean;

  // Humor
  humorLevel: 0 | 1 | 2 | 3 | 4 | 5; // 0=serious, 5=comedy
  humorStyle: 'auto' | 'situational' | 'slapstick' | 'wordplay' | 'cultural_reference';

  // Production
  mode: ProductionMode;
  quality: QualityTier;
  targetDuration: number;             // seconds
  sceneCount?: number;                // Override auto scene count

  // Inputs
  inputs: PipelineInput[];            // User-provided assets

  // Brand
  brandProfile?: Partial<BrandIntelligenceProfile>;

  // Output
  outputLanguages: string[];          // Languages to produce
  platforms: string[];                // Target platforms (youtube, instagram, whatsapp, etc.)
}

// ─── Scene Script ────────────────────────────────────────────────────────────

export interface SceneScript {
  sceneNumber: number;
  title: string;
  narrationText: string;              // What the narrator/character says
  visualDescription: string;          // What we see (for image/video generation)
  characterActions: string[];         // What characters do in this scene
  emotionalBeat: string;              // The emotional moment (tension, release, humor, etc.)
  cameraDirection: string;            // Camera movement instruction
  musicCue: string;                   // Music change/emphasis
  sfxCues: string[];                  // Sound effects
  textOverlays: string[];             // On-screen text
  duration: number;                   // Target duration in seconds
  inputAssetHandling: AssetHandling;  // How to handle user input for this scene
  generationPrompts: {
    imagePrompt: string;              // For text-to-image generation
    videoPrompt: string;              // For text-to-video or image-to-video
    audioPrompt: string;              // For music/SFX generation
    characterPrompt: string;          // For character/avatar generation
  };
}

// ─── Full Production Script ──────────────────────────────────────────────────

export interface FullProductionScript {
  title: string;
  logline: string;                    // One sentence summary
  targetAudience: string;
  tone: string;
  style: CreativeStyleFamily;
  totalDuration: number;
  sceneCount: number;
  scenes: SceneScript[];
  globalMusicPrompt: string;
  characterDescriptions: Array<{
    id: string;
    name: string;
    visualDescription: string;
    personality: string;
    role: string;                     // 'narrator', 'protagonist', 'sidekick', 'companion'
  }>;
  culturalNotes: string[];            // Important cultural considerations
  brandIntegration: {
    logoPlacement: string;            // When/where to show brand logo
    colorUsage: string;               // How brand colors are used
    messageReinforcement: string;     // How brand message is woven in
  };
}

// ─── Prompt Templates by Style ───────────────────────────────────────────────

export const STYLE_PROMPT_TEMPLATES: Record<CreativeStyleFamily, {
  scenePromptPrefix: string;
  characterPromptPrefix: string;
  environmentPromptPrefix: string;
  negativePrompt: string;
  qualityBoost: string;
}> = {
  pixar_3d: {
    scenePromptPrefix: 'pixar style 3D animated scene, expressive character design, cinematic lighting, subsurface scattering, depth of field, emotional storytelling',
    characterPromptPrefix: 'pixar style 3D character, large expressive eyes, stylized proportions, detailed textures, warm lighting, personality in pose',
    environmentPromptPrefix: 'pixar style 3D environment, detailed and colorful, cinematic composition, volumetric lighting, rich textures',
    negativePrompt: 'realistic photo, uncanny valley, low poly, flat shading, anime, blurry, deformed',
    qualityBoost: 'masterpiece, best quality, 8k, ray tracing, global illumination',
  },
  disney_2d: {
    scenePromptPrefix: 'disney 2D animation style scene, hand-drawn aesthetic, watercolor backgrounds, theatrical lighting, flowing animation',
    characterPromptPrefix: 'disney 2D animated character, hand-drawn style, expressive face, clean linework, dynamic pose, musical energy',
    environmentPromptPrefix: 'disney 2D painted background, atmospheric depth, warm colors, detailed scenery, storybook quality',
    negativePrompt: '3D render, photorealistic, anime, low quality, rough sketch',
    qualityBoost: 'masterpiece, disney quality, detailed, cel animation, professional',
  },
  disney_3d: {
    scenePromptPrefix: 'disney 3D animation style (Frozen/Moana quality), stylized 3D, emotional lighting, magical atmosphere',
    characterPromptPrefix: 'disney 3D animated character, stylized proportions, expressive eyes, detailed hair and clothing, magical quality',
    environmentPromptPrefix: 'disney 3D environment, magical atmosphere, detailed textures, cinematic lighting, awe-inspiring scale',
    negativePrompt: 'realistic photo, anime, low poly, uncanny valley, flat',
    qualityBoost: 'masterpiece, disney quality, cinematic, detailed, magical',
  },
  anime: {
    scenePromptPrefix: 'anime style scene, dramatic lighting, detailed background art, cel-shading, atmospheric',
    characterPromptPrefix: 'anime character, detailed eyes, dynamic pose, cel-shaded, expressive, vibrant colors',
    environmentPromptPrefix: 'anime background art, detailed painted scenery, atmospheric depth, Studio Ghibli quality',
    negativePrompt: '3D render, photorealistic, western cartoon, low quality, deformed',
    qualityBoost: 'masterpiece, best quality, anime key visual, detailed, vibrant',
  },
  cartoon_classic: {
    scenePromptPrefix: 'classic cartoon style scene, exaggerated proportions, bold colors, slapstick energy, rubber hose animation',
    characterPromptPrefix: 'classic cartoon character, exaggerated features, stretchy limbs, big expressions, bold outline',
    environmentPromptPrefix: 'classic cartoon background, simplified but colorful, flat planes with depth cues',
    negativePrompt: 'realistic, 3D, anime, horror, dark',
    qualityBoost: 'professional cartoon quality, clean lines, vibrant colors',
  },
  motion_graphics: {
    scenePromptPrefix: 'clean motion graphics, infographic style, flat design with depth, smooth transitions, data visualization',
    characterPromptPrefix: 'flat design character icon, simplified human figure, clean lines, corporate style',
    environmentPromptPrefix: 'abstract geometric background, gradient colors, clean corporate aesthetic',
    negativePrompt: 'photorealistic, detailed, messy, hand-drawn, anime',
    qualityBoost: 'professional motion graphics, clean, minimal, high contrast',
  },
  whiteboard: {
    scenePromptPrefix: 'whiteboard animation style, hand-drawing effect, black ink on white, educational, step by step reveal',
    characterPromptPrefix: 'whiteboard sketch character, simple line drawing, black ink, minimal detail but expressive',
    environmentPromptPrefix: 'clean white background, hand-drawn elements appearing progressively',
    negativePrompt: 'colored, photorealistic, 3D, anime, complex',
    qualityBoost: 'clean whiteboard animation, smooth drawing effect, professional',
  },
  stop_motion: {
    scenePromptPrefix: 'stop motion claymation style, handmade texture, visible fingerprints in clay, warm studio lighting',
    characterPromptPrefix: 'claymation character, handmade clay figure, textured surface, charming imperfections, wire armature visible',
    environmentPromptPrefix: 'miniature set design, handcrafted props, theatrical lighting, shallow depth of field',
    negativePrompt: 'digital, smooth, photorealistic, anime, 2D',
    qualityBoost: 'professional stop motion, Aardman quality, detailed miniatures',
  },
  comic_book: {
    scenePromptPrefix: 'comic book panel style, bold ink lines, halftone dots, dynamic composition, action frames',
    characterPromptPrefix: 'comic book character, bold outlines, heroic proportions, dynamic pose, speech bubble ready',
    environmentPromptPrefix: 'comic book background, speed lines, dramatic angles, bold shadows, KAPOW effects',
    negativePrompt: 'realistic photo, 3D render, anime, soft, pastel',
    qualityBoost: 'professional comic art, Marvel/DC quality, bold colors',
  },
  watercolor: {
    scenePromptPrefix: 'watercolor illustration in motion, soft edges, paint bleeding, delicate washes, artistic',
    characterPromptPrefix: 'watercolor painted character, soft features, paint texture visible, artistic and dreamy',
    environmentPromptPrefix: 'watercolor landscape, wet on wet technique, soft gradients, atmospheric, impressionistic',
    negativePrompt: 'photorealistic, 3D, anime, sharp lines, digital art',
    qualityBoost: 'professional watercolor, gallery quality, artistic, luminous',
  },
  flat_design: {
    scenePromptPrefix: 'flat design illustration, no gradients, bold geometric shapes, modern minimal, Google/Apple style',
    characterPromptPrefix: 'flat design character, geometric shapes, minimal detail, clean lines, bold colors',
    environmentPromptPrefix: 'flat design background, geometric shapes, solid colors, modern aesthetic',
    negativePrompt: 'realistic, 3D, detailed, textured, anime',
    qualityBoost: 'professional flat design, modern, clean, Material Design quality',
  },
  realistic_avatar: {
    scenePromptPrefix: 'photorealistic scene, professional studio lighting, 4K quality, natural colors',
    characterPromptPrefix: 'photorealistic human, professional appearance, natural skin, detailed features, studio lighting',
    environmentPromptPrefix: 'professional background, office/studio setting, clean, well-lit',
    negativePrompt: 'cartoon, anime, illustration, low quality, blurry, deformed',
    qualityBoost: 'photorealistic, 4K, professional, studio quality, detailed',
  },
  cultural_illustration: {
    scenePromptPrefix: 'traditional cultural art style, regional artistic heritage, handcrafted aesthetic, folk art quality',
    characterPromptPrefix: 'traditional art style character, cultural clothing, regional artistic style, folk art quality',
    environmentPromptPrefix: 'cultural landscape, traditional architecture, regional artistic style, heritage quality',
    negativePrompt: 'modern, digital, anime, western cartoon, generic',
    qualityBoost: 'authentic cultural art, museum quality, detailed traditional techniques',
  },
  retro_vintage: {
    scenePromptPrefix: '80s/90s retro aesthetic, VHS grain, neon colors, synthwave, nostalgic',
    characterPromptPrefix: 'retro 80s character, neon accents, vintage fashion, pixel art elements',
    environmentPromptPrefix: 'retro neon cityscape, arcade aesthetic, VHS quality, synthwave colors',
    negativePrompt: 'modern, clean, minimal, photorealistic, anime',
    qualityBoost: 'retro quality, nostalgic, vibrant neon, professional vintage',
  },
  cyberpunk: {
    scenePromptPrefix: 'cyberpunk scene, neon-lit dystopian city, holographic displays, rain-slicked streets, high tech low life',
    characterPromptPrefix: 'cyberpunk character, neon accents, cybernetic enhancements, street fashion, holographic elements',
    environmentPromptPrefix: 'cyberpunk city, neon signs, holographic ads, flying vehicles, dense urban, rain',
    negativePrompt: 'natural, pastoral, bright, cartoon, cute',
    qualityBoost: 'cinematic cyberpunk, Blade Runner quality, detailed neon, atmospheric',
  },
  documentary: {
    scenePromptPrefix: 'documentary style, real footage aesthetic, natural lighting, informative overlays, interview framing',
    characterPromptPrefix: 'real person in interview setting, natural appearance, professional but authentic',
    environmentPromptPrefix: 'real-world location, natural lighting, documentary camera angles, B-roll quality',
    negativePrompt: 'cartoon, anime, illustration, artificial, CGI',
    qualityBoost: 'broadcast quality, 4K documentary, natural color grading, professional',
  },
  mixed_media: {
    scenePromptPrefix: 'mixed media scene, combining live action with animation, collage aesthetic, creative transitions',
    characterPromptPrefix: 'mixed media character, part photo part illustration, creative composite, artistic',
    environmentPromptPrefix: 'mixed media background, photo collage with illustrated elements, textured layers',
    negativePrompt: 'single style, pure photo, pure illustration, boring, flat',
    qualityBoost: 'professional mixed media, creative composition, artistic quality',
  },
};

// ─── Script Generation Functions ─────────────────────────────────────────────

export function generateScenePrompts(
  scene: SceneScript,
  style: CreativeStyleFamily,
  regionCode: string,
  brandProfile?: Partial<BrandIntelligenceProfile>,
): SceneScript['generationPrompts'] {
  const template = STYLE_PROMPT_TEMPLATES[style];
  const narrative = getRegionalNarrativeStyle(regionCode);

  // Build image prompt
  let imagePrompt = `${template.scenePromptPrefix}. ${scene.visualDescription}`;
  imagePrompt = enrichPromptWithRegion(imagePrompt, regionCode);
  if (brandProfile?.visual) {
    imagePrompt += `. Brand colors: ${brandProfile.visual.primaryColor}, ${brandProfile.visual.secondaryColor}`;
  }
  imagePrompt += `. ${template.qualityBoost}`;

  // Build video prompt
  let videoPrompt = `${imagePrompt}. Camera: ${scene.cameraDirection}. Duration: ${scene.duration}s.`;
  if (scene.characterActions.length > 0) {
    videoPrompt += ` Character actions: ${scene.characterActions.join(', ')}.`;
  }

  // Build character prompt
  let characterPrompt = template.characterPromptPrefix;
  if (scene.characterActions.length > 0) {
    characterPrompt += `. Action: ${scene.characterActions[0]}. Expression: ${scene.emotionalBeat}.`;
  }
  characterPrompt = enrichPromptWithRegion(characterPrompt, regionCode);

  // Build audio prompt
  const music = getRegionalMusicPrompt(regionCode);
  const audioPrompt = `${music.prompt}. Mood: ${scene.musicCue}. Scene emotion: ${scene.emotionalBeat}.`;

  return {
    imagePrompt,
    videoPrompt,
    audioPrompt,
    characterPrompt,
  };
}

// ─── End-to-End Production Builder ───────────────────────────────────────────

export function buildFullProductionScript(config: CastPromptConfig): FullProductionScript {
  const narrative = getRegionalNarrativeStyle(config.regionCode);
  const music = getRegionalMusicPrompt(config.regionCode);
  const styleTemplate = STYLE_PROMPT_TEMPLATES[config.styleFamily];

  // Determine scene count based on duration
  const sceneCount = config.sceneCount ||
    Math.max(3, Math.min(15, Math.ceil(config.targetDuration / 12)));

  // Determine duration per scene
  const durationPerScene = Math.round(config.targetDuration / sceneCount);

  // Build character descriptions
  const characters: FullProductionScript['characterDescriptions'] = [];
  if (config.characterCount > 0) {
    characters.push({
      id: 'char-narrator',
      name: 'Narrator',
      visualDescription: `${styleTemplate.characterPromptPrefix}. Professional, friendly, culturally appropriate for ${config.regionCode}.`,
      personality: narrative?.emotionalTone || 'warm and professional',
      role: 'narrator',
    });
  }

  if (config.includeCompanionCreature) {
    const companion = getRegionalMusicPrompt(config.regionCode); // Use same region
    characters.push({
      id: 'char-companion',
      name: 'Companion',
      visualDescription: `${styleTemplate.characterPromptPrefix}. Regional companion creature for ${config.regionCode}.`,
      personality: 'playful, wise, culturally connected',
      role: 'companion',
    });
  }

  // Build scene scripts
  const scenes: SceneScript[] = [];
  for (let i = 0; i < sceneCount; i++) {
    const isFirst = i === 0;
    const isLast = i === sceneCount - 1;

    let emotionalBeat: string;
    if (isFirst) emotionalBeat = 'intrigue and hook';
    else if (isLast) emotionalBeat = 'confidence and call to action';
    else if (i === 1) emotionalBeat = 'establishing context';
    else if (i === sceneCount - 2) emotionalBeat = 'building to climax';
    else emotionalBeat = i % 2 === 0 ? 'building tension' : 'release and insight';

    scenes.push({
      sceneNumber: i + 1,
      title: isFirst ? 'Opening Hook' :
             isLast ? 'Call to Action' :
             `Scene ${i + 1}`,
      narrationText: '', // To be filled by AI generation
      visualDescription: '', // To be filled by AI generation
      characterActions: config.characterCount > 0 ? ['talking', 'gesturing'] : [],
      emotionalBeat,
      cameraDirection: isFirst ? 'dramatic zoom in' :
                      isLast ? 'slow pull back, wide shot' :
                      i % 3 === 0 ? 'pan left to right' :
                      i % 3 === 1 ? 'dolly forward' :
                      'static with subtle movement',
      musicCue: isFirst ? 'mysterious intro building' :
               isLast ? 'triumphant resolution' :
               'maintain energy, slight variation',
      sfxCues: [],
      textOverlays: [],
      duration: durationPerScene,
      inputAssetHandling: config.inputs.length > 0 ? config.inputs[0].userPreference : 'ai_generate',
      generationPrompts: {
        imagePrompt: '',
        videoPrompt: '',
        audioPrompt: '',
        characterPrompt: '',
      },
    });
  }

  // Generate prompts for each scene
  for (const scene of scenes) {
    scene.generationPrompts = generateScenePrompts(
      scene,
      config.styleFamily,
      config.regionCode,
      config.brandProfile,
    );
  }

  // Cultural notes
  const culturalNotes: string[] = [];
  if (narrative) {
    culturalNotes.push(`Storytelling approach: ${narrative.approach}`);
    culturalNotes.push(`Humor style: ${narrative.humorStyle}`);
    culturalNotes.push(`Formality: Level ${narrative.formalityLevel}/5`);
    culturalNotes.push(`Emotional tone: ${narrative.emotionalTone}`);
  }

  return {
    title: config.prompt.slice(0, 100),
    logline: config.prompt,
    targetAudience: config.brandProfile?.audience?.totalAddressableMarket || 'General audience',
    tone: narrative?.emotionalTone || 'professional',
    style: config.styleFamily,
    totalDuration: config.targetDuration,
    sceneCount,
    scenes,
    globalMusicPrompt: music.prompt,
    characterDescriptions: characters,
    culturalNotes,
    brandIntegration: {
      logoPlacement: 'Opening scene (3s) and closing scene (5s)',
      colorUsage: config.brandProfile?.visual
        ? `Primary: ${config.brandProfile.visual.primaryColor} for headers/CTAs, Secondary: ${config.brandProfile.visual.secondaryColor} for backgrounds`
        : 'Use style default colors',
      messageReinforcement: config.brandProfile?.marketing?.valueProposition?.forCustomer || 'Weave product benefits naturally into narration',
    },
  };
}

// ─── Platform-Specific Output Configs ────────────────────────────────────────

export const PLATFORM_OUTPUT_CONFIGS: Record<string, OutputDeliverable> = {
  youtube: {
    platform: 'youtube',
    format: 'video_mp4',
    aspectRatio: '16:9',
    maxFileSize: '256MB',
    autoResize: true,
    addWatermark: false,
  },
  youtube_shorts: {
    platform: 'youtube_shorts',
    format: 'video_mp4',
    aspectRatio: '9:16',
    maxFileSize: '60MB',
    autoResize: true,
    addWatermark: false,
  },
  instagram_reels: {
    platform: 'instagram_reels',
    format: 'video_mp4',
    aspectRatio: '9:16',
    maxFileSize: '100MB',
    autoResize: true,
    addWatermark: true,
  },
  instagram_post: {
    platform: 'instagram_post',
    format: 'video_mp4',
    aspectRatio: '1:1',
    maxFileSize: '100MB',
    autoResize: true,
    addWatermark: true,
  },
  linkedin: {
    platform: 'linkedin',
    format: 'video_mp4',
    aspectRatio: '16:9',
    maxFileSize: '200MB',
    autoResize: true,
    addWatermark: true,
  },
  tiktok: {
    platform: 'tiktok',
    format: 'video_mp4',
    aspectRatio: '9:16',
    maxFileSize: '72MB',
    autoResize: true,
    addWatermark: false,
  },
  whatsapp_status: {
    platform: 'whatsapp_status',
    format: 'video_mp4',
    aspectRatio: '9:16',
    maxFileSize: '16MB',
    autoResize: true,
    addWatermark: true,
  },
  twitter: {
    platform: 'twitter',
    format: 'video_mp4',
    aspectRatio: '16:9',
    maxFileSize: '512MB',
    autoResize: true,
    addWatermark: false,
  },
  facebook: {
    platform: 'facebook',
    format: 'video_mp4',
    aspectRatio: '4:5',
    maxFileSize: '4000MB',
    autoResize: true,
    addWatermark: true,
  },
  website_hero: {
    platform: 'website_hero',
    format: 'video_webm',
    aspectRatio: '16:9',
    maxFileSize: '50MB',
    autoResize: true,
    addWatermark: false,
  },
  email: {
    platform: 'email',
    format: 'gif',
    aspectRatio: '16:9',
    maxFileSize: '5MB',
    autoResize: true,
    addWatermark: true,
  },
};

// ─── Utility: Get Recommended Platforms by Tier ──────────────────────────────

export function getRecommendedPlatforms(tier: BusinessTier): string[] {
  switch (tier) {
    case 'nano':
      return ['whatsapp_status', 'instagram_reels', 'facebook'];
    case 'micro':
      return ['whatsapp_status', 'instagram_reels', 'instagram_post', 'facebook', 'tiktok'];
    case 'small':
      return ['instagram_reels', 'youtube', 'linkedin', 'facebook', 'tiktok', 'website_hero'];
    case 'medium':
      return ['youtube', 'linkedin', 'instagram_reels', 'twitter', 'website_hero', 'facebook'];
    case 'large':
    case 'enterprise':
      return ['youtube', 'linkedin', 'instagram_reels', 'twitter', 'website_hero', 'facebook', 'email'];
    default:
      return ['youtube', 'instagram_reels', 'linkedin'];
  }
}

export function getPlatformConfig(platform: string): OutputDeliverable | undefined {
  return PLATFORM_OUTPUT_CONFIGS[platform];
}
