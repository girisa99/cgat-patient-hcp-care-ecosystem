/**
 * Production Email Templates Configuration
 * 
 * Dynamic email templates based on category, type, and stage
 * Integrates with GENIE_PRODUCTS for consistent branding
 */

import { 
  GENIE_PRODUCTS, 
  ASK_GENIE,
  type GenieProduct 
} from '@/constants/genie-products';
import type { EventCategory, ShowType, ProductionStage, MeetingStage, EventStage, DemoStage } from '@/types/shows';

// Logo imports for email banners
import genieMindLogo from '@/assets/logos/genie-mind-combined.png';
import genieSparkLogo from '@/assets/logos/genie-spark-combined.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined.png';
import genieStudioBanner from '@/assets/logos/genie-studio-banner.png';
import genieArcLogo from '@/assets/logos/genie-arc-combined.png';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';

// Category info with branding
export interface CategoryEmailConfig {
  name: string;
  tagline: string;
  description: string;
  primaryColor: string;
  icon: string;
  logo?: string;
  product?: GenieProduct;
}

// Show type to product mapping for demos
export const SHOW_TYPE_TO_PRODUCT: Partial<Record<ShowType, GenieProduct>> = {
  genie_studio_full: 'studio',
  genie_spark_demo: 'spark',
  genie_arc_demo: 'arc',
  genie_mind_demo: 'mind',
  genie_vibe_demo: 'vibe',
  genie_suite_overview: 'studio',
};

// Category configurations with branding
export const CATEGORY_EMAIL_CONFIG: Record<EventCategory, CategoryEmailConfig> = {
  media_production: {
    name: 'Media Production',
    tagline: 'Professional content creation',
    description: 'Join us for a professional media production session',
    primaryColor: '#8B5CF6', // purple
    icon: '🎬',
    logo: genieVibeLogo,
    product: 'vibe',
  },
  business_meeting: {
    name: 'Business Meeting',
    tagline: 'Collaborate and connect',
    description: 'Join us for an important business discussion',
    primaryColor: '#3B82F6', // blue
    icon: '💼',
    logo: genieArcLogo,
    product: 'arc',
  },
  event: {
    name: 'Event',
    tagline: 'Learn and engage',
    description: 'You are invited to an exciting event',
    primaryColor: '#F97316', // orange
    icon: '📅',
    logo: genieStudioBanner,
    product: 'studio',
  },
  genie_demo: {
    name: 'Genie Studio Demo',
    tagline: 'Experience the magic',
    description: 'Join us for an exclusive Genie Studio product demonstration',
    primaryColor: '#D946EF', // fuchsia
    icon: '✨',
    logo: genieStudioBanner,
    product: 'studio',
  },
};

// Show type display names and icons
export const SHOW_TYPE_EMAIL_CONFIG: Partial<Record<ShowType, { name: string; icon: string; description: string }>> = {
  // Media Productions
  podcast: { name: 'Podcast Recording', icon: '🎙️', description: 'Join us for a podcast recording session' },
  webcast: { name: 'Webcast', icon: '📺', description: 'Join us for a live webcast' },
  interview: { name: 'Interview', icon: '🎤', description: 'You are invited to participate in an interview' },
  panel: { name: 'Panel Discussion', icon: '👥', description: 'Join our expert panel discussion' },
  tutorial: { name: 'Tutorial', icon: '📚', description: 'Join us for an educational tutorial session' },
  broadcast: { name: 'Broadcast', icon: '📡', description: 'Join us for a live broadcast' },
  // Business Meetings
  discovery_call: { name: 'Discovery Call', icon: '📞', description: 'Let\'s explore how we can work together' },
  sales_meeting: { name: 'Sales Meeting', icon: '💼', description: 'Join us for an important sales discussion' },
  project_kickoff: { name: 'Project Kickoff', icon: '🚀', description: 'Let\'s kick off this exciting project together' },
  status_update: { name: 'Status Update', icon: '📊', description: 'Join us for a project status update' },
  consultation: { name: 'Consultation', icon: '💬', description: 'Join us for a consultation session' },
  // Events
  workshop: { name: 'Workshop', icon: '🔧', description: 'Join our hands-on workshop' },
  webinar: { name: 'Webinar', icon: '🖥️', description: 'You are invited to an informative webinar' },
  conference: { name: 'Conference', icon: '🏢', description: 'Join us at this exciting conference' },
  training_session: { name: 'Training Session', icon: '📖', description: 'Join us for a training session' },
  // Genie Suite Demos
  genie_studio_full: { name: 'Full Genie Suite Demo', icon: '✨', description: 'Experience the complete Genie Suite' },
  genie_spark_demo: { name: 'Genie Spark Demo', icon: '⚡', description: 'Ignite your ideas with Genie Spark' },
  genie_arc_demo: { name: 'Genie Hub Demo', icon: '🎬', description: 'Discover your creative command center with Genie Hub' },
  genie_mind_demo: { name: 'Genie Mind Demo', icon: '🧠', description: 'Experience AI that truly understands with Genie Mind' },
  genie_vibe_demo: { name: 'Genie Vibe Demo', icon: '🎵', description: 'Go from script to screen with Genie Vibe' },
  genie_suite_overview: { name: 'Genie Suite Overview', icon: '🌟', description: 'Get a complete overview of the Genie Suite ecosystem' },
};

// Stage-specific email messages
export const STAGE_EMAIL_CONFIG: Record<string, { action: string; context: string }> = {
  // Production stages
  outreach: { action: 'reaching out to invite you', context: 'We would love to have you as part of our production' },
  script: { action: 'preparing the script', context: 'Please review the attached script before our session' },
  rehearsal: { action: 'scheduling a rehearsal', context: 'Let\'s practice together before the recording' },
  recording: { action: 'scheduling the recording', context: 'Get ready for the recording session' },
  post_production: { action: 'in post-production', context: 'We are polishing the final product' },
  published: { action: 'published', context: 'The production is now live!' },
  // Meeting stages
  scheduled: { action: 'scheduling', context: 'Please save this date in your calendar' },
  confirmed: { action: 'confirming', context: 'Thank you for confirming your attendance' },
  agenda_prep: { action: 'preparing the agenda', context: 'Please review the meeting agenda' },
  in_progress: { action: 'starting soon', context: 'The meeting is about to begin' },
  follow_up: { action: 'following up', context: 'Thank you for your participation' },
  completed: { action: 'completed', context: 'Thank you for attending' },
  // Event stages
  planning: { action: 'in planning', context: 'We are planning an exciting event' },
  promotion: { action: 'promoting', context: 'Don\'t miss this exciting event' },
  registration: { action: 'open for registration', context: 'Register now to secure your spot' },
  live: { action: 'happening live', context: 'The event is live!' },
  wrap_up: { action: 'wrapping up', context: 'Thank you for being part of this event' },
  // Demo stages
  setup: { action: 'setting up', context: 'We are preparing an amazing demo for you' },
  walkthrough: { action: 'doing a walkthrough', context: 'Get ready for an in-depth product tour' },
  demo_live: { action: 'going live', context: 'The live demo is about to begin' },
  q_and_a: { action: 'having Q&A', context: 'Prepare your questions for our experts' },
  feedback: { action: 'collecting feedback', context: 'We value your thoughts and feedback' },
};

// Get product info for a show type
export function getProductForShowType(showType: ShowType): GenieProduct | undefined {
  return SHOW_TYPE_TO_PRODUCT[showType];
}

// Get product branding for email
export function getProductBranding(product: GenieProduct) {
  const info = GENIE_PRODUCTS[product];
  return {
    name: info.name,
    tagline: info.tagline,
    description: info.description,
    color: info.color,
    logo: info.logos.combined,
    features: info.features,
  };
}

// Generate dynamic email subject
export function generateEmailSubject(params: {
  category: EventCategory;
  showType: ShowType;
  stage: string;
  title: string;
  hostName?: string;
}): string {
  const { category, showType, stage, title, hostName } = params;
  const typeConfig = SHOW_TYPE_EMAIL_CONFIG[showType];
  const stageConfig = STAGE_EMAIL_CONFIG[stage];
  
  // For Genie demos, use product-specific subjects
  const product = getProductForShowType(showType);
  if (product) {
    const branding = getProductBranding(product);
    return `${typeConfig?.icon || '✨'} ${branding.name}: ${title} - ${branding.tagline}`;
  }
  
  // Standard subjects
  if (hostName) {
    return `${typeConfig?.icon || '📅'} ${hostName} invites you to: ${title}`;
  }
  
  return `${typeConfig?.icon || '📅'} You're invited: ${title}`;
}

// Generate personalized email greeting
export function generateEmailGreeting(firstName: string): string {
  const greetings = [
    `Hi ${firstName}! 👋`,
    `Hello ${firstName}!`,
    `Hey ${firstName}! 🌟`,
    `Dear ${firstName},`,
  ];
  // Use a simple random selection or always use the first for consistency
  return greetings[0];
}

// Generate dynamic email body
export function generateEmailBody(params: {
  category: EventCategory;
  showType: ShowType;
  stage: string;
  title: string;
  description?: string;
  scheduledDate?: string;
  hostName?: string;
  participantFirstName: string;
  meetingLink?: string;
  topics?: string;
}): string {
  const { 
    category, 
    showType, 
    stage, 
    title, 
    description,
    scheduledDate, 
    hostName, 
    participantFirstName,
    meetingLink,
    topics 
  } = params;
  
  const categoryConfig = CATEGORY_EMAIL_CONFIG[category];
  const typeConfig = SHOW_TYPE_EMAIL_CONFIG[showType];
  const stageConfig = STAGE_EMAIL_CONFIG[stage] || { action: 'inviting you', context: 'We would love to have you join us' };
  
  const greeting = generateEmailGreeting(participantFirstName);
  const product = getProductForShowType(showType);
  
  let body = `${greeting}\n\n`;
  
  // Add product-specific branding for demos
  if (product) {
    const branding = getProductBranding(product);
    body += `${branding.name} - ${branding.tagline}\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    body += `We are excited to ${stageConfig.action} for:\n\n`;
    body += `📌 ${title}\n`;
    if (description) body += `${description}\n`;
    body += `\n${branding.description}\n\n`;
    
    // Add product features
    body += `What you'll experience:\n`;
    branding.features.slice(0, 3).forEach(feature => {
      body += `  ✓ ${feature}\n`;
    });
    body += `\n`;
  } else {
    body += `${typeConfig?.icon || categoryConfig.icon} ${categoryConfig.name}\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    body += `${stageConfig.context}\n\n`;
    body += `📌 ${title}\n`;
    if (description) body += `${description}\n\n`;
    else body += `\n`;
    body += `${typeConfig?.description || categoryConfig.description}\n\n`;
  }
  
  // Add details
  if (scheduledDate) {
    const date = new Date(scheduledDate);
    body += `📅 Date: ${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    body += `⏰ Time: ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\n`;
  }
  
  if (hostName) {
    body += `👤 Host: ${hostName}\n`;
  }
  
  if (topics) {
    body += `📋 Topics: ${topics}\n`;
  }
  
  if (meetingLink) {
    body += `\n🔗 Join Link: ${meetingLink}\n`;
  }
  
  body += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  body += `Powered by Genie Studio - Mind to Media ✨\n`;
  
  return body;
}

// Get banner image URL for category/type
export function getEmailBannerImage(category: EventCategory, showType: ShowType): string {
  const product = getProductForShowType(showType);
  if (product) {
    return GENIE_PRODUCTS[product].logos.combined;
  }
  return CATEGORY_EMAIL_CONFIG[category].logo || genieStudioBanner;
}

// Export product logos for use in components
export const PRODUCT_LOGOS = {
  mind: genieMindLogo,
  spark: genieSparkLogo,
  vibe: genieVibeLogo,
  studio: genieStudioBanner,
  arc: genieArcLogo,
  deck: genieDeckLogo,
};

// Get all demo types with their product branding
export function getDemoTypesWithBranding() {
  return [
    { 
      id: 'genie_studio_full', 
      label: 'Full Studio Demo', 
      ...getProductBranding('studio'),
      icon: '✨' 
    },
    { 
      id: 'genie_spark_demo', 
      label: 'Genie Spark Demo', 
      ...getProductBranding('spark'),
      icon: '⚡' 
    },
    { 
      id: 'genie_arc_demo', 
      label: 'Genie Hub Demo', 
      ...getProductBranding('arc'),
      icon: '🎬' 
    },
    { 
      id: 'genie_mind_demo', 
      label: 'Genie Mind Demo', 
      ...getProductBranding('mind'),
      icon: '🧠' 
    },
    { 
      id: 'genie_vibe_demo', 
      label: 'Genie Vibe Demo', 
      ...getProductBranding('vibe'),
      icon: '🎵' 
    },
    { 
      id: 'genie_suite_overview', 
      label: 'Suite Overview', 
      ...getProductBranding('studio'),
      icon: '🌟' 
    },
  ];
}
