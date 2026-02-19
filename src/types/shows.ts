/**
 * Types for Shows/Productions & Scheduling system
 * Unified system for media productions, meetings, and events
 */

// Event Categories
export type EventCategory = 'media_production' | 'business_meeting' | 'event' | 'genie_demo';

// Extended Show Types (includes all scheduling types)
export type ShowType = 
  // Media Productions
  | 'podcast' | 'webcast' | 'interview' | 'panel' | 'tutorial' | 'broadcast' | 'other'
  // Business Meetings
  | 'discovery_call' | 'sales_meeting' | 'project_kickoff' | 'status_update' | 'consultation'
  // Events
  | 'workshop' | 'webinar' | 'conference' | 'training_session'
  // Genie Suite Demos
  | 'genie_studio_full' | 'genie_spark_demo' | 'genie_arc_demo' | 'genie_mind_demo' | 'genie_vibe_demo' | 'genie_suite_overview';

// Stage types per category
export type ProductionStage = 'outreach' | 'script' | 'rehearsal' | 'recording' | 'post_production' | 'published';
// Meeting stages - matches database enum. UI shows streamlined version (confirmed/agenda_prep auto-handled during scheduling)
export type MeetingStage = 'scheduled' | 'confirmed' | 'agenda_prep' | 'in_progress' | 'follow_up' | 'completed' | 'cancelled' | 'rescheduled';
// Event stages - logical flow with postponed option
export type EventStage = 'planning' | 'promotion' | 'registration' | 'live' | 'wrap_up' | 'archived' | 'postponed' | 'cancelled';
// DemoStage matches the production_stage enum values in database
export type DemoStage = 'demo_scheduled' | 'demo_prep' | 'demo_live' | 'demo_followup' | 'demo_closed';

export type ParticipantRole = 'host' | 'co_host' | 'guest' | 'panelist' | 'interviewer' | 'interviewee' | 'narrator' | 'attendee' | 'organizer' | 'speaker' | 'other';
export type ParticipantStatus = 'invited' | 'confirmed' | 'declined' | 'tentative' | 'cancelled';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface Show {
  id: string;
  user_id: string;
  title: string;
  slug: string | null;
  description: string | null;
  show_type: ShowType;
  event_category: EventCategory;
  current_stage: ProductionStage;
  meeting_stage: MeetingStage | null;
  event_stage: EventStage | null;
  thumbnail_url: string | null;
  scheduled_date: string | null;
  published_at: string | null;
  landing_page_enabled: boolean;
  embed_enabled: boolean;
  metadata: Record<string, any>;
  // Meeting/Event specific fields
  agenda: string | null;
  meeting_link: string | null;
  location: string | null;
  duration_minutes: number;
  attendees_count: number;
  follow_up_notes: string | null;
  priority: Priority;
  created_at: string;
  updated_at: string;
}

export interface ShowParticipant {
  id: string;
  show_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: ParticipantRole;
  status: ParticipantStatus;
  bio: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  social_links: Record<string, string>;
  notes: string | null;
  invited_at: string | null;
  confirmed_at: string | null;
  // Reminder preferences
  email_reminder_24h: boolean;
  email_reminder_1h: boolean;
  email_reminder_30m: boolean;
  email_reminder_15m: boolean;
  sms_reminder_30m: boolean;
  sms_reminder_15m: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShowStageHistory {
  id: string;
  show_id: string;
  stage: ProductionStage | MeetingStage | EventStage;
  entered_at: string;
  completed_at: string | null;
  notes: string | null;
  completed_by: string | null;
}

export interface ShowAsset {
  id: string;
  show_id: string;
  asset_type: 'script' | 'voiceover' | 'music' | 'recording' | 'thumbnail' | 'video' | 'audio' | 'document' | 'presentation';
  name: string;
  file_url: string | null;
  file_size: number | null;
  duration_seconds: number | null;
  metadata: Record<string, any>;
  stage: ProductionStage | MeetingStage | EventStage | null;
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

// Category configuration
export const EVENT_CATEGORIES: {
  id: EventCategory;
  label: string;
  description: string;
  icon: string;
}[] = [
  { id: 'media_production', label: 'Media Production', description: 'Podcasts, webcasts, interviews', icon: 'Video' },
  { id: 'business_meeting', label: 'Business Meeting', description: 'Calls, meetings, consultations', icon: 'Users' },
  { id: 'event', label: 'Event', description: 'Workshops, webinars, conferences', icon: 'Calendar' },
  { id: 'genie_demo', label: 'Genie Suite Demo', description: 'Product demos & walkthroughs', icon: 'Sparkles' },
];

// Stage configuration for Media Productions
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

// Stage configuration for Business Meetings - Streamlined UI (confirmed/agenda_prep auto-handled during scheduling)
export const MEETING_STAGES: { 
  id: MeetingStage; 
  label: string; 
  description: string; 
  icon: string;
  color: string;
}[] = [
  { id: 'scheduled', label: 'Scheduled', description: 'Meeting booked & confirmed', icon: 'CalendarCheck', color: 'bg-blue-500' },
  { id: 'in_progress', label: 'In Progress', description: 'Meeting ongoing', icon: 'Play', color: 'bg-yellow-500' },
  { id: 'follow_up', label: 'Follow Up', description: 'Action items & notes', icon: 'MessageSquare', color: 'bg-orange-500' },
  { id: 'completed', label: 'Completed', description: 'Meeting finished', icon: 'CheckCircle2', color: 'bg-green-500' },
  { id: 'rescheduled', label: 'Rescheduled', description: 'Meeting moved to new time', icon: 'CalendarClock', color: 'bg-purple-500' },
  { id: 'cancelled', label: 'Cancelled', description: 'Meeting cancelled', icon: 'XCircle', color: 'bg-gray-500' },
];

// Stage configuration for Events - Logical workflow with clear actions
export const EVENT_STAGES: { 
  id: EventStage; 
  label: string; 
  description: string; 
  icon: string;
  color: string;
}[] = [
  { id: 'planning', label: 'Planning', description: 'Configure event details, schedule & agenda', icon: 'Settings', color: 'bg-blue-500' },
  { id: 'promotion', label: 'Promotion', description: 'Share event & send invitations', icon: 'Share2', color: 'bg-purple-500' },
  { id: 'registration', label: 'Registration', description: 'Manage attendees & track signups', icon: 'Users', color: 'bg-cyan-500' },
  { id: 'live', label: 'Live', description: 'Event in progress - join & manage', icon: 'Radio', color: 'bg-red-500' },
  { id: 'wrap_up', label: 'Wrap Up', description: 'Send recordings, feedback & follow-ups', icon: 'MessageSquare', color: 'bg-orange-500' },
  { id: 'archived', label: 'Archived', description: 'Event completed & archived', icon: 'CheckCircle', color: 'bg-green-500' },
  { id: 'postponed', label: 'Postponed', description: 'Event moved to new date', icon: 'CalendarClock', color: 'bg-amber-500' },
  { id: 'cancelled', label: 'Cancelled', description: 'Event cancelled', icon: 'XCircle', color: 'bg-gray-500' },
];

// Show types grouped by category
export const SHOW_TYPES: { id: ShowType; label: string; icon: string; category: EventCategory }[] = [
  // Media Productions
  { id: 'podcast', label: 'Podcast', icon: 'Podcast', category: 'media_production' },
  { id: 'webcast', label: 'Webcast', icon: 'Tv', category: 'media_production' },
  { id: 'interview', label: 'Interview', icon: 'Users', category: 'media_production' },
  { id: 'panel', label: 'Panel Discussion', icon: 'Users', category: 'media_production' },
  { id: 'tutorial', label: 'Tutorial', icon: 'GraduationCap', category: 'media_production' },
  { id: 'broadcast', label: 'Broadcast', icon: 'Radio', category: 'media_production' },
  { id: 'other', label: 'Other', icon: 'Video', category: 'media_production' },
  // Business Meetings
  { id: 'discovery_call', label: 'Discovery Call', icon: 'Phone', category: 'business_meeting' },
  { id: 'sales_meeting', label: 'Sales Meeting', icon: 'Briefcase', category: 'business_meeting' },
  { id: 'project_kickoff', label: 'Project Kickoff', icon: 'Rocket', category: 'business_meeting' },
  { id: 'status_update', label: 'Status Update', icon: 'BarChart', category: 'business_meeting' },
  { id: 'consultation', label: 'Consultation', icon: 'MessageCircle', category: 'business_meeting' },
  // Events
  { id: 'workshop', label: 'Workshop', icon: 'Wrench', category: 'event' },
  { id: 'webinar', label: 'Webinar', icon: 'Monitor', category: 'event' },
  { id: 'conference', label: 'Conference', icon: 'Building', category: 'event' },
  { id: 'training_session', label: 'Training Session', icon: 'BookOpen', category: 'event' },
  // Genie Suite Demos
  { id: 'genie_studio_full', label: 'Full Suite Demo', icon: 'Sparkles', category: 'genie_demo' },
  { id: 'genie_spark_demo', label: 'Genie Spark Demo', icon: 'Zap', category: 'genie_demo' },
  { id: 'genie_arc_demo', label: 'Genie Hub Demo', icon: 'Film', category: 'genie_demo' },
  { id: 'genie_mind_demo', label: 'Genie Mind Demo', icon: 'Brain', category: 'genie_demo' },
  { id: 'genie_vibe_demo', label: 'Genie Vibe Demo', icon: 'Music', category: 'genie_demo' },
  { id: 'genie_suite_overview', label: 'Suite Overview', icon: 'Layers', category: 'genie_demo' },
];

export const PARTICIPANT_ROLES: { id: ParticipantRole; label: string }[] = [
  { id: 'host', label: 'Host' },
  { id: 'co_host', label: 'Co-Host' },
  { id: 'guest', label: 'Guest' },
  { id: 'panelist', label: 'Panelist' },
  { id: 'interviewer', label: 'Interviewer' },
  { id: 'interviewee', label: 'Interviewee' },
  { id: 'narrator', label: 'Narrator' },
  { id: 'attendee', label: 'Attendee' },
  { id: 'organizer', label: 'Organizer' },
  { id: 'speaker', label: 'Speaker' },
  { id: 'other', label: 'Other' },
];

// Demo stages configuration - matches production_stage enum in database
export const DEMO_STAGES: { 
  id: DemoStage; 
  label: string; 
  description: string; 
  icon: string;
  color: string;
}[] = [
  { id: 'demo_scheduled', label: 'Scheduled', description: 'Demo scheduled', icon: 'Calendar', color: 'bg-blue-500' },
  { id: 'demo_prep', label: 'Preparation', description: 'Prepare demo environment', icon: 'Settings', color: 'bg-purple-500' },
  { id: 'demo_live', label: 'Live Demo', description: 'Interactive demonstration', icon: 'Play', color: 'bg-red-500' },
  { id: 'demo_followup', label: 'Follow-up', description: 'Post-demo follow-up', icon: 'MessageCircle', color: 'bg-yellow-500' },
  { id: 'demo_closed', label: 'Closed', description: 'Demo completed', icon: 'CheckCircle', color: 'bg-green-500' },
];

// Helper function to get stages based on category
export const getStagesForCategory = (category: EventCategory) => {
  switch (category) {
    case 'media_production':
      return PRODUCTION_STAGES;
    case 'business_meeting':
      return MEETING_STAGES;
    case 'event':
      return EVENT_STAGES;
    case 'genie_demo':
      return DEMO_STAGES;
    default:
      return PRODUCTION_STAGES;
  }
};

// Helper function to get show types for a category
export const getShowTypesForCategory = (category: EventCategory) => {
  return SHOW_TYPES.filter(type => type.category === category);
};

// Helper function to get current stage based on category
export const getCurrentStage = (show: Show): string => {
  switch (show.event_category) {
    case 'media_production':
      return show.current_stage;
    case 'business_meeting':
      return show.meeting_stage || 'scheduled';
    case 'event':
      return show.event_stage || 'planning';
    default:
      return show.current_stage;
  }
};
