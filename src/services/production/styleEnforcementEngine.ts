/**
 * STYLE ENFORCEMENT ENGINE
 *
 * Lightweight validation layer that ensures the selected visual style is
 * consistently applied throughout the production pipeline.
 *
 * Three responsibilities:
 * 1. Inject style directives into scene prompts before dispatch
 * 2. Validate pipeline step outputs match style expectations
 * 3. Provide style-appropriate provider hints
 *
 * Wired into useCastProductionOrchestrator before dispatching each step.
 */

// ─── TYPES ─────────────────────────────────────────────────────────────────

export interface StyleEnforcementConfig {
  /** DB IDs of selected visual styles */
  selectedStyleIds: string[];
  /** Style category from cast_visual_styles.category */
  selectedStyleCategory: string;
  /** e.g. '16:9' */
  aspectRatio: string;
  /** e.g. '1920x1080' */
  resolution: string;
  /** 'preview' | 'production' | 'cinematic' */
  productionQuality: string;
}

export interface StyleMetadata {
  label: string;
  custom_prompt?: string;
  character_type?: string;
  category: string;
}

export interface StyleConsistencyResult {
  valid: boolean;
  warnings: string[];
}

export interface StyleProviderHints {
  preferredImageProvider?: string;
  preferredVideoProvider?: string;
}

// ─── STYLE DIRECTIVE MAPS ──────────────────────────────────────────────────

const CATEGORY_DIRECTIVES: Record<string, string> = {
  artistic:      'Artistic style with bold colors and expressive compositions.',
  character:     'Character-focused illustration with detailed figure work.',
  illustration:  'Illustrated style with clean linework and stylized forms.',
  motion:        'Dynamic motion style with implied movement and energy.',
  social:        'Social media-optimized, bold text-friendly layout.',
  media:         'Broadcast media style with professional framing.',
  healthcare:    'Clean, trustworthy healthcare visual language.',
  education:     'Clear, educational visual style with informative layout.',
  gaming:        'Gaming aesthetic with vibrant effects and dynamic action.',
  lifestyle:     'Warm lifestyle photography feel with natural lighting.',
  ecommerce:     'Product-focused e-commerce visual with clean background.',
  presentation:  'Professional presentation style with clean typography.',
  framework:     'Structured framework layout with data visualization feel.',
  seasonal:      'Festive, seasonal visual style with celebratory elements.',
  storytelling:  'Narrative storytelling visual with cinematic pacing.',
  immersive:     'Immersive, enveloping visual with depth and atmosphere.',
  demo:          'Product demo style with screen-capture and highlight overlays.',
};

const QUALITY_HINTS: Record<string, string> = {
  preview:    'Fast render, lower detail acceptable.',
  production: 'Balanced quality and speed, production-ready.',
  cinematic:  'Maximum visual fidelity, cinematic grading, high detail.',
};

// ─── CORE FUNCTIONS ────────────────────────────────────────────────────────

/**
 * Inject style directives into a visual prompt before dispatch.
 * Prepends style directive so the image/video provider adheres to the chosen style.
 */
export function enforceStyleOnPrompt(
  prompt: string,
  styleConfig: StyleEnforcementConfig,
  styleMetadata: StyleMetadata,
): string {
  const parts: string[] = [];

  // 1. Custom prompt from the style (DB-authored)
  if (styleMetadata.custom_prompt) {
    parts.push(styleMetadata.custom_prompt);
  } else {
    // Fallback to category directive
    const directive = CATEGORY_DIRECTIVES[styleMetadata.category];
    if (directive) parts.push(directive);
  }

  // 2. Style label as explicit instruction
  parts.push(`Visual style: ${styleMetadata.label}.`);

  // 3. Character type hint if present
  if (styleMetadata.character_type) {
    parts.push(`Character style: ${styleMetadata.character_type}.`);
  }

  // 4. Quality hint
  const qualityHint = QUALITY_HINTS[styleConfig.productionQuality];
  if (qualityHint) parts.push(qualityHint);

  // 5. Aspect ratio and resolution hints
  parts.push(`Aspect ratio: ${styleConfig.aspectRatio}. Resolution: ${styleConfig.resolution}.`);

  // Combine: style directive first, then original prompt
  const stylePrefix = parts.join(' ');
  return `${stylePrefix}\n\n${prompt}`;
}

/**
 * Validate that a pipeline step type aligns with the selected style.
 * Returns warnings (not blockers) — style mismatches degrade quality but don't break the pipeline.
 */
export function validateStepStyleConsistency(
  stepType: string,
  styleCategory: string,
): StyleConsistencyResult {
  const warnings: string[] = [];

  // Anime style with photorealistic generation steps
  if (styleCategory === 'illustration' && stepType === 'photorealistic_render') {
    warnings.push('Illustration style with photorealistic render — output may be inconsistent.');
  }

  // Gaming/motion style with static-only steps
  if ((styleCategory === 'gaming' || styleCategory === 'motion') && stepType === 'static_image_only') {
    warnings.push(`${styleCategory} style works best with motion-enabled steps.`);
  }

  // Presentation style with heavy VFX steps
  if (styleCategory === 'presentation' && stepType === 'heavy_vfx') {
    warnings.push('Presentation style typically uses clean visuals — heavy VFX may conflict.');
  }

  return { valid: warnings.length === 0, warnings };
}

/**
 * Get style-appropriate provider hints.
 * Some styles produce better results with specific providers.
 */
export function getStyleProviderHints(
  styleCategory: string,
): StyleProviderHints {
  switch (styleCategory) {
    case 'illustration':
    case 'character':
      return { preferredImageProvider: 'gemini', preferredVideoProvider: 'alibaba-wan' };
    case 'artistic':
      return { preferredImageProvider: 'gemini', preferredVideoProvider: 'sora-2' };
    case 'gaming':
    case 'motion':
      return { preferredImageProvider: 'modelslab', preferredVideoProvider: 'modelslab-animate' };
    case 'immersive':
      return { preferredImageProvider: 'vertex-imagen', preferredVideoProvider: 'sora-2' };
    case 'seasonal':
    case 'storytelling':
      return { preferredImageProvider: 'gemini', preferredVideoProvider: 'sora-2' };
    default:
      return {};
  }
}
