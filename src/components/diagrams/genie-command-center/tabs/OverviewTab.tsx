/**
 * Overview Tab - Problem Statement & User Journey
 * Restructured with journey-step-centric layout and scrolling VoC
 */

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, AlertTriangle, DollarSign, 
  TrendingUp, Zap, Target,
  ArrowRight, CheckCircle2, XCircle,
  Sparkles, Users, Layers, MessageSquareQuote,
  Video, FileText, Mic, Globe, BarChart3,
  Download, Maximize2, X, ChevronLeft, ChevronRight,
  Code, Wrench, Calculator, GraduationCap, Heart, Lightbulb
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

// Enhanced Journey Steps with detailed metrics
const journeySteps = [
  {
    step: 1,
    title: 'Ideation & Scripting',
    icon: FileText,
    before: { 
      time: '2-4 hours', 
      timePercent: 18,
      cost: '$45-90',
      tools: 'ChatGPT + Google Docs + Research', 
      pain: 'Context switching, version chaos',
      output: '1 script draft'
    },
    after: { 
      time: '15-30 min', 
      tools: 'Genie Mind', 
      wow: 'AI writes, refines, and organizes in one place',
      output: '3-5 script variants'
    },
    criticalPain: true,
    timeWasted: '85%',
    segmentPains: {
      'Content Creators': { pain: 'Writer block with no AI assistance', severity: 75 },
      'Corporate L&D': { pain: 'Compliance language requirements', severity: 82 },
      'Marketing Teams': { pain: 'Brand voice consistency', severity: 79 },
      'Healthcare': { pain: 'Medical accuracy verification', severity: 95 },
      'Educators': { pain: 'Curriculum alignment', severity: 68 },
      'Knowledge Sharers': { pain: 'Don\'t know how to structure ideas', severity: 88 },
    },
    vocQuotes: [
      { quote: "I sit staring at a blank doc for hours. By the time I start writing, my creative energy is gone.", author: "Marcus L.", role: "YouTuber, 180K subs" },
      { quote: "Every script needs legal review. That alone takes 2 weeks.", author: "Sarah M.", role: "L&D Manager, Bank" },
      { quote: "I know my craft inside out but putting it into words for video? Impossible.", author: "Tony R.", role: "Auto Mechanic, 20 yrs exp" },
    ],
    influencerVoices: [
      { name: 'James R.', platform: 'YouTube', handle: '@TechReviewPro', quote: "Research alone takes 3 hours. Then organizing it into a script is another 2. For 8 videos a month, that's 40 hours just on ideation." },
      { name: 'Zoe K.', platform: 'TikTok', handle: '@ZoeDances', quote: "I have to come up with fresh ideas daily. The pressure is insane. I'd kill for an AI that knows my style." },
    ],
  },
  {
    step: 2,
    title: 'Voice & Audio',
    icon: Mic,
    before: { 
      time: '1-3 hours', 
      timePercent: 12,
      cost: '$25-75',
      tools: 'ElevenLabs + Audacity + Multiple logins', 
      pain: 'Manual export/import cycles',
      output: '1 audio file'
    },
    after: { 
      time: '5 min', 
      tools: 'Genie Vibe', 
      wow: '11 TTS providers, auto-sync with script',
      output: 'Multi-language audio'
    },
    criticalPain: false,
    timeWasted: '92%',
    segmentPains: {
      'Content Creators': { pain: 'Voice fatigue on long recordings', severity: 62 },
      'Corporate L&D': { pain: 'Multi-language requirements', severity: 78 },
      'Marketing Teams': { pain: 'Consistent brand voice across regions', severity: 71 },
      'Healthcare': { pain: 'Medical pronunciation accuracy', severity: 89 },
      'Educators': { pain: 'Accent clarity for diverse students', severity: 65 },
      'Knowledge Sharers': { pain: 'Shy about their voice/accent', severity: 94 },
    },
    vocQuotes: [
      { quote: "I hate my voice on recordings. I've rerecorded the same intro 50 times.", author: "Priya S.", role: "Accountant wanting to teach" },
      { quote: "My accent makes people dismiss my expertise. AI voice would be a game changer.", author: "Wei L.", role: "Software Engineer, 15 yrs" },
      { quote: "We need 12 language versions. Each one costs $500 in voice talent.", author: "Jennifer L.", role: "Global Marketing Lead" },
    ],
    influencerVoices: [
      { name: 'Maria G.', platform: 'YouTube', handle: '@BakingMagic', quote: "Voice-over for 12 videos a month destroys my throat. I've had to take breaks for vocal rest." },
      { name: 'Derek W.', platform: 'TikTok', handle: '@ComedyKingDerek', quote: "Different character voices are exhausting. An AI that could clone my style would save hours." },
    ],
  },
  {
    step: 3,
    title: 'Recording & Production',
    icon: Video,
    before: { 
      time: '3-6 hours', 
      timePercent: 28,
      cost: '$75-150',
      tools: 'Loom + OBS + Teleprompter app + Camera', 
      pain: 'Setup time, re-takes, lighting issues',
      output: '1 raw video'
    },
    after: { 
      time: '20 min', 
      tools: 'Genie Arc', 
      wow: 'Smart teleprompter, AI-powered scene cuts',
      output: 'Polished recording'
    },
    criticalPain: true,
    timeWasted: '89%',
    segmentPains: {
      'Content Creators': { pain: 'Endless retakes for perfection', severity: 81 },
      'Corporate L&D': { pain: 'SME availability constraints', severity: 76 },
      'Marketing Teams': { pain: 'Location and set requirements', severity: 68 },
      'Healthcare': { pain: 'Patient privacy in recordings', severity: 92 },
      'Educators': { pain: 'Tech setup complexity', severity: 73 },
      'Knowledge Sharers': { pain: 'Camera anxiety, fear of judgment', severity: 96 },
    },
    vocQuotes: [
      { quote: "I did 47 takes for a 10-minute tutorial. My perfectionism is killing me.", author: "David H.", role: "Professor, CompSci" },
      { quote: "I know more than most YouTubers in my field, but I freeze on camera.", author: "Rachel K.", role: "Financial Analyst, CFA" },
      { quote: "Setting up lights, camera, audio takes 2 hours. By then, I've lost motivation.", author: "Mike T.", role: "Electrician, 25 yrs exp" },
    ],
    influencerVoices: [
      { name: 'Alex T.', platform: 'Instagram', handle: '@AlexFitness', quote: "Gym recordings need perfect lighting and no background noise. I've scrapped hours of footage." },
      { name: 'Robert M.', platform: 'Facebook', handle: 'DIY Home Repairs', quote: "Try filming while your hands are covered in grease. The technical side is a nightmare." },
    ],
  },
  {
    step: 4,
    title: 'Editing & Assembly',
    icon: Layers,
    before: { 
      time: '4-10 hours', 
      timePercent: 35,
      cost: '$100-250',
      tools: 'Premiere + After Effects + Canva', 
      pain: 'Steep learning curve, render times',
      output: '1 edited video'
    },
    after: { 
      time: '30 min', 
      tools: 'Genie Spark', 
      wow: 'AI edits, auto-captions, one-click polish',
      output: 'Platform-ready video'
    },
    criticalPain: true,
    timeWasted: '92%',
    segmentPains: {
      'Content Creators': { pain: 'Hours lost to timeline tweaking', severity: 88 },
      'Corporate L&D': { pain: 'Revision cycles with stakeholders', severity: 84 },
      'Marketing Teams': { pain: 'Multi-format export hell', severity: 91 },
      'Healthcare': { pain: 'Annotation accuracy for medical content', severity: 87 },
      'Educators': { pain: 'Accessibility requirements (captions, etc.)', severity: 72 },
      'Knowledge Sharers': { pain: 'No video editing skills at all', severity: 98 },
    },
    vocQuotes: [
      { quote: "I'm a world-class mechanic, not a video editor. Learning Premiere would take months.", author: "Carlos M.", role: "Master Mechanic, ASE certified" },
      { quote: "Client wants one word changed. That's 4 hours of re-rendering and re-uploading.", author: "Marcus T.", role: "Creative Director, Agency" },
      { quote: "I teach Excel to 10,000 students but can't figure out video editing software.", author: "Susan P.", role: "Accountant, Excel trainer" },
    ],
    influencerVoices: [
      { name: 'Priya S.', platform: 'Instagram', handle: '@PriyaFashionista', quote: "Same video, 4 different aspect ratios. I'm essentially making it 4 times. It's exhausting." },
      { name: 'Linda C.', platform: 'Facebook', handle: 'Cooking with Linda', quote: "I spend more time on captions and text overlays than on actual cooking." },
    ],
  },
  {
    step: 5,
    title: 'Distribution & Publishing',
    icon: Globe,
    before: { 
      time: '1-2 hours', 
      timePercent: 7,
      cost: '$25-50',
      tools: 'Hootsuite + YouTube Studio + Manual uploads', 
      pain: 'Format conversion nightmare',
      output: '1-2 platforms'
    },
    after: { 
      time: '2 min', 
      tools: 'Genie Suite', 
      wow: 'One-click multi-platform publish',
      output: '6+ platforms'
    },
    criticalPain: false,
    timeWasted: '96%',
    segmentPains: {
      'Content Creators': { pain: 'Algorithm-specific optimization', severity: 74 },
      'Corporate L&D': { pain: 'LMS integration complexity', severity: 79 },
      'Marketing Teams': { pain: 'Cross-platform scheduling', severity: 77 },
      'Healthcare': { pain: 'Compliance verification before publish', severity: 93 },
      'Educators': { pain: 'Student access management', severity: 66 },
      'Knowledge Sharers': { pain: 'Don\'t know where to publish or how', severity: 91 },
    },
    vocQuotes: [
      { quote: "I made amazing content but it got 12 views. I don't understand the algorithm.", author: "Tom H.", role: "Developer, JS expert" },
      { quote: "Upload to YouTube, then TikTok, then Instagram, then LinkedIn... each with different specs.", author: "Amy W.", role: "Marketing Coordinator" },
      { quote: "I just want my knowledge out there. The tech stuff stops me.", author: "George P.", role: "Retired Teacher, 40 yrs exp" },
    ],
    influencerVoices: [
      { name: 'Derek W.', platform: 'TikTok', handle: '@ComedyKingDerek', quote: "I hired a VA just to handle uploads and scheduling. That's $1,500/month just for publishing." },
      { name: 'James R.', platform: 'YouTube', handle: '@TechReviewPro', quote: "Shorts, Reels, TikToks all want different hooks. Same video, 3 different intros." },
    ],
  },
];

// Knowledge Sharers Segment - The Ignored Experts
const knowledgeSharers = [
  {
    type: 'Developers',
    icon: Code,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    avgExperience: '8-15 years',
    potentialReach: '10M+ learners',
    blockers: ['Camera anxiety', 'Imposter syndrome', 'No editing skills', 'Time constraints'],
    frustration: 85,
    profiles: [
      { name: 'Wei L.', exp: '15 yrs', specialty: 'System Architecture', quote: "I've built systems handling millions of users. But explaining it on camera? I freeze. My accent makes me self-conscious." },
      { name: 'Tom H.', exp: '12 yrs', specialty: 'JavaScript/React', quote: "Stack Overflow karma doesn't translate to video presence. I've tried twice and deleted everything." },
      { name: 'Aisha K.', exp: '8 yrs', specialty: 'Machine Learning', quote: "The ML content on YouTube is either too basic or wrong. I could teach it right, but video production is its own skill I don't have." },
    ],
    marketOpportunity: '$2.4B in developer education market',
  },
  {
    type: 'Skilled Tradespeople',
    icon: Wrench,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
    avgExperience: '15-30 years',
    potentialReach: '50M+ DIYers',
    blockers: ['Dirty hands on camera', 'Tech illiteracy', 'Time constraints', 'Location challenges'],
    frustration: 92,
    profiles: [
      { name: 'Carlos M.', exp: '28 yrs', specialty: 'Auto Mechanics', quote: "I can rebuild any engine blindfolded. But filming it? My hands are covered in grease, I don't know camera angles, and editing is impossible." },
      { name: 'Mike T.', exp: '25 yrs', specialty: 'Electrician', quote: "Safety videos on YouTube are dangerous. I see wrong advice getting millions of views. I could save lives with proper content but don't know how." },
      { name: 'Robert J.', exp: '32 yrs', specialty: 'Plumbing', quote: "Younger plumbers learn from bad TikToks. I have 32 years of knowledge but zero tech skills to share it." },
    ],
    marketOpportunity: '$8.5B in DIY/Home improvement content',
  },
  {
    type: 'Finance Professionals',
    icon: Calculator,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
    avgExperience: '10-20 years',
    potentialReach: '100M+ seeking financial literacy',
    blockers: ['Compliance concerns', 'Perfectionism', 'Camera presence', 'Fear of criticism'],
    frustration: 78,
    profiles: [
      { name: 'Rachel K.', exp: '14 yrs', specialty: 'Investment Analysis', quote: "I manage $500M in assets. I know more than most finfluencers. But they have production quality I can't match, so they get the audience." },
      { name: 'Susan P.', exp: '18 yrs', specialty: 'Tax/Accounting', quote: "I teach Excel to colleagues easily. Recording it for YouTube? 6 hours wasted, nothing usable produced." },
      { name: 'David R.', exp: '22 yrs', specialty: 'CFP', quote: "Financial literacy is a crisis. I could help millions but I'm stuck in 1:1 consultations because I can't do video." },
    ],
    marketOpportunity: '$3.8B in personal finance education',
  },
  {
    type: 'Healthcare Professionals',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
    avgExperience: '10-25 years',
    potentialReach: 'Billions seeking health info',
    blockers: ['HIPAA/Compliance', 'Liability concerns', 'Time scarcity', 'Camera discomfort'],
    frustration: 88,
    profiles: [
      { name: 'Dr. Emily C.', exp: '16 yrs', specialty: 'Pediatrics', quote: "Parents get health advice from influencers with no medical training. I could create trusted content but have zero time for production." },
      { name: 'Nurse Lisa M.', exp: '20 yrs', specialty: 'ER/Trauma', quote: "I see preventable injuries daily. Educational content could save lives. But our legal team won't approve anything I try to make." },
      { name: 'Dr. James W.', exp: '12 yrs', specialty: 'Mental Health', quote: "Therapy TikTok is doing harm. I want to provide real guidance but can't figure out video production while managing a practice." },
    ],
    marketOpportunity: '$12B+ in health education content',
  },
  {
    type: 'Retired Educators',
    icon: GraduationCap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    avgExperience: '25-40 years',
    potentialReach: 'Next generation learners',
    blockers: ['Tech overwhelm', 'Generation gap', 'No platform knowledge', 'Low confidence'],
    frustration: 95,
    profiles: [
      { name: 'George P.', exp: '40 yrs', specialty: 'History', quote: "40 years of teaching, thousands of students. Now retired with so much to share but completely lost with modern video tools." },
      { name: 'Prof. Margaret S.', exp: '35 yrs', specialty: 'Physics', quote: "I made physics understandable for generations. YouTube seems easy but the technical side defeats me every time." },
      { name: 'Coach Bill T.', exp: '30 yrs', specialty: 'Sports/Fitness', quote: "Kids today learn from Instagram. I have 30 years of proper technique to share but don't speak their digital language." },
    ],
    marketOpportunity: '$15B in lifelong learning market',
  },
];

// Segment Pain Points with multiple VoCs
const segmentPainPoints = [
  {
    segment: 'Content Creators',
    emoji: '🎬',
    avgHoursPerWeek: 25,
    videosPerWeek: 2,
    toolsUsed: 8,
    monthlyToolCost: '$247',
    frustrationScore: 78,
    topPain: 'Switching between 8+ apps for one video',
    biggestTimeWaste: 'Editing & Assembly (40%)',
    keyGap: 'No unified workflow - each tool solves one piece',
    vocs: [
      { quote: "I spend more time fighting with software than actually creating. By the time I export from one tool and import to another, I have lost my creative flow.", author: 'Sarah K.', role: 'YouTube Creator, 250K subscribers' },
      { quote: "My tool stack costs more than my rent. And they don't even talk to each other.", author: 'Mike J.', role: 'Multi-platform creator' },
      { quote: "I miss the days when creativity was the hard part. Now it's the tech.", author: 'Lisa P.', role: 'Lifestyle vlogger' },
    ],
  },
  {
    segment: 'Corporate L&D',
    emoji: '🏢',
    avgHoursPerWeek: 18,
    videosPerWeek: 1,
    toolsUsed: 6,
    monthlyToolCost: '$890',
    frustrationScore: 72,
    topPain: 'Content outdated before rollout',
    biggestTimeWaste: 'Approval cycles (45%)',
    keyGap: 'Slow iteration - cannot quickly update existing content',
    vocs: [
      { quote: "We spent 3 months creating a compliance video. By the time it was approved, the regulations had changed. We need to update content in hours, not months.", author: 'Michael R.', role: 'L&D Director, Fortune 500' },
      { quote: "Our LMS doesn't integrate with any video tool. Manual upload for 50,000 employees.", author: 'Karen L.', role: 'Training Manager' },
      { quote: "Stakeholder reviews take longer than content creation. It's a bureaucratic nightmare.", author: 'James T.', role: 'Corporate Trainer' },
    ],
  },
  {
    segment: 'Marketing Teams',
    emoji: '📈',
    avgHoursPerWeek: 22,
    videosPerWeek: 4,
    toolsUsed: 10,
    monthlyToolCost: '$1,250',
    frustrationScore: 81,
    topPain: 'Multi-platform format juggling',
    biggestTimeWaste: 'Format conversion (35%)',
    keyGap: 'No automated multi-format export',
    vocs: [
      { quote: "Every platform wants different specs. TikTok, YouTube Shorts, Instagram Reels - we are basically making the same video 5 times. It is insane.", author: 'Jennifer L.', role: 'Marketing Manager, SaaS Startup' },
      { quote: "We have brand guidelines but no way to enforce them across video content.", author: 'Amanda S.', role: 'Brand Manager' },
      { quote: "Agency quoted us $15K for one campaign video. We tried DIY. 3 weeks later, still not done.", author: 'Chris W.', role: 'Startup CMO' },
    ],
  },
  {
    segment: 'Healthcare',
    emoji: '🏥',
    avgHoursPerWeek: 15,
    videosPerWeek: 1,
    toolsUsed: 5,
    monthlyToolCost: '$2,100',
    frustrationScore: 85,
    topPain: 'HIPAA compliance delays everything',
    biggestTimeWaste: 'Compliance review (55%)',
    keyGap: 'Compliance-first video tools do not exist affordably',
    vocs: [
      { quote: "We cannot use most video tools because of HIPAA. The ones that are compliant cost a fortune and have terrible UX. Our nurses give up and just do in-person training.", author: 'Dr. Patricia M.', role: 'Chief Medical Officer' },
      { quote: "Patient education videos take 6 months to produce. Patients need them now.", author: 'Nurse Director', role: 'Large Hospital System' },
      { quote: "Every video needs legal sign-off. That queue is 8 weeks deep.", author: 'Health Educator', role: 'Community Health Center' },
    ],
  },
  {
    segment: 'Educators',
    emoji: '📚',
    avgHoursPerWeek: 12,
    videosPerWeek: 3,
    toolsUsed: 7,
    monthlyToolCost: '$180',
    frustrationScore: 69,
    topPain: 'No time for video during teaching load',
    biggestTimeWaste: 'Recording retakes (50%)',
    keyGap: 'Too time-intensive for already-busy educators',
    vocs: [
      { quote: "I want to create engaging video lectures but I teach 5 classes. I tried once and it took my entire weekend for one 10-minute video. Never again.", author: 'Prof. David H.', role: 'University Professor' },
      { quote: "Students want TikTok-style content. I can barely use PowerPoint.", author: 'High School Teacher', role: '15 years experience' },
      { quote: "Accessibility requirements for captions add 2 hours per video.", author: 'Special Ed Teacher', role: 'K-12 District' },
    ],
  },
  {
    segment: 'Knowledge Sharers',
    emoji: '💡',
    avgHoursPerWeek: 0,
    videosPerWeek: 0,
    toolsUsed: 0,
    monthlyToolCost: '$0',
    frustrationScore: 95,
    topPain: 'Expertise trapped - can\'t share what they know',
    biggestTimeWaste: 'Not even started due to barriers',
    keyGap: 'Zero production ability despite deep expertise',
    vocs: [
      { quote: "I've been a developer for 15 years. I know things that could help millions. But I can't get past the camera anxiety and editing complexity.", author: 'Wei L.', role: 'Senior Software Architect' },
      { quote: "Bad advice goes viral while experts like me stay silent. The tools are the barrier.", author: 'Carlos M.', role: 'Master Mechanic, 28 years' },
      { quote: "I retired with 40 years of teaching experience. All of it will be lost because I can't figure out YouTube.", author: 'George P.', role: 'Retired Educator' },
    ],
  },
];

// Platform-specific Influencer Data
const influencersByPlatform = [
  {
    platform: 'YouTube',
    icon: '🔴',
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    influencers: [
      { name: 'James R.', handle: '@TechReviewPro', followers: '1.2M', niche: 'Tech', monthlySpend: '$450', hoursPerVideo: 18, frustration: "Each video takes me 18 hours minimum. The editing alone is 10 hours." },
      { name: 'Maria G.', handle: '@BakingMagic', followers: '890K', niche: 'Cooking', monthlySpend: '$320', hoursPerVideo: 14, frustration: "My computer crashes during 4K export. Thumbnails take 2 hours each." },
      { name: 'Dr. Sarah M.', handle: '@HealthExplained', followers: '2.1M', niche: 'Health', monthlySpend: '$580', hoursPerVideo: 22, frustration: "Medical accuracy requires multiple reviews. One video takes a month." },
    ],
  },
  {
    platform: 'TikTok',
    icon: '🎵',
    color: 'text-pink-600',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    influencers: [
      { name: 'Zoe K.', handle: '@ZoeDances', followers: '3.2M', niche: 'Dance', monthlySpend: '$180', hoursPerVideo: 2, frustration: "I post daily. Even 2 hours per video is 60 hours a month just for TikTok." },
      { name: 'Derek W.', handle: '@ComedyKingDerek', followers: '5.8M', niche: 'Comedy', monthlySpend: '$250', hoursPerVideo: 1.5, frustration: "2-3 takes per skit, 60 videos a month. The creative drain is real." },
      { name: 'Emma L.', handle: '@LearnWithEmma', followers: '1.5M', niche: 'Education', monthlySpend: '$200', hoursPerVideo: 3, frustration: "Making complex topics simple AND entertaining in 60 seconds is brutal." },
    ],
  },
  {
    platform: 'Instagram',
    icon: '📸',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    influencers: [
      { name: 'Priya S.', handle: '@PriyaFashionista', followers: '780K', niche: 'Fashion', monthlySpend: '$400', hoursPerVideo: 3, frustration: "Reels, Stories, Carousels - same content, 4 different formats." },
      { name: 'Alex T.', handle: '@AlexFitness', followers: '1.5M', niche: 'Fitness', monthlySpend: '$350', hoursPerVideo: 2.5, frustration: "Form tips overlays, rep counters, music sync - technically demanding." },
      { name: 'Nina R.', handle: '@NinaCooks', followers: '520K', niche: 'Food', monthlySpend: '$280', hoursPerVideo: 4, frustration: "Perfect aesthetic required. One imperfect shot ruins everything." },
    ],
  },
  {
    platform: 'LinkedIn',
    icon: '💼',
    color: 'text-blue-700',
    bgColor: 'bg-blue-700/10',
    borderColor: 'border-blue-700/20',
    influencers: [
      { name: 'David K.', handle: '@ThoughtLeader', followers: '180K', niche: 'Business', monthlySpend: '$300', hoursPerVideo: 5, frustration: "Professional quality expected but budget of a solo creator." },
      { name: 'Rachel M.', handle: '@HRInsights', followers: '95K', niche: 'HR/Leadership', monthlySpend: '$220', hoursPerVideo: 4, frustration: "Corporate audience expects polish I can't afford to produce." },
      { name: 'Mark S.', handle: '@StartupStories', followers: '250K', niche: 'Entrepreneurship', monthlySpend: '$380', hoursPerVideo: 6, frustration: "Competing with VC-backed content teams with just me and a laptop." },
    ],
  },
];

// Project-level metrics
const projectMetrics = {
  singleVideoTraditional: {
    totalHours: '11-25 hours',
    totalCost: '$270-615',
    toolsRequired: '8-12 apps',
    outputFormats: 1,
    languages: 1,
  },
  singleVideoGenie: {
    totalHours: '1-2 hours',
    totalCost: '$29-79',
    toolsRequired: '1 platform',
    outputFormats: 6,
    languages: 'Unlimited',
  },
};

// Market Stats
const marketStats = [
  { stat: '86%', label: 'Businesses using video for marketing', trend: '+12% YoY', icon: Video },
  { stat: '$400B', label: 'Global video production market by 2030', trend: '19.6% CAGR', icon: DollarSign },
  { stat: '1,200%', label: 'More shares for video vs text+image', trend: 'Consistent', icon: TrendingUp },
  { stat: '72%', label: 'Prefer video over text for product info', trend: '+8% YoY', icon: BarChart3 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// VoC Carousel Component
const VocCarousel: React.FC<{ quotes: Array<{ quote: string; author: string; role: string }> }> = ({ quotes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const next = () => setCurrentIndex((prev) => (prev + 1) % quotes.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  
  if (!quotes || quotes.length === 0) return null;
  
  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-primary/5 rounded-lg p-4 border border-primary/10 min-h-[120px]"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
            <MessageSquareQuote className="w-3 h-3" />
            Voice of Customer ({currentIndex + 1}/{quotes.length})
          </div>
          <p className="text-sm text-muted-foreground italic mb-3">
            &ldquo;{quotes[currentIndex].quote}&rdquo;
          </p>
          <div className="text-xs">
            <span className="font-medium text-foreground">{quotes[currentIndex].author}</span>
            <span className="text-muted-foreground"> • {quotes[currentIndex].role}</span>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {quotes.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <Button variant="outline" size="icon" className="h-6 w-6" onClick={prev}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <div className="flex gap-1">
            {quotes.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          <Button variant="outline" size="icon" className="h-6 w-6" onClick={next}>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Section with Download/Fullscreen
const SectionWrapper: React.FC<{ 
  title: string; 
  children: React.ReactNode;
  downloadFileName?: string;
}> = ({ title, children, downloadFileName = 'section' }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const handleDownload = async () => {
    if (!sectionRef.current) return;
    try {
      toast.info('Generating PNG...');
      const canvas = await html2canvas(sectionRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `${downloadFileName}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('Downloaded!');
    } catch (error) {
      toast.error('Download failed');
    }
  };
  
  return (
    <>
      <div className="relative group">
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7 bg-background/80 backdrop-blur"
            onClick={handleDownload}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7 bg-background/80 backdrop-blur"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div ref={sectionRef}>
          {children}
        </div>
      </div>
      
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 overflow-auto">
          <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
            <h2 className="text-foreground font-semibold text-lg">{title}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
          <div className="p-8">
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export const OverviewTab: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1920px] mx-auto space-y-10 p-6"
    >
      {/* Hero Problem Statement */}
      <motion.div variants={itemVariants} className="text-center py-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <Badge variant="destructive" className="mb-4 px-4 py-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            The Content Production Crisis
          </Badge>
        </motion.div>
        
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Creators waste{' '}
          <span className="text-primary">25+ hours per week</span>{' '}
          juggling fragmented tools
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          The average content professional uses <strong>8-12 disconnected applications</strong> to produce 
          a single piece of content, spending <strong>$270-615 per video</strong> in tool costs and labor.
        </p>
      </motion.div>

      {/* Project Comparison Cards */}
      <SectionWrapper title="Traditional vs Genie Workflow" downloadFileName="workflow-comparison">
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Workflow */}
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-destructive" />
                <CardTitle className="text-destructive">Traditional Workflow (1 Video)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-xl">
                  <div className="text-3xl font-bold text-destructive">{projectMetrics.singleVideoTraditional.totalHours}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Time</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-xl">
                  <div className="text-3xl font-bold text-destructive">{projectMetrics.singleVideoTraditional.totalCost}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Cost</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-xl">
                  <div className="text-2xl font-bold text-foreground">{projectMetrics.singleVideoTraditional.toolsRequired}</div>
                  <div className="text-sm text-muted-foreground mt-1">Tools Required</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-xl">
                  <div className="text-2xl font-bold text-foreground">{projectMetrics.singleVideoTraditional.outputFormats} format</div>
                  <div className="text-sm text-muted-foreground mt-1">Output</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Genie Workflow */}
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <CardTitle className="text-green-600 dark:text-green-400">With Genie Suite (1 Video)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">{projectMetrics.singleVideoGenie.totalHours}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Time</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">{projectMetrics.singleVideoGenie.totalCost}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Cost</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-xl">
                  <div className="text-2xl font-bold text-foreground">{projectMetrics.singleVideoGenie.toolsRequired}</div>
                  <div className="text-sm text-muted-foreground mt-1">Tools Required</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-xl">
                  <div className="text-2xl font-bold text-foreground">{projectMetrics.singleVideoGenie.outputFormats}+ formats</div>
                  <div className="text-sm text-muted-foreground mt-1">Multi-language</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </SectionWrapper>

      {/* Market Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {marketStats.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <motion.div 
                    className="text-3xl font-bold text-primary"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {item.stat}
                  </motion.div>
                  <div className="text-sm text-muted-foreground mt-2">{item.label}</div>
                </div>
                <item.icon className="w-5 h-5 text-primary/60" />
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs text-green-600 font-medium">
                <TrendingUp className="w-3 h-3" />
                {item.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Content Creation Journey - Step-Centric with 3 Columns */}
      <SectionWrapper title="Content Creation Journey - Deep Dive" downloadFileName="content-creation-journey">
        <motion.div variants={itemVariants}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              Content Creation Journey - Step by Step Analysis
            </h3>
          </div>

          <div className="space-y-8">
            {journeySteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Card className={step.criticalPain ? 'border-destructive/30' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        step.criticalPain 
                          ? 'bg-destructive text-destructive-foreground' 
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        <step.icon className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle>Step {step.step}: {step.title}</CardTitle>
                          {step.criticalPain && (
                            <Badge variant="destructive" className="text-xs">Critical Pain Point</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{step.before.timePercent}% of total time</span>
                          <span>•</span>
                          <span className="text-green-600 font-medium">{step.timeWasted} time saved with Genie</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Before/After Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/20">
                        <div className="flex items-center gap-2 mb-3">
                          <XCircle className="w-4 h-4 text-destructive" />
                          <span className="font-semibold text-destructive text-sm">Before Genie</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground text-xs">Time</span>
                            <div className="font-medium text-foreground">{step.before.time}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Cost</span>
                            <div className="font-medium text-destructive">{step.before.cost}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Output</span>
                            <div className="font-medium text-foreground">{step.before.output}</div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-destructive/20 text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {step.before.pain}
                        </div>
                      </div>

                      <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600 text-sm">With {step.after.tools}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground text-xs">Time</span>
                            <div className="font-medium text-green-600">{step.after.time}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Tool</span>
                            <div className="font-medium text-foreground">{step.after.tools}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Output</span>
                            <div className="font-medium text-foreground">{step.after.output}</div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-green-500/20 text-xs text-green-600 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {step.after.wow}
                        </div>
                      </div>
                    </div>

                    {/* 3-Column Layout: Pain by Segment | VoC Quotes | Influencer Voices */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Column 1: Pain Points by Segment */}
                      <Card className="border-amber-500/20">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            Pain by Market Segment
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          <ScrollArea className="h-[200px]">
                            <div className="space-y-2">
                              {Object.entries(step.segmentPains).map(([segment, data]) => (
                                <div key={segment} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-foreground">{segment}</div>
                                    <div className="text-xs text-muted-foreground truncate">{data.pain}</div>
                                  </div>
                                  <Badge 
                                    variant="outline" 
                                    className={`ml-2 text-xs ${data.severity >= 90 ? 'border-destructive text-destructive' : data.severity >= 75 ? 'border-amber-500 text-amber-600' : 'border-muted-foreground'}`}
                                  >
                                    {data.severity}%
                                  </Badge>
                                </div>
                              ))}
                            </div>
                            <ScrollBar orientation="vertical" />
                          </ScrollArea>
                        </CardContent>
                      </Card>

                      {/* Column 2: VoC Carousel */}
                      <Card className="border-primary/20">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <MessageSquareQuote className="w-4 h-4 text-primary" />
                            Voice of Customer
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          <VocCarousel quotes={step.vocQuotes} />
                        </CardContent>
                      </Card>

                      {/* Column 3: Real Influencer Insights */}
                      <Card className="border-purple-500/20">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-600" />
                            Real Influencer Voices
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          <ScrollArea className="h-[200px]">
                            <div className="space-y-3">
                              {step.influencerVoices.map((inf, idx) => (
                                <div key={idx} className="bg-purple-500/5 rounded-lg p-3 border border-purple-500/10">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="text-[10px]">{inf.platform}</Badge>
                                    <span className="text-xs font-medium text-foreground">{inf.name}</span>
                                    <span className="text-xs text-muted-foreground">{inf.handle}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground italic">
                                    &ldquo;{inf.quote}&rdquo;
                                  </p>
                                </div>
                              ))}
                            </div>
                            <ScrollBar orientation="vertical" />
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </SectionWrapper>

      {/* The Ignored Experts - Knowledge Sharers */}
      <SectionWrapper title="The Ignored Experts - Knowledge Sharers" downloadFileName="knowledge-sharers">
        <motion.div variants={itemVariants}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </div>
              The Ignored Experts: Knowledge Trapped by Technology
            </h3>
            <Badge variant="outline" className="border-amber-500/30 text-amber-600">
              $40B+ in untapped educational content
            </Badge>
          </div>

          <p className="text-muted-foreground mb-6 max-w-4xl">
            Millions of professionals with decades of expertise remain silent while influencers with less knowledge 
            dominate platforms. The barrier isn&apos;t their skills—it&apos;s the complexity of content creation technology.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {knowledgeSharers.map((group, index) => (
              <motion.div
                key={group.type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className={`h-full ${group.bgColor} border-${group.color.replace('text-', '')}/20`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${group.bgColor} flex items-center justify-center`}>
                        <group.icon className={`w-6 h-6 ${group.color}`} />
                      </div>
                      <div>
                        <CardTitle className={`text-lg ${group.color}`}>{group.type}</CardTitle>
                        <span className="text-xs text-muted-foreground">{group.avgExperience} avg experience</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-background/50 rounded-lg p-2.5 text-center">
                        <div className="font-bold text-foreground">{group.potentialReach}</div>
                        <div className="text-[10px] text-muted-foreground">Potential Reach</div>
                      </div>
                      <div className="bg-destructive/10 rounded-lg p-2.5 text-center">
                        <div className="font-bold text-destructive">{group.frustration}%</div>
                        <div className="text-[10px] text-muted-foreground">Frustration</div>
                      </div>
                    </div>

                    {/* Blockers */}
                    <div className="mb-4">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Key Blockers:</div>
                      <div className="flex flex-wrap gap-1">
                        {group.blockers.map((blocker, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px] border-destructive/30 text-destructive">
                            {blocker}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* VoC Carousel */}
                    <VocCarousel 
                      quotes={group.profiles.map(p => ({
                        quote: p.quote,
                        author: p.name,
                        role: `${p.specialty}, ${p.exp}`
                      }))}
                    />

                    {/* Market Opportunity */}
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-600">{group.marketOpportunity}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Key Insight Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="mt-6 border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  <h4 className="text-lg font-semibold text-foreground">The Knowledge Barrier Crisis</h4>
                </div>
                <p className="text-muted-foreground mb-4">
                  <strong className="text-foreground">Experts with 10-40 years of experience</strong> are being outpaced by 
                  influencers with better video production skills but less actual expertise. Bad advice goes viral while 
                  genuine knowledge remains locked away.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-destructive">89%</div>
                    <div className="text-xs text-muted-foreground">of experts never create video content</div>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">$40B+</div>
                    <div className="text-xs text-muted-foreground">in untapped educational market</div>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">Genie</div>
                    <div className="text-xs text-muted-foreground">removes the technology barrier</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </SectionWrapper>

      {/* Market Segment Pain Points with Scrolling VoC */}
      <SectionWrapper title="Pain Points by Market Segment" downloadFileName="segment-pain-points">
        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-destructive" />
            </div>
            Pain Points by Market Segment
            <Badge variant="secondary" className="ml-3">Multiple Voices per Segment</Badge>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {segmentPainPoints.map((segment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{segment.emoji}</span>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">{segment.segment}</h4>
                        <span className="text-xs text-muted-foreground">{segment.videosPerWeek} videos/week avg</span>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                        <div className="font-bold text-foreground">{segment.avgHoursPerWeek || '—'}h</div>
                        <div className="text-[10px] text-muted-foreground">Weekly Hours</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                        <div className="font-bold text-foreground">{segment.toolsUsed || '—'} apps</div>
                        <div className="text-[10px] text-muted-foreground">Tools Used</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                        <div className="font-bold text-green-600">{segment.monthlyToolCost}</div>
                        <div className="text-[10px] text-muted-foreground">Monthly Cost</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                        <div className="font-bold text-destructive">{segment.frustrationScore}%</div>
                        <div className="text-[10px] text-muted-foreground">Frustration</div>
                      </div>
                    </div>

                    {/* Biggest Time Waste */}
                    <div className="bg-amber-500/10 rounded-lg p-3 mb-3 border border-amber-500/20">
                      <div className="flex items-center gap-2 text-xs font-medium text-amber-600 mb-1">
                        <Clock className="w-3 h-3" />
                        Biggest Time Waste
                      </div>
                      <span className="text-sm text-foreground">{segment.biggestTimeWaste}</span>
                    </div>

                    {/* Key Gap */}
                    <div className="bg-destructive/5 rounded-lg p-3 mb-4 border border-destructive/10">
                      <div className="flex items-center gap-2 text-xs font-medium text-destructive mb-1">
                        <AlertTriangle className="w-3 h-3" />
                        Key Gap
                      </div>
                      <span className="text-sm text-foreground">{segment.keyGap}</span>
                    </div>

                    {/* Scrolling Voice of Customer */}
                    <VocCarousel quotes={segment.vocs} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </SectionWrapper>

      {/* Influencer Insights by Platform */}
      <SectionWrapper title="Influencer Insights by Platform" downloadFileName="influencer-insights">
        <motion.div variants={itemVariants}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-xl">🎭</span>
              </div>
              Real Influencer Insights by Platform
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {influencersByPlatform.map((platform, pIndex) => (
              <motion.div
                key={platform.platform}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * pIndex }}
              >
                <Card className={`overflow-hidden ${platform.borderColor}`}>
                  <CardHeader className={`${platform.bgColor} border-b ${platform.borderColor} py-3`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <CardTitle className={`text-lg ${platform.color}`}>{platform.platform}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ScrollArea className="h-[280px]">
                      <div className="space-y-3">
                        {platform.influencers.map((influencer, iIndex) => (
                          <div key={iIndex} className={`${platform.bgColor} rounded-lg p-3 border ${platform.borderColor}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-medium text-foreground text-sm">{influencer.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">{influencer.handle}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">{influencer.followers}</Badge>
                            </div>
                            <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                              <span>{influencer.niche}</span>
                              <span>•</span>
                              <span className="text-destructive">{influencer.monthlySpend}/mo</span>
                              <span>•</span>
                              <span>{influencer.hoursPerVideo}h/video</span>
                            </div>
                            <p className="text-xs text-foreground italic">
                              &ldquo;{influencer.frustration}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                      <ScrollBar orientation="vertical" />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </SectionWrapper>

      {/* Solution Summary */}
      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <motion.div 
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Target className="w-8 h-8 text-primary-foreground" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Genie Suite: One Platform, Complete Workflow
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    From idea to published content in minutes, not days. AI-powered automation handles the tedious work.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center px-4 py-3 bg-background/50 rounded-xl">
                  <div className="text-2xl font-bold text-primary">289</div>
                  <div className="text-xs text-muted-foreground">Scenarios</div>
                </div>
                <div className="text-center px-4 py-3 bg-background/50 rounded-xl">
                  <div className="text-2xl font-bold text-primary">6</div>
                  <div className="text-xs text-muted-foreground">Products</div>
                </div>
                <div className="text-center px-4 py-3 bg-background/50 rounded-xl">
                  <div className="text-2xl font-bold text-primary">90%</div>
                  <div className="text-xs text-muted-foreground">Time Saved</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
