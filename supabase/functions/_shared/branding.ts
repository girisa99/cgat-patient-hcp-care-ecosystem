/**
 * Centralized Branding Configuration for Edge Functions
 * 
 * This file mirrors src/constants/genie-products.ts for use in edge functions.
 * IMPORTANT: Keep this in sync with the frontend constants!
 * 
 * Last Updated: 2026-01-14
 */

export const GENIE_BRANDING = {
  // Company/Platform
  platform: {
    name: 'Genie Studio',
    tagline: 'Mind to Media',
    description: 'AI-Powered Production Platform',
    emoji: '✨',
    url: 'https://genieaiexperimentationhub.tech',
    email: 'info@genieaiexperimentationhub.tech',
    colors: {
      primary: '#8B5CF6', // Purple
      secondary: '#7C3AED',
      accent: '#A855F7',
    }
  },
  
  // Products
  products: {
    mind: {
      name: 'Genie Mind',
      tagline: 'AI that understands',
      emoji: '🧠',
      color: '#0EA5E9',
      description: 'Your intelligent AI companion',
      url: 'https://genieaiexperimentationhub.tech/genie-mind'
    },
    spark: {
      name: 'Genie Spark',
      tagline: 'Ignite your Ideas',
      emoji: '⚡',
      color: '#F59E0B',
      description: 'AI-powered content creation and scriptwriting',
      url: 'https://genieaiexperimentationhub.tech/genie-spark'
    },
    vibe: {
      name: 'Genie Vibe',
      tagline: 'Script to Screen',
      emoji: '🎭',
      color: '#10B981',
      description: 'Live meeting studio with real-time collaboration',
      url: 'https://genieaiexperimentationhub.tech/genie-vibe'
    },
    studio: {
      name: 'Genie Studio',
      tagline: 'Mind to Media',
      emoji: '🎨',
      color: '#8B5CF6',
      description: 'Complete creative production suite',
      url: 'https://genieaiexperimentationhub.tech/genie-studio'
    },
    arc: {
      name: 'Genie Arc',
      tagline: 'Your Production Journey With Infinite Possibilities',
      emoji: '🎯',
      color: '#8B5CF6',
      description: 'Production Hub for scheduling and management',
      url: 'https://genieaiexperimentationhub.tech/genie-arc'
    }
  },
  
  // Ask Genie (AI Assistant)
  askGenie: {
    name: 'Ask Genie',
    tagline: 'Your wish is my command',
    emoji: '🧞',
    color: '#A855F7'
  },
  
  // Email Templates
  email: {
    fromName: 'Genie Studio',
    fromEmail: 'info@genieaiexperimentationhub.tech',
    replyTo: 'support@genieaiexperimentationhub.tech',
    footer: {
      powered: 'Powered by Genie Studio',
      tagline: 'AI-Powered Production Platform',
      copyright: `© ${new Date().getFullYear()} Genie Studio. All rights reserved.`
    }
  },
  
  // Category mappings for events/shows
  categories: {
    media_production: { name: 'Media Production', emoji: '🎬' },
    business_meeting: { name: 'Business Meeting', emoji: '💼' },
    event: { name: 'Event', emoji: '🎉' },
    genie_demo: { name: 'Genie Studio Demo', emoji: '✨' },
  },
  
  // Show type mappings
  showTypes: {
    podcast: { name: 'Podcast', emoji: '🎙️', color: '#8B5CF6' },
    video_podcast: { name: 'Video Podcast', emoji: '📹', color: '#EC4899' },
    interview: { name: 'Interview', emoji: '🎤', color: '#F59E0B' },
    webinar: { name: 'Webinar', emoji: '📺', color: '#06B6D4' },
    live_stream: { name: 'Live Stream', emoji: '🔴', color: '#EF4444' },
    recording_session: { name: 'Recording Session', emoji: '🎬', color: '#10B981' },
    virtual_event: { name: 'Virtual Event', emoji: '🌐', color: '#3B82F6' },
    workshop: { name: 'Workshop', emoji: '🛠️', color: '#F97316' },
    panel_discussion: { name: 'Panel Discussion', emoji: '👥', color: '#6366F1' },
    product_demo: { name: 'Product Demo', emoji: '📦', color: '#84CC16' },
    training_session: { name: 'Training Session', emoji: '📖', color: '#10B981' },
    genie_studio_full: { name: 'Genie Studio Full Demo', emoji: '✨', color: '#8B5CF6' },
    genie_spark_demo: { name: 'Genie Spark Demo', emoji: '⚡', color: '#F59E0B' },
    genie_arc_demo: { name: 'Genie Arc Demo', emoji: '🎬', color: '#10B981' },
    genie_vibe_demo: { name: 'Genie Vibe Demo', emoji: '🎭', color: '#EC4899' },
    genie_mind_demo: { name: 'Genie Mind Demo', emoji: '🧠', color: '#06B6D4' },
    ask_genie_demo: { name: 'Ask Genie Demo', emoji: '🧞', color: '#A855F7' },
    investor_meeting: { name: 'Investor Meeting', emoji: '💰', color: '#6366F1' },
    team_standup: { name: 'Team Stand-up', emoji: '🧍', color: '#10B981' },
    client_call: { name: 'Client Call', emoji: '📞', color: '#3B82F6' },
    one_on_one: { name: 'One-on-One', emoji: '👤', color: '#8B5CF6' },
    board_meeting: { name: 'Board Meeting', emoji: '🏛️', color: '#1E293B' },
    brainstorm: { name: 'Brainstorm', emoji: '💡', color: '#F59E0B' },
    retrospective: { name: 'Retrospective', emoji: '🔄', color: '#06B6D4' },
    planning_session: { name: 'Planning Session', emoji: '📋', color: '#10B981' },
  },
  
  // Role mappings
  roles: {
    host: { name: 'Host', emoji: '🎙️' },
    'co-host': { name: 'Co-Host', emoji: '🎤' },
    guest: { name: 'Guest', emoji: '👤' },
    speaker: { name: 'Speaker', emoji: '🗣️' },
    panelist: { name: 'Panelist', emoji: '👥' },
    moderator: { name: 'Moderator', emoji: '⚖️' },
    attendee: { name: 'Attendee', emoji: '👁️' },
    participant: { name: 'Participant', emoji: '✋' },
    stakeholder: { name: 'Stakeholder', emoji: '📊' },
    producer: { name: 'Producer', emoji: '🎬' },
  },
  
  // Stage/Phase mappings
  stages: {
    outreach: { name: 'Outreach', emoji: '📧' },
    scheduled: { name: 'Scheduled', emoji: '📅' },
    pre_production: { name: 'Pre-Production', emoji: '📝' },
    preparation: { name: 'Preparation', emoji: '🔧' },
    rehearsal: { name: 'Rehearsal', emoji: '🎭' },
    live: { name: 'Live', emoji: '🔴' },
    recording: { name: 'Recording', emoji: '⏺️' },
    post_production: { name: 'Post-Production', emoji: '✂️' },
    follow_up: { name: 'Follow-up', emoji: '📬' },
    completed: { name: 'Completed', emoji: '✅' },
    cancelled: { name: 'Cancelled', emoji: '❌' },
  }
} as const;

// Helper functions
export const getCategory = (key: string) => 
  GENIE_BRANDING.categories[key as keyof typeof GENIE_BRANDING.categories] || 
  { name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), emoji: '📌' };

export const getShowType = (key: string) => 
  GENIE_BRANDING.showTypes[key as keyof typeof GENIE_BRANDING.showTypes] || 
  { name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), emoji: '📺', color: '#8B5CF6' };

export const getRole = (key: string) => 
  GENIE_BRANDING.roles[key as keyof typeof GENIE_BRANDING.roles] || 
  { name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), emoji: '👤' };

export const getStage = (key: string) => 
  GENIE_BRANDING.stages[key as keyof typeof GENIE_BRANDING.stages] || 
  { name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), emoji: '📍' };

export const getProduct = (key: string) =>
  GENIE_BRANDING.products[key as keyof typeof GENIE_BRANDING.products] ||
  GENIE_BRANDING.products.studio;
