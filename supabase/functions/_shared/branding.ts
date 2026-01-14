/**
 * Centralized Branding Configuration for Edge Functions
 * 
 * This file mirrors src/constants/genie-products.ts for use in edge functions.
 * IMPORTANT: Keep this in sync with the frontend constants!
 * 
 * Last Updated: 2026-01-14
 */

// Base URL for hosted assets (using GitHub raw or CDN)
const ASSET_BASE_URL = 'https://raw.githubusercontent.com/genieaiexperimentationhub/assets/main/logos';
// Fallback: Use the production site assets
const SITE_ASSET_URL = 'https://cgat-patient-hcp-care-ecosystem.lovable.app';

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
      gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    },
    logo: {
      banner: `${SITE_ASSET_URL}/placeholder.svg`, // Will use emoji fallback
      horizontal: `${SITE_ASSET_URL}/placeholder.svg`,
      icon: `${SITE_ASSET_URL}/placeholder.svg`,
    }
  },
  
  // Products with logos and proper branding
  products: {
    mind: {
      name: 'Genie Mind',
      tagline: 'AI that understands',
      emoji: '🧠',
      color: '#0EA5E9',
      gradientFrom: '#0EA5E9',
      gradientTo: '#06B6D4',
      description: 'Your intelligent AI companion that truly understands context and provides meaningful insights.',
      url: 'https://genieaiexperimentationhub.tech/genie-mind',
      features: ['Contextual AI understanding', 'Multi-modal intelligence', 'Personalized learning']
    },
    spark: {
      name: 'Genie Spark',
      tagline: 'Ignite your Ideas',
      emoji: '⚡',
      color: '#F59E0B',
      gradientFrom: '#F59E0B',
      gradientTo: '#F97316',
      description: 'Transform your creative sparks into brilliant content with AI-powered inspiration.',
      url: 'https://genieaiexperimentationhub.tech/genie-spark',
      features: ['AI script generation', 'Story development', 'Creative brainstorming']
    },
    vibe: {
      name: 'Genie Vibe',
      tagline: 'Script to Screen',
      emoji: '🎭',
      color: '#10B981',
      gradientFrom: '#10B981',
      gradientTo: '#14B8A6',
      description: 'Bring your scripts to life with seamless audio and video production tools.',
      url: 'https://genieaiexperimentationhub.tech/genie-vibe',
      features: ['Audio recording & editing', 'Video capture', 'Real-time effects']
    },
    studio: {
      name: 'Genie Studio',
      tagline: 'Mind to Media',
      emoji: '🎨',
      color: '#8B5CF6',
      gradientFrom: '#8B5CF6',
      gradientTo: '#7C3AED',
      description: 'The complete creative studio that transforms your ideas into polished media.',
      url: 'https://genieaiexperimentationhub.tech/genie-studio',
      features: ['Integrated creative suite', 'Asset management', 'Cross-product workflows']
    },
    arc: {
      name: 'Genie Arc',
      tagline: 'Your Production Journey',
      emoji: '🎯',
      color: '#6366F1',
      gradientFrom: '#6366F1',
      gradientTo: '#8B5CF6',
      description: 'Orchestrate your production workflow with powerful scheduling and team collaboration.',
      url: 'https://genieaiexperimentationhub.tech/genie-arc',
      features: ['Show scheduling', 'Team collaboration', 'Production pipeline']
    }
  },
  
  // Ask Genie (AI Assistant)
  askGenie: {
    name: 'Ask Genie',
    tagline: 'Your wish is my command',
    emoji: '🧞',
    color: '#A855F7',
    gradientFrom: '#A855F7',
    gradientTo: '#EC4899',
    description: 'Your intelligent AI companion that guides you through the entire Genie Studio experience.'
  },
  
  // Production Hub
  productionHub: {
    name: 'Production Hub',
    tagline: 'Command Center for Creators',
    emoji: '🎬',
    color: '#EC4899',
    gradientFrom: '#EC4899',
    gradientTo: '#F43F5E',
    description: 'Your centralized command center for managing all production activities.'
  },
  
  // Email Templates Configuration
  email: {
    fromName: 'Genie Studio',
    fromEmail: 'info@genieaiexperimentationhub.tech',
    replyTo: 'support@genieaiexperimentationhub.tech',
    footer: {
      powered: 'Powered by Genie Studio',
      tagline: 'AI-Powered Production Platform',
      copyright: `© ${new Date().getFullYear()} Genie Studio. All rights reserved.`
    },
    // Responsive breakpoints for email
    styles: {
      maxWidth: '600px',
      mobileBreakpoint: '480px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
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

/**
 * Generate responsive email wrapper with proper styling
 */
export const getResponsiveEmailWrapper = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    /* Reset styles */
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    /* Base styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #f3f4f6;
      font-family: ${GENIE_BRANDING.email.styles.fontFamily};
      line-height: 1.6;
    }
    
    /* Container */
    .email-container {
      max-width: ${GENIE_BRANDING.email.styles.maxWidth};
      margin: 0 auto;
      background: #ffffff;
    }
    
    /* Responsive text */
    .responsive-text {
      word-wrap: break-word;
      word-break: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
    }
    
    /* Responsive padding */
    .content-padding {
      padding: 32px;
    }
    
    /* Responsive buttons */
    .btn {
      display: inline-block;
      padding: 16px 32px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #8B5CF6, #7C3AED);
      color: #ffffff !important;
    }
    
    /* Product cards */
    .product-card {
      display: block;
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      border: 1px solid rgba(255,255,255,0.2);
      text-decoration: none;
    }
    
    /* Mobile styles */
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        margin: 0 !important;
      }
      
      .content-padding {
        padding: 20px !important;
      }
      
      .header-padding {
        padding: 32px 20px !important;
      }
      
      .btn {
        display: block !important;
        width: 100% !important;
        padding: 14px 20px !important;
        font-size: 15px !important;
        box-sizing: border-box !important;
      }
      
      .product-grid {
        display: block !important;
      }
      
      .product-card {
        padding: 12px !important;
      }
      
      .hide-mobile {
        display: none !important;
      }
      
      h1 { font-size: 24px !important; }
      h2 { font-size: 20px !important; }
      h3 { font-size: 18px !important; }
      
      .details-table td {
        display: block !important;
        width: 100% !important;
        padding: 8px 0 !important;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 20px 10px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Generate the Genie Products section for emails
 */
export const getProductsSection = () => {
  const { products, platform, askGenie, productionHub } = GENIE_BRANDING;
  
  const productItems = [
    { key: 'studio', ...products.studio },
    { key: 'mind', ...products.mind },
    { key: 'spark', ...products.spark },
    { key: 'vibe', ...products.vibe },
    { key: 'arc', ...products.arc },
  ];
  
  const productCards = productItems.map(p => `
    <tr>
      <td style="padding: 6px 0;">
        <a href="${p.url}" style="text-decoration: none; display: block; background: rgba(255,255,255,0.08); border-radius: 10px; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.15);">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td width="44" style="vertical-align: middle;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo}); border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">${p.emoji}</div>
              </td>
              <td style="padding-left: 12px; vertical-align: middle;">
                <p style="color: #ffffff; margin: 0 0 2px; font-weight: 600; font-size: 15px;">${p.name}</p>
                <p style="color: #a5b4fc; margin: 0; font-size: 12px; line-height: 1.4;">${p.tagline}</p>
              </td>
            </tr>
          </table>
        </a>
      </td>
    </tr>
  `).join('');
  
  return `
    <tr>
      <td style="padding: 24px; background: linear-gradient(135deg, #1e1b4b, #312e81); border-radius: 12px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="text-align: center; padding-bottom: 20px;">
              <p style="color: #c4b5fd; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 6px;">Explore</p>
              <h3 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">${platform.name} Products</h3>
              <p style="color: #a5b4fc; margin: 6px 0 0; font-size: 13px;">${platform.tagline}</p>
            </td>
          </tr>
          ${productCards}
          <tr>
            <td style="padding: 12px 0 0; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 0 8px;">
                    <div style="width: 36px; height: 36px; background: linear-gradient(135deg, ${askGenie.gradientFrom}, ${askGenie.gradientTo}); border-radius: 50%; text-align: center; line-height: 36px; font-size: 18px;" title="${askGenie.name}">${askGenie.emoji}</div>
                  </td>
                  <td style="padding: 0 8px;">
                    <div style="width: 36px; height: 36px; background: linear-gradient(135deg, ${productionHub.gradientFrom}, ${productionHub.gradientTo}); border-radius: 50%; text-align: center; line-height: 36px; font-size: 18px;" title="${productionHub.name}">${productionHub.emoji}</div>
                  </td>
                </tr>
              </table>
              <p style="color: #818cf8; font-size: 11px; margin: 8px 0 0;">${askGenie.name} • ${productionHub.name}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
};

/**
 * Generate email footer
 */
export const getEmailFooter = () => {
  const { platform, email } = GENIE_BRANDING;
  
  return `
    <tr>
      <td style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="text-align: center;">
              <p style="color: #8B5CF6; font-size: 18px; margin: 0 0 4px; font-weight: 700;">${platform.emoji} ${platform.name}</p>
              <p style="color: #64748b; font-size: 13px; margin: 0 0 12px;">${platform.tagline}</p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">${email.footer.copyright}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
};
