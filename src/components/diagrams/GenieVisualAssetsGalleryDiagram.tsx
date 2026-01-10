import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Download,
  FileImage,
  FileCode,
  Layers,
  Users,
  GraduationCap,
  Heart,
  Building,
  Smartphone,
  Globe,
  Package,
  Sparkles,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Zap,
  Target,
  Film,
  Shield
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

// Enterprise color palette with semantic naming for consistency across light/dark modes
const colors = {
  completed: { bg: 'hsl(160, 84%, 39%)', text: '#ffffff', light: 'hsl(150, 80%, 94%)' },
  inProgress: { bg: 'hsl(38, 92%, 50%)', text: '#ffffff', light: 'hsl(48, 96%, 94%)' },
  planned: { bg: 'hsl(239, 84%, 67%)', text: '#ffffff', light: 'hsl(224, 76%, 94%)' },
  
  p0: { bg: 'hsl(160, 84%, 39%)', text: '#ffffff', light: 'hsl(150, 80%, 94%)' },
  p1: { bg: 'hsl(199, 89%, 48%)', text: '#ffffff', light: 'hsl(201, 94%, 94%)' },
  p2: { bg: 'hsl(38, 92%, 50%)', text: '#ffffff', light: 'hsl(48, 96%, 94%)' },
  p3: { bg: 'hsl(330, 81%, 60%)', text: '#ffffff', light: 'hsl(326, 78%, 95%)' },
  p4: { bg: 'hsl(258, 90%, 66%)', text: '#ffffff', light: 'hsl(250, 91%, 95%)' },
  p5: { bg: 'hsl(215, 16%, 47%)', text: '#ffffff', light: 'hsl(210, 40%, 96%)' },
  
  creator: { bg: 'hsl(258, 90%, 66%)', text: '#ffffff', light: 'hsl(250, 91%, 95%)', icon: '🎨' },
  traveler: { bg: 'hsl(199, 89%, 48%)', text: '#ffffff', light: 'hsl(201, 94%, 94%)', icon: '✈️' },
  smb: { bg: 'hsl(38, 92%, 50%)', text: '#ffffff', light: 'hsl(48, 96%, 94%)', icon: '🏪' },
  education: { bg: 'hsl(160, 84%, 39%)', text: '#ffffff', light: 'hsl(150, 80%, 94%)', icon: '📚' },
  healthcare: { bg: 'hsl(330, 81%, 60%)', text: '#ffffff', light: 'hsl(326, 78%, 95%)', icon: '🏥' },
  enterprise: { bg: 'hsl(215, 16%, 47%)', text: '#ffffff', light: 'hsl(210, 40%, 96%)', icon: '🏢' },
  
  border: 'hsl(var(--border))',
  background: 'hsl(var(--background))',
  cardBg: 'hsl(var(--card))',
  text: 'hsl(var(--foreground))',
  textMuted: 'hsl(var(--muted-foreground))',
};

// Creative Segment Journey Data with visual storytelling
const segmentJourneys = {
  creator: {
    name: 'Creator',
    icon: '🎨',
    color: colors.creator,
    tagline: '"I just want to go viral, is that too much to ask?" 🚀',
    character: {
      scene: '🧑‍🎤 flying through a galaxy of content ideas',
      emoji: '🚀✨🎬',
      action: 'Surfing on a viral wave',
      vibe: 'chaotic energy but make it aesthetic'
    },
    workflow: [
      { step: 1, action: 'Record', emoji: '🎤', desc: 'Speak your truth (or just rant)', visual: 'Person talking to phone' },
      { step: 2, action: 'Voice', emoji: '🗣️', desc: 'Pick your vibe - sassy or soothing', visual: 'AI voices spinning' },
      { step: 3, action: 'Language', emoji: '🌍', desc: 'Go global or stay local', visual: 'Flags dancing' },
      { step: 4, action: 'Generate', emoji: '⚡', desc: 'AI does the heavy lifting', visual: 'Magic sparkles' },
      { step: 5, action: 'Edit', emoji: '✂️', desc: 'Chop, slice, make it nice', visual: 'Scissors cutting' },
      { step: 6, action: 'Re-record', emoji: '🔄', desc: 'Oops, let me try that again', visual: 'Retry loop' },
      { step: 7, action: 'Script', emoji: '📝', desc: 'Attach the genius script', visual: 'Floating text' },
      { step: 8, action: 'Publish', emoji: '📲', desc: 'IG/YT/FB/TikTok - everywhere!', visual: 'Rockets launching' }
    ],
    journey: [
      { phase: 'P0', feature: 'Script + TTS', humor: 'Finally, no more typing!' },
      { phase: 'P1', feature: 'Quick Clips', humor: 'TikTok here I come!' },
      { phase: 'P2', feature: 'Voice Editing', humor: 'Edit while eating ramen' },
      { phase: 'P3', feature: 'Voice Clone', humor: 'My AI twin sounds cooler' },
      { phase: 'P4', feature: 'Analytics', humor: 'Obsessing over views = ✓' },
      { phase: 'P5', feature: 'API Access', humor: 'I\'m basically a developer now' }
    ],
    publishTo: ['📸 Instagram', '🎬 YouTube', '📘 Facebook', '🎵 TikTok', '🐦 Twitter'],
    subscription: 'Starter ($9.99/mo)',
    marketData: '68% want mobile-first'
  },
  traveler: {
    name: 'Traveler',
    icon: '✈️',
    color: colors.traveler,
    tagline: '"Lost luggage? No problem. Lost footage? PANIC!" 😱',
    character: {
      scene: '🧳 adventurer soaring above exotic locations',
      emoji: '🌴📷☁️',
      action: 'Capturing moments from the clouds',
      vibe: 'wanderlust but make it content'
    },
    workflow: [
      { step: 1, action: 'Record', emoji: '📹', desc: 'Capture the sunset (again)', visual: 'Camera in paradise' },
      { step: 2, action: 'Voice', emoji: '🎙️', desc: 'Add narration mid-flight', visual: 'Voice waves' },
      { step: 3, action: 'Language', emoji: '🗣️', desc: 'Hola! Bonjour! Ciao!', visual: 'Language bubbles' },
      { step: 4, action: 'Generate', emoji: '🪄', desc: 'AI makes magic happen', visual: 'Sparkle effect' },
      { step: 5, action: 'Edit', emoji: '🎞️', desc: 'Trim the boring bits', visual: 'Film strip' },
      { step: 6, action: 'Offline', emoji: '📴', desc: 'No WiFi? No problem!', visual: 'Airplane mode' },
      { step: 7, action: 'Script', emoji: '📜', desc: 'Travel diary mode ON', visual: 'Scroll unrolling' },
      { step: 8, action: 'Publish', emoji: '🌐', desc: 'Share from the beach!', visual: 'Beach + upload' }
    ],
    journey: [
      { phase: 'P0', feature: 'Recording', humor: 'Sunset #847 incoming' },
      { phase: 'P1', feature: 'One-Tap Record', humor: 'Phone ready, always' },
      { phase: 'P2', feature: 'Offline Mode', humor: 'No WiFi? No problem!' },
      { phase: 'P3', feature: 'Auto-Edit Kit', humor: '76% want this magic' },
      { phase: 'P4', feature: 'Multi-Language', humor: 'Hola! Bonjour! Ciao!' },
      { phase: 'P5', feature: 'B-Roll Library', humor: 'Stock sunsets backup' }
    ],
    publishTo: ['🎬 YouTube Vlogs', '📸 Instagram Reels', '🐦 Twitter', '📍 TripAdvisor'],
    subscription: 'Starter ($9.99/mo)',
    marketData: '54% need offline'
  },
  smb: {
    name: 'SMB Owner',
    icon: '🏪',
    color: colors.smb,
    tagline: '"Synthesia costs WHAT?! $67/mo?!" 💸',
    character: {
      scene: '👔 entrepreneur riding a rocket of growth',
      emoji: '📈💰🎯',
      action: 'Building an empire one video at a time',
      vibe: 'hustle culture but affordable'
    },
    workflow: [
      { step: 1, action: 'Record', emoji: '🎥', desc: 'Product demo time!', visual: 'Product spotlight' },
      { step: 2, action: 'Voice', emoji: '🗣️', desc: 'Professional narration', visual: 'Mic and script' },
      { step: 3, action: 'Language', emoji: '🌎', desc: 'Reach global customers', visual: 'World map' },
      { step: 4, action: 'Template', emoji: '📋', desc: 'One-click branding', visual: 'Template picker' },
      { step: 5, action: 'Edit', emoji: '✂️', desc: 'Quick polish', visual: 'Polish sparkle' },
      { step: 6, action: 'Team', emoji: '👥', desc: 'Collaborate with team', visual: 'Team avatars' },
      { step: 7, action: 'Brand', emoji: '🏷️', desc: 'Add logo & colors', visual: 'Branding kit' },
      { step: 8, action: 'Publish', emoji: '📣', desc: 'Launch to the world!', visual: 'Megaphone' }
    ],
    journey: [
      { phase: 'P0', feature: 'Script AI', humor: 'Marketing copy? Done!' },
      { phase: 'P1', feature: 'Templates', humor: 'One-click product video' },
      { phase: 'P2', feature: 'Collaboration', humor: 'Team of 3 can edit!' },
      { phase: 'P3', feature: 'Product Demo', humor: '71% need quick demos' },
      { phase: 'P4', feature: 'White-Label', humor: 'My brand, everywhere' },
      { phase: 'P5', feature: 'Batch Process', humor: '100 videos in 1 hour' }
    ],
    publishTo: ['📘 Facebook Ads', '📸 Instagram', '🛒 Shopify', '📧 Email', '🌐 Website'],
    subscription: 'Business ($29.99/mo)',
    marketData: '71% want quick templates'
  },
  education: {
    name: 'Educator',
    icon: '📚',
    color: colors.education,
    tagline: '"If I say \'pop quiz\' one more time..." 🎓',
    character: {
      scene: '👩‍🏫 teacher flying on a book through knowledge clouds',
      emoji: '📖🎓💡',
      action: 'Spreading wisdom at lightning speed',
      vibe: 'edutainment supreme'
    },
    workflow: [
      { step: 1, action: 'Record', emoji: '🎬', desc: 'Lecture capture', visual: 'Screen + face' },
      { step: 2, action: 'Voice', emoji: '🎤', desc: 'Clear explanation voice', visual: 'Audio wave' },
      { step: 3, action: 'Language', emoji: '🌐', desc: 'Multi-lingual lessons', visual: 'Translation' },
      { step: 4, action: 'Quiz', emoji: '❓', desc: 'Add interactive quizzes', visual: 'Quiz bubbles' },
      { step: 5, action: 'Edit', emoji: '📝', desc: 'Structure the lesson', visual: 'Outline' },
      { step: 6, action: 'Caption', emoji: '💬', desc: 'Auto-captions for all', visual: 'CC icon' },
      { step: 7, action: 'LMS', emoji: '📚', desc: 'Export to Moodle/Canvas', visual: 'LMS icons' },
      { step: 8, action: 'Publish', emoji: '🎯', desc: 'Assign to students', visual: 'Student desk' }
    ],
    journey: [
      { phase: 'P0', feature: 'Script + TTS', humor: 'Lecture on autopilot' },
      { phase: 'P1', feature: 'PiP Recording', humor: 'Face + slides = engage' },
      { phase: 'P2', feature: 'AI Arrange', humor: 'Smart lesson flow' },
      { phase: 'P3', feature: 'Lesson Builder', humor: '69% want AI scripts' },
      { phase: 'P4', feature: 'Team Reviews', humor: 'Peer approval queue' },
      { phase: 'P5', feature: 'Analytics', humor: 'Did they watch it?' }
    ],
    publishTo: ['📚 LMS (Moodle)', '🎬 YouTube Edu', '📱 App', '📧 Email', '🌐 Portal'],
    subscription: 'Pro ($79.99/mo)',
    marketData: '69% want AI lesson scripts'
  },
  healthcare: {
    name: 'Healthcare',
    icon: '🏥',
    color: colors.healthcare,
    tagline: '"$1000/mo for HIPAA? My budget just flatlined!" 💉',
    character: {
      scene: '👨‍⚕️ doctor on a healing cloud of care',
      emoji: '💊🩺❤️',
      action: 'Delivering care through video',
      vibe: 'professional but compassionate'
    },
    workflow: [
      { step: 1, action: 'Record', emoji: '📹', desc: 'Patient education video', visual: 'Medical setting' },
      { step: 2, action: 'Voice', emoji: '🗣️', desc: 'Calm, clear explanation', visual: 'Soothing voice' },
      { step: 3, action: 'Language', emoji: '🌍', desc: 'Multi-language care', visual: 'Translation' },
      { step: 4, action: 'HIPAA', emoji: '🔒', desc: 'PHI redaction auto', visual: 'Lock + shield' },
      { step: 5, action: 'Caption', emoji: '💬', desc: 'Accessibility first', visual: 'CC accessible' },
      { step: 6, action: 'Review', emoji: '✅', desc: 'Medical review approval', visual: 'Checkmark' },
      { step: 7, action: 'Audit', emoji: '📋', desc: 'Full audit trail', visual: 'Document trail' },
      { step: 8, action: 'Publish', emoji: '🏥', desc: 'Secure patient portal', visual: 'Portal icon' }
    ],
    journey: [
      { phase: 'P0', feature: 'Secure Record', humor: 'Patient consent ✓' },
      { phase: 'P1', feature: 'Audio Mixer', humor: 'Clear instructions' },
      { phase: 'P2', feature: 'Captions', humor: 'Accessibility first' },
      { phase: 'P3', feature: 'Patient Ed', humor: 'Multi-language care' },
      { phase: 'P4', feature: 'HIPAA Mode', humor: '94% want this <$100!' },
      { phase: 'P5', feature: 'Audit Trail', humor: 'Compliance = peace' }
    ],
    publishTo: ['🏥 Patient Portal', '📧 Secure Email', '📱 MyChart', '🌐 Internal'],
    subscription: 'Enterprise (Custom)',
    marketData: '94% want HIPAA under $100/mo'
  },
  enterprise: {
    name: 'Enterprise',
    icon: '🏢',
    color: colors.enterprise,
    tagline: '"Legal wants to review? That\'s 3 weeks..." ⏳',
    character: {
      scene: '👔 executive commanding a fleet of content ships',
      emoji: '🏛️📊🌐',
      action: 'Orchestrating global communications',
      vibe: 'corporate but efficient'
    },
    workflow: [
      { step: 1, action: 'Record', emoji: '🎥', desc: 'Executive message', visual: 'Boardroom' },
      { step: 2, action: 'Voice', emoji: '🗣️', desc: 'Consistent brand voice', visual: 'Brand mic' },
      { step: 3, action: 'Language', emoji: '🌐', desc: 'Global office reach', visual: 'Global offices' },
      { step: 4, action: 'Approve', emoji: '✅', desc: 'Legal & compliance', visual: 'Approval stamp' },
      { step: 5, action: 'Edit', emoji: '✂️', desc: 'Brand compliance edit', visual: 'Brand guide' },
      { step: 6, action: 'Version', emoji: '📁', desc: 'Version control', visual: 'Git-like tree' },
      { step: 7, action: 'SSO', emoji: '🔐', desc: 'Secure access', visual: 'SSO login' },
      { step: 8, action: 'Publish', emoji: '📡', desc: 'Multi-channel deploy', visual: 'Broadcast' }
    ],
    journey: [
      { phase: 'P0', feature: 'Project Mgmt', humor: 'Version control!' },
      { phase: 'P1', feature: 'Arc Hub', humor: 'Team workspace' },
      { phase: 'P2', feature: 'Collab Edit', humor: 'Real-time editing' },
      { phase: 'P3', feature: 'Compliance', humor: 'Legal happy = rare' },
      { phase: 'P4', feature: 'Multi-Tenant', humor: 'Department isolation' },
      { phase: 'P5', feature: 'SSO/SAML', humor: 'IT approved!' }
    ],
    publishTo: ['📧 Internal Comms', '🌐 Intranet', '📺 Digital Signage', '📱 Teams/Slack'],
    subscription: 'Enterprise (Custom)',
    marketData: 'White-label demand high'
  }
};

// Technical Flow Infographic Data
const technicalFlows = [
  { 
    id: 'content-creation',
    name: 'Content Creation Pipeline',
    emoji: '🎬',
    steps: [
      { icon: '📝', label: 'Script', tool: 'Mind AI' },
      { icon: '🎙️', label: 'TTS/Voice', tool: 'ElevenLabs' },
      { icon: '📹', label: 'Record', tool: 'Vibe Studio' },
      { icon: '✂️', label: 'Edit', tool: 'Remix Engine' },
      { icon: '🚀', label: 'Publish', tool: 'Multi-Platform' }
    ]
  },
  {
    id: 'vibe-mind-bridge',
    name: 'Vibe ↔ Mind Bidirectional',
    emoji: '🔄',
    steps: [
      { icon: '📄', label: 'Upload', tool: 'PDF/PPT/URL/IMG' },
      { icon: '🧠', label: 'Analyze', tool: 'Mind AI' },
      { icon: '📜', label: 'Script', tool: 'ContentAnalyzer' },
      { icon: '🎤', label: 'Narrate', tool: 'TTS Engine' },
      { icon: '🎥', label: 'Record', tool: 'Vibe Studio' }
    ]
  },
  {
    id: 'mobile-first',
    name: 'Mobile-First Flow',
    emoji: '📱',
    steps: [
      { icon: '👆', label: 'One-Tap', tool: 'Quick Start' },
      { icon: '📴', label: 'Offline', tool: 'IndexedDB' },
      { icon: '🎬', label: 'Clip', tool: 'Quick Editor' },
      { icon: '📲', label: 'Preview', tool: 'Mobile View' },
      { icon: '📤', label: 'Share', tool: 'Social APIs' }
    ]
  }
];

// Subscription Tier Visual
const subscriptionTiers = [
  { 
    name: 'Free', 
    price: '$0', 
    color: '#94a3b8',
    emoji: '🆓',
    features: ['3 videos/mo', 'Watermark', '5 AI scripts'],
    segments: ['Trial users'],
    humor: 'Taste the magic free!'
  },
  { 
    name: 'Starter', 
    price: '$9.99/mo', 
    color: '#10b981',
    emoji: '🌱',
    features: ['Unlimited videos', 'No watermark', '100 AI scripts'],
    segments: ['Creator', 'Traveler'],
    humor: 'Most popular for solopreneurs!'
  },
  { 
    name: 'Business', 
    price: '$29.99/mo', 
    color: '#f59e0b',
    emoji: '💼',
    features: ['Product demos', 'Templates', '3 team members'],
    segments: ['SMB'],
    humor: 'Synthesia who? Save $37/mo!'
  },
  { 
    name: 'Pro', 
    price: '$79.99/mo', 
    color: '#8b5cf6',
    emoji: '🚀',
    features: ['Lesson Builder', 'API access', '10 team members'],
    segments: ['Education'],
    humor: 'Teachers deserve the best!'
  },
  { 
    name: 'Enterprise', 
    price: 'Custom', 
    color: '#ec4899',
    emoji: '🏛️',
    features: ['HIPAA', 'White-label', 'Unlimited', 'SSO'],
    segments: ['Healthcare', 'Enterprise'],
    humor: 'Your legal team will love us!'
  }
];

// Phase Priority with Market Data - Complete P0-P5
const phaseData = [
  { 
    id: 'P0', 
    name: 'Core MVP', 
    color: colors.p0, 
    scenarios: 13, 
    icon: Zap, 
    status: 'complete', 
    market: 'Foundation',
    features: ['Script + TTS', 'Recording Studio', 'Teleprompter', 'Export MP4/WebM', 'Vibe↔Mind Bridge'],
    timeline: 'Weeks 1-4',
    keyMetric: '72% Complete'
  },
  { 
    id: 'P1', 
    name: 'Mobile & Remix', 
    color: colors.p1, 
    scenarios: 10, 
    icon: Smartphone, 
    status: 'partial', 
    market: '68% mobile demand',
    features: ['One-Tap Recording', 'Quick Clips', 'Clip Assembly', 'Mobile Preview', 'Social Sharing'],
    timeline: 'Weeks 5-8',
    keyMetric: '30% Complete'
  },
  { 
    id: 'P2', 
    name: 'Advanced', 
    color: colors.p2, 
    scenarios: 10, 
    icon: TrendingUp, 
    status: 'planned', 
    market: '54% offline need',
    features: ['Offline Mode', 'AI Voice Edit', 'Smart Captions', 'AI Arrange', 'Collaboration'],
    timeline: 'Weeks 9-12',
    keyMetric: '10% Complete'
  },
  { 
    id: 'P3', 
    name: 'Segments', 
    color: colors.p3, 
    scenarios: 10, 
    icon: Target, 
    status: 'planned', 
    market: '6 vertical markets',
    features: ['Product Demo Kit', 'Lesson Builder', 'Patient Ed Kit', 'Voice Clone', 'Auto-Edit Kit'],
    timeline: 'Weeks 13-16',
    keyMetric: 'Roadmap'
  },
  { 
    id: 'P4', 
    name: 'Enterprise', 
    color: colors.p4, 
    scenarios: 10, 
    icon: Shield, 
    status: 'planned', 
    market: 'White-label sales',
    features: ['HIPAA Mode', 'White-Label', 'Multi-Tenant', 'Approval Workflows', 'SSO/SAML'],
    timeline: 'Weeks 17-20',
    keyMetric: 'Enterprise Sales'
  },
  { 
    id: 'P5', 
    name: 'Future', 
    color: colors.p5, 
    scenarios: 10, 
    icon: Film, 
    status: 'planned', 
    market: 'Innovation',
    features: ['API Access', 'Batch Processing', 'AI Director', 'B-Roll Library', 'Analytics Pro'],
    timeline: 'Weeks 21+',
    keyMetric: 'Innovation'
  }
];

// Language Prioritization Data
const languagePriority = [
  { 
    tier: 'Tier 1 (P1)', 
    languages: [
      { code: 'en', name: 'English', icon: '🇺🇸', speakers: '1.5B', priority: 'P0 - Core' },
      { code: 'hi', name: 'Hindi', icon: '🇮🇳', speakers: '600M', priority: 'P1 - High' },
      { code: 'es', name: 'Spanish', icon: '🇪🇸', speakers: '560M', priority: 'P1 - High' },
      { code: 'zh', name: 'Mandarin', icon: '🇨🇳', speakers: '1.1B', priority: 'P1 - High' }
    ],
    color: colors.p1,
    marketNote: 'Covers 60% of global internet users'
  },
  { 
    tier: 'Tier 2 (P2)', 
    languages: [
      { code: 'fr', name: 'French', icon: '🇫🇷', speakers: '310M', priority: 'P2 - Medium' },
      { code: 'ja', name: 'Japanese', icon: '🇯🇵', speakers: '125M', priority: 'P2 - Medium' },
      { code: 'te', name: 'Telugu', icon: '🇮🇳', speakers: '96M', priority: 'P2 - Medium' },
      { code: 'mr', name: 'Marathi', icon: '🇮🇳', speakers: '95M', priority: 'P2 - Medium' }
    ],
    color: colors.p2,
    marketNote: 'High-value regional markets'
  },
  { 
    tier: 'Tier 3 (P3)', 
    languages: [
      { code: 'kn', name: 'Kannada', icon: '🇮🇳', speakers: '59M', priority: 'P3 - Regional' },
      { code: 'pt', name: 'Portuguese', icon: '🇧🇷', speakers: '260M', priority: 'P3 - Regional' },
      { code: 'de', name: 'German', icon: '🇩🇪', speakers: '135M', priority: 'P3 - Regional' },
      { code: 'ar', name: 'Arabic', icon: '🇸🇦', speakers: '420M', priority: 'P3 - Regional' }
    ],
    color: colors.p3,
    marketNote: 'Regional expansion'
  }
];

// Complete Cross-Functional Matrix
const crossFunctionalMatrix = [
  {
    category: '🌍 Universal Features',
    emoji: '🌍',
    products: ['Mind', 'Vibe', 'Arc', 'Spark'],
    segments: ['All 6 Segments'],
    features: ['Script + TTS', 'Recording', 'Export', 'Templates'],
    subscriptions: ['Free', 'Starter', 'Business', 'Pro', 'Enterprise'],
    marketData: 'Foundation - 100% coverage',
    priority: 'P0',
    color: colors.p0
  },
  {
    category: '📱 Mobile-First',
    emoji: '📱',
    products: ['Mind', 'Vibe', 'Spark'],
    segments: ['Creator', 'Traveler', 'SMB'],
    features: ['One-Tap Record', 'Quick Clips', 'Mobile Preview', 'Social Share'],
    subscriptions: ['Starter', 'Business'],
    marketData: '68% mobile demand - Research shows creators want phone-first',
    priority: 'P1',
    color: colors.p1
  },
  {
    category: '🎬 Remix & Clips',
    emoji: '🎬',
    products: ['Vibe', 'Arc', 'Spark'],
    segments: ['Creator', 'SMB', 'Education'],
    features: ['Clip Assembly', 'Remix Engine', 'Auto-Highlights', 'Timestamp Markers'],
    subscriptions: ['Starter', 'Business', 'Pro'],
    marketData: '82% want clips - Short-form content dominance',
    priority: 'P1',
    color: colors.p1
  },
  {
    category: '📴 Offline Mode',
    emoji: '📴',
    products: ['Vibe', 'Mind (cached)'],
    segments: ['Traveler', 'Healthcare', 'Education'],
    features: ['IndexedDB Storage', 'Sync on Connect', 'Offline Recording', 'Local AI'],
    subscriptions: ['Starter', 'Pro', 'Enterprise'],
    marketData: '54% need offline - Travel & field work',
    priority: 'P2',
    color: colors.p2
  },
  {
    category: '🌐 Multi-Language',
    emoji: '🌐',
    products: ['Mind', 'Vibe', 'Arc'],
    segments: ['Traveler', 'SMB', 'Education', 'Enterprise'],
    features: ['12 Languages', 'Auto-Translate', 'Regional TTS', 'Caption Localization'],
    subscriptions: ['Business', 'Pro', 'Enterprise'],
    marketData: 'India + LATAM + APAC = 3B users',
    priority: 'P2',
    color: colors.p2
  },
  {
    category: '🎓 Education Kit',
    emoji: '🎓',
    products: ['Mind', 'Vibe', 'Arc'],
    segments: ['Education'],
    features: ['Lesson Builder', 'Quiz Integration', 'Student Analytics', 'LMS Export'],
    subscriptions: ['Pro'],
    marketData: '69% want AI scripts - Teachers save 4+ hours/video',
    priority: 'P3',
    color: colors.p3
  },
  {
    category: '🏥 Healthcare Kit',
    emoji: '🏥',
    products: ['Vibe', 'Arc', 'Hub'],
    segments: ['Healthcare'],
    features: ['Patient Ed Templates', 'HIPAA Mode', 'PHI Redaction', 'Audit Trail'],
    subscriptions: ['Enterprise'],
    marketData: '94% want HIPAA <$100/mo - Massive gap!',
    priority: 'P3',
    color: colors.p3
  },
  {
    category: '🏢 Enterprise Compliance',
    emoji: '🏢',
    products: ['Vibe', 'Arc', 'Hub'],
    segments: ['Healthcare', 'Enterprise'],
    features: ['Approval Workflows', 'Legal Review Gate', 'SOC2', 'SSO/SAML'],
    subscriptions: ['Enterprise'],
    marketData: 'White-label demand high - $10K+ deals',
    priority: 'P4',
    color: colors.p4
  },
  {
    category: '🔌 API & Integration',
    emoji: '🔌',
    products: ['All Products'],
    segments: ['SMB', 'Education', 'Enterprise'],
    features: ['REST API', 'Webhooks', 'Zapier', 'Custom Integrations'],
    subscriptions: ['Pro', 'Enterprise'],
    marketData: 'Developer ecosystem - Multiplier effect',
    priority: 'P5',
    color: colors.p5
  }
];

export const GenieVisualAssetsGalleryDiagram = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    try {
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: colors.background,
        scale: 2
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `genie-visual-assets-${activeTab}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PNG downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PNG');
    }
  };

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <FileImage className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-xl md:text-2xl text-foreground">Visual Assets Gallery</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Interactive Infographics • Segment Journeys • Technical Flows • Subscription Mapping
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="gap-2">
                <Download className="h-4 w-4" />
                PNG
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs with scroll buttons */}
      <div className="diagram-scroll-container">
        <Button 
          variant="default" 
          size="icon" 
          className="diagram-scroll-btn diagram-scroll-btn-left hidden md:flex"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
            <TabsList className="diagram-tabs-list inline-flex w-max min-w-full justify-start">
              <TabsTrigger value="overview" className="diagram-tab-trigger">📊 Overview</TabsTrigger>
              <TabsTrigger value="segments" className="diagram-tab-trigger">🎯 Segments</TabsTrigger>
              <TabsTrigger value="roadmap" className="diagram-tab-trigger">🗺️ P0-P5 Roadmap</TabsTrigger>
              <TabsTrigger value="crossover" className="diagram-tab-trigger">🔗 Matrix</TabsTrigger>
              <TabsTrigger value="languages" className="diagram-tab-trigger">🌐 Languages</TabsTrigger>
              <TabsTrigger value="technical" className="diagram-tab-trigger">⚙️ Technical</TabsTrigger>
              <TabsTrigger value="subscriptions" className="diagram-tab-trigger">💳 Tiers</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[650px] mt-4">
            <div ref={diagramRef} className="p-4 md:p-6 bg-card rounded-lg border border-border/30">
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {phaseData.map((phase) => {
                    const Icon = phase.icon;
                    return (
                      <Card 
                        key={phase.id}
                        className="cursor-pointer hover:shadow-lg transition-all border-2"
                        style={{ borderColor: phase.color.bg, backgroundColor: phase.color.light }}
                      >
                        <CardContent className="p-3 md:p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-4 w-4" style={{ color: phase.color.bg }} />
                            <span className="font-bold text-sm" style={{ color: phase.color.bg }}>{phase.id}</span>
                          </div>
                          <p className="text-xs font-medium" style={{ color: colors.text }}>{phase.name}</p>
                          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{phase.scenarios} scenarios</p>
                          <Badge 
                            className="mt-2 text-xs"
                            style={{ 
                              backgroundColor: phase.status === 'complete' ? colors.completed.bg : 
                                              phase.status === 'partial' ? colors.inProgress.bg : colors.planned.bg,
                              color: '#fff'
                            }}
                          >
                            {phase.status === 'complete' ? '✓ Done' : phase.status === 'partial' ? '◐ WIP' : '○ Planned'}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Humor Quote Banner */}
                <div className="p-4 rounded-lg border-2 border-dashed" style={{ borderColor: colors.inProgress.bg, backgroundColor: colors.inProgress.light }}>
                  <p className="text-center text-sm md:text-base font-medium" style={{ color: colors.text }}>
                    🎬 "I spend 2 hours editing a 60-second reel. I wish I could just talk and have it edit itself." 
                    <span className="text-xs block mt-1" style={{ color: colors.textMuted }}>— TikTok Creator (probably you)</span>
                  </p>
                </div>

                {/* Quick Segment Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(segmentJourneys).map(([key, segment]) => (
                    <Card 
                      key={key}
                      className="cursor-pointer hover:shadow-lg transition-all border-2"
                      style={{ borderColor: segment.color.bg }}
                      onClick={() => { setActiveTab('segments'); setSelectedSegment(key); }}
                    >
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{segment.icon}</span>
                          <span className="font-bold text-sm" style={{ color: segment.color.bg }}>{segment.name}</span>
                        </div>
                        <p className="text-xs italic" style={{ color: colors.textMuted }}>{segment.tagline}</p>
                        <Badge className="mt-2 text-xs" style={{ backgroundColor: segment.color.light, color: segment.color.bg }}>
                          {segment.subscription}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Segments Tab - Creative Journey Infographics */}
              <TabsContent value="segments" className="space-y-6 mt-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: colors.text }}>🎯 Segment Journey Infographics</h3>
                    <p className="text-sm" style={{ color: colors.textMuted }}>Explore each segment's creative workflow from Record → Voice → Language → Generate → Edit → Publish!</p>
                  </div>
                  <Badge style={{ backgroundColor: colors.creator.bg, color: '#fff' }}>6 Segments • 48 Workflow Steps</Badge>
                </div>
                
                {/* Segment Selector */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(segmentJourneys).map(([key, segment]) => (
                    <Button
                      key={key}
                      variant={selectedSegment === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSegment(key)}
                      className="gap-2 transition-all hover:scale-105"
                      style={selectedSegment === key ? { backgroundColor: segment.color.bg } : {}}
                    >
                      <span className="text-lg">{segment.icon}</span>
                      {segment.name}
                    </Button>
                  ))}
                </div>

                {/* Selected Segment Journey - Enhanced Creative Infographic */}
                {selectedSegment && segmentJourneys[selectedSegment as keyof typeof segmentJourneys] && (() => {
                  const segment = segmentJourneys[selectedSegment as keyof typeof segmentJourneys];
                  return (
                    <div className="space-y-4">
                      {/* Hero Character Scene */}
                      <Card className="border-2 overflow-hidden" style={{ borderColor: segment.color.bg }}>
                        <div 
                          className="p-6 relative"
                          style={{ 
                            background: `linear-gradient(135deg, ${segment.color.light} 0%, ${segment.color.bg}20 100%)`,
                          }}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg animate-bounce"
                                style={{ backgroundColor: segment.color.bg }}
                              >
                                {segment.icon}
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold" style={{ color: segment.color.bg }}>
                                  {segment.name} Journey
                                </h3>
                                <p className="text-base italic" style={{ color: colors.textMuted }}>
                                  {segment.tagline}
                                </p>
                                <p className="text-sm mt-2" style={{ color: colors.text }}>
                                  {segment.character.scene}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-4xl mb-2">{segment.character.emoji}</div>
                              <Badge style={{ backgroundColor: segment.color.bg, color: '#fff' }} className="text-sm">
                                {segment.subscription}
                              </Badge>
                              <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{segment.marketData}</p>
                            </div>
                          </div>
                          
                          {/* Fun Action Quote */}
                          <div className="mt-4 p-3 rounded-lg border-2 border-dashed" style={{ borderColor: segment.color.bg, backgroundColor: 'rgba(255,255,255,0.5)' }}>
                            <p className="text-center text-sm font-medium" style={{ color: segment.color.bg }}>
                              🎬 {segment.character.action} • <span className="italic">"{segment.character.vibe}"</span>
                            </p>
                          </div>
                        </div>
                      </Card>

                      {/* Creative Workflow Pipeline - Visual Infographic */}
                      <Card className="border-2" style={{ borderColor: segment.color.bg }}>
                        <CardHeader className="pb-3" style={{ backgroundColor: segment.color.light }}>
                          <CardTitle className="text-lg flex items-center gap-2" style={{ color: segment.color.bg }}>
                            🚀 Complete Workflow Pipeline
                            <span className="text-sm font-normal italic">— From idea to publication!</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="relative">
                            {/* Workflow Steps as Visual Pipeline */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                              {segment.workflow.map((step, idx) => (
                                <div 
                                  key={idx}
                                  className="relative group"
                                >
                                  <div 
                                    className="flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg cursor-pointer"
                                    style={{ 
                                      borderColor: segment.color.bg,
                                      backgroundColor: idx % 2 === 0 ? segment.color.light : 'rgba(255,255,255,0.8)'
                                    }}
                                  >
                                    <div 
                                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 shadow-md"
                                      style={{ backgroundColor: segment.color.bg }}
                                    >
                                      {step.emoji}
                                    </div>
                                    <span 
                                      className="text-xs font-bold text-center"
                                      style={{ color: segment.color.bg }}
                                    >
                                      {step.step}. {step.action}
                                    </span>
                                    <span className="text-xs text-center mt-1" style={{ color: colors.textMuted }}>
                                      {step.desc}
                                    </span>
                                  </div>
                                  {/* Arrow between steps */}
                                  {idx < segment.workflow.length - 1 && (
                                    <div 
                                      className="hidden lg:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-2xl z-10"
                                      style={{ color: segment.color.bg }}
                                    >
                                      →
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            {/* Mobile arrow indicator */}
                            <div className="lg:hidden flex justify-center mt-3 gap-1">
                              {segment.workflow.map((_, idx) => (
                                <div 
                                  key={idx}
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: segment.color.bg, opacity: 0.6 }}
                                />
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Publish Destinations - Social Media */}
                      <Card className="border-2" style={{ borderColor: segment.color.bg }}>
                        <CardHeader className="pb-2" style={{ backgroundColor: segment.color.light }}>
                          <CardTitle className="text-base flex items-center gap-2" style={{ color: segment.color.bg }}>
                            📲 Publish Destinations
                            <span className="text-sm font-normal">— Share everywhere!</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3">
                          <div className="flex flex-wrap gap-2">
                            {segment.publishTo.map((platform, idx) => (
                              <div 
                                key={idx}
                                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 hover:scale-105 transition-all cursor-pointer"
                                style={{ 
                                  borderColor: segment.color.bg,
                                  backgroundColor: segment.color.light
                                }}
                              >
                                <span className="text-lg">{platform}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Phase Timeline */}
                      <Card className="border-2" style={{ borderColor: segment.color.bg }}>
                        <CardHeader className="pb-2" style={{ backgroundColor: segment.color.light }}>
                          <CardTitle className="text-base flex items-center gap-2" style={{ color: segment.color.bg }}>
                            📅 Feature Roadmap (P0 → P5)
                            <span className="text-sm font-normal">— What's coming for you!</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-1 rounded-full" style={{ backgroundColor: segment.color.bg }} />
                            <div className="space-y-3">
                              {segment.journey.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-4 ml-0">
                                  <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 shadow-md"
                                    style={{ 
                                      backgroundColor: phaseData.find(p => p.id === step.phase)?.color.bg || colors.planned.bg,
                                      color: '#fff'
                                    }}
                                  >
                                    {step.phase}
                                  </div>
                                  <div 
                                    className="flex-1 p-3 rounded-lg border-2 hover:shadow-md transition-all"
                                    style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
                                  >
                                    <div className="flex justify-between items-start flex-wrap gap-2">
                                      <span className="font-semibold text-sm" style={{ color: colors.text }}>{step.feature}</span>
                                      <Badge 
                                        variant="outline" 
                                        className="text-xs"
                                        style={{ borderColor: segment.color.bg, color: segment.color.bg }}
                                      >
                                        {step.phase}
                                      </Badge>
                                    </div>
                                    <p className="text-xs italic mt-1" style={{ color: colors.textMuted }}>💬 "{step.humor}"</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}

                {!selectedSegment && (
                  <div className="space-y-6">
                    {/* Overview of all segments with visual preview */}
                    <div className="text-center p-6 rounded-lg border-2 border-dashed" style={{ borderColor: colors.inProgress.bg, backgroundColor: colors.inProgress.light }}>
                      <p className="text-xl mb-2" style={{ color: colors.text }}>👆 Select a segment above to explore their creative journey!</p>
                      <p className="text-sm" style={{ color: colors.textMuted }}>Each segment has a unique workflow: Record → Voice → Language → Generate → Edit → Publish</p>
                    </div>
                    
                    {/* Mini preview cards for all segments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(segmentJourneys).map(([key, segment]) => (
                        <Card 
                          key={key}
                          className="border-2 cursor-pointer hover:shadow-lg transition-all hover:scale-102"
                          style={{ borderColor: segment.color.bg }}
                          onClick={() => setSelectedSegment(key)}
                        >
                          <div className="p-4" style={{ backgroundColor: segment.color.light }}>
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-3xl">{segment.icon}</span>
                              <div>
                                <h4 className="font-bold" style={{ color: segment.color.bg }}>{segment.name}</h4>
                                <p className="text-xs italic" style={{ color: colors.textMuted }}>{segment.character.action}</p>
                              </div>
                            </div>
                            
                            {/* Mini workflow preview */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {segment.workflow.slice(0, 4).map((step, idx) => (
                                <span key={idx} className="text-lg">{step.emoji}</span>
                              ))}
                              <span className="text-sm" style={{ color: colors.textMuted }}>+{segment.workflow.length - 4} more</span>
                            </div>
                            
                            {/* Publish icons */}
                            <div className="flex flex-wrap gap-1 text-xs">
                              {segment.publishTo.slice(0, 3).map((p, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs" style={{ borderColor: segment.color.bg }}>
                                  {p}
                                </Badge>
                              ))}
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full mt-3"
                              style={{ color: segment.color.bg }}
                            >
                              Explore Journey →
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Technical Flows Tab */}
              <TabsContent value="technical" className="space-y-6 mt-0">
                <h3 className="text-lg font-semibold" style={{ color: colors.text }}>⚙️ Technical Flow Infographics</h3>
                
                {technicalFlows.map((flow) => (
                  <Card key={flow.id} className="border-2" style={{ borderColor: colors.completed.bg }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="text-2xl">{flow.emoji}</span>
                        {flow.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2">
                        {flow.steps.map((step, idx) => (
                          <React.Fragment key={idx}>
                            <div className="flex flex-col items-center min-w-[80px]">
                              <div 
                                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                                style={{ backgroundColor: colors.completed.light, border: `2px solid ${colors.completed.bg}` }}
                              >
                                {step.icon}
                              </div>
                              <span className="text-xs font-semibold mt-2" style={{ color: colors.text }}>{step.label}</span>
                              <span className="text-xs" style={{ color: colors.textMuted }}>{step.tool}</span>
                            </div>
                            {idx < flow.steps.length - 1 && (
                              <div className="text-2xl" style={{ color: colors.completed.bg }}>→</div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Subscriptions Tab */}
              <TabsContent value="subscriptions" className="space-y-6 mt-0">
                <h3 className="text-lg font-semibold" style={{ color: colors.text }}>💳 Subscription Tiers by Segment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {subscriptionTiers.map((tier) => (
                    <Card 
                      key={tier.name}
                      className="border-2 hover:shadow-lg transition-all"
                      style={{ borderColor: tier.color }}
                    >
                      <CardHeader className="pb-2" style={{ backgroundColor: `${tier.color}15` }}>
                        <div className="text-center">
                          <span className="text-3xl">{tier.emoji}</span>
                          <CardTitle className="text-lg mt-2" style={{ color: tier.color }}>{tier.name}</CardTitle>
                          <p className="text-2xl font-bold" style={{ color: colors.text }}>{tier.price}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-xs italic text-center mb-3" style={{ color: colors.textMuted }}>"{tier.humor}"</p>
                        <ul className="space-y-2">
                          {tier.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs" style={{ color: colors.text }}>
                              <span style={{ color: tier.color }}>✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 flex flex-wrap gap-1">
                          {tier.segments.map((seg, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs" style={{ borderColor: tier.color, color: tier.color }}>
                              {seg}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Roadmap Tab - Enhanced P0-P5 */}
              <TabsContent value="roadmap" className="space-y-6 mt-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-semibold" style={{ color: colors.text }}>🗺️ P0 → P5 Phase Roadmap</h3>
                  <Badge style={{ backgroundColor: colors.completed.bg, color: '#fff' }}>63 Scenarios Mapped</Badge>
                </div>
                
                {/* Humor Banner */}
                <div className="p-3 rounded-lg border-2 border-dashed" style={{ borderColor: colors.p2.bg, backgroundColor: colors.p2.light }}>
                  <p className="text-center text-sm" style={{ color: colors.text }}>
                    🚀 "Rome wasn't built in a day, but they weren't using Agile sprints either!" 
                    <span className="text-xs block mt-1" style={{ color: colors.textMuted }}>— Project Manager, probably</span>
                  </p>
                </div>
                
                {/* Phase Cards - Detailed View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {phaseData.map((phase) => {
                    const Icon = phase.icon;
                    return (
                      <Card 
                        key={phase.id}
                        className="border-2 hover:shadow-lg transition-all"
                        style={{ borderColor: phase.color.bg }}
                      >
                        <CardHeader className="pb-2" style={{ backgroundColor: phase.color.light }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-6 w-6" style={{ color: phase.color.bg }} />
                              <div>
                                <CardTitle className="text-lg" style={{ color: phase.color.bg }}>{phase.id}</CardTitle>
                                <p className="text-xs font-medium" style={{ color: colors.text }}>{phase.name}</p>
                              </div>
                            </div>
                            <Badge 
                              style={{ 
                                backgroundColor: phase.status === 'complete' ? colors.completed.bg : 
                                                phase.status === 'partial' ? colors.inProgress.bg : colors.planned.bg,
                                color: '#fff'
                              }}
                            >
                              {phase.keyMetric}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-3">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span style={{ color: colors.textMuted }}>Timeline:</span>
                              <span className="font-medium" style={{ color: colors.text }}>{phase.timeline}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span style={{ color: colors.textMuted }}>Scenarios:</span>
                              <span className="font-medium" style={{ color: colors.text }}>{phase.scenarios}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span style={{ color: colors.textMuted }}>Market:</span>
                              <span className="font-medium" style={{ color: colors.text }}>{phase.market}</span>
                            </div>
                            <hr className="my-2" style={{ borderColor: colors.border }} />
                            <div>
                              <p className="text-xs font-medium mb-1" style={{ color: colors.text }}>Key Features:</p>
                              <div className="flex flex-wrap gap-1">
                                {phase.features.map((f, i) => (
                                  <Badge key={i} variant="outline" className="text-xs" style={{ borderColor: phase.color.bg, color: phase.color.bg }}>
                                    {f}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Timeline Visualization */}
                <Card className="border" style={{ borderColor: colors.border }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      📅 Development Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative overflow-x-auto">
                      <div className="flex gap-1 min-w-[600px]">
                        {phaseData.map((phase, idx) => (
                          <div key={phase.id} className="flex-1 text-center">
                            <div 
                              className="h-8 rounded flex items-center justify-center text-xs font-bold text-white"
                              style={{ backgroundColor: phase.color.bg }}
                            >
                              {phase.id}
                            </div>
                            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{phase.timeline}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cross-Functional Tab - Complete Matrix */}
              <TabsContent value="crossover" className="space-y-6 mt-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-semibold" style={{ color: colors.text }}>🔗 Cross-Functional Feature Matrix</h3>
                  <Badge style={{ backgroundColor: colors.p1.bg, color: '#fff' }}>9 Categories • All Products</Badge>
                </div>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  Complete mapping of categories → products → segments → subscriptions → market data
                </p>

                {/* Matrix Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {crossFunctionalMatrix.map((item, idx) => (
                    <Card 
                      key={idx}
                      className="border-2 hover:shadow-lg transition-all"
                      style={{ borderColor: item.color.bg }}
                    >
                      <CardHeader className="pb-2" style={{ backgroundColor: item.color.light }}>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2" style={{ color: item.color.bg }}>
                            <span className="text-xl">{item.emoji}</span>
                            {item.category.replace(item.emoji + ' ', '')}
                          </CardTitle>
                          <Badge style={{ backgroundColor: item.color.bg, color: '#fff' }}>{item.priority}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3 space-y-2">
                        <div>
                          <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Products:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.products.map((p, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Segments:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.segments.map((s, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Features:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.features.slice(0, 3).map((f, i) => (
                              <Badge key={i} className="text-xs" style={{ backgroundColor: item.color.light, color: item.color.bg, border: `1px solid ${item.color.bg}` }}>
                                {f}
                              </Badge>
                            ))}
                            {item.features.length > 3 && (
                              <Badge variant="outline" className="text-xs">+{item.features.length - 3}</Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Subscriptions:</p>
                          <p className="text-xs" style={{ color: colors.text }}>{item.subscriptions.join(', ')}</p>
                        </div>
                        <hr style={{ borderColor: colors.border }} />
                        <div className="p-2 rounded" style={{ backgroundColor: item.color.light }}>
                          <p className="text-xs font-medium" style={{ color: item.color.bg }}>📊 {item.marketData}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Summary Table */}
                <Card className="border" style={{ borderColor: colors.border }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">📋 Quick Reference Matrix</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs" style={{ minWidth: '800px' }}>
                        <thead>
                          <tr>
                            <th className="p-2 text-left border" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>Category</th>
                            <th className="p-2 text-center border" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>Priority</th>
                            <th className="p-2 text-center border" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>Products</th>
                            <th className="p-2 text-center border" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>Segments</th>
                            <th className="p-2 text-center border" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>Tiers</th>
                            <th className="p-2 text-center border" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>Market</th>
                          </tr>
                        </thead>
                        <tbody>
                          {crossFunctionalMatrix.map((item, idx) => (
                            <tr key={idx}>
                              <td className="p-2 border font-medium" style={{ backgroundColor: item.color.light, borderColor: colors.border }}>
                                {item.category}
                              </td>
                              <td className="p-2 border text-center" style={{ borderColor: colors.border }}>
                                <Badge style={{ backgroundColor: item.color.bg, color: '#fff' }}>{item.priority}</Badge>
                              </td>
                              <td className="p-2 border text-center" style={{ borderColor: colors.border }}>{item.products.join(', ')}</td>
                              <td className="p-2 border text-center" style={{ borderColor: colors.border }}>{item.segments.join(', ')}</td>
                              <td className="p-2 border text-center" style={{ borderColor: colors.border }}>{item.subscriptions.length}</td>
                              <td className="p-2 border text-center" style={{ borderColor: colors.border }}>{item.marketData.split(' - ')[0]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Languages Tab - NEW */}
              <TabsContent value="languages" className="space-y-6 mt-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-semibold" style={{ color: colors.text }}>🌐 Language Prioritization Roadmap</h3>
                  <Badge style={{ backgroundColor: colors.p1.bg, color: '#fff' }}>12 Languages Planned</Badge>
                </div>

                {/* Humor Banner */}
                <div className="p-3 rounded-lg border-2 border-dashed" style={{ borderColor: colors.p3.bg, backgroundColor: colors.p3.light }}>
                  <p className="text-center text-sm" style={{ color: colors.text }}>
                    🗣️ "The only language barrier should be not knowing what 'fleek' means!" 
                    <span className="text-xs block mt-1" style={{ color: colors.textMuted }}>— Multilingual Creator, 2024</span>
                  </p>
                </div>

                {/* Language Tiers */}
                <div className="space-y-6">
                  {languagePriority.map((tier, tierIdx) => (
                    <Card key={tierIdx} className="border-2" style={{ borderColor: tier.color.bg }}>
                      <CardHeader className="pb-2" style={{ backgroundColor: tier.color.light }}>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg" style={{ color: tier.color.bg }}>{tier.tier}</CardTitle>
                          <p className="text-xs" style={{ color: colors.textMuted }}>{tier.marketNote}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {tier.languages.map((lang, langIdx) => (
                            <div 
                              key={langIdx}
                              className="p-3 rounded-lg border text-center hover:shadow-md transition-all"
                              style={{ borderColor: tier.color.bg, backgroundColor: colors.cardBg }}
                            >
                              <span className="text-3xl">{lang.icon}</span>
                              <p className="font-bold text-sm mt-2" style={{ color: colors.text }}>{lang.name}</p>
                              <p className="text-xs" style={{ color: colors.textMuted }}>{lang.code.toUpperCase()}</p>
                              <Badge className="mt-2 text-xs" style={{ backgroundColor: tier.color.light, color: tier.color.bg, border: `1px solid ${tier.color.bg}` }}>
                                {lang.speakers}
                              </Badge>
                              <p className="text-xs mt-1" style={{ color: tier.color.bg }}>{lang.priority}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Language Feature Matrix */}
                <Card className="border" style={{ borderColor: colors.border }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      📋 Language Feature Support Matrix
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs" style={{ minWidth: '600px' }}>
                        <thead>
                          <tr>
                            <th className="p-2 text-left border" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>Feature</th>
                            <th className="p-2 text-center border" style={{ backgroundColor: colors.p1.light, borderColor: colors.border }}>Tier 1</th>
                            <th className="p-2 text-center border" style={{ backgroundColor: colors.p2.light, borderColor: colors.border }}>Tier 2</th>
                            <th className="p-2 text-center border" style={{ backgroundColor: colors.p3.light, borderColor: colors.border }}>Tier 3</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border" style={{ borderColor: colors.border }}>🎙️ TTS (Text-to-Speech)</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border }}>✅ P1</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border }}>✅ P2</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border }}>⏳ P3</td>
                          </tr>
                          <tr>
                            <td className="p-2 border" style={{ borderColor: colors.border }}>📝 UI Translation</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border }}>✅ P1</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border }}>✅ P2</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border }}>⏳ P3</td>
                          </tr>
                          <tr>
                            <td className="p-2 border" style={{ borderColor: colors.border }}>📺 Auto-Captions</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border }}>✅ P1</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border }}>✅ P2</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border }}>⏳ P3</td>
                          </tr>
                          <tr>
                            <td className="p-2 border" style={{ borderColor: colors.border }}>🔄 Script Translation</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border }}>✅ P2</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border }}>⏳ P3</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border }}>⏳ P4</td>
                          </tr>
                          <tr>
                            <td className="p-2 border" style={{ borderColor: colors.border }}>🗣️ Voice Clone</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border }}>⏳ P3</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border }}>⏳ P4</td>
                            <td className="p-2 border text-center" style={{ borderColor: colors.border }}>⏳ P5</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Regional Market Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border" style={{ borderColor: colors.p1.bg }}>
                    <CardContent className="p-4 text-center">
                      <span className="text-3xl">🇮🇳</span>
                      <p className="font-bold mt-2" style={{ color: colors.text }}>India Market</p>
                      <p className="text-xs" style={{ color: colors.textMuted }}>Hindi, Telugu, Marathi, Kannada</p>
                      <Badge className="mt-2" style={{ backgroundColor: colors.p1.bg, color: '#fff' }}>1.4B population</Badge>
                    </CardContent>
                  </Card>
                  <Card className="border" style={{ borderColor: colors.p2.bg }}>
                    <CardContent className="p-4 text-center">
                      <span className="text-3xl">🌏</span>
                      <p className="font-bold mt-2" style={{ color: colors.text }}>APAC Market</p>
                      <p className="text-xs" style={{ color: colors.textMuted }}>Mandarin, Japanese</p>
                      <Badge className="mt-2" style={{ backgroundColor: colors.p2.bg, color: '#fff' }}>1.5B speakers</Badge>
                    </CardContent>
                  </Card>
                  <Card className="border" style={{ borderColor: colors.p3.bg }}>
                    <CardContent className="p-4 text-center">
                      <span className="text-3xl">🌍</span>
                      <p className="font-bold mt-2" style={{ color: colors.text }}>Global Market</p>
                      <p className="text-xs" style={{ color: colors.textMuted }}>Spanish, French, Portuguese</p>
                      <Badge className="mt-2" style={{ backgroundColor: colors.p3.bg, color: '#fff' }}>1.1B speakers</Badge>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
        
        <Button 
          variant="default" 
          size="icon" 
          className="diagram-scroll-btn diagram-scroll-btn-right hidden md:flex"
          onClick={scrollRight}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default GenieVisualAssetsGalleryDiagram;
