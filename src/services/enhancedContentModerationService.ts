/**
 * Enhanced Content Moderation Service
 * Advanced adult content, privacy, and recording detection with regional compliance
 * Integrates with geo-compliance and suspicious activity detection
 */

import { getContentPolicy, getRegionFromCountry, type ComplianceRegion, type ContentRestrictionLevel } from './regionalComplianceRegistry';

// ═══════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export interface ContentModerationConfig {
  region: ComplianceRegion;
  strictMode: boolean;
  enableAudioAnalysis: boolean;
  enableVideoAnalysis: boolean;
  enableImageAnalysis: boolean;
  enableTextAnalysis: boolean;
}

export interface ModerationResult {
  isAllowed: boolean;
  hasViolations: boolean;
  violations: ContentViolation[];
  warnings: ContentWarning[];
  riskScore: number; // 0-100, 0 = safe, 100 = highest risk
  blockedReason?: string;
  requiresManualReview: boolean;
  contentCategory: ContentCategory;
  regionalFlags: RegionalFlag[];
}

export interface ContentViolation {
  type: ViolationType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  matchedPattern?: string;
  confidence: number;
  autoBlock: boolean;
}

export interface ContentWarning {
  type: string;
  message: string;
  recommendation: string;
}

export interface RegionalFlag {
  region: ComplianceRegion;
  flag: string;
  description: string;
  action: 'block' | 'warn' | 'review';
}

export type ViolationType = 
  | 'adult_content'
  | 'explicit_nudity'
  | 'sexual_content'
  | 'pornography'
  | 'violence'
  | 'gore'
  | 'hate_speech'
  | 'discrimination'
  | 'harassment'
  | 'drugs'
  | 'weapons'
  | 'terrorism'
  | 'child_safety'
  | 'privacy_violation'
  | 'pii_exposure'
  | 'religious_insensitivity'
  | 'political_content'
  | 'gambling'
  | 'alcohol'
  | 'tobacco'
  | 'profanity'
  | 'copyright'
  | 'deepfake'
  | 'misinformation';

export type ContentCategory = 
  | 'safe'
  | 'sensitive'
  | 'restricted'
  | 'blocked';

// ═══════════════════════════════════════════════════════════════════
// DETECTION PATTERNS - COMPREHENSIVE
// ═══════════════════════════════════════════════════════════════════

// Adult/Explicit Content Patterns (Critical - Always Block)
const ADULT_CONTENT_PATTERNS = [
  // Core explicit terms
  /\b(porn(ography)?|xxx|nsfw|adult\s*(only|content|video|film|movie))\b/i,
  /\b(nude|naked|nudity|topless|bottomless)\b/i,
  /\b(sex(ual)?|erotic(a)?|sensual|intimate)\b/i,
  /\b(orgasm|climax|arousal|foreplay)\b/i,
  /\b(genital|penis|vagina|breasts?|nipple|buttocks)\b/i,
  /\b(masturbat(e|ion)|self.?pleasure)\b/i,
  /\b(intercourse|coitus|copulat(e|ion))\b/i,
  /\b(stripper|escort|prostitut(e|ion)|sex\s*work)\b/i,
  /\b(fetish|bdsm|bondage|dominat(ion|rix)|submissive)\b/i,
  /\b(hentai|tentacle|rule\s*34)\b/i,
  /\b(cam\s*girl|only\s*fans|adult\s*performer)\b/i,
  /\b(explicit|uncensored|uncut)\b/i,
  /\b(seduc(e|tion)|hook\s*up|one\s*night\s*stand)\b/i,
];

// Violence/Gore Patterns
const VIOLENCE_PATTERNS = [
  /\b(gore|gory|blood(y)?|bloody\s*mess)\b/i,
  /\b(murder|kill(ing)?|slaughter|massacre)\b/i,
  /\b(torture|torment|abuse|assault)\b/i,
  /\b(decapitat(e|ion)|dismember|mutilat(e|ion))\b/i,
  /\b(stab(bing)?|shoot(ing)?|beat(ing)?)\b/i,
  /\b(suicide|self.?harm|cutting)\b/i,
  /\b(execution|lynching|hanging)\b/i,
  /\b(terrorist|terrorism|bomb(ing)?|explosion)\b/i,
  /\b(dead\s*body|corpse|cadaver)\b/i,
];

// Hate Speech/Discrimination Patterns
const HATE_SPEECH_PATTERNS = [
  /\b(hate|hatred|despise)\s+(race|religion|ethnic|gay|trans)/i,
  /\b(racist|racism|bigot(ry)?|prejudice)\b/i,
  /\b(nazi|white\s*supremac(y|ist)|kkk|klan)\b/i,
  /\b(slur|derogatory|offensive\s*term)\b/i,
  /\b(discriminat(e|ion)|segregat(e|ion))\b/i,
  /\b(xenophob(ia|ic)|homophob(ia|ic)|transphob(ia|ic))\b/i,
  /\b(inferior|subhuman|vermin)\b/i,
];

// Drug/Substance Patterns
const DRUG_PATTERNS = [
  /\b(drug(s)?|narcotic(s)?|controlled\s*substance)\b/i,
  /\b(cocaine|heroin|meth(amphetamine)?|fentanyl)\b/i,
  /\b(marijuana|cannabis|weed|pot|hash(ish)?)\b/i,
  /\b(lsd|acid|mushroom|shroom|mdma|ecstasy)\b/i,
  /\b(opioid|opiate|morphine|codeine)\b/i,
  /\b(overdose|od|high\s*(on|off))\b/i,
  /\b(dealer|trafficking|smuggl(e|ing))\b/i,
];

// Weapons Patterns
const WEAPONS_PATTERNS = [
  /\b(weapon(s)?|gun(s)?|firearm(s)?)\b/i,
  /\b(rifle|shotgun|pistol|revolver|handgun)\b/i,
  /\b(automatic\s*weapon|assault\s*rifle|ar.?15|ak.?47)\b/i,
  /\b(bomb|explosive|grenade|dynamite)\b/i,
  /\b(knife|blade|sword|machete)\b/i,
  /\b(ammunition|ammo|bullets|cartridge)\b/i,
];

// Privacy/PII Patterns
const PRIVACY_PATTERNS = [
  /\b(\d{3}[-.\s]?\d{2}[-.\s]?\d{4})\b/, // SSN
  /\b(\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4})\b/, // Credit Card
  /\b([A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}[A-Z0-9]?)\b/, // IBAN
  /\b(password|passwd|pwd)\s*[:=]\s*\S+/i,
  /\b(api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*\S+/i,
  /\b(medical\s*record|health\s*record|phi|pii)\b/i,
  /\b(social\s*security|ssn|national\s*id)\b/i,
  /\b(bank\s*account|routing\s*number|swift\s*code)\b/i,
  /\b(driver.?s?\s*license|passport\s*number)\b/i,
];

// Child Safety Patterns (Highest Priority)
const CHILD_SAFETY_PATTERNS = [
  /\b(child|minor|kid|teen)\s*(nude|naked|porn|sex)/i,
  /\b(csam|cp|child\s*abuse|pedophil)/i,
  /\b(underage|under\s*age|jailbait)/i,
  /\b(loli|shota|minor\s*attract)/i,
];

// Profanity Patterns
const PROFANITY_PATTERNS = [
  /\b(fuck|fucking|fucked|fucker)\b/i,
  /\b(shit|shitting|bullshit)\b/i,
  /\b(ass(hole)?|bastard|bitch)\b/i,
  /\b(damn|hell|crap)\b/i,
  /\b(cock|dick|pussy|cunt)\b/i,
];

// Deepfake/Synthetic Media Patterns
const DEEPFAKE_PATTERNS = [
  /\b(deep\s*fake|fake\s*video|synthetic\s*media)\b/i,
  /\b(face\s*swap|body\s*swap)\b/i,
  /\b(fake\s*celebrity|fake\s*politician)\b/i,
  /\b(ai\s*generated\s*fake|manipulated\s*video)\b/i,
];

// Religious Sensitivity (for MENA/APAC regions)
const RELIGIOUS_SENSITIVITY_PATTERNS = [
  /\b(blasphemy|heresy|infidel|kafir)\b/i,
  /\b(insult\s*(allah|prophet|god|jesus|buddha))\b/i,
  /\b(mock(ing)?\s*religion|anti.?(islam|christian|hindu|buddhist))\b/i,
];

// Gambling Patterns
const GAMBLING_PATTERNS = [
  /\b(gambl(e|ing)|casino|bet(ting)?|wager)\b/i,
  /\b(poker|blackjack|roulette|slot\s*machine)\b/i,
  /\b(sports\s*bet(ting)?|lottery|lotto)\b/i,
];

// Alcohol Patterns
const ALCOHOL_PATTERNS = [
  /\b(alcohol|alcoholic|booze|liquor)\b/i,
  /\b(beer|wine|vodka|whiskey|rum|gin|tequila)\b/i,
  /\b(drunk|intoxicated|wasted|hammered)\b/i,
  /\b(bar|pub|club|nightclub)\b/i,
];

// ═══════════════════════════════════════════════════════════════════
// MODERATION SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════

class EnhancedContentModerationService {
  private static instance: EnhancedContentModerationService;
  private config: ContentModerationConfig;

  private constructor() {
    this.config = {
      region: 'US',
      strictMode: true,
      enableAudioAnalysis: true,
      enableVideoAnalysis: true,
      enableImageAnalysis: true,
      enableTextAnalysis: true,
    };
  }

  static getInstance(): EnhancedContentModerationService {
    if (!EnhancedContentModerationService.instance) {
      EnhancedContentModerationService.instance = new EnhancedContentModerationService();
    }
    return EnhancedContentModerationService.instance;
  }

  /**
   * Configure moderation for a specific region/country
   */
  configureForRegion(countryCode: string): void {
    this.config.region = getRegionFromCountry(countryCode);
    console.log(`[ContentModeration] Configured for region: ${this.config.region}`);
  }

  /**
   * Main content moderation function
   */
  async moderateContent(
    content: string,
    contentType: 'text' | 'transcript' | 'prompt' | 'filename' | 'metadata' = 'text'
  ): Promise<ModerationResult> {
    const violations: ContentViolation[] = [];
    const warnings: ContentWarning[] = [];
    const regionalFlags: RegionalFlag[] = [];
    let riskScore = 0;

    const contentPolicy = getContentPolicy(this.config.region);
    const lowerContent = content.toLowerCase();

    // ═══ CRITICAL: Child Safety (Always Block) ═══
    for (const pattern of CHILD_SAFETY_PATTERNS) {
      if (pattern.test(lowerContent)) {
        violations.push({
          type: 'child_safety',
          severity: 'critical',
          description: 'Content related to child exploitation detected',
          matchedPattern: pattern.source,
          confidence: 1.0,
          autoBlock: true,
        });
        riskScore = 100;
      }
    }

    // ═══ Adult Content Detection ═══
    if (!contentPolicy.adultContentAllowed) {
      for (const pattern of ADULT_CONTENT_PATTERNS) {
        if (pattern.test(lowerContent)) {
          violations.push({
            type: 'adult_content',
            severity: 'critical',
            description: 'Adult/explicit content detected',
            matchedPattern: pattern.source,
            confidence: 0.95,
            autoBlock: true,
          });
          riskScore = Math.max(riskScore, 90);
        }
      }
    }

    // ═══ Violence Detection ═══
    const violenceLevel = contentPolicy.violenceLevel;
    if (violenceLevel !== 'standard') {
      for (const pattern of VIOLENCE_PATTERNS) {
        if (pattern.test(lowerContent)) {
          violations.push({
            type: 'violence',
            severity: violenceLevel === 'strict' ? 'high' : 'medium',
            description: 'Violent content detected',
            matchedPattern: pattern.source,
            confidence: 0.85,
            autoBlock: violenceLevel === 'strict',
          });
          riskScore = Math.max(riskScore, violenceLevel === 'strict' ? 80 : 50);
        }
      }
    }

    // ═══ Hate Speech Detection ═══
    for (const pattern of HATE_SPEECH_PATTERNS) {
      if (pattern.test(lowerContent)) {
        violations.push({
          type: 'hate_speech',
          severity: 'high',
          description: 'Hate speech or discriminatory content detected',
          matchedPattern: pattern.source,
          confidence: 0.90,
          autoBlock: true,
        });
        riskScore = Math.max(riskScore, 85);
      }
    }

    // ═══ Privacy/PII Detection ═══
    for (const pattern of PRIVACY_PATTERNS) {
      if (pattern.test(content)) { // Case-sensitive for PII
        violations.push({
          type: 'pii_exposure',
          severity: 'high',
          description: 'Potential personal identifiable information detected',
          matchedPattern: pattern.source,
          confidence: 0.80,
          autoBlock: false,
        });
        riskScore = Math.max(riskScore, 70);
        warnings.push({
          type: 'privacy',
          message: 'Content may contain sensitive personal information',
          recommendation: 'Review and redact any PII before proceeding',
        });
      }
    }

    // ═══ Drug Content Detection ═══
    for (const pattern of DRUG_PATTERNS) {
      if (pattern.test(lowerContent)) {
        const severity = this.config.region === 'MENA' || this.config.region === 'APAC' ? 'high' : 'medium';
        violations.push({
          type: 'drugs',
          severity,
          description: 'Drug-related content detected',
          matchedPattern: pattern.source,
          confidence: 0.85,
          autoBlock: severity === 'high',
        });
        riskScore = Math.max(riskScore, severity === 'high' ? 75 : 40);
      }
    }

    // ═══ Weapons Detection ═══
    if (!contentPolicy.weaponryContentAllowed) {
      for (const pattern of WEAPONS_PATTERNS) {
        if (pattern.test(lowerContent)) {
          violations.push({
            type: 'weapons',
            severity: 'medium',
            description: 'Weapons-related content detected',
            matchedPattern: pattern.source,
            confidence: 0.80,
            autoBlock: false,
          });
          riskScore = Math.max(riskScore, 45);
        }
      }
    }

    // ═══ Deepfake Detection ═══
    for (const pattern of DEEPFAKE_PATTERNS) {
      if (pattern.test(lowerContent)) {
        violations.push({
          type: 'deepfake',
          severity: 'high',
          description: 'Deepfake or synthetic media reference detected',
          matchedPattern: pattern.source,
          confidence: 0.85,
          autoBlock: true,
        });
        riskScore = Math.max(riskScore, 80);
      }
    }

    // ═══ Regional-Specific Checks ═══
    
    // MENA: Religious sensitivity
    if (this.config.region === 'MENA' && contentPolicy.religiousSensitivity === 'strict') {
      for (const pattern of RELIGIOUS_SENSITIVITY_PATTERNS) {
        if (pattern.test(lowerContent)) {
          violations.push({
            type: 'religious_insensitivity',
            severity: 'critical',
            description: 'Content may be religiously insensitive for MENA region',
            matchedPattern: pattern.source,
            confidence: 0.90,
            autoBlock: true,
          });
          regionalFlags.push({
            region: 'MENA',
            flag: 'religious_sensitivity',
            description: 'Content flagged for religious sensitivity review',
            action: 'block',
          });
          riskScore = Math.max(riskScore, 90);
        }
      }

      // Check for alcohol in MENA
      for (const pattern of ALCOHOL_PATTERNS) {
        if (pattern.test(lowerContent)) {
          regionalFlags.push({
            region: 'MENA',
            flag: 'alcohol_content',
            description: 'Alcohol references not permitted in MENA region',
            action: 'block',
          });
          riskScore = Math.max(riskScore, 70);
        }
      }
    }

    // Gambling restrictions
    if (!contentPolicy.gamblingContentAllowed) {
      for (const pattern of GAMBLING_PATTERNS) {
        if (pattern.test(lowerContent)) {
          violations.push({
            type: 'gambling',
            severity: 'medium',
            description: 'Gambling content detected (restricted in region)',
            matchedPattern: pattern.source,
            confidence: 0.85,
            autoBlock: true,
          });
          riskScore = Math.max(riskScore, 60);
        }
      }
    }

    // Profanity check based on region
    if (contentPolicy.profanityLevel !== 'standard') {
      for (const pattern of PROFANITY_PATTERNS) {
        if (pattern.test(lowerContent)) {
          const severity = contentPolicy.profanityLevel === 'strict' ? 'medium' : 'low';
          violations.push({
            type: 'profanity',
            severity,
            description: 'Profanity detected',
            matchedPattern: pattern.source,
            confidence: 0.95,
            autoBlock: contentPolicy.profanityLevel === 'strict',
          });
          riskScore = Math.max(riskScore, severity === 'medium' ? 35 : 15);
        }
      }
    }

    // Custom regional patterns
    for (const pattern of contentPolicy.customPatterns) {
      if (pattern.test(lowerContent)) {
        warnings.push({
          type: 'regional_sensitivity',
          message: `Content may require cultural sensitivity review for ${this.config.region}`,
          recommendation: 'Review content for regional appropriateness',
        });
      }
    }

    // ═══ Determine Final Result ═══
    const hasCriticalViolation = violations.some(v => v.severity === 'critical');
    const hasAutoBlockViolation = violations.some(v => v.autoBlock);
    const requiresManualReview = violations.some(v => v.severity === 'high' && !v.autoBlock);

    let contentCategory: ContentCategory = 'safe';
    if (hasCriticalViolation || hasAutoBlockViolation) {
      contentCategory = 'blocked';
    } else if (violations.length > 0) {
      contentCategory = violations.some(v => v.severity === 'high') ? 'restricted' : 'sensitive';
    }

    return {
      isAllowed: !hasCriticalViolation && !hasAutoBlockViolation,
      hasViolations: violations.length > 0,
      violations,
      warnings,
      riskScore: Math.min(100, riskScore),
      blockedReason: hasCriticalViolation 
        ? violations.find(v => v.severity === 'critical')?.description
        : hasAutoBlockViolation
          ? violations.find(v => v.autoBlock)?.description
          : undefined,
      requiresManualReview,
      contentCategory,
      regionalFlags,
    };
  }

  /**
   * Moderate recording content (audio/video)
   */
  async moderateRecording(
    transcription: string,
    metadata?: { filename?: string; duration?: number; mimeType?: string }
  ): Promise<ModerationResult> {
    // Moderate transcription
    const transcriptResult = await this.moderateContent(transcription, 'transcript');
    
    // Moderate filename if provided
    if (metadata?.filename) {
      const filenameResult = await this.moderateContent(metadata.filename, 'filename');
      if (filenameResult.hasViolations) {
        transcriptResult.violations.push(...filenameResult.violations);
        transcriptResult.riskScore = Math.max(transcriptResult.riskScore, filenameResult.riskScore);
      }
    }

    // Add recording-specific warnings
    if (metadata?.duration && metadata.duration > 3600) {
      transcriptResult.warnings.push({
        type: 'long_recording',
        message: 'Recording exceeds 1 hour - extended review may be required',
        recommendation: 'Consider splitting into shorter segments',
      });
    }

    return transcriptResult;
  }

  /**
   * Moderate file upload
   */
  async moderateFileUpload(file: File): Promise<ModerationResult> {
    const result = await this.moderateContent(file.name, 'filename');
    
    // Check file type restrictions
    const restrictedTypes = ['application/x-executable', 'application/x-msdownload'];
    if (restrictedTypes.includes(file.type)) {
      result.violations.push({
        type: 'privacy_violation',
        severity: 'high',
        description: 'Executable files are not permitted',
        confidence: 1.0,
        autoBlock: true,
      });
      result.riskScore = 100;
      result.isAllowed = false;
    }

    return result;
  }

  /**
   * Get current configuration
   */
  getConfig(): ContentModerationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ContentModerationConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Export singleton instance
export const enhancedContentModeration = EnhancedContentModerationService.getInstance();

export default EnhancedContentModerationService;
