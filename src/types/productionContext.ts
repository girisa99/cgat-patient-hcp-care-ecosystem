/**
 * Production Context - Flows from Production Hub to Recording Studio
 * Contains all info needed to configure studio based on production settings
 */

import type { ShowType, ProductionStage, ShowWithParticipants, ShowAsset, ShowParticipant } from './shows';
import type { ScriptMode } from './projects';
import type { ProductionCapability } from '@/services/marketing/aiMessagingGeneratorService';

/**
 * Maps ShowType to default ProductionCapability for auto-deriving context
 */
export const SHOW_TYPE_TO_PRODUCTION_CAPABILITY: Partial<Record<ShowType, { primary: ProductionCapability; secondary?: ProductionCapability }>> = {
  // Media Productions
  podcast: { primary: 'stock_remix', secondary: 'avatar_lipsync' },
  webcast: { primary: 'avatar_lipsync', secondary: 'ppt_slides' },
  interview: { primary: 'avatar_lipsync', secondary: 'stock_remix' },
  panel: { primary: 'avatar_lipsync', secondary: 'stock_remix' },
  tutorial: { primary: 'avatar_lipsync', secondary: 'motion_graphics' },
  broadcast: { primary: 'stock_remix', secondary: 'motion_graphics' },
  // Business Meetings
  discovery_call: { primary: 'avatar_lipsync' },
  sales_meeting: { primary: 'ppt_slides', secondary: 'avatar_lipsync' },
  project_kickoff: { primary: 'ppt_slides' },
  status_update: { primary: 'ppt_slides' },
  consultation: { primary: 'avatar_lipsync' },
  // Events
  workshop: { primary: 'ppt_slides', secondary: 'motion_graphics' },
  webinar: { primary: 'ppt_slides', secondary: 'avatar_lipsync' },
  conference: { primary: 'ppt_slides', secondary: 'motion_graphics' },
  training_session: { primary: 'avatar_lipsync', secondary: 'ppt_slides' },
  // Genie Studio Demos
  genie_studio_full: { primary: 'motion_graphics', secondary: 'avatar_lipsync' },
  genie_spark_demo: { primary: 'motion_graphics', secondary: 'banner_static' },
  genie_arc_demo: { primary: 'motion_graphics' },
  genie_mind_demo: { primary: 'avatar_lipsync', secondary: 'stock_remix' },
  genie_vibe_demo: { primary: 'motion_graphics', secondary: '3d_vr' },
  genie_suite_overview: { primary: 'motion_graphics', secondary: 'ppt_slides' },
  other: { primary: 'stock_remix' },
};

/**
 * Maps ShowType to ScriptMode for unified configuration
 */
export const SHOW_TYPE_TO_SCRIPT_MODE: Record<ShowType, ScriptMode> = {
  // Media Productions
  podcast: 'podcast',
  webcast: 'webcast',
  interview: 'podcast',
  panel: 'podcast',
  tutorial: 'video',
  broadcast: 'webcast',
  other: 'audio',
  // Business Meetings - default to audio/podcast style
  discovery_call: 'audio',
  sales_meeting: 'audio',
  project_kickoff: 'audio',
  status_update: 'audio',
  consultation: 'audio',
  // Events - default to webcast style
  workshop: 'video',
  webinar: 'webcast',
  conference: 'webcast',
  training_session: 'video',
  // Genie Studio Demos - default to video style
  genie_studio_full: 'video',
  genie_spark_demo: 'video',
  genie_arc_demo: 'video',
  genie_mind_demo: 'video',
  genie_vibe_demo: 'video',
  genie_suite_overview: 'video',
};

/**
 * Production context passed to Recording Studio
 */
export interface ProductionContext {
  // Show/Production info
  showId: string;
  showTitle: string;
  showType: ShowType;
  showDescription?: string;
  currentStage: ProductionStage;
  scheduledDate?: string;
  
  // Script mode derived from show type
  scriptMode: ScriptMode;
  
  // Linked assets
  linkedScriptId?: string;
  linkedMusicId?: string;
  
  // Participants
  participants: {
    id: string;
    name: string;
    email?: string;
    role: string;
    avatarUrl?: string;
  }[];
  
  // Assets from the production
  assets: {
    scripts: { id: string; name: string; url?: string }[];
    voiceovers: { id: string; name: string; url: string }[];
    music: { id: string; name: string; url: string }[];
    recordings: { id: string; name: string; url: string }[];
  };
  
  // Metadata
  metadata?: Record<string, any>;
}

/**
 * Builds production context from a show with participants
 */
export function buildProductionContext(show: ShowWithParticipants): ProductionContext {
  const assets = show.assets || [];
  
  const scriptAssets = assets.filter(a => a.asset_type === 'script');
  const voiceoverAssets = assets.filter(a => a.asset_type === 'voiceover');
  const musicAssets = assets.filter(a => a.asset_type === 'music');
  const recordingAssets = assets.filter(a => a.asset_type === 'recording' || a.asset_type === 'audio' || a.asset_type === 'video');
  
  return {
    showId: show.id,
    showTitle: show.title,
    showType: show.show_type,
    showDescription: show.description || undefined,
    currentStage: show.current_stage,
    scheduledDate: show.scheduled_date || undefined,
    scriptMode: SHOW_TYPE_TO_SCRIPT_MODE[show.show_type] || 'audio',
    linkedScriptId: show.metadata?.linked_script_id,
    linkedMusicId: show.metadata?.linked_music_id,
    participants: (show.participants || []).map(p => ({
      id: p.id,
      name: p.name,
      email: p.email || undefined,
      role: p.role,
      avatarUrl: p.avatar_url || undefined,
    })),
    assets: {
      scripts: scriptAssets.map(a => ({ id: a.id, name: a.name, url: a.file_url || undefined })),
      voiceovers: voiceoverAssets.map(a => ({ id: a.id, name: a.name, url: a.file_url || '' })),
      music: musicAssets.map(a => ({ id: a.id, name: a.name, url: a.file_url || '' })),
      recordings: recordingAssets.map(a => ({ id: a.id, name: a.name, url: a.file_url || '' })),
    },
    metadata: show.metadata,
  };
}

/**
 * Recording studio settings derived from production context
 */
export interface StudioSettingsFromProduction {
  // Teleprompter settings
  teleprompterSpeed: number;
  teleprompterEnabled: boolean;
  
  // TTS settings
  ttsVoiceId: string;
  ttsProvider: 'openai' | 'elevenlabs';
  ttsVoiceSettings: {
    stability: number;
    similarity_boost: number;
    style: number;
    speed: number;
  };
  
  // Recording layout
  showParticipantList: boolean;
  showTimer: boolean;
  showVisualCues: boolean;
  
  // Audio settings
  studioSoundEnabled: boolean;
  noiseReductionLevel: 'low' | 'medium' | 'high';
}
