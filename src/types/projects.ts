/**
 * Types for Projects hierarchy system
 */

export type ProjectStatus = 'active' | 'archived' | 'completed';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  thumbnail_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Extended project with related data
export interface ProjectWithShows extends Project {
  shows?: import('./shows').ShowWithParticipants[];
  show_count?: number;
}

// Script modes for type-specific editing
export type ScriptMode = 'podcast' | 'webcast' | 'video' | 'audio';

// Script mode configuration
export const SCRIPT_MODES: {
  id: ScriptMode;
  label: string;
  description: string;
  icon: string;
  features: string[];
  ttsEnabled: boolean;
}[] = [
  {
    id: 'podcast',
    label: 'Podcast',
    description: 'Dialogue-focused with speaker columns',
    icon: 'Podcast',
    features: ['Speaker columns', 'Timestamps', 'Interview questions', 'Cue notes'],
    ttsEnabled: false,
  },
  {
    id: 'webcast',
    label: 'Webcast',
    description: 'Presentation-style with slides',
    icon: 'Tv',
    features: ['Slide markers', 'Demo notes', 'Q&A prompts', 'Visual cues'],
    ttsEnabled: true,
  },
  {
    id: 'video',
    label: 'Video/Voiceover',
    description: 'Narration with scene descriptions',
    icon: 'Video',
    features: ['Scene descriptions', 'Timing marks', 'B-roll notes', 'Transitions'],
    ttsEnabled: true,
  },
  {
    id: 'audio',
    label: 'Audio Narration',
    description: 'Pure audio with pace markers',
    icon: 'Mic',
    features: ['Pace markers', 'Emphasis notation', 'Breath marks', 'Sound cues'],
    ttsEnabled: true,
  },
];
