/**
 * Overview Tab - Problem Statement & User Journey
 * Restructured with horizontal scrollable cards per step with auto-scrolling VoC
 */

import React, { useRef, useState, useEffect } from 'react';
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

// Enhanced Journey Steps with correct Genie Product mapping
// Based on src/constants/genie-products.ts:
// - Genie Spark: "Ignite your Ideas" - AI script generation, story development, content ideation
// - Genie Mind: "AI that understands" - Contextual AI, script editing, TTS, templates
// - Genie Vibe: "Script to Screen" - Audio/video recording, editing, production
// - Genie Arc: "Your Production Journey With Infinite Possibilities" - Production workflow, team collaboration
// - Ask Genie: "Your wish is my command" - Universal AI assistant throughout

// Segment data with metrics - VoC is now nested within each segment
interface SegmentPainWithVoC {
  segment: string;
  emoji: string;
  pain: string;
  severity: number;
  metrics: {
    videosPerWeek: number;
    audiosPerMonth: number;
    editsPerWeek: number;
    hoursPerWeek: number;
    toolCost: string;
  };
  voc: Array<{ quote: string; author: string; role: string }>;
}

const journeySteps = [
  {
    step: 1,
    title: "Ideation & Scripting",
    icon: FileText,
    product: {
      name: "Genie Spark",
      tagline: "Ignite your Ideas",
      emoji: "✨",
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    before: { 
      time: "2-4 hours", 
      timePercent: 18,
      cost: "$45-90",
      tools: "ChatGPT + Google Docs + Research", 
      pain: "Context switching, version chaos",
      output: "1 script draft"
    },
    after: { 
      time: "15-30 min", 
      tools: "Genie Spark", 
      wow: "AI script generation, story development & content ideation",
      output: "3-5 script variants"
    },
    criticalPain: true,
    timeWasted: "85%",
    segmentPains: [
      { 
        segment: "Content Creators", emoji: "🎬", pain: "Writer block with no AI assistance", severity: 75,
        metrics: { videosPerWeek: 3, audiosPerMonth: 12, editsPerWeek: 4, hoursPerWeek: 8, toolCost: "$247/mo" },
        voc: [
          { quote: "I sit staring at a blank doc for hours. By the time I start writing, my creative energy is gone.", author: "Marcus L.", role: "YouTuber, 180K subs" },
          { quote: "Coming up with fresh ideas for 3 videos a week is mentally exhausting.", author: "Sarah K.", role: "Lifestyle Creator" },
        ]
      },
      { 
        segment: "Corporate L&D", emoji: "🏢", pain: "Compliance language requirements", severity: 82,
        metrics: { videosPerWeek: 1, audiosPerMonth: 4, editsPerWeek: 2, hoursPerWeek: 18, toolCost: "$890/mo" },
        voc: [
          { quote: "Every script needs legal review. That alone takes 2 weeks.", author: "Sarah M.", role: "L&D Manager, Bank" },
          { quote: "We have 47 compliance checkpoints for each training video.", author: "Michael R.", role: "L&D Director" },
        ]
      },
      { 
        segment: "Marketing Teams", emoji: "📈", pain: "Brand voice consistency", severity: 79,
        metrics: { videosPerWeek: 4, audiosPerMonth: 16, editsPerWeek: 6, hoursPerWeek: 22, toolCost: "$1,250/mo" },
        voc: [
          { quote: "Our brand voice guide is 40 pages. No one follows it consistently.", author: "Amanda S.", role: "Brand Manager" },
          { quote: "We rewrite the same script 12 times before anyone is happy.", author: "Jennifer L.", role: "Marketing Director" },
        ]
      },
      { 
        segment: "Healthcare", emoji: "🏥", pain: "Medical accuracy verification", severity: 95,
        metrics: { videosPerWeek: 1, audiosPerMonth: 4, editsPerWeek: 1, hoursPerWeek: 15, toolCost: "$2,100/mo" },
        voc: [
          { quote: "Medical terminology takes forever to get right in layman terms.", author: "Dr. Patricia M.", role: "CMO, Hospital" },
          { quote: "One wrong word in patient education can cause harm.", author: "Nurse Director", role: "Large Hospital" },
        ]
      },
      { 
        segment: "Educators", emoji: "📚", pain: "Curriculum alignment", severity: 68,
        metrics: { videosPerWeek: 3, audiosPerMonth: 8, editsPerWeek: 4, hoursPerWeek: 12, toolCost: "$180/mo" },
        voc: [
          { quote: "Aligning videos with learning standards adds hours to prep.", author: "Prof. David H.", role: "University Professor" },
          { quote: "Students want engaging content but curriculum is rigid.", author: "High School Teacher", role: "15 yrs exp" },
        ]
      },
      { 
        segment: "Knowledge Sharers", emoji: "💡", pain: "Cannot structure ideas for video", severity: 88,
        metrics: { videosPerWeek: 0, audiosPerMonth: 0, editsPerWeek: 0, hoursPerWeek: 0, toolCost: "$0" },
        voc: [
          { quote: "I know my craft inside out but putting it into words for video? Impossible.", author: "Tony R.", role: "Auto Mechanic, 20 yrs" },
          { quote: "I have 15 years of expertise but no idea how to script a tutorial.", author: "Wei L.", role: "Software Architect" },
        ]
      },
      { 
        segment: "Influencers", emoji: "📱", pain: "Daily content pressure across platforms", severity: 85,
        metrics: { videosPerWeek: 8, audiosPerMonth: 20, editsPerWeek: 12, hoursPerWeek: 25, toolCost: "$500/mo" },
        voc: [
          { quote: "Research alone takes 3 hours. Then organizing it into a script is another 2. For 8 videos a month, thats 40 hours just on ideation.", author: "James R.", role: "YouTube @TechReviewPro, 1.2M" },
          { quote: "I have to come up with fresh ideas daily. The pressure is insane.", author: "Zoe K.", role: "TikTok @ZoeDances, 3.2M" },
        ]
      },
    ],
  },
  {
    step: 2,
    title: "Script Editing & Enhancement",
    icon: FileText,
    product: {
      name: "Genie Mind",
      tagline: "AI that understands",
      emoji: "🧠",
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    before: { 
      time: "1-2 hours", 
      timePercent: 10,
      cost: "$25-50",
      tools: "Manual editing + Grammarly + Style guides", 
      pain: "Inconsistent tone, missing context",
      output: "1 refined script"
    },
    after: { 
      time: "10 min", 
      tools: "Genie Mind", 
      wow: "Contextual AI understanding with cross-product memory",
      output: "Polished multi-format scripts"
    },
    criticalPain: false,
    timeWasted: "83%",
    segmentPains: [
      { 
        segment: "Content Creators", emoji: "🎬", pain: "Maintaining consistent voice across videos", severity: 70,
        metrics: { videosPerWeek: 3, audiosPerMonth: 12, editsPerWeek: 6, hoursPerWeek: 4, toolCost: "$50/mo" },
        voc: [
          { quote: "I spend 2 hours polishing a script, then realize the tone is all wrong.", author: "Lisa P.", role: "Lifestyle Vlogger" },
          { quote: "My old videos sound nothing like my new ones. No consistency.", author: "Mike J.", role: "Tech Creator" },
        ]
      },
      { 
        segment: "Corporate L&D", emoji: "🏢", pain: "Policy compliance verification", severity: 80,
        metrics: { videosPerWeek: 1, audiosPerMonth: 4, editsPerWeek: 3, hoursPerWeek: 6, toolCost: "$200/mo" },
        voc: [
          { quote: "Compliance check takes longer than writing the content.", author: "Michael R.", role: "L&D Director" },
          { quote: "Legal reviews every word. One mistake and we start over.", author: "Karen L.", role: "Training Manager" },
        ]
      },
      { 
        segment: "Marketing Teams", emoji: "📈", pain: "Brand guidelines enforcement", severity: 75,
        metrics: { videosPerWeek: 4, audiosPerMonth: 16, editsPerWeek: 8, hoursPerWeek: 6, toolCost: "$300/mo" },
        voc: [
          { quote: "40-page brand guide and still no one writes consistently.", author: "Amanda S.", role: "Brand Manager" },
          { quote: "Different writers, different voices. Customers notice.", author: "Chris W.", role: "CMO" },
        ]
      },
      { 
        segment: "Healthcare", emoji: "🏥", pain: "Medical terminology accuracy", severity: 92,
        metrics: { videosPerWeek: 1, audiosPerMonth: 2, editsPerWeek: 2, hoursPerWeek: 8, toolCost: "$500/mo" },
        voc: [
          { quote: "Medical jargon needs simplification without losing accuracy.", author: "Dr. Emily C.", role: "Pediatrician" },
          { quote: "Patients misunderstand one term and treatment fails.", author: "Nurse Lisa M.", role: "ER, 20 yrs" },
        ]
      },
      { 
        segment: "Educators", emoji: "📚", pain: "Learning objective alignment", severity: 65,
        metrics: { videosPerWeek: 3, audiosPerMonth: 6, editsPerWeek: 4, hoursPerWeek: 3, toolCost: "$30/mo" },
        voc: [
          { quote: "I know the material, but making it engaging for video is different.", author: "Prof. David H.", role: "University Professor" },
          { quote: "Students zone out if script sounds like a textbook.", author: "High School Teacher", role: "Science" },
        ]
      },
      { 
        segment: "Knowledge Sharers", emoji: "💡", pain: "Translating expertise to simple language", severity: 85,
        metrics: { videosPerWeek: 0, audiosPerMonth: 0, editsPerWeek: 0, hoursPerWeek: 0, toolCost: "$0" },
        voc: [
          { quote: "I can explain to colleagues but simplifying for video is impossible.", author: "Rachel K.", role: "CFA, 14 yrs" },
          { quote: "Technical accuracy vs accessibility - I cannot find balance.", author: "Tom H.", role: "Developer, 12 yrs" },
        ]
      },
      { 
        segment: "Influencers", emoji: "📱", pain: "Platform-specific tone switching", severity: 82,
        metrics: { videosPerWeek: 8, audiosPerMonth: 20, editsPerWeek: 15, hoursPerWeek: 8, toolCost: "$150/mo" },
        voc: [
          { quote: "Making complex topics simple AND entertaining is brutal. I rewrite each script 5 times.", author: "Emma L.", role: "TikTok @LearnWithEmma, 1.5M" },
          { quote: "Professional tone for LinkedIn, casual for TikTok - same content, completely different scripts.", author: "Mark S.", role: "LinkedIn @StartupStories, 250K" },
        ]
      },
    ],
  },
  {
    step: 3,
    title: "Voice & Audio Production",
    icon: Mic,
    product: {
      name: "Genie Mind",
      tagline: "AI that understands",
      emoji: "🧠",
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    before: { 
      time: "1-3 hours", 
      timePercent: 12,
      cost: "$25-75",
      tools: "ElevenLabs + Audacity + Multiple logins", 
      pain: "Manual export/import cycles",
      output: "1 audio file"
    },
    after: { 
      time: "5 min", 
      tools: "Genie Mind TTS", 
      wow: "11 TTS providers, voice synthesis & script-to-audio",
      output: "Multi-language audio"
    },
    criticalPain: false,
    timeWasted: "92%",
    segmentPains: [
      { 
        segment: "Content Creators", emoji: "🎬", pain: "Voice fatigue on long recordings", severity: 62,
        metrics: { videosPerWeek: 3, audiosPerMonth: 15, editsPerWeek: 4, hoursPerWeek: 5, toolCost: "$80/mo" },
        voc: [
          { quote: "Voice-over for 12 videos a month destroys my throat.", author: "Maria G.", role: "YouTube, 890K subs" },
          { quote: "I re-record the same intro 50 times to get it right.", author: "Alex T.", role: "Fitness Creator" },
        ]
      },
      { 
        segment: "Corporate L&D", emoji: "🏢", pain: "Multi-language requirements", severity: 78,
        metrics: { videosPerWeek: 1, audiosPerMonth: 12, editsPerWeek: 2, hoursPerWeek: 8, toolCost: "$400/mo" },
        voc: [
          { quote: "We need 12 language versions. Each one costs $500 in voice talent.", author: "Jennifer L.", role: "Global L&D Lead" },
          { quote: "Syncing audio across languages is a logistical nightmare.", author: "Training Director", role: "Multinational Corp" },
        ]
      },
      { 
        segment: "Marketing Teams", emoji: "📈", pain: "Consistent brand voice across regions", severity: 71,
        metrics: { videosPerWeek: 4, audiosPerMonth: 20, editsPerWeek: 5, hoursPerWeek: 6, toolCost: "$350/mo" },
        voc: [
          { quote: "Different voice actors in each region. No brand consistency.", author: "Amanda S.", role: "Global Brand" },
          { quote: "Re-recording for each market doubles our timeline.", author: "Regional Marketing Head", role: "APAC" },
        ]
      },
      { 
        segment: "Healthcare", emoji: "🏥", pain: "Medical pronunciation accuracy", severity: 89,
        metrics: { videosPerWeek: 1, audiosPerMonth: 4, editsPerWeek: 1, hoursPerWeek: 4, toolCost: "$600/mo" },
        voc: [
          { quote: "Mispronouncing drug names can cause patient harm.", author: "Dr. James W.", role: "Clinical Educator" },
          { quote: "Finding voice talent who can pronounce medical terms is impossible.", author: "Health Comms Director", role: "Hospital Network" },
        ]
      },
      { 
        segment: "Educators", emoji: "📚", pain: "Accent clarity for diverse students", severity: 65,
        metrics: { videosPerWeek: 3, audiosPerMonth: 10, editsPerWeek: 3, hoursPerWeek: 4, toolCost: "$50/mo" },
        voc: [
          { quote: "Narrating a 45-minute course leaves me voiceless for days.", author: "Prof. David H.", role: "University" },
          { quote: "International students struggle with my regional accent.", author: "Online Instructor", role: "Coursera" },
        ]
      },
      { 
        segment: "Knowledge Sharers", emoji: "💡", pain: "Shy about their voice/accent", severity: 94,
        metrics: { videosPerWeek: 0, audiosPerMonth: 0, editsPerWeek: 0, hoursPerWeek: 0, toolCost: "$0" },
        voc: [
          { quote: "I hate my voice on recordings. I have deleted 50 attempts.", author: "Priya S.", role: "Accountant" },
          { quote: "My accent makes people dismiss my expertise. AI voice would change everything.", author: "Wei L.", role: "Engineer, 15 yrs" },
        ]
      },
      { 
        segment: "Influencers", emoji: "📱", pain: "Voice fatigue from high-volume production", severity: 78,
        metrics: { videosPerWeek: 8, audiosPerMonth: 30, editsPerWeek: 10, hoursPerWeek: 10, toolCost: "$200/mo" },
        voc: [
          { quote: "Voice-over for 12 videos a month destroys my throat. Vocal rest breaks are mandatory now.", author: "Maria G.", role: "YouTube @BakingMagic, 890K" },
          { quote: "Different character voices are exhausting. An AI that could clone my style would save hours.", author: "Derek W.", role: "TikTok @ComedyKingDerek, 5.8M" },
        ]
      },
    ],
  },
  {
    step: 4,
    title: "Video Recording & Production",
    icon: Video,
    product: {
      name: "Genie Vibe",
      tagline: "Script to Screen",
      emoji: "🎬",
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    before: { 
      time: "3-6 hours", 
      timePercent: 28,
      cost: "$75-150",
      tools: "Loom + OBS + Teleprompter app + Camera", 
      pain: "Setup time, re-takes, lighting issues",
      output: "1 raw video"
    },
    after: { 
      time: "20 min", 
      tools: "Genie Vibe", 
      wow: "Video capture, real-time effects & script-to-screen workflow",
      output: "Polished recording"
    },
    criticalPain: true,
    timeWasted: "89%",
    segmentPains: [
      { 
        segment: "Content Creators", emoji: "🎬", pain: "Endless retakes for perfection", severity: 81,
        metrics: { videosPerWeek: 3, audiosPerMonth: 12, editsPerWeek: 5, hoursPerWeek: 12, toolCost: "$150/mo" },
        voc: [
          { quote: "I did 47 takes for a 10-minute tutorial. Perfectionism is killing me.", author: "David H.", role: "Prof, CompSci" },
          { quote: "One bad take and I reshoot the entire segment.", author: "Priya S.", role: "Fashion Creator" },
        ]
      },
      { 
        segment: "Corporate L&D", emoji: "🏢", pain: "SME availability constraints", severity: 76,
        metrics: { videosPerWeek: 1, audiosPerMonth: 4, editsPerWeek: 2, hoursPerWeek: 10, toolCost: "$300/mo" },
        voc: [
          { quote: "Our CEO has 10 minutes between meetings. We get one shot.", author: "Karen L.", role: "Corporate Comms" },
          { quote: "Subject matter experts are too busy to reshoot anything.", author: "L&D Producer", role: "Enterprise" },
        ]
      },
      { 
        segment: "Marketing Teams", emoji: "📈", pain: "Location and set requirements", severity: 68,
        metrics: { videosPerWeek: 4, audiosPerMonth: 16, editsPerWeek: 6, hoursPerWeek: 15, toolCost: "$500/mo" },
        voc: [
          { quote: "Studio rental is $2,000/day. We can only afford 2 shoot days a month.", author: "Production Manager", role: "Agency" },
          { quote: "Location scouting takes longer than the actual shoot.", author: "Video Producer", role: "Brand Team" },
        ]
      },
      { 
        segment: "Healthcare", emoji: "🏥", pain: "Patient privacy in recordings", severity: 92,
        metrics: { videosPerWeek: 1, audiosPerMonth: 2, editsPerWeek: 1, hoursPerWeek: 6, toolCost: "$800/mo" },
        voc: [
          { quote: "HIPAA means we cannot show anything identifiable. Limits content severely.", author: "Compliance Officer", role: "Hospital" },
          { quote: "Simulating procedures with actors costs a fortune.", author: "Medical Educator", role: "Teaching Hospital" },
        ]
      },
      { 
        segment: "Educators", emoji: "📚", pain: "Tech setup complexity", severity: 73,
        metrics: { videosPerWeek: 3, audiosPerMonth: 8, editsPerWeek: 4, hoursPerWeek: 8, toolCost: "$100/mo" },
        voc: [
          { quote: "Setting up lights, camera, audio takes 2 hours. Motivation gone by then.", author: "Mike T.", role: "Electrician, 25 yrs" },
          { quote: "I teach 5 classes. No time to figure out recording equipment.", author: "Prof. Margaret S.", role: "Physics" },
        ]
      },
      { 
        segment: "Knowledge Sharers", emoji: "💡", pain: "Camera anxiety, fear of judgment", severity: 96,
        metrics: { videosPerWeek: 0, audiosPerMonth: 0, editsPerWeek: 0, hoursPerWeek: 0, toolCost: "$0" },
        voc: [
          { quote: "I know more than most YouTubers in my field, but I freeze on camera.", author: "Rachel K.", role: "CFA, 14 yrs" },
          { quote: "The thought of being judged on appearance stops me from starting.", author: "Carlos M.", role: "Mechanic, 28 yrs" },
        ]
      },
      { 
        segment: "Influencers", emoji: "📱", pain: "Perfect production standards pressure", severity: 83,
        metrics: { videosPerWeek: 8, audiosPerMonth: 20, editsPerWeek: 15, hoursPerWeek: 20, toolCost: "$400/mo" },
        voc: [
          { quote: "Gym recordings need perfect lighting and no background noise. I have scrapped hours of footage.", author: "Alex T.", role: "Instagram @AlexFitness, 1.5M" },
          { quote: "Try filming while your hands are covered in grease. The technical side is a nightmare.", author: "Robert M.", role: "Facebook DIY Home Repairs, 520K" },
        ]
      },
    ],
  },
  {
    step: 5,
    title: "Editing & Assembly",
    icon: Layers,
    product: {
      name: "Genie Vibe",
      tagline: "Script to Screen",
      emoji: "🎬",
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    before: { 
      time: "4-10 hours", 
      timePercent: 35,
      cost: "$100-250",
      tools: "Premiere + After Effects + Canva", 
      pain: "Steep learning curve, render times",
      output: "1 edited video"
    },
    after: { 
      time: "30 min", 
      tools: "Genie Vibe", 
      wow: "Multi-track editing, real-time effects & auto-captions",
      output: "Platform-ready video"
    },
    criticalPain: true,
    timeWasted: "92%",
    segmentPains: [
      { 
        segment: "Content Creators", emoji: "🎬", pain: "Hours lost to timeline tweaking", severity: 88,
        metrics: { videosPerWeek: 3, audiosPerMonth: 12, editsPerWeek: 8, hoursPerWeek: 20, toolCost: "$60/mo" },
        voc: [
          { quote: "Same video, 4 different aspect ratios. I make it 4 times.", author: "Priya S.", role: "Fashion, 780K" },
          { quote: "Color grading, sound design, motion graphics - each is a full-time job.", author: "James R.", role: "Tech, 1.2M" },
        ]
      },
      { 
        segment: "Corporate L&D", emoji: "🏢", pain: "Revision cycles with stakeholders", severity: 84,
        metrics: { videosPerWeek: 1, audiosPerMonth: 4, editsPerWeek: 5, hoursPerWeek: 12, toolCost: "$400/mo" },
        voc: [
          { quote: "Client wants one word changed. Thats 4 hours of re-rendering.", author: "Marcus T.", role: "Creative Director" },
          { quote: "7 stakeholders, 7 rounds of revisions, 7 weeks of delays.", author: "L&D Producer", role: "Fortune 500" },
        ]
      },
      { 
        segment: "Marketing Teams", emoji: "📈", pain: "Multi-format export nightmare", severity: 91,
        metrics: { videosPerWeek: 4, audiosPerMonth: 16, editsPerWeek: 12, hoursPerWeek: 25, toolCost: "$200/mo" },
        voc: [
          { quote: "Exporting for YouTube, TikTok, LinkedIn, Instagram... each has different specs.", author: "Amy W.", role: "Social Media Mgr" },
          { quote: "We have a full-time person just for format conversions.", author: "Video Team Lead", role: "Agency" },
        ]
      },
      { 
        segment: "Healthcare", emoji: "🏥", pain: "Annotation accuracy for medical content", severity: 87,
        metrics: { videosPerWeek: 1, audiosPerMonth: 2, editsPerWeek: 2, hoursPerWeek: 10, toolCost: "$600/mo" },
        voc: [
          { quote: "Medical annotations must be precise. One error could harm patients.", author: "Clinical Educator", role: "Hospital" },
          { quote: "Accessibility requirements for medical content are complex.", author: "Health Comms", role: "NHS" },
        ]
      },
      { 
        segment: "Educators", emoji: "📚", pain: "Accessibility requirements (captions, etc.)", severity: 72,
        metrics: { videosPerWeek: 3, audiosPerMonth: 8, editsPerWeek: 5, hoursPerWeek: 10, toolCost: "$80/mo" },
        voc: [
          { quote: "I spend more time on captions than on actual content.", author: "Linda C.", role: "Online Instructor" },
          { quote: "Accessibility compliance adds 2 hours per video minimum.", author: "Special Ed Teacher", role: "K-12" },
        ]
      },
      { 
        segment: "Knowledge Sharers", emoji: "💡", pain: "No video editing skills at all", severity: 98,
        metrics: { videosPerWeek: 0, audiosPerMonth: 0, editsPerWeek: 0, hoursPerWeek: 0, toolCost: "$0" },
        voc: [
          { quote: "I am a world-class mechanic, not a video editor. Learning Premiere would take months.", author: "Carlos M.", role: "ASE Certified" },
          { quote: "I teach Excel to 10,000 students but cannot figure out video editing software.", author: "Susan P.", role: "Accountant" },
        ]
      },
      { 
        segment: "Influencers", emoji: "📱", pain: "Multi-format repurposing nightmare", severity: 90,
        metrics: { videosPerWeek: 8, audiosPerMonth: 20, editsPerWeek: 25, hoursPerWeek: 30, toolCost: "$300/mo" },
        voc: [
          { quote: "Same video, 4 different aspect ratios. I am essentially making it 4 times. It is exhausting.", author: "Priya S.", role: "Instagram @PriyaFashionista, 780K" },
          { quote: "I spend more time on captions and text overlays than on actual cooking.", author: "Linda C.", role: "Facebook Cooking with Linda, 340K" },
        ]
      },
    ],
  },
  {
    step: 6,
    title: "Production Pipeline & Collaboration",
    icon: Users,
    product: {
      name: "Genie Arc",
      tagline: "Your Production Journey With Infinite Possibilities",
      emoji: "🎯",
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    before: { 
      time: "2-4 hours", 
      timePercent: 15,
      cost: "$50-100",
      tools: "Slack + Trello + Frame.io + Email chains", 
      pain: "Scattered feedback, version confusion",
      output: "Approved final cut"
    },
    after: { 
      time: "15 min", 
      tools: "Genie Arc", 
      wow: "Team collaboration, resource management & live coordination",
      output: "Streamlined approval workflow"
    },
    criticalPain: false,
    timeWasted: "88%",
    segmentPains: [
      { 
        segment: "Content Creators", emoji: "🎬", pain: "Managing client feedback chaos", severity: 72,
        metrics: { videosPerWeek: 3, audiosPerMonth: 12, editsPerWeek: 6, hoursPerWeek: 4, toolCost: "$50/mo" },
        voc: [
          { quote: "Feedback comes through 5 different channels. I miss half of it.", author: "Marcus T.", role: "Creative Director" },
          { quote: "I coordinate editor, designer, SEO person - thats a part-time job.", author: "James R.", role: "YouTube, 1.2M" },
        ]
      },
      { 
        segment: "Corporate L&D", emoji: "🏢", pain: "Stakeholder alignment across departments", severity: 85,
        metrics: { videosPerWeek: 1, audiosPerMonth: 4, editsPerWeek: 3, hoursPerWeek: 8, toolCost: "$300/mo" },
        voc: [
          { quote: "Legal, compliance, marketing all need to sign off. Nightmare to coordinate.", author: "Michael R.", role: "L&D Director" },
          { quote: "Approval chains take 3 weeks. Content is stale by then.", author: "Karen L.", role: "Training Mgr" },
        ]
      },
      { 
        segment: "Marketing Teams", emoji: "📈", pain: "Campaign coordination across teams", severity: 80,
        metrics: { videosPerWeek: 4, audiosPerMonth: 16, editsPerWeek: 8, hoursPerWeek: 10, toolCost: "$400/mo" },
        voc: [
          { quote: "Creative, media, analytics teams never align on timelines.", author: "Campaign Manager", role: "Brand" },
          { quote: "8 different tools just to stay coordinated with my team of 6.", author: "Derek W.", role: "TikTok, 5.8M" },
        ]
      },
      { 
        segment: "Healthcare", emoji: "🏥", pain: "Multi-department compliance review", severity: 90,
        metrics: { videosPerWeek: 1, audiosPerMonth: 2, editsPerWeek: 2, hoursPerWeek: 6, toolCost: "$500/mo" },
        voc: [
          { quote: "Compliance review queue is 8 weeks deep.", author: "Health Educator", role: "Community Health" },
          { quote: "5 departments must approve before we can publish anything.", author: "Communications Dir", role: "Hospital" },
        ]
      },
      { 
        segment: "Educators", emoji: "📚", pain: "Peer review and feedback integration", severity: 60,
        metrics: { videosPerWeek: 3, audiosPerMonth: 8, editsPerWeek: 4, hoursPerWeek: 3, toolCost: "$30/mo" },
        voc: [
          { quote: "Department head wants changes after everything is final.", author: "Assoc Professor", role: "University" },
          { quote: "Getting feedback from other faculty takes weeks.", author: "Course Designer", role: "Online Ed" },
        ]
      },
      { 
        segment: "Knowledge Sharers", emoji: "💡", pain: "No team, doing everything solo", severity: 65,
        metrics: { videosPerWeek: 0, audiosPerMonth: 0, editsPerWeek: 0, hoursPerWeek: 0, toolCost: "$0" },
        voc: [
          { quote: "I work alone. Hiring a team would cost more than I make.", author: "Sarah K.", role: "Creator, 250K" },
          { quote: "Solo creator means every mistake is mine to fix.", author: "George P.", role: "Retired Teacher" },
        ]
      },
      { 
        segment: "Influencers", emoji: "📱", pain: "Team coordination across tools", severity: 80,
        metrics: { videosPerWeek: 8, audiosPerMonth: 20, editsPerWeek: 15, hoursPerWeek: 12, toolCost: "$600/mo" },
        voc: [
          { quote: "I have an editor, thumbnail designer, and SEO person. Coordinating them is a part-time job.", author: "James R.", role: "YouTube @TechReviewPro, 1.2M" },
          { quote: "My team is 6 people. We use 8 different tools just to stay coordinated.", author: "Derek W.", role: "TikTok @ComedyKingDerek, 5.8M" },
        ]
      },
    ],
  },
  {
    step: 7,
    title: "Distribution & Publishing",
    icon: Globe,
    product: {
      name: "Genie Arc",
      tagline: "Your Production Journey With Infinite Possibilities",
      emoji: "🎯",
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    before: { 
      time: "1-2 hours", 
      timePercent: 7,
      cost: "$25-50",
      tools: "Hootsuite + YouTube Studio + Manual uploads", 
      pain: "Format conversion nightmare",
      output: "1-2 platforms"
    },
    after: { 
      time: "2 min", 
      tools: "Genie Arc", 
      wow: "Show scheduling, resource management & multi-platform publish",
      output: "6+ platforms"
    },
    criticalPain: false,
    timeWasted: "96%",
    segmentPains: [
      { 
        segment: "Content Creators", emoji: "🎬", pain: "Algorithm-specific optimization", severity: 74,
        metrics: { videosPerWeek: 3, audiosPerMonth: 12, editsPerWeek: 4, hoursPerWeek: 3, toolCost: "$50/mo" },
        voc: [
          { quote: "Shorts, Reels, TikToks all want different hooks. Same video, 3 intros.", author: "James R.", role: "YouTube, 1.2M" },
          { quote: "I hired a VA just for uploads. Thats $1,500/month for publishing.", author: "Derek W.", role: "TikTok, 5.8M" },
        ]
      },
      { 
        segment: "Corporate L&D", emoji: "🏢", pain: "LMS integration complexity", severity: 79,
        metrics: { videosPerWeek: 1, audiosPerMonth: 4, editsPerWeek: 2, hoursPerWeek: 4, toolCost: "$200/mo" },
        voc: [
          { quote: "Our LMS does not accept standard video formats. Re-encoding takes hours.", author: "Training Manager", role: "Fortune 500" },
          { quote: "SCORM compliance adds another week to every project.", author: "L&D Tech Lead", role: "Enterprise" },
        ]
      },
      { 
        segment: "Marketing Teams", emoji: "📈", pain: "Cross-platform scheduling", severity: 77,
        metrics: { videosPerWeek: 4, audiosPerMonth: 16, editsPerWeek: 6, hoursPerWeek: 5, toolCost: "$300/mo" },
        voc: [
          { quote: "Upload to YouTube, TikTok, Instagram, LinkedIn... each with different specs.", author: "Amy W.", role: "Social Media Coord" },
          { quote: "Campaign timing across 8 platforms is impossible to coordinate.", author: "Digital Marketing Mgr", role: "Agency" },
        ]
      },
      { 
        segment: "Healthcare", emoji: "🏥", pain: "Compliance verification before publish", severity: 93,
        metrics: { videosPerWeek: 1, audiosPerMonth: 2, editsPerWeek: 1, hoursPerWeek: 3, toolCost: "$400/mo" },
        voc: [
          { quote: "Every video needs final compliance stamp before going live.", author: "Regulatory Affairs", role: "Pharma" },
          { quote: "Wrong information published could cost lives and lawsuits.", author: "CMO", role: "Health System" },
        ]
      },
      { 
        segment: "Educators", emoji: "📚", pain: "Student access management", severity: 66,
        metrics: { videosPerWeek: 3, audiosPerMonth: 8, editsPerWeek: 3, hoursPerWeek: 2, toolCost: "$50/mo" },
        voc: [
          { quote: "Students cannot find videos. LMS organization is confusing.", author: "Online Instructor", role: "Coursera" },
          { quote: "Different access levels for different cohorts is a nightmare.", author: "Course Admin", role: "University" },
        ]
      },
      { 
        segment: "Knowledge Sharers", emoji: "💡", pain: "Do not know where to publish or how", severity: 91,
        metrics: { videosPerWeek: 0, audiosPerMonth: 0, editsPerWeek: 0, hoursPerWeek: 0, toolCost: "$0" },
        voc: [
          { quote: "I made amazing content but it got 12 views. I do not understand the algorithm.", author: "Tom H.", role: "Dev, JS expert" },
          { quote: "I just want my knowledge out there. The tech stuff stops me.", author: "George P.", role: "Retired, 40 yrs" },
        ]
      },
      { 
        segment: "Influencers", emoji: "📱", pain: "Multi-platform publishing overhead", severity: 88,
        metrics: { videosPerWeek: 8, audiosPerMonth: 20, editsPerWeek: 12, hoursPerWeek: 8, toolCost: "$350/mo" },
        voc: [
          { quote: "I hired a VA just to handle uploads and scheduling. Thats $1,500/month just for publishing.", author: "Derek W.", role: "TikTok @ComedyKingDerek, 5.8M" },
          { quote: "LinkedIn video requires a completely different tone. I am making 2 versions of everything.", author: "Rachel M.", role: "LinkedIn @HRInsights, 95K" },
        ]
      },
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

// Auto-scrolling VoC Component
const AutoScrollVoC: React.FC<{ 
  quotes: Array<{ quote: string; author: string; role: string }>;
  interval?: number;
}> = ({ quotes, interval = 4000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    if (isPaused || quotes.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, interval);
    return () => clearInterval(timer);
  }, [quotes.length, interval, isPaused]);

  if (!quotes || quotes.length === 0) return null;

  return (
    <div 
      className="relative h-full min-h-[140px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="h-full"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
            <MessageSquareQuote className="w-3 h-3" />
            Voice of Customer ({currentIndex + 1}/{quotes.length})
          </div>
          <p className="text-sm text-muted-foreground italic mb-3 line-clamp-3">
            &ldquo;{quotes[currentIndex].quote}&rdquo;
          </p>
          <div className="text-xs">
            <span className="font-medium text-foreground">{quotes[currentIndex].author}</span>
            <span className="text-muted-foreground"> • {quotes[currentIndex].role}</span>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Progress dots */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1.5 pt-2">
        {quotes.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrentIndex(idx)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              idx === currentIndex ? 'bg-primary w-3' : 'bg-muted hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>
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

// Horizontal Scroll Card Container
const HorizontalScrollCards: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <div className="relative group/scroll">
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 h-8 w-8 rounded-full opacity-0 group-hover/scroll:opacity-100 transition-opacity bg-background/90 shadow-lg"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent scroll-smooth"
        style={{ scrollbarWidth: 'thin' }}
      >
        {children}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 h-8 w-8 rounded-full opacity-0 group-hover/scroll:opacity-100 transition-opacity bg-background/90 shadow-lg"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const OverviewTab: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1920px] mx-auto space-y-8 p-6"
    >
      {/* Hero Problem Statement */}
      <motion.div variants={itemVariants} className="text-center py-4">
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
        
        <h2 className="text-3xl font-bold text-foreground mb-3">
          Creators waste{' '}
          <span className="text-primary">25+ hours per week</span>{' '}
          juggling fragmented tools
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          The average content professional uses <strong>8-12 disconnected applications</strong> to produce 
          a single piece of content, spending <strong>$270-615 per video</strong> in tool costs and labor.
        </p>
      </motion.div>

      {/* Compact Project Comparison */}
      <SectionWrapper title="Workflow Comparison" downloadFileName="workflow-comparison">
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-5 h-5 text-destructive" />
                <span className="font-semibold text-destructive">Traditional (1 Video)</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-background/50 rounded-lg p-2">
                  <div className="text-lg font-bold text-destructive">{projectMetrics.singleVideoTraditional.totalHours}</div>
                  <div className="text-[10px] text-muted-foreground">Time</div>
                </div>
                <div className="bg-background/50 rounded-lg p-2">
                  <div className="text-lg font-bold text-destructive">{projectMetrics.singleVideoTraditional.totalCost}</div>
                  <div className="text-[10px] text-muted-foreground">Cost</div>
                </div>
                <div className="bg-background/50 rounded-lg p-2">
                  <div className="text-lg font-bold text-foreground">{projectMetrics.singleVideoTraditional.toolsRequired}</div>
                  <div className="text-[10px] text-muted-foreground">Tools</div>
                </div>
                <div className="bg-background/50 rounded-lg p-2">
                  <div className="text-lg font-bold text-foreground">{projectMetrics.singleVideoTraditional.outputFormats}</div>
                  <div className="text-[10px] text-muted-foreground">Output</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-600">With Genie Suite (1 Video)</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-background/50 rounded-lg p-2">
                  <div className="text-lg font-bold text-green-600">{projectMetrics.singleVideoGenie.totalHours}</div>
                  <div className="text-[10px] text-muted-foreground">Time</div>
                </div>
                <div className="bg-background/50 rounded-lg p-2">
                  <div className="text-lg font-bold text-green-600">{projectMetrics.singleVideoGenie.totalCost}</div>
                  <div className="text-[10px] text-muted-foreground">Cost</div>
                </div>
                <div className="bg-background/50 rounded-lg p-2">
                  <div className="text-lg font-bold text-foreground">{projectMetrics.singleVideoGenie.toolsRequired}</div>
                  <div className="text-[10px] text-muted-foreground">Tools</div>
                </div>
                <div className="bg-background/50 rounded-lg p-2">
                  <div className="text-lg font-bold text-foreground">{projectMetrics.singleVideoGenie.outputFormats}+</div>
                  <div className="text-[10px] text-muted-foreground">Outputs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </SectionWrapper>

      {/* Market Stats - Compact */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {marketStats.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{item.stat}</div>
                  <div className="text-xs text-muted-foreground leading-tight mt-1">{item.label}</div>
                </div>
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-xs text-green-600 mt-2">{item.trend}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Content Creation Journey - Horizontal Scrollable Per Step */}
      <SectionWrapper title="Content Creation Journey" downloadFileName="content-creation-journey">
        <motion.div variants={itemVariants}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              Content Creation Journey
              <Badge variant="secondary" className="text-xs">Scroll horizontally →</Badge>
            </h3>
            {/* Product Legend */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 rounded-md">
                <span className="text-sm">✨</span>
                <span className="text-xs font-medium text-amber-600">Spark</span>
                <span className="text-[10px] text-muted-foreground">Ideation</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded-md">
                <span className="text-sm">🧠</span>
                <span className="text-xs font-medium text-blue-600">Mind</span>
                <span className="text-[10px] text-muted-foreground">Enhancement</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 rounded-md">
                <span className="text-sm">🎬</span>
                <span className="text-xs font-medium text-purple-600">Vibe</span>
                <span className="text-[10px] text-muted-foreground">Production</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-md">
                <span className="text-sm">🎯</span>
                <span className="text-xs font-medium text-emerald-600">Arc</span>
                <span className="text-[10px] text-muted-foreground">Workflow</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {journeySteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card className={step.criticalPain ? 'border-destructive/30' : ''}>
                  {/* Step Header */}
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-center gap-3">
                      {/* Product Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.product.bgColor}`}>
                        <span className="text-2xl">{step.product.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-base">Step {step.step}: {step.title}</CardTitle>
                          <Badge className={`text-[10px] ${step.product.bgColor} ${step.product.color} border-0`}>
                            {step.product.name}
                          </Badge>
                          {step.criticalPain && (
                            <Badge variant="destructive" className="text-[10px]">Critical Pain</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className={step.product.color}>"{step.product.tagline}"</span>
                          <span>•</span>
                          <span>{step.before.timePercent}% of time</span>
                          <span>•</span>
                          <span className="text-green-600">{step.timeWasted} saved</span>
                        </div>
                      </div>
                      {/* Before/After Quick Metrics */}
                      <div className="hidden lg:flex items-center gap-3">
                        <div className="text-center px-3 py-1 bg-destructive/10 rounded-lg">
                          <div className="text-sm font-bold text-destructive">{step.before.time}</div>
                          <div className="text-[9px] text-muted-foreground">Before</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className={`text-center px-3 py-1 ${step.product.bgColor} rounded-lg`}>
                          <div className={`text-sm font-bold ${step.product.color}`}>{step.after.time}</div>
                          <div className="text-[9px] text-muted-foreground">{step.product.name}</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="px-4 pb-4">
                    {/* Horizontal Scrollable Cards - Segments with nested VoC */}
                    <HorizontalScrollCards>
                      {/* Segment Cards with Pain, Metrics, and VoC inside */}
                      {step.segmentPains.map((segmentData, pIdx) => (
                        <div 
                          key={pIdx}
                          className="flex-shrink-0 w-[340px] bg-muted/30 rounded-xl border border-border overflow-hidden"
                        >
                          {/* Segment Header */}
                          <div className="bg-amber-500/10 px-4 py-3 border-b border-amber-500/20">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{segmentData.emoji}</span>
                              <span className="font-semibold text-sm text-foreground">{segmentData.segment}</span>
                              <Badge 
                                variant="outline" 
                                className={`ml-auto text-[10px] ${
                                  segmentData.severity >= 90 ? "border-destructive text-destructive" : 
                                  segmentData.severity >= 75 ? "border-amber-500 text-amber-600" : 
                                  "border-muted-foreground"
                                }`}
                              >
                                {segmentData.severity}%
                              </Badge>
                            </div>
                            <div className="flex items-start gap-2 mt-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-muted-foreground">{segmentData.pain}</p>
                            </div>
                          </div>
                          
                          {/* Metrics Grid */}
                          <div className="px-3 py-2 bg-background/50 border-b border-border">
                            <div className="grid grid-cols-5 gap-1 text-center">
                              <div>
                                <div className="text-xs font-bold text-foreground">{segmentData.metrics.videosPerWeek}</div>
                                <div className="text-[8px] text-muted-foreground">vid/wk</div>
                              </div>
                              <div>
                                <div className="text-xs font-bold text-foreground">{segmentData.metrics.audiosPerMonth}</div>
                                <div className="text-[8px] text-muted-foreground">aud/mo</div>
                              </div>
                              <div>
                                <div className="text-xs font-bold text-foreground">{segmentData.metrics.editsPerWeek}</div>
                                <div className="text-[8px] text-muted-foreground">edits/wk</div>
                              </div>
                              <div>
                                <div className="text-xs font-bold text-destructive">{segmentData.metrics.hoursPerWeek}h</div>
                                <div className="text-[8px] text-muted-foreground">hrs/wk</div>
                              </div>
                              <div>
                                <div className="text-xs font-bold text-green-600">{segmentData.metrics.toolCost}</div>
                                <div className="text-[8px] text-muted-foreground">tools</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* VoC Section - Auto Scroll */}
                          <div className="p-3">
                            <div className="text-[10px] font-medium text-primary mb-2 flex items-center gap-1">
                              <MessageSquareQuote className="w-3 h-3" />
                              Voice of Customer
                            </div>
                            <AutoScrollVoC quotes={segmentData.voc} interval={5000} />
                          </div>
                        </div>
                      ))}

                    </HorizontalScrollCards>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </SectionWrapper>

      {/* The Ignored Experts - Compact Grid */}
      <SectionWrapper title="Knowledge Sharers" downloadFileName="knowledge-sharers">
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </div>
              The Ignored Experts: Knowledge Trapped by Technology
            </h3>
            <Badge variant="outline" className="border-amber-500/30 text-amber-600">
              $40B+ untapped market
            </Badge>
          </div>

          <HorizontalScrollCards>
            {knowledgeSharers.map((group, index) => (
              <div 
                key={group.type}
                className={`flex-shrink-0 w-[340px] ${group.bgColor} rounded-xl p-4 border border-${group.color.replace('text-', '')}/20`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${group.bgColor} flex items-center justify-center`}>
                    <group.icon className={`w-5 h-5 ${group.color}`} />
                  </div>
                  <div>
                    <div className={`font-semibold ${group.color}`}>{group.type}</div>
                    <div className="text-xs text-muted-foreground">{group.avgExperience} experience</div>
                  </div>
                  <Badge variant="destructive" className="ml-auto text-[10px]">{group.frustration}%</Badge>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {group.blockers.slice(0, 3).map((blocker, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px] border-destructive/30 text-destructive">
                      {blocker}
                    </Badge>
                  ))}
                </div>

                <div className="bg-background/50 rounded-lg p-3 mb-3">
                  <AutoScrollVoC 
                    quotes={group.profiles.map(p => ({
                      quote: p.quote,
                      author: p.name,
                      role: `${p.specialty}, ${p.exp}`
                    }))}
                    interval={6000}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-600">{group.marketOpportunity}</span>
                </div>
              </div>
            ))}
          </HorizontalScrollCards>

          {/* Key Insight */}
          <Card className="mt-4 border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-foreground">Knowledge Barrier Crisis:</span>
                </div>
                <div className="flex gap-6 flex-wrap">
                  <div className="text-center">
                    <div className="text-xl font-bold text-destructive">89%</div>
                    <div className="text-[10px] text-muted-foreground">experts never create video</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-600">$40B+</div>
                    <div className="text-[10px] text-muted-foreground">untapped market</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">Genie</div>
                    <div className="text-[10px] text-muted-foreground">removes the barrier</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </SectionWrapper>

      {/* Solution Summary - Compact */}
      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Target className="w-7 h-7 text-primary-foreground" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Genie Suite: One Platform, Complete Workflow
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    From idea to published content in minutes, not days.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 bg-background/50 rounded-xl">
                  <div className="text-xl font-bold text-primary">289</div>
                  <div className="text-[10px] text-muted-foreground">Scenarios</div>
                </div>
                <div className="text-center px-4 py-2 bg-background/50 rounded-xl">
                  <div className="text-xl font-bold text-primary">6</div>
                  <div className="text-[10px] text-muted-foreground">Products</div>
                </div>
                <div className="text-center px-4 py-2 bg-background/50 rounded-xl">
                  <div className="text-xl font-bold text-primary">90%</div>
                  <div className="text-[10px] text-muted-foreground">Time Saved</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
