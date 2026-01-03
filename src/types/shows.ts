/**
 * Types for Shows/Productions system
 */

export type ShowType = 'podcast' | 'webcast' | 'interview' | 'panel' | 'tutorial' | 'other';
export type ProductionStage = 'outreach' | 'script' | 'rehearsal' | 'recording' | 'post_production' | 'published';
export type ParticipantRole = 'host' | 'co_host' | 'guest' | 'panelist' | 'interviewer' | 'interviewee' | 'narrator' | 'other';
export type ParticipantStatus = 'invited' | 'confirmed' | 'declined' | 'tentative' | 'cancelled';

export interface Show {
  id: string;
  user_id: string;
  title: string;
  slug: string | null;
  description: string | null;
  show_type: ShowType;
  current_stage: ProductionStage;
  thumbnail_url: string | null;
  scheduled_date: string | null;
  published_at: string | null;
  landing_page_enabled: boolean;
  embed_enabled: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ShowParticipant {
  id: string;
  show_id: string;
  name: string;
  email: string | null;
  role: ParticipantRole;
  status: ParticipantStatus;
  bio: string | null;
  avatar_url: string | null;
  social_links: Record<string, string>;
  notes: string | null;
  invited_at: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShowStageHistory {
  id: string;
  show_id: string;
  stage: ProductionStage;
  entered_at: string;
  completed_at: string | null;
  notes: string | null;
  completed_by: string | null;
}

export interface ShowAsset {
  id: string;
  show_id: string;
  asset_type: 'script' | 'voiceover' | 'music' | 'recording' | 'thumbnail' | 'video' | 'audio';
  name: string;
  file_url: string | null;
  file_size: number | null;
  duration_seconds: number | null;
  metadata: Record<string, any>;
  stage: ProductionStage | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// Extended types with relationships
export interface ShowWithParticipants extends Show {
  participants?: ShowParticipant[];
  assets?: ShowAsset[];
  stage_history?: ShowStageHistory[];
}

// Stage configuration for UI
export const PRODUCTION_STAGES: { 
  id: ProductionStage; 
  label: string; 
  description: string; 
  icon: string;
  color: string;
}[] = [
  { id: 'outreach', label: 'Outreach', description: 'Invite participants', icon: 'Mail', color: 'bg-blue-500' },
  { id: 'script', label: 'Script', description: 'Write & prepare content', icon: 'FileText', color: 'bg-purple-500' },
  { id: 'rehearsal', label: 'Rehearsal', description: 'Practice & tech check', icon: 'Play', color: 'bg-yellow-500' },
  { id: 'recording', label: 'Recording', description: 'Record the show', icon: 'Video', color: 'bg-red-500' },
  { id: 'post_production', label: 'Post-Production', description: 'Edit & polish', icon: 'Film', color: 'bg-orange-500' },
  { id: 'published', label: 'Published', description: 'Live & available', icon: 'Globe', color: 'bg-green-500' },
];

export const SHOW_TYPES: { id: ShowType; label: string; icon: string }[] = [
  { id: 'podcast', label: 'Podcast', icon: 'Podcast' },
  { id: 'webcast', label: 'Webcast', icon: 'Tv' },
  { id: 'interview', label: 'Interview', icon: 'Users' },
  { id: 'panel', label: 'Panel Discussion', icon: 'Users' },
  { id: 'tutorial', label: 'Tutorial', icon: 'GraduationCap' },
  { id: 'other', label: 'Other', icon: 'Video' },
];

export const PARTICIPANT_ROLES: { id: ParticipantRole; label: string }[] = [
  { id: 'host', label: 'Host' },
  { id: 'co_host', label: 'Co-Host' },
  { id: 'guest', label: 'Guest' },
  { id: 'panelist', label: 'Panelist' },
  { id: 'interviewer', label: 'Interviewer' },
  { id: 'interviewee', label: 'Interviewee' },
  { id: 'narrator', label: 'Narrator' },
  { id: 'other', label: 'Other' },
];
