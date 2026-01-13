/**
 * Genie Studio Types - Extracted from GenieStudio.tsx
 * These types support the main studio functionality
 */

// Types for media items
export interface MediaItem {
  id: string;
  name: string;
  type: 'video' | 'audio';
  url?: string;
  timestamp: number;
  duration?: number;
  size?: number;
  scriptText?: string;
  originalScript?: string;
  scriptType?: string;
  metadataType?: string;
}

// Types for saved scripts - Extended for full script workflow
export interface SavedScript {
  id: string;
  name: string;
  content: string;
  type: 'video' | 'audio';
  createdAt: number;
  updatedAt: number;
  enhancedContent?: string;
  cleanContent?: string; // For TTS
  draftContent?: string;
  draftStatus?: 'in_progress' | 'completed';
  draftChanges?: any[];
  stats?: {
    wordCount: number;
    sentenceCount: number;
    characterCount: number;
    estimatedReadingMinutes: number;
    estimatedSpeakingMinutes: number;
    readabilityScore: 'easy' | 'moderate' | 'difficult';
  };
  hasVoiceover?: boolean;
  voiceoverId?: string;
}

// Types for shows/events - Extended for all scheduling types
export interface ShowEvent {
  id: string;
  type: 'podcast' | 'webcast' | 'broadcast' | 'interview' | 'panel' | 'tutorial' | 'discovery_call' | 'sales_meeting' | 'project_kickoff' | 'status_update' | 'consultation' | 'workshop' | 'webinar' | 'conference' | 'training_session' | 'other';
  eventCategory?: 'media_production' | 'business_meeting' | 'event';
  title: string;
  description: string;
  scheduledDate: Date;
  participants: Participant[];
  scriptId?: string;
  scriptContent?: string;
  hostName?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  // Additional fields for meetings/events
  agenda?: string;
  meetingLink?: string;
  location?: string;
  durationMinutes?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'co-host' | 'guest' | 'panelist' | 'attendee' | 'organizer' | 'speaker';
  status: 'pending' | 'confirmed' | 'declined';
}

// Feature card type
export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge: string | null;
  stats: { label: string; value: string };
  tab?: string;
  isExternal?: boolean;
  route?: string;
}

// Quick tip type
export interface QuickTip {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}

// Music genre type
export interface MusicGenre {
  id: string;
  name: string;
  prompt: string;
  color: string;
}

// Script template type
export interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'video' | 'audio' | 'podcast' | 'webcast' | 'broadcast';
  content: string;
  icon?: React.ComponentType<{ className?: string }>;
}
