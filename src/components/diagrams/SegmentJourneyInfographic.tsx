import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// Segment colors with HSL for theming
const segmentColors = {
  creator: { bg: 'hsl(258, 90%, 66%)', light: 'hsl(250, 91%, 95%)', gradient: 'linear-gradient(135deg, hsl(258, 90%, 66%) 0%, hsl(280, 85%, 55%) 100%)' },
  traveler: { bg: 'hsl(199, 89%, 48%)', light: 'hsl(201, 94%, 94%)', gradient: 'linear-gradient(135deg, hsl(199, 89%, 48%) 0%, hsl(180, 80%, 40%) 100%)' },
  smb: { bg: 'hsl(38, 92%, 50%)', light: 'hsl(48, 96%, 94%)', gradient: 'linear-gradient(135deg, hsl(38, 92%, 50%) 0%, hsl(25, 95%, 53%) 100%)' },
  education: { bg: 'hsl(160, 84%, 39%)', light: 'hsl(150, 80%, 94%)', gradient: 'linear-gradient(135deg, hsl(160, 84%, 39%) 0%, hsl(140, 75%, 35%) 100%)' },
  healthcare: { bg: 'hsl(330, 81%, 60%)', light: 'hsl(326, 78%, 95%)', gradient: 'linear-gradient(135deg, hsl(330, 81%, 60%) 0%, hsl(340, 85%, 50%) 100%)' },
  enterprise: { bg: 'hsl(215, 50%, 45%)', light: 'hsl(210, 40%, 96%)', gradient: 'linear-gradient(135deg, hsl(215, 50%, 45%) 0%, hsl(225, 45%, 55%) 100%)' },
};

const phaseColors = {
  P0: 'hsl(160, 84%, 39%)',
  P1: 'hsl(199, 89%, 48%)',
  P2: 'hsl(38, 92%, 50%)',
  P3: 'hsl(330, 81%, 60%)',
  P4: 'hsl(258, 90%, 66%)',
  P5: 'hsl(215, 16%, 47%)',
};

// Complete journey data with winding path visualization
const segmentJourneyData = {
  creator: {
    name: 'Creator',
    icon: '🎨',
    character: '🧑‍🎤',
    tagline: '"I just want to go viral, is that too much to ask?"',
    sceneDescription: 'Flying through a galaxy of content ideas, surfing on viral waves',
    vibe: 'Chaotic energy but make it aesthetic ✨',
    subscription: 'Starter ($9.99/mo)',
    marketInsight: '68% want mobile-first content creation',
    stages: [
      {
        id: 1,
        name: 'Inspiration',
        icon: '💡',
        scene: '🌟 Stargazing at trending content',
        description: 'Scroll TikTok for 3 hours, call it "research"',
        actions: ['Browse trends', 'Get inspired', 'Start dreaming'],
        emotion: 'Excitement',
        phase: 'P0',
        technical: 'Mind AI - Trend Analysis',
        crossFunction: 'Content Discovery',
      },
      {
        id: 2,
        name: 'Decide',
        icon: '🎯',
        scene: '🤔 Standing at the crossroads of ideas',
        description: 'What content? Reel? Short? Both?',
        actions: ['Pick format', 'Choose topic', 'Set goal'],
        emotion: 'Determination',
        phase: 'P0',
        technical: 'Template Selection',
        crossFunction: 'Format Decision',
      },
      {
        id: 3,
        name: 'Script',
        icon: '📝',
        scene: '✍️ Typing furiously on magic scroll',
        description: 'AI writes, I take credit. Fair deal!',
        actions: ['Generate script', 'Add hooks', 'Edit flow'],
        emotion: 'Creative',
        phase: 'P0',
        technical: 'Mind AI - Script Gen',
        crossFunction: 'AI Script + TTS',
      },
      {
        id: 4,
        name: 'Record',
        icon: '🎤',
        scene: '🎬 In the spotlight, camera rolling',
        description: 'Take 47... This is THE one! (narrator: it wasn\'t)',
        actions: ['Voice capture', 'Face record', 'Screen share'],
        emotion: 'Nervous excitement',
        phase: 'P0',
        technical: 'Vibe Studio - Recording',
        crossFunction: 'Multi-Input Capture',
      },
      {
        id: 5,
        name: 'Voice',
        icon: '🗣️',
        scene: '🎭 Choosing between 100 AI voices',
        description: 'Do I want to sound like a CEO or a bestie?',
        actions: ['Pick voice', 'Adjust tone', 'Preview audio'],
        emotion: 'Playful',
        phase: 'P1',
        technical: 'ElevenLabs TTS',
        crossFunction: 'Voice Synthesis',
      },
      {
        id: 6,
        name: 'Language',
        icon: '🌍',
        scene: '🗺️ World map lights up with reach',
        description: 'Hola! Bonjour! Namaste! Going global!',
        actions: ['Select languages', 'Auto-translate', 'Localize'],
        emotion: 'Ambitious',
        phase: 'P2',
        technical: 'Multi-Lang Engine',
        crossFunction: '12 Languages',
      },
      {
        id: 7,
        name: 'Generate',
        icon: '⚡',
        scene: '✨ Magic sparkles as AI works',
        description: 'AI does the heavy lifting while I snack',
        actions: ['Process video', 'Add effects', 'Sync audio'],
        emotion: 'Anticipation',
        phase: 'P1',
        technical: 'Remix Engine',
        crossFunction: 'AI Processing',
      },
      {
        id: 8,
        name: 'Edit',
        icon: '✂️',
        scene: '🎞️ Surgeon-level precision cutting',
        description: 'Chop, slice, trim. Make it TikTok length!',
        actions: ['Trim clips', 'Add transitions', 'Fine-tune'],
        emotion: 'Focus',
        phase: 'P1',
        technical: 'Arc Editor',
        crossFunction: 'Quick Clips',
      },
      {
        id: 9,
        name: 'Re-record',
        icon: '🔄',
        scene: '😅 Oops moment, back to mic',
        description: '"Let me try that one line again..."',
        actions: ['Punch-in audio', 'Replace section', 'Sync'],
        emotion: 'Perfectionist',
        phase: 'P2',
        technical: 'Voice Editor',
        crossFunction: 'AI Voice Edit',
      },
      {
        id: 10,
        name: 'Script Attach',
        icon: '📜',
        scene: '📎 Attaching the genius masterpiece',
        description: 'Captions on, accessibility up!',
        actions: ['Add captions', 'Sync timing', 'Style text'],
        emotion: 'Professional',
        phase: 'P2',
        technical: 'Smart Captions',
        crossFunction: 'Caption Gen',
      },
      {
        id: 11,
        name: 'Preview',
        icon: '👀',
        scene: '📱 Final check on all devices',
        description: 'Looks good on phone? Desktop? Fridge?',
        actions: ['Mobile preview', 'Desktop check', 'Share test'],
        emotion: 'Nervous',
        phase: 'P1',
        technical: 'Preview Engine',
        crossFunction: 'Multi-Device',
      },
      {
        id: 12,
        name: 'Publish',
        icon: '🚀',
        scene: '🎉 Rockets launching to all platforms',
        description: 'IG, YT, TikTok, FB - EVERYWHERE!',
        actions: ['📸 Instagram', '🎬 YouTube', '🎵 TikTok', '📘 Facebook'],
        emotion: 'HYPE',
        phase: 'P1',
        technical: 'Multi-Platform API',
        crossFunction: 'Social Publishing',
        isPublish: true,
      },
    ],
  },
  traveler: {
    name: 'Traveler',
    icon: '✈️',
    character: '🧳',
    tagline: '"Lost luggage? No problem. Lost footage? PANIC!"',
    sceneDescription: 'Soaring above exotic locations, capturing every moment',
    vibe: 'Wanderlust but make it content 🌴',
    subscription: 'Starter ($9.99/mo)',
    marketInsight: '54% need offline recording capability',
    stages: [
      {
        id: 1,
        name: 'Trip Inspiration',
        icon: '🌟',
        scene: '🗺️ Dreaming of destinations',
        description: 'Planning the ultimate content journey',
        actions: ['Research spots', 'Plan shots', 'Pack gear'],
        emotion: 'Wanderlust',
        phase: 'P0',
        technical: 'Destination Research',
        crossFunction: 'Content Planning',
      },
      {
        id: 2,
        name: 'Booking',
        icon: '✈️',
        scene: '🎫 Tickets booked, adventure awaits',
        description: 'Flights, hotels, and content schedule locked!',
        actions: ['Book travel', 'Schedule shoots', 'Prep gear'],
        emotion: 'Excitement',
        phase: 'P0',
        technical: 'Pre-Trip Planning',
        crossFunction: 'Trip Organization',
      },
      {
        id: 3,
        name: 'On Location',
        icon: '📍',
        scene: '🏝️ Arrived at paradise',
        description: 'The backdrop is perfect, let\'s roll!',
        actions: ['Scout location', 'Setup shots', 'Check light'],
        emotion: 'Awe',
        phase: 'P0',
        technical: 'Location Setup',
        crossFunction: 'Field Recording',
      },
      {
        id: 4,
        name: 'Record',
        icon: '📹',
        scene: '🌅 Capturing that perfect sunset (again)',
        description: 'Golden hour waits for no one!',
        actions: ['Record video', 'Capture audio', 'Take stills'],
        emotion: 'In the zone',
        phase: 'P0',
        technical: 'Vibe Studio Mobile',
        crossFunction: 'Quick Capture',
      },
      {
        id: 5,
        name: 'Voice Narration',
        icon: '🎙️',
        scene: '☁️ Narrating mid-flight',
        description: 'Adding voice-over from 30,000 feet!',
        actions: ['Record narration', 'Add atmosphere', 'Sync clips'],
        emotion: 'Storytelling',
        phase: 'P1',
        technical: 'Voice Recorder',
        crossFunction: 'Audio Capture',
      },
      {
        id: 6,
        name: 'Offline Mode',
        icon: '📴',
        scene: '🏔️ No WiFi? No problem!',
        description: 'Creating content in airplane mode',
        actions: ['Local storage', 'Offline edit', 'Queue sync'],
        emotion: 'Independent',
        phase: 'P2',
        technical: 'IndexedDB Storage',
        crossFunction: 'Offline Capability',
      },
      {
        id: 7,
        name: 'Language',
        icon: '🗣️',
        scene: '🌐 Hola! Bonjour! Ciao!',
        description: 'Reaching travelers worldwide',
        actions: ['Translate subs', 'Localize voice', 'Add flags'],
        emotion: 'Global',
        phase: 'P2',
        technical: 'Translation API',
        crossFunction: 'Multi-Language',
      },
      {
        id: 8,
        name: 'Auto-Edit Kit',
        icon: '🪄',
        scene: '✨ AI edits while you explore',
        description: 'Highlight reel ready when you return!',
        actions: ['AI highlights', 'Smart cuts', 'Auto music'],
        emotion: 'Magic',
        phase: 'P3',
        technical: 'AI Director',
        crossFunction: 'Smart Editing',
      },
      {
        id: 9,
        name: 'B-Roll Library',
        icon: '🎬',
        scene: '📚 Stock footage backup',
        description: 'Missed the shot? B-roll saves the day!',
        actions: ['Browse library', 'Match style', 'Insert clips'],
        emotion: 'Relief',
        phase: 'P5',
        technical: 'Asset Library',
        crossFunction: 'Stock Content',
      },
      {
        id: 10,
        name: 'Travel Diary',
        icon: '📜',
        scene: '📓 Story mode activated',
        description: 'Turning clips into epic travel story',
        actions: ['Add chapters', 'Write captions', 'Timeline'],
        emotion: 'Nostalgic',
        phase: 'P2',
        technical: 'Story Builder',
        crossFunction: 'Narrative Mode',
      },
      {
        id: 11,
        name: 'Preview',
        icon: '👀',
        scene: '📱 Final check from the beach',
        description: 'Looks good on hotel WiFi!',
        actions: ['Mobile check', 'Quality verify', 'Final tweak'],
        emotion: 'Satisfied',
        phase: 'P1',
        technical: 'Preview Engine',
        crossFunction: 'Quality Check',
      },
      {
        id: 12,
        name: 'Publish',
        icon: '🌐',
        scene: '🏖️ Sharing from paradise',
        description: 'Posted before reaching home!',
        actions: ['🎬 YouTube Vlogs', '📸 Instagram', '🐦 Twitter', '📍 TripAdvisor'],
        emotion: 'Achievement',
        phase: 'P1',
        technical: 'Social APIs',
        crossFunction: 'Travel Publishing',
        isPublish: true,
      },
    ],
  },
  smb: {
    name: 'SMB Owner',
    icon: '🏪',
    character: '👔',
    tagline: '"Synthesia costs WHAT?! $67/mo?!"',
    sceneDescription: 'Building an empire one video at a time',
    vibe: 'Hustle culture but affordable 💰',
    subscription: 'Business ($29.99/mo)',
    marketInsight: '71% want quick product demo templates',
    stages: [
      {
        id: 1,
        name: 'Business Need',
        icon: '💡',
        scene: '📊 Looking at declining engagement',
        description: 'Text posts aren\'t cutting it anymore',
        actions: ['Identify gap', 'Research video', 'Set budget'],
        emotion: 'Determined',
        phase: 'P0',
        technical: 'Business Analysis',
        crossFunction: 'Need Assessment',
      },
      {
        id: 2,
        name: 'Template Select',
        icon: '📋',
        scene: '🎨 One-click branding magic',
        description: 'Product demo template? Yes please!',
        actions: ['Browse templates', 'Pick style', 'Customize'],
        emotion: 'Efficient',
        phase: 'P1',
        technical: 'Template Engine',
        crossFunction: 'Quick Templates',
      },
      {
        id: 3,
        name: 'Script AI',
        icon: '📝',
        scene: '🤖 AI writes marketing copy',
        description: 'Product descriptions that actually sell',
        actions: ['Generate copy', 'Add CTA', 'Optimize'],
        emotion: 'Impressed',
        phase: 'P0',
        technical: 'Mind AI - Sales',
        crossFunction: 'AI Marketing',
      },
      {
        id: 4,
        name: 'Record Demo',
        icon: '🎥',
        scene: '📦 Product spotlight time!',
        description: 'Showing off features like a pro',
        actions: ['Demo product', 'Explain features', 'Show benefits'],
        emotion: 'Professional',
        phase: 'P0',
        technical: 'Vibe Studio',
        crossFunction: 'Product Demo',
      },
      {
        id: 5,
        name: 'Brand Voice',
        icon: '🗣️',
        scene: '🎭 Consistent brand narration',
        description: 'AI voice that matches our brand',
        actions: ['Select voice', 'Match tone', 'Review'],
        emotion: 'On-brand',
        phase: 'P1',
        technical: 'Brand Voice AI',
        crossFunction: 'Voice Branding',
      },
      {
        id: 6,
        name: 'Global Reach',
        icon: '🌎',
        scene: '🗺️ Reaching customers worldwide',
        description: 'Ads in 12 languages = 12x customers?',
        actions: ['Translate', 'Localize', 'Review regions'],
        emotion: 'Ambitious',
        phase: 'P2',
        technical: 'Translation API',
        crossFunction: 'Market Expansion',
      },
      {
        id: 7,
        name: 'Team Collab',
        icon: '👥',
        scene: '🤝 Team reviews together',
        description: '3 team members, one video, zero chaos',
        actions: ['Share draft', 'Get feedback', 'Iterate'],
        emotion: 'Collaborative',
        phase: 'P2',
        technical: 'Team Workspace',
        crossFunction: 'Collaboration',
      },
      {
        id: 8,
        name: 'Brand Kit',
        icon: '🏷️',
        scene: '🎨 Logo, colors, fonts applied',
        description: 'Consistent branding across all videos',
        actions: ['Add logo', 'Apply colors', 'Set fonts'],
        emotion: 'Polished',
        phase: 'P3',
        technical: 'Brand Manager',
        crossFunction: 'Brand Consistency',
      },
      {
        id: 9,
        name: 'Batch Process',
        icon: '⚡',
        scene: '🏭 100 videos, 1 hour',
        description: 'Mass production mode activated!',
        actions: ['Queue videos', 'Process batch', 'Export all'],
        emotion: 'Productive',
        phase: 'P5',
        technical: 'Batch Engine',
        crossFunction: 'Scale Processing',
      },
      {
        id: 10,
        name: 'Review',
        icon: '✅',
        scene: '👔 Final business approval',
        description: 'Boss says it\'s perfect!',
        actions: ['Final check', 'Get approval', 'Lock it'],
        emotion: 'Proud',
        phase: 'P2',
        technical: 'Approval Flow',
        crossFunction: 'Business Review',
      },
      {
        id: 11,
        name: 'Analytics',
        icon: '📊',
        scene: '📈 Tracking performance',
        description: 'Views up, sales up, boss happy!',
        actions: ['Track views', 'Measure ROI', 'Optimize'],
        emotion: 'Data-driven',
        phase: 'P4',
        technical: 'Analytics Pro',
        crossFunction: 'Performance',
      },
      {
        id: 12,
        name: 'Publish',
        icon: '📣',
        scene: '🚀 Launch to the world!',
        description: 'Ads running, leads flowing!',
        actions: ['📘 Facebook Ads', '📸 Instagram', '🛒 Shopify', '📧 Email'],
        emotion: 'Success',
        phase: 'P1',
        technical: 'Marketing APIs',
        crossFunction: 'Business Publishing',
        isPublish: true,
      },
    ],
  },
  education: {
    name: 'Educator',
    icon: '📚',
    character: '👩‍🏫',
    tagline: '"If I say pop quiz one more time..."',
    sceneDescription: 'Flying on a book through knowledge clouds',
    vibe: 'Edutainment supreme 🎓',
    subscription: 'Pro ($79.99/mo)',
    marketInsight: '69% want AI-generated lesson scripts',
    stages: [
      {
        id: 1,
        name: 'Lesson Plan',
        icon: '📋',
        scene: '📚 Curriculum review time',
        description: 'What do students need to learn?',
        actions: ['Review curriculum', 'Set objectives', 'Plan flow'],
        emotion: 'Focused',
        phase: 'P0',
        technical: 'Lesson Planning',
        crossFunction: 'Curriculum Alignment',
      },
      {
        id: 2,
        name: 'AI Script',
        icon: '📝',
        scene: '🤖 AI writes the lecture',
        description: 'Finally, no more typing at 2 AM!',
        actions: ['Generate script', 'Add examples', 'Review'],
        emotion: 'Relieved',
        phase: 'P0',
        technical: 'Mind AI - Education',
        crossFunction: 'AI Lesson Scripts',
      },
      {
        id: 3,
        name: 'Record Lecture',
        icon: '🎬',
        scene: '🎥 Picture-in-Picture mode',
        description: 'Face + slides = maximum engagement',
        actions: ['Record face', 'Share slides', 'Explain concepts'],
        emotion: 'Teaching',
        phase: 'P1',
        technical: 'PiP Recording',
        crossFunction: 'Multi-Source',
      },
      {
        id: 4,
        name: 'Voice Clarity',
        icon: '🎤',
        scene: '🔊 Crystal clear explanations',
        description: 'Every word matters for learning',
        actions: ['Record audio', 'Enhance clarity', 'Reduce noise'],
        emotion: 'Clear',
        phase: 'P1',
        technical: 'Audio Mixer',
        crossFunction: 'Audio Quality',
      },
      {
        id: 5,
        name: 'Language',
        icon: '🌐',
        scene: '🗺️ Multi-lingual lessons',
        description: 'Teaching the world, literally!',
        actions: ['Translate content', 'Localize examples', 'Regional voice'],
        emotion: 'Inclusive',
        phase: 'P2',
        technical: 'Translation Engine',
        crossFunction: 'Global Education',
      },
      {
        id: 6,
        name: 'AI Arrange',
        icon: '🎯',
        scene: '✨ Smart lesson flow',
        description: 'AI structures for optimal learning',
        actions: ['Auto-arrange', 'Add transitions', 'Flow check'],
        emotion: 'Organized',
        phase: 'P2',
        technical: 'AI Arrange',
        crossFunction: 'Smart Structure',
      },
      {
        id: 7,
        name: 'Quiz Integration',
        icon: '❓',
        scene: '📝 Interactive quizzes',
        description: 'Did they actually watch it?',
        actions: ['Add quiz', 'Set checkpoints', 'Track progress'],
        emotion: 'Engaging',
        phase: 'P3',
        technical: 'Quiz Builder',
        crossFunction: 'Assessment',
      },
      {
        id: 8,
        name: 'Captions',
        icon: '💬',
        scene: '📺 Accessibility first',
        description: 'Everyone can learn, everyone can read',
        actions: ['Auto-caption', 'Review accuracy', 'Style text'],
        emotion: 'Inclusive',
        phase: 'P2',
        technical: 'Smart Captions',
        crossFunction: 'Accessibility',
      },
      {
        id: 9,
        name: 'Team Review',
        icon: '👥',
        scene: '🎓 Peer approval queue',
        description: 'Fellow educators give feedback',
        actions: ['Share draft', 'Collect feedback', 'Iterate'],
        emotion: 'Collaborative',
        phase: 'P4',
        technical: 'Review Workflow',
        crossFunction: 'Peer Review',
      },
      {
        id: 10,
        name: 'LMS Export',
        icon: '📚',
        scene: '🏫 Direct to Moodle/Canvas',
        description: 'One-click LMS integration',
        actions: ['Select LMS', 'Configure', 'Export'],
        emotion: 'Seamless',
        phase: 'P3',
        technical: 'LMS Integration',
        crossFunction: 'Platform Connect',
      },
      {
        id: 11,
        name: 'Analytics',
        icon: '📊',
        scene: '📈 Did they watch it?',
        description: 'Completion rates, quiz scores, engagement',
        actions: ['Track views', 'Measure learning', 'Identify gaps'],
        emotion: 'Insightful',
        phase: 'P5',
        technical: 'Learning Analytics',
        crossFunction: 'Performance',
      },
      {
        id: 12,
        name: 'Publish',
        icon: '🎯',
        scene: '📤 Assign to students',
        description: 'Learning starts now!',
        actions: ['📚 LMS (Moodle)', '🎬 YouTube Edu', '📱 App', '🌐 Portal'],
        emotion: 'Accomplished',
        phase: 'P1',
        technical: 'Distribution',
        crossFunction: 'Education Publishing',
        isPublish: true,
      },
    ],
  },
  healthcare: {
    name: 'Healthcare',
    icon: '🏥',
    character: '👨‍⚕️',
    tagline: '"$1000/mo for HIPAA? My budget just flatlined!"',
    sceneDescription: 'On a healing cloud of care, delivering health education',
    vibe: 'Professional but compassionate ❤️',
    subscription: 'Enterprise (Custom)',
    marketInsight: '94% want HIPAA compliance under $100/mo',
    stages: [
      {
        id: 1,
        name: 'Patient Need',
        icon: '💊',
        scene: '🏥 Identifying education gaps',
        description: 'Patients need to understand their care',
        actions: ['Assess needs', 'Plan content', 'Review compliance'],
        emotion: 'Caring',
        phase: 'P0',
        technical: 'Need Analysis',
        crossFunction: 'Patient Education',
      },
      {
        id: 2,
        name: 'Consent',
        icon: '✅',
        scene: '📋 Proper permissions first',
        description: 'Patient consent is non-negotiable',
        actions: ['Get consent', 'Document', 'Verify'],
        emotion: 'Ethical',
        phase: 'P0',
        technical: 'Consent Management',
        crossFunction: 'Compliance',
      },
      {
        id: 3,
        name: 'Secure Record',
        icon: '📹',
        scene: '🔒 Recording in HIPAA mode',
        description: 'Every frame is encrypted and secure',
        actions: ['Enable HIPAA', 'Record content', 'Encrypt'],
        emotion: 'Protected',
        phase: 'P0',
        technical: 'Secure Recording',
        crossFunction: 'HIPAA Recording',
      },
      {
        id: 4,
        name: 'Clear Voice',
        icon: '🗣️',
        scene: '💬 Calm, clear explanations',
        description: 'Medical info needs to be understood',
        actions: ['Record narration', 'Simplify terms', 'Clear audio'],
        emotion: 'Reassuring',
        phase: 'P1',
        technical: 'Audio Mixer',
        crossFunction: 'Health Literacy',
      },
      {
        id: 5,
        name: 'Language',
        icon: '🌍',
        scene: '🗺️ Multi-language patient care',
        description: 'Healthcare in every language',
        actions: ['Translate', 'Medical accuracy', 'Cultural adapt'],
        emotion: 'Inclusive',
        phase: 'P3',
        technical: 'Medical Translation',
        crossFunction: 'Multilingual Care',
      },
      {
        id: 6,
        name: 'PHI Redaction',
        icon: '🔐',
        scene: '🛡️ Auto-blur sensitive info',
        description: 'AI spots and redacts PHI automatically',
        actions: ['Scan for PHI', 'Auto-blur', 'Verify redaction'],
        emotion: 'Secure',
        phase: 'P4',
        technical: 'PHI Detection AI',
        crossFunction: 'Data Protection',
      },
      {
        id: 7,
        name: 'Accessibility',
        icon: '💬',
        scene: '♿ Everyone can understand',
        description: 'Captions, audio descriptions, all formats',
        actions: ['Add captions', 'Alt text', 'ASL option'],
        emotion: 'Universal',
        phase: 'P2',
        technical: 'Accessibility Kit',
        crossFunction: 'ADA Compliance',
      },
      {
        id: 8,
        name: 'Medical Review',
        icon: '👨‍⚕️',
        scene: '⚕️ Clinical accuracy check',
        description: 'Medical team verifies content',
        actions: ['Clinical review', 'Fact check', 'Approve'],
        emotion: 'Accurate',
        phase: 'P3',
        technical: 'Review Workflow',
        crossFunction: 'Medical Accuracy',
      },
      {
        id: 9,
        name: 'Compliance',
        icon: '📋',
        scene: '✅ All regulations checked',
        description: 'HIPAA, SOC2, all boxes checked',
        actions: ['Compliance scan', 'Document', 'Certify'],
        emotion: 'Compliant',
        phase: 'P4',
        technical: 'Compliance Engine',
        crossFunction: 'Regulatory',
      },
      {
        id: 10,
        name: 'Audit Trail',
        icon: '📜',
        scene: '📊 Every action logged',
        description: 'Full audit trail for regulators',
        actions: ['Log actions', 'Track access', 'Generate reports'],
        emotion: 'Accountable',
        phase: 'P5',
        technical: 'Audit System',
        crossFunction: 'Traceability',
      },
      {
        id: 11,
        name: 'Secure Delivery',
        icon: '🔒',
        scene: '📤 Encrypted distribution',
        description: 'Secure patient portal delivery',
        actions: ['Encrypt link', 'Set expiry', 'Track access'],
        emotion: 'Protected',
        phase: 'P4',
        technical: 'Secure Delivery',
        crossFunction: 'Safe Distribution',
      },
      {
        id: 12,
        name: 'Publish',
        icon: '🏥',
        scene: '📱 Patient portal ready',
        description: 'Secure, compliant, helpful content live!',
        actions: ['🏥 Patient Portal', '📧 Secure Email', '📱 MyChart', '🌐 Internal'],
        emotion: 'Caring',
        phase: 'P3',
        technical: 'Healthcare APIs',
        crossFunction: 'Healthcare Publishing',
        isPublish: true,
      },
    ],
  },
  enterprise: {
    name: 'Enterprise',
    icon: '🏢',
    character: '👔',
    tagline: '"Legal wants to review? That\'s 3 weeks..."',
    sceneDescription: 'Commanding a fleet of content ships across the corporate sea',
    vibe: 'Corporate but efficient ⏱️',
    subscription: 'Enterprise (Custom)',
    marketInsight: 'White-label demand high - $10K+ deals',
    stages: [
      {
        id: 1,
        name: 'Strategy',
        icon: '📊',
        scene: '🏛️ Executive communication planning',
        description: 'Aligning video with business goals',
        actions: ['Define goals', 'Assign owners', 'Set KPIs'],
        emotion: 'Strategic',
        phase: 'P0',
        technical: 'Strategy Planning',
        crossFunction: 'Business Alignment',
      },
      {
        id: 2,
        name: 'Project Setup',
        icon: '📁',
        scene: '🗂️ Version control activated',
        description: 'Proper project management from day 1',
        actions: ['Create project', 'Assign team', 'Set timeline'],
        emotion: 'Organized',
        phase: 'P0',
        technical: 'Project Manager',
        crossFunction: 'Version Control',
      },
      {
        id: 3,
        name: 'Record',
        icon: '🎥',
        scene: '🏢 Executive message time',
        description: 'CEO has 5 minutes, make it count!',
        actions: ['Schedule exec', 'Record message', 'Backup'],
        emotion: 'Precise',
        phase: 'P0',
        technical: 'Vibe Studio Pro',
        crossFunction: 'Executive Recording',
      },
      {
        id: 4,
        name: 'Brand Voice',
        icon: '🗣️',
        scene: '🎭 Consistent corporate voice',
        description: 'Every video sounds like us',
        actions: ['Brand voice AI', 'Tone check', 'Consistency'],
        emotion: 'On-brand',
        phase: 'P1',
        technical: 'Brand Voice AI',
        crossFunction: 'Voice Identity',
      },
      {
        id: 5,
        name: 'Global Offices',
        icon: '🌐',
        scene: '🗺️ 50 offices, one message',
        description: 'Localized for every region',
        actions: ['Translate all', 'Regional adapt', 'Verify'],
        emotion: 'Global',
        phase: 'P2',
        technical: 'Enterprise Translation',
        crossFunction: 'Global Comms',
      },
      {
        id: 6,
        name: 'Collab Edit',
        icon: '👥',
        scene: '🤝 Real-time team editing',
        description: 'Marketing, Legal, Comms - all together',
        actions: ['Invite team', 'Track changes', 'Merge edits'],
        emotion: 'Collaborative',
        phase: 'P2',
        technical: 'Real-time Collab',
        crossFunction: 'Team Editing',
      },
      {
        id: 7,
        name: 'Legal Review',
        icon: '⚖️',
        scene: '📋 Legal approval gate',
        description: 'No more "Legal will get back to you"',
        actions: ['Submit to legal', 'Track status', 'Get approval'],
        emotion: 'Compliant',
        phase: 'P3',
        technical: 'Approval Workflows',
        crossFunction: 'Legal Gate',
      },
      {
        id: 8,
        name: 'Brand Check',
        icon: '🏷️',
        scene: '🎨 Brand compliance verified',
        description: 'Logo, colors, fonts - all correct',
        actions: ['Brand scan', 'Fix issues', 'Certify'],
        emotion: 'Polished',
        phase: 'P3',
        technical: 'Brand Compliance',
        crossFunction: 'Brand Standards',
      },
      {
        id: 9,
        name: 'SSO Access',
        icon: '🔐',
        scene: '🔑 IT-approved secure access',
        description: 'SAML, SSO, all the security acronyms',
        actions: ['Configure SSO', 'Set roles', 'Audit access'],
        emotion: 'Secure',
        phase: 'P5',
        technical: 'SSO/SAML',
        crossFunction: 'Identity Management',
      },
      {
        id: 10,
        name: 'Multi-Tenant',
        icon: '🏛️',
        scene: '🏢 Department isolation',
        description: 'Each BU has their own space',
        actions: ['Create tenants', 'Set permissions', 'Isolate data'],
        emotion: 'Segmented',
        phase: 'P4',
        technical: 'Multi-Tenant',
        crossFunction: 'Department Isolation',
      },
      {
        id: 11,
        name: 'White-Label',
        icon: '🏷️',
        scene: '🎨 Your brand, everywhere',
        description: 'Completely branded experience',
        actions: ['Remove Genie brand', 'Add yours', 'Deploy'],
        emotion: 'Owned',
        phase: 'P4',
        technical: 'White-Label Engine',
        crossFunction: 'Custom Branding',
      },
      {
        id: 12,
        name: 'Publish',
        icon: '📡',
        scene: '🌐 Multi-channel deployment',
        description: 'Internal comms everywhere at once!',
        actions: ['📧 Internal Comms', '🌐 Intranet', '📺 Signage', '📱 Teams/Slack'],
        emotion: 'Deployed',
        phase: 'P2',
        technical: 'Enterprise APIs',
        crossFunction: 'Enterprise Publishing',
        isPublish: true,
      },
    ],
  },
};

interface SegmentJourneyInfographicProps {
  selectedSegment: string | null;
  onSelectSegment: (segment: string) => void;
}

export const SegmentJourneyInfographic: React.FC<SegmentJourneyInfographicProps> = ({
  selectedSegment,
  onSelectSegment,
}) => {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  if (!selectedSegment) {
    return (
      <div className="text-center p-8 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20">
        <p className="text-xl mb-2 text-foreground">👆 Select a segment above to explore their journey!</p>
        <p className="text-sm text-muted-foreground">Each segment has a unique 12-stage visual workflow</p>
      </div>
    );
  }

  const segment = segmentJourneyData[selectedSegment as keyof typeof segmentJourneyData];
  if (!segment) return null;

  const colorScheme = segmentColors[selectedSegment as keyof typeof segmentColors];

  return (
    <div className="space-y-6">
      {/* Hero Header with Character Scene */}
      <Card 
        className="overflow-hidden border-2"
        style={{ borderColor: colorScheme.bg }}
      >
        <div 
          className="p-6 relative"
          style={{ background: colorScheme.gradient }}
        >
          {/* Floating decorative elements */}
          <div className="absolute top-4 right-4 text-6xl opacity-20 animate-pulse">
            {segment.character}
          </div>
          <div className="absolute bottom-4 left-4 text-4xl opacity-20 animate-bounce">
            ✨
          </div>
          
          <div className="flex items-start justify-between flex-wrap gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-xl bg-white/90 animate-pulse"
              >
                {segment.icon}
              </div>
              <div className="text-white">
                <h2 className="text-2xl md:text-3xl font-bold drop-shadow-lg">
                  {segment.name} Journey
                </h2>
                <p className="text-sm md:text-base italic opacity-90">
                  {segment.tagline}
                </p>
                <p className="text-xs md:text-sm mt-2 opacity-80">
                  {segment.sceneDescription}
                </p>
              </div>
            </div>
            <div className="text-right text-white">
              <div className="text-4xl mb-2">{segment.character}</div>
              <Badge className="bg-white/20 text-white border-white/40">
                {segment.subscription}
              </Badge>
              <p className="text-xs mt-2 opacity-80">{segment.marketInsight}</p>
            </div>
          </div>
          
          {/* Vibe Quote */}
          <div className="mt-4 p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
            <p className="text-center text-sm text-white font-medium">
              ✨ Vibe: {segment.vibe}
            </p>
          </div>
        </div>
      </Card>

      {/* Winding Journey Path - Infographic Style */}
      <Card className="border-2 overflow-hidden" style={{ borderColor: colorScheme.bg }}>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            🗺️ Visual Journey Map
            <Badge variant="outline" className="text-xs">12 Stages</Badge>
          </h3>
          
          {/* Journey Path - Winding Road Style */}
          <div className="relative">
            {/* Background scenery gradient */}
            <div 
              className="absolute inset-0 rounded-xl opacity-10"
              style={{ background: colorScheme.gradient }}
            />
            
            {/* Winding path container */}
            <div className="relative py-4">
              {segment.stages.map((stage, index) => {
                const isLeft = index % 2 === 0;
                const phaseColor = phaseColors[stage.phase as keyof typeof phaseColors];
                
                return (
                  <div 
                    key={stage.id}
                    className={`relative flex items-center gap-4 mb-6 ${isLeft ? '' : 'flex-row-reverse'}`}
                    onMouseEnter={() => setHoveredStage(stage.id)}
                    onMouseLeave={() => setHoveredStage(null)}
                  >
                    {/* Connecting path line */}
                    {index < segment.stages.length - 1 && (
                      <div 
                        className={`absolute h-16 w-1 ${isLeft ? 'left-[39px]' : 'right-[39px]'} top-full`}
                        style={{ 
                          background: `linear-gradient(to bottom, ${phaseColor}, ${
                            phaseColors[segment.stages[index + 1].phase as keyof typeof phaseColors]
                          })`,
                          opacity: 0.4,
                        }}
                      />
                    )}
                    
                    {/* Stage Node - Large Icon */}
                    <div 
                      className={`
                        relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-3xl
                        shadow-lg transition-all duration-300 cursor-pointer flex-shrink-0
                        ${hoveredStage === stage.id ? 'scale-110 shadow-xl' : ''}
                        ${stage.isPublish ? 'animate-pulse' : ''}
                      `}
                      style={{ 
                        background: stage.isPublish 
                          ? `linear-gradient(135deg, ${colorScheme.bg}, gold)` 
                          : colorScheme.light,
                        border: `3px solid ${phaseColor}`,
                      }}
                    >
                      {stage.icon}
                      {/* Phase indicator */}
                      <div 
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white shadow"
                        style={{ backgroundColor: phaseColor }}
                      >
                        {stage.phase.replace('P', '')}
                      </div>
                    </div>
                    
                    {/* Stage Details Card */}
                    <div 
                      className={`
                        flex-1 p-4 rounded-xl border-2 transition-all duration-300
                        ${hoveredStage === stage.id ? 'shadow-lg scale-[1.02]' : 'shadow-sm'}
                        ${isLeft ? '' : 'text-right'}
                      `}
                      style={{ 
                        backgroundColor: hoveredStage === stage.id ? colorScheme.light : 'hsl(var(--card))',
                        borderColor: hoveredStage === stage.id ? colorScheme.bg : 'hsl(var(--border))',
                      }}
                    >
                      {/* Stage header */}
                      <div className={`flex items-center gap-2 mb-2 ${isLeft ? '' : 'flex-row-reverse'}`}>
                        <span className="font-bold text-foreground">{stage.name}</span>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ borderColor: phaseColor, color: phaseColor }}
                        >
                          {stage.phase}
                        </Badge>
                        <span className="text-xs text-muted-foreground">| {stage.emotion}</span>
                      </div>
                      
                      {/* Scene description */}
                      <p className="text-sm text-muted-foreground mb-2 italic">{stage.scene}</p>
                      
                      {/* Humor/Description */}
                      <p className="text-sm text-foreground mb-3">💬 "{stage.description}"</p>
                      
                      {/* Actions */}
                      <div className={`flex flex-wrap gap-1 mb-2 ${isLeft ? '' : 'justify-end'}`}>
                        {stage.actions.map((action, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className="text-xs"
                            style={{ 
                              backgroundColor: stage.isPublish ? colorScheme.light : undefined,
                              borderColor: stage.isPublish ? colorScheme.bg : undefined,
                            }}
                          >
                            {action}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Technical & Cross-Function footer */}
                      <div className={`flex flex-wrap gap-2 text-xs mt-2 pt-2 border-t border-border/50 ${isLeft ? '' : 'justify-end'}`}>
                        <span className="text-muted-foreground">
                          ⚙️ {stage.technical}
                        </span>
                        <span className="text-muted-foreground">
                          🔗 {stage.crossFunction}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Summary Bar */}
      <Card className="border" style={{ borderColor: colorScheme.bg }}>
        <CardContent className="p-4">
          <h4 className="text-sm font-bold text-foreground mb-3">📊 Phase Distribution</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(phaseColors).map(([phase, color]) => {
              const count = segment.stages.filter(s => s.phase === phase).length;
              if (count === 0) return null;
              return (
                <Badge 
                  key={phase}
                  className="text-xs text-white"
                  style={{ backgroundColor: color }}
                >
                  {phase}: {count} stages
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SegmentJourneyInfographic;
