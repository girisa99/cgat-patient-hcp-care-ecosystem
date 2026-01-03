/**
 * Genie Studio - Professional Media Production Hub
 * Unified dashboard for video recording, voice generation, and content creation
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Video, 
  Mic, 
  FileText, 
  Play, 
  Pause,
  Sparkles, 
  Wand2,
  Library,
  Clock,
  Zap,
  Music,
  Download,
  Trash2,
  Layers,
  Film,
  Headphones,
  PenTool,
  Cpu,
  TrendingUp,
  Loader2,
  Upload,
  Check,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Copy,
  Plus,
  RefreshCw,
  Radio,
  Podcast,
  Tv,
  Send,
  Users,
  Calendar,
  Mail,
  UserPlus,
  X,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecordingStudio } from '@/components/document-processing/RecordingStudio';
import { toast } from 'sonner';
import { useTTSGeneration, OPENAI_VOICES, ELEVENLABS_VOICES } from '@/components/document-processing/RecordingStudio/hooks/useTTSGeneration';
import { useMediaProject } from '@/components/document-processing/RecordingStudio/hooks/useMediaProject';
import { ScriptEditorTab } from '@/components/genie-studio/ScriptEditorTab';
import { SavedAudioCard } from '@/components/genie-studio/SavedAudioCard';
import { useGenieMediaLibrary } from '@/components/genie-studio/useGenieMediaLibrary';
import { useGenieScripts, type GenieScript } from '@/components/genie-studio/useGenieScripts';
import { supabase } from '@/integrations/supabase/client';

// Types for media items
interface MediaItem {
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
interface SavedScript {
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

// Types for shows/events
interface ShowEvent {
  id: string;
  type: 'podcast' | 'webcast' | 'broadcast';
  title: string;
  description: string;
  scheduledDate: Date;
  participants: Participant[];
  scriptId?: string;
  scriptContent?: string;
  hostName?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
}

interface Participant {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'co-host' | 'guest' | 'panelist';
  status: 'pending' | 'confirmed' | 'declined';
}

// Script Templates
const SCRIPT_TEMPLATES = [
  {
    id: 'product-demo',
    name: 'Product Demo',
    description: 'Showcase your product features',
    category: 'Marketing',
    type: 'video' as const,
    content: `Welcome to [Product Name]! 

Today, I'll walk you through the key features that make our solution stand out.

First, let's look at [Feature 1]. This allows you to [benefit 1], saving you time and effort.

Next, [Feature 2] enables [benefit 2]. Watch how easy it is to [action].

Finally, [Feature 3] gives you [benefit 3], ensuring you get the most value.

Ready to get started? Click the link below to try it free today!`
  },
  {
    id: 'tutorial',
    name: 'Tutorial / How-To',
    description: 'Step-by-step educational content',
    category: 'Education',
    type: 'video' as const,
    content: `Hey everyone! In this tutorial, I'll show you how to [topic].

By the end of this video, you'll be able to [outcome].

Let's dive in!

Step 1: [First action]
Start by [detailed instruction]. This is important because [reason].

Step 2: [Second action]
Now, [detailed instruction]. You'll notice that [observation].

Step 3: [Third action]
Finally, [detailed instruction]. And that's it!

If you found this helpful, don't forget to subscribe for more tutorials!`
  },
  {
    id: 'announcement',
    name: 'Announcement',
    description: 'Share news or updates',
    category: 'Corporate',
    type: 'video' as const,
    content: `We're excited to announce [news/update]!

After [timeframe/effort], we're proud to share that [details].

This means [impact/benefit] for our [customers/team/community].

Here's what you need to know:
• [Key point 1]
• [Key point 2]  
• [Key point 3]

[Next steps or call to action]

Thank you for your continued support!`
  },
  {
    id: 'explainer',
    name: 'Explainer Video',
    description: 'Explain complex topics simply',
    category: 'Education',
    type: 'video' as const,
    content: `Have you ever wondered how [topic] works?

Let me break it down for you in simple terms.

[Topic] is essentially [simple definition].

Think of it like [analogy]. When you [action], it [result].

The key thing to understand is [core concept].

This is important because [reason/impact].

Now you know the basics of [topic]! Have questions? Drop them in the comments.`
  },
  {
    id: 'testimonial',
    name: 'Customer Testimonial',
    description: 'Share customer success stories',
    category: 'Marketing',
    type: 'video' as const,
    content: `Before using [Product/Service], I was struggling with [problem].

I tried [previous solutions] but nothing worked.

Then I discovered [Product/Service] and everything changed.

Within [timeframe], I was able to [achievement].

The best part? [Favorite feature or benefit].

I highly recommend [Product/Service] to anyone dealing with [problem].

It's been a game-changer for my [business/life/workflow].`
  },
  // Podcast Template
  {
    id: 'podcast-episode',
    name: 'Podcast Episode',
    description: 'Full podcast episode structure',
    category: 'Podcast',
    type: 'podcast' as const,
    icon: Podcast,
    content: `# [Podcast Name] - Episode [Number]
## Topic: [Episode Topic]

---

### INTRO [0:00 - 2:00]

🎵 [Intro music plays]

HOST: Welcome back to [Podcast Name]! I'm your host, [Host Name], and today we're diving deep into [topic].

If you're new here, make sure to hit subscribe and leave us a review—it really helps us grow!

Today's episode is sponsored by [Sponsor Name]. [Brief sponsor message].

---

### GUEST INTRODUCTION [2:00 - 5:00]

HOST: I'm thrilled to welcome [Guest Name] to the show today. [Guest Name] is [brief bio/credentials].

[Guest Name], welcome to the show!

GUEST: Thanks for having me! I'm excited to be here.

HOST: Before we dive in, tell our listeners a bit about yourself and your journey.

GUEST: [Guest introduction/background]

---

### MAIN DISCUSSION [5:00 - 35:00]

HOST: Let's get into today's topic: [Topic].

**Question 1:** [First discussion point]
**Question 2:** [Second discussion point]  
**Question 3:** [Third discussion point]
**Question 4:** [Fourth discussion point]

---

### RAPID FIRE / FUN SEGMENT [35:00 - 40:00]

HOST: Now for our rapid-fire round! Quick answers only.

1. [Fun question 1]
2. [Fun question 2]
3. [Fun question 3]

---

### CLOSING [40:00 - 45:00]

HOST: [Guest Name], this has been incredible. Where can our listeners find you and learn more about your work?

GUEST: [Social media handles, website, etc.]

HOST: Amazing! Thank you so much for being here.

And to our listeners, thank you for tuning in! Don't forget to subscribe, leave a review, and share this episode with someone who needs to hear it.

Until next time, stay [podcast tagline]!

🎵 [Outro music plays]

---

### SHOW NOTES

**Episode Links:**
- [Guest's website/resource]
- [Mentioned resource 1]
- [Mentioned resource 2]

**Connect with us:**
- Website: [podcast website]
- Twitter: @[handle]
- Instagram: @[handle]`
  },
  // Webcast Template
  {
    id: 'webcast-webinar',
    name: 'Webcast / Webinar',
    description: 'Live webcast or webinar structure',
    category: 'Webcast',
    type: 'webcast' as const,
    icon: Tv,
    content: `# [Webcast Title]
## Live Event Script

**Date:** [Date]
**Time:** [Time with timezone]
**Platform:** [Zoom/Teams/YouTube Live/etc.]
**Duration:** [Expected duration]

---

### PRE-SHOW [10 min before]

TECH HOST: [Run tech checks]
- Audio levels ✓
- Screen sharing ✓
- Chat moderator ready ✓
- Recording started ✓

[Background music or holding slide displayed]

---

### OPENING [0:00 - 5:00]

HOST: Good [morning/afternoon/evening] everyone! Welcome to [Webcast Title].

I'm [Host Name], [your role/title], and I'll be your host today.

Before we begin:
• Please use the chat for questions—we'll have Q&A at the end
• This session is being recorded and will be shared afterward
• Feel free to [specific call to action]

Let me introduce today's [speakers/panelists]:
- [Speaker 1]: [Brief intro]
- [Speaker 2]: [Brief intro]
- [Speaker 3]: [Brief intro]

---

### AGENDA OVERVIEW [5:00 - 7:00]

HOST: Here's what we'll cover today:

1. [Topic 1] - [Duration]
2. [Topic 2] - [Duration]
3. [Topic 3] - [Duration]
4. Live Q&A - 15 minutes

---

### MAIN CONTENT [7:00 - 45:00]

**SECTION 1: [Topic 1]**
SPEAKER 1: [Content for section 1]

🖥️ [Slide: Key Visual]

Key points:
• [Point 1]
• [Point 2]
• [Point 3]

---

**SECTION 2: [Topic 2]**
SPEAKER 2: [Content for section 2]

🖥️ [Slide: Demo/Screenshot]

Live demonstration: [Description]

---

**SECTION 3: [Topic 3]**
SPEAKER 3: [Content for section 3]

---

### Q&A SESSION [45:00 - 55:00]

HOST: Now let's open it up for questions. [Moderator], what questions do we have?

MODERATOR: [Reads questions from chat]

[Allow 2-3 minutes per question]

---

### CLOSING [55:00 - 60:00]

HOST: We're at time! Thank you all for joining us today.

Key takeaways:
1. [Takeaway 1]
2. [Takeaway 2]
3. [Takeaway 3]

**Next steps:**
- Recording will be sent within 24 hours
- [Resource/follow-up link]
- Next webcast: [Date/Topic]

Thank you to our speakers and everyone who attended. Have a great [day/evening]!

---

### POST-SHOW

- Stop recording
- Export chat for follow-up
- Send thank you to speakers
- Schedule recording distribution`
  },
  // Broadcast Template
  {
    id: 'live-broadcast',
    name: 'Live Broadcast',
    description: 'Live streaming broadcast format',
    category: 'Broadcast',
    type: 'broadcast' as const,
    icon: Radio,
    content: `# [Broadcast Title] - LIVE
## Run of Show

**Broadcast Date:** [Date]
**Start Time:** [Time]
**Platform(s):** [YouTube/Twitch/LinkedIn/Facebook/etc.]
**Estimated Duration:** [Duration]

---

### TECHNICAL SETUP [-30 min]

☐ Stream settings configured (1080p, 6000kbps)
☐ Audio levels tested
☐ Camera angles checked
☐ Graphics/overlays loaded
☐ Chat moderation active
☐ Backup internet ready

---

### COUNTDOWN [-5 min]

🎵 [Countdown music/animation]

MODERATOR: "Going live in 5 minutes! Get your questions ready!"

---

### COLD OPEN [0:00]

🔴 LIVE

[Opening animation/graphic]

HOST: We're LIVE! Welcome everyone to [Broadcast Name]!

[Wait 30 seconds for viewers to join]

I see we've got viewers joining from [locations]. Drop where you're watching from in the chat!

---

### WELCOME SEGMENT [1:00 - 5:00]

HOST: For those new here, I'm [Name], and every [frequency] we [what you do on this broadcast].

Today's show is packed:
• [Segment 1 preview]
• [Segment 2 preview]  
• [Segment 3 preview]

Smash that like button if you're excited! Let's get into it.

---

### SEGMENT 1: [Title] [5:00 - 20:00]

HOST: First up, [segment description]...

🎥 [Camera angle/graphic change]

[Main content for segment]

💬 CHAT CHECK: "What do you think about [related question]?"

---

### SEGMENT 2: [Title] [20:00 - 35:00]

HOST: Moving on to [transition]...

[Guest/demo/discussion]

GUEST (if applicable): [Guest content]

---

### SEGMENT 3: [Title] [35:00 - 50:00]

HOST: Now for [segment description]...

[Interactive element: poll, Q&A, demo]

---

### LIVE Q&A [50:00 - 58:00]

HOST: Let's answer YOUR questions!

MODERATOR: [Feeds questions from chat]

[Answer 3-5 questions]

---

### CLOSING [58:00 - 60:00]

HOST: That's all we have time for today!

**QUICK RECAP:**
- [Key point 1]
- [Key point 2]
- [Key point 3]

**NEXT BROADCAST:** [Date/time/topic]

Don't forget to:
✓ Subscribe/Follow
✓ Ring the notification bell
✓ Share with someone who'd enjoy this

Thank you for watching! See you next time!

🔴 END STREAM

---

### POST-BROADCAST

- Review analytics
- Clip highlights for social
- Respond to unanswered questions
- Archive recording`
  },
  {
    id: 'podcast-interview',
    name: 'Interview Podcast',
    description: 'One-on-one interview format',
    category: 'Podcast',
    type: 'podcast' as const,
    icon: Podcast,
    content: `# Interview Episode: [Guest Name]

---

## PRE-INTERVIEW CHECKLIST

☐ Guest bio confirmed
☐ Recording software tested
☐ Backup recording ready
☐ Questions reviewed with guest
☐ Release form signed

---

## INTRO

HOST: Welcome to [Podcast Name]. I'm [Host], and today I have the privilege of speaking with [Guest Name], [their credentials/why they matter].

[Guest], thank you for being here.

GUEST: [Expected response/pleasantries]

---

## BACKGROUND [5 min]

HOST: Let's start at the beginning. Tell us about your journey—how did you get to where you are today?

[Follow-up questions based on response]

---

## DEEP DIVE [25 min]

HOST: Now, I want to explore [main topic]. Can you walk us through [specific aspect]?

**Key questions:**
1. [Question about their expertise]
2. [Question about challenges]
3. [Question about lessons learned]
4. [Question about future/what's next]

---

## RAPID ROUND [5 min]

HOST: Quick questions, first thing that comes to mind:

• Best advice you've received?
• Biggest mistake that taught you something?
• One book everyone should read?
• What would you tell your younger self?

---

## WRAP UP

HOST: This has been fantastic. Before we go, where can people find you?

GUEST: [Their handles/website/etc.]

HOST: Thank you so much for your time and insights. This was [Podcast Name]—see you next episode!`
  }
];

// Music genres with prompts
const MUSIC_GENRES = [
  { id: 'corporate', name: 'Corporate', prompt: 'Professional corporate background music, clean and modern, suitable for business presentations', color: 'blue' },
  { id: 'upbeat', name: 'Upbeat', prompt: 'Upbeat and energetic music, positive vibes, perfect for promotional content', color: 'orange' },
  { id: 'cinematic', name: 'Cinematic', prompt: 'Epic cinematic orchestral music with emotional depth, movie trailer style', color: 'purple' },
  { id: 'ambient', name: 'Ambient', prompt: 'Calm ambient soundscape, peaceful and relaxing, meditation style', color: 'green' },
  { id: 'motivational', name: 'Motivational', prompt: 'Inspiring motivational music with building energy, workout or achievement style', color: 'red' },
  { id: 'lofi', name: 'Lo-Fi', prompt: 'Chill lo-fi hip hop beats, relaxed and nostalgic, study music vibe', color: 'pink' },
  { id: 'electronic', name: 'Electronic', prompt: 'Modern electronic music with synths and beats, tech and innovation feel', color: 'cyan' },
  { id: 'acoustic', name: 'Acoustic', prompt: 'Warm acoustic guitar melody, natural and organic, coffeehouse atmosphere', color: 'amber' }
];

// Feature cards for the dashboard - Workflow order: Script → Voice → Music → Record
const FEATURES = [
  {
    id: 'productions',
    title: 'Production Hub',
    description: 'Manage podcast & webcast productions pipeline',
    icon: Layers,
    color: 'from-indigo-500 to-violet-500',
    badge: 'New',
    stats: { label: '6 Stages', value: 'Kanban' },
    tab: 'productions',
    isExternal: true,
    route: '/genie-studio/productions'
  },
  {
    id: 'script',
    title: 'Script Editor',
    description: 'Write & enhance scripts with AI assistance',
    icon: PenTool,
    color: 'from-blue-500 to-cyan-500',
    badge: null,
    stats: { label: 'AI Enhanced', value: 'Yes' },
    tab: 'script'
  },
  {
    id: 'voice',
    title: 'AI Voice Generator',
    description: 'Ultra-realistic voices with ElevenLabs & OpenAI',
    icon: Mic,
    color: 'from-purple-500 to-pink-500',
    badge: 'AI Powered',
    stats: { label: 'Voice Styles', value: '50+' },
    tab: 'voice'
  },
  {
    id: 'music',
    title: 'AI Music Studio',
    description: 'Generate background music & soundscapes',
    icon: Music,
    color: 'from-green-500 to-emerald-500',
    badge: 'New',
    stats: { label: 'Genres', value: '25+' },
    tab: 'music'
  },
  {
    id: 'record',
    title: 'Record Video',
    description: 'Camera, screen, or both with AI teleprompter',
    icon: Video,
    color: 'from-red-500 to-orange-500',
    badge: 'Popular',
    stats: { label: 'Quick Start', value: '< 10s' },
    tab: 'record'
  },
  {
    id: 'publish',
    title: 'Publish & Go Live',
    description: 'Podcast, webcast, or broadcast to your audience',
    icon: Radio,
    color: 'from-cyan-500 to-teal-500',
    badge: 'Coming Soon',
    stats: { label: 'Platforms', value: '10+' },
    tab: 'publish'
  }
];

// Quick Tips for Users - Updated for Production Hub workflow
const QUICK_TIPS = [
  { icon: Layers, title: '1. Create Production', text: 'Start in Production Hub - create podcast, webcast, or video project' },
  { icon: Users, title: '2. Outreach', text: 'Invite participants, hosts, and guests - track confirmations' },
  { icon: PenTool, title: '3. Write Script', text: 'Upload or write your script - AI enhance for clarity and engagement' },
  { icon: Music, title: '4. Add Music', text: 'Generate or upload background music (podcasts) or intro/outro music' },
  { icon: Video, title: '5. Record/Rehearse', text: 'Open Recording Studio with teleprompter - for webcasts, TTS preview available' },
  { icon: Film, title: '6. Post-Production', text: 'Edit, trim, and polish your recording in the studio' },
  { icon: Radio, title: '7. Publish', text: 'Go live with landing page and embeddable widget' }
];

// Custom hook to load media from localStorage
function useMediaLibrary() {
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [audios, setAudios] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMedia = () => {
    setIsLoading(true);
    try {
      const savedMedia = localStorage.getItem('recordedMedia');
      if (savedMedia) {
        const allMedia = JSON.parse(savedMedia);
        setVideos(allMedia.filter((m: any) => m.type === 'video').map((v: any, i: number) => ({
          id: v.id || `video-${i}`,
          name: v.name || `Video ${i + 1}`,
          type: 'video' as const,
          url: v.url,
          timestamp: v.timestamp || Date.now(),
          duration: v.duration,
          size: v.size
        })));
        
        const audioItems = allMedia.filter((m: any) => m.type === 'audio').map((a: any, i: number) => ({
          id: a.id || `audio-${i}`,
          name: a.name || `Audio ${i + 1}`,
          type: 'audio' as const,
          url: a.url,
          timestamp: a.timestamp || Date.now(),
          duration: a.duration,
          size: a.size
        }));
        setAudios(audioItems);
      }

      const generatedAudios = localStorage.getItem('generatedAudiosMetadata');
      if (generatedAudios) {
        const generated = JSON.parse(generatedAudios);
        const generatedItems: MediaItem[] = generated.map((a: any, i: number) => ({
          id: a.id || `gen-audio-${i}`,
          name: a.title || a.name || 'Generated Audio',
          type: 'audio' as const,
          url: a.audioUrl || a.url,
          timestamp: a.generatedAt ? new Date(a.generatedAt).getTime() : Date.now()
        }));
        setAudios(prev => [...prev, ...generatedItems]);
      }
    } catch (e) {
      console.error('Failed to load media library:', e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const deleteMedia = (id: string, type: 'video' | 'audio') => {
    try {
      const savedMedia = localStorage.getItem('recordedMedia');
      if (savedMedia) {
        const allMedia = JSON.parse(savedMedia);
        const filtered = allMedia.filter((m: any) => m.id !== id);
        localStorage.setItem('recordedMedia', JSON.stringify(filtered));
      }
      
      if (type === 'video') {
        setVideos(prev => prev.filter(v => v.id !== id));
      } else {
        setAudios(prev => prev.filter(a => a.id !== id));
      }
      toast.success(`${type === 'video' ? 'Video' : 'Audio'} deleted`);
    } catch (e) {
      toast.error('Failed to delete media');
    }
  };

  return { videos, audios, isLoading, loadMedia, deleteMedia };
}

// Custom hook for managing shows/events
function useShowEvents() {
  const [events, setEvents] = useState<ShowEvent[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('genieStudioEvents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEvents(parsed.map((e: any) => ({
          ...e,
          scheduledDate: new Date(e.scheduledDate)
        })));
      } catch (e) {
        console.error('Failed to load events:', e);
      }
    }
  }, []);

  const saveEvents = (newEvents: ShowEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('genieStudioEvents', JSON.stringify(newEvents));
  };

  const addEvent = (event: Omit<ShowEvent, 'id'>) => {
    const newEvent: ShowEvent = {
      ...event,
      id: crypto.randomUUID()
    };
    saveEvents([...events, newEvent]);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<ShowEvent>) => {
    const updated = events.map(e => e.id === id ? { ...e, ...updates } : e);
    saveEvents(updated);
  };

  const deleteEvent = (id: string) => {
    saveEvents(events.filter(e => e.id !== id));
  };

  const addParticipant = (eventId: string, participant: Omit<Participant, 'id'>) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      const newParticipant: Participant = {
        ...participant,
        id: crypto.randomUUID()
      };
      updateEvent(eventId, {
        participants: [...event.participants, newParticipant]
      });
      return newParticipant;
    }
    return null;
  };

  const upcomingEvents = events
    .filter(e => e.scheduledDate > new Date() && e.status === 'scheduled')
    .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

  return { events, upcomingEvents, addEvent, updateEvent, deleteEvent, addParticipant };
}

export default function GenieStudio() {
  const navigate = useNavigate();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Script Editor State
  const [scriptContent, setScriptContent] = useState('');
  const [scriptName, setScriptName] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Script Analysis State
  const [analysisResult, setAnalysisResult] = useState<{
    stats?: { wordCount: number; sentenceCount: number; estimatedDurationMinutes: number; readabilityScore: string };
    recommendations?: Array<{ id: string; type: string; severity: string; title: string; description: string; accepted: boolean | null }>;
  } | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Script Enhancement State
  const [enhancedScriptContent, setEnhancedScriptContent] = useState<string | null>(null);
  const [enhancementChanges, setEnhancementChanges] = useState<Array<{ id: string; type: string; original: string; enhanced: string; reason: string; accepted: boolean | null }>>([]);
  const [showEnhancementChanges, setShowEnhancementChanges] = useState(false);
  const [originalScriptContent, setOriginalScriptContent] = useState<string | null>(null);
  
  // File upload refs
  const voiceoverUploadRef = useRef<HTMLInputElement>(null);
  const musicUploadRef = useRef<HTMLInputElement>(null);
  const featuresScrollRef = useRef<HTMLDivElement>(null);
  
  // Publish Dialog State
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'elevenlabs'>('elevenlabs');
  const [selectedVoice, setSelectedVoice] = useState('');
  
  // Music Studio State
  const [musicPrompt, setMusicPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Show/Event State
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedEventForInvite, setSelectedEventForInvite] = useState<ShowEvent | null>(null);
  const [isCreateShowDialogOpen, setIsCreateShowDialogOpen] = useState(false);
  const [newShowType, setNewShowType] = useState<'podcast' | 'webcast' | 'broadcast'>('podcast');
  const [newShowTitle, setNewShowTitle] = useState('');
  const [newShowDescription, setNewShowDescription] = useState('');
  const [newShowDate, setNewShowDate] = useState('');
  const [newShowTime, setNewShowTime] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'host' | 'co-host' | 'guest' | 'panelist'>('guest');
  
  // New: Schedule Show with script, topics, and participants
  const [showTopics, setShowTopics] = useState('');
  const [showScript, setShowScript] = useState('');
  const [showParticipants, setShowParticipants] = useState<Omit<Participant, 'id'>[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestedTitle, setSuggestedTitle] = useState('');
  const [suggestedIntro, setSuggestedIntro] = useState('');
  const [scheduleStep, setScheduleStep] = useState<'details' | 'content' | 'participants'>('details');
  const [hostName, setHostName] = useState('');
  const [attachScriptToInvite, setAttachScriptToInvite] = useState(true);
  
  // Scripts from database (replaces localStorage)
  const {
    scripts: dbScripts,
    videoScripts,
    audioScripts,
    isLoading: isScriptsLoading,
    saveScript: saveDbScript,
    updateScript: updateDbScript,
    deleteScript: deleteDbScript,
    refresh: refreshScripts
  } = useGenieScripts();
  
  // Media projects from Recording Studio
  const { projects: mediaProjects, isLoading: isProjectsLoading } = useMediaProject();
  
  // Convert GenieScript to SavedScript format for compatibility
  const savedScripts: SavedScript[] = dbScripts.map(s => ({
    id: s.id,
    name: s.name,
    content: s.content,
    type: s.type,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    enhancedContent: s.enhancedContent || undefined,
    cleanContent: s.cleanContent || undefined,
    draftContent: s.draftContent || undefined,
    draftStatus: s.draftStatus || undefined,
    draftChanges: s.draftChanges || undefined,
    stats: s.stats || undefined,
    hasVoiceover: s.hasVoiceover,
    voiceoverId: s.voiceoverId || undefined,
  }));
  
  // Legacy localStorage for voiceovers and music (will merge with DB data)
  const [savedVoiceovers, setSavedVoiceovers] = useState<MediaItem[]>([]);
  const [savedMusic, setSavedMusic] = useState<MediaItem[]>([]);

  // Load voiceovers and music from localStorage (legacy support)
  useEffect(() => {
    try {
      const voiceovers = localStorage.getItem('genieStudioVoiceovers');
      if (voiceovers) setSavedVoiceovers(JSON.parse(voiceovers));
      
      const music = localStorage.getItem('genieStudioMusic');
      if (music) setSavedMusic(JSON.parse(music));
    } catch (e) {
      console.error('Failed to load saved content:', e);
    }
  }, []);

  // Save script to database
  const saveScript = async (script?: SavedScript) => {
    if (script) {
      await saveDbScript({
        name: script.name,
        content: script.content,
        type: script.type,
        enhancedContent: script.enhancedContent,
        cleanContent: script.cleanContent,
        draftContent: script.draftContent,
        draftStatus: script.draftStatus,
        draftChanges: script.draftChanges,
        stats: script.stats,
        hasVoiceover: script.hasVoiceover,
        voiceoverId: script.voiceoverId,
        id: script.id, // Pass ID for update
      });
      return;
    }
    
    // Legacy: if called without args, use the state values
    if (!scriptName.trim() || !scriptContent.trim()) {
      toast.error('Please add a name and content');
      return;
    }
    await saveDbScript({
      name: scriptName,
      content: scriptContent,
      type: 'video',
    });
  };
  
  // Update script in database
  const updateScript = async (id: string, updates: Partial<SavedScript>) => {
    await updateDbScript(id, {
      name: updates.name,
      content: updates.content,
      type: updates.type,
      enhancedContent: updates.enhancedContent,
      cleanContent: updates.cleanContent,
      draftContent: updates.draftContent,
      draftStatus: updates.draftStatus,
      draftChanges: updates.draftChanges,
      stats: updates.stats,
      hasVoiceover: updates.hasVoiceover,
      voiceoverId: updates.voiceoverId,
    });
  };

  const loadScript = (script: SavedScript) => {
    setScriptName(script.name);
    setScriptContent(script.content);
    toast.success(`Loaded "${script.name}"`);
  };

  // Delete script from database
  const deleteScript = async (id: string) => {
    await deleteDbScript(id);
  };

  // Save voiceover to database (generated_media table) - handles blob URLs and data URIs
  const saveVoiceover = async (
    url: string, 
    name: string, 
    audioBlob?: Blob,
    scriptMeta?: { originalScript?: string; scriptText?: string; scriptType?: string }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to save voiceovers');
        return;
      }
      
      const sanitizedName = name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniquePath = `voiceovers/${user.id}/${Date.now()}_${sanitizedName}.mp3`;
      
      let finalUrl = url;
      
      // If we have a blob, upload it to storage
      if (audioBlob) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('genie-media')
          .upload(uniquePath, audioBlob, {
            contentType: 'audio/mpeg',
            upsert: true
          });
          
        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error('Failed to upload audio file');
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('genie-media')
          .getPublicUrl(uniquePath);
          
        finalUrl = publicUrl;
      } else if (url.startsWith('data:') || url.startsWith('blob:')) {
        // Convert data URI or blob URL to actual blob and upload
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('genie-media')
            .upload(uniquePath, blob, {
              contentType: 'audio/mpeg',
              upsert: true
            });
            
          if (uploadError) {
            console.error('Storage upload error:', uploadError);
            throw new Error('Failed to upload audio file');
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('genie-media')
            .getPublicUrl(uniquePath);
            
          finalUrl = publicUrl;
        } catch (fetchErr) {
          console.error('Failed to fetch blob:', fetchErr);
          throw new Error('Failed to process audio data');
        }
      }
      
      const { error } = await supabase
        .from('generated_media')
        .insert({
          user_id: user.id,
          name,
          file_type: 'audio',
          file_url: finalUrl,
          source: 'tts',
          storage_bucket: 'genie-media',
          storage_path: uniquePath,
          metadata: { 
            type: 'voiceover', 
            uploadedAs: 'voiceover', 
            generatedAt: new Date().toISOString(),
            scriptText: scriptMeta?.scriptText,
            originalScript: scriptMeta?.originalScript,
            scriptType: scriptMeta?.scriptType || 'tts'
          }
        });
      
      if (error) throw error;
      
      toast.success('Voiceover saved to library!');
      refreshDbMedia();
    } catch (err) {
      console.error('Failed to save voiceover:', err);
      toast.error('Failed to save voiceover: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Save music track to database (generated_media table)
  const saveMusicTrack = async (url: string, name: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to save music');
        return;
      }
      
      // Generate a unique path for the file reference
      const uniquePath = `music/${user.id}/${Date.now()}_${name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const { error } = await supabase
        .from('generated_media')
        .insert({
          user_id: user.id,
          name,
          file_type: 'audio',
          file_url: url,
          source: 'upload',
          storage_bucket: 'genie-media',
          storage_path: uniquePath,
          metadata: { type: 'instrumental', uploadedAs: 'music' }
        });
      
      if (error) throw error;
      
      toast.success('Music saved!');
      refreshDbMedia();
    } catch (err) {
      console.error('Failed to save music:', err);
      toast.error('Failed to save music');
    }
  };
  
  // TTS Hook
  const { 
    isGenerating: isTTSGenerating, 
    lastResult: ttsResult, 
    generate: generateTTS, 
    play: playTTS, 
    stop: stopTTS,
    download: downloadTTS 
  } = useTTSGeneration();
  
  // Load real media from localStorage
  const { videos, audios, isLoading, loadMedia, deleteMedia } = useMediaLibrary();
  
  // Load media from database (voiceovers, music, TTS files)
  const { 
    instrumentalMusic: dbMusic, 
    ttsFiles: dbTtsFiles, 
    voiceovers: dbVoiceovers,
    customVoices: dbCustomVoices,
    isLoading: isDbLoading,
    refresh: refreshDbMedia 
  } = useGenieMediaLibrary();
  
  // Merge localStorage voiceovers with database voiceovers (DB takes priority)
  // Preserve metadata for proper categorization and teleprompter sync
  const mergedVoiceovers = [
    ...dbVoiceovers.map(v => ({
      id: v.id,
      name: v.name,
      type: 'audio' as const,
      url: v.url,
      timestamp: v.timestamp || Date.now(),
      scriptText: v.scriptText,
      originalScript: v.originalScript,
      scriptType: v.scriptType,
      metadataType: v.metadataType
    })),
    ...dbTtsFiles.map(v => ({
      id: v.id,
      name: v.name,
      type: 'audio' as const,
      url: v.url,
      timestamp: v.timestamp || Date.now(),
      scriptText: v.scriptText,
      originalScript: v.originalScript,
      scriptType: v.scriptType,
      metadataType: v.metadataType || 'tts'
    })),
    ...savedVoiceovers.filter(sv => 
      !dbVoiceovers.some(dv => dv.id === sv.id) && 
      !dbTtsFiles.some(dv => dv.id === sv.id)
    )
  ];
  
  // Merge localStorage music with database instrumental files
  const mergedMusic = [
    ...dbMusic.map(m => ({
      id: m.id,
      name: m.name,
      type: 'audio' as const,
      url: m.url,
      timestamp: Date.now()
    })),
    ...savedMusic.filter(sm => !dbMusic.some(dm => dm.id === sm.id))
  ];
  
  // Show events
  const { events, upcomingEvents, addEvent, updateEvent, deleteEvent, addParticipant } = useShowEvents();

  // Set default voice when provider changes
  useEffect(() => {
    if (selectedProvider === 'openai') {
      setSelectedVoice(OPENAI_VOICES[0].value);
    } else {
      setSelectedVoice(ELEVENLABS_VOICES[0].value);
    }
  }, [selectedProvider]);

  const handleStudioClose = () => {
    setIsStudioOpen(false);
    loadMedia();
    refreshDbMedia(); // Refresh database audio files
    refreshScripts(); // Refresh scripts from database
  };

  const handleFeatureClick = (featureId: string) => {
    if (featureId === 'productions') {
      navigate('/genie-studio/productions');
    } else if (featureId === 'record') {
      setIsStudioOpen(true);
    } else if (featureId === 'voice') {
      setActiveTab('voice-generator');
    } else if (featureId === 'script') {
      setActiveTab('script-editor');
    } else if (featureId === 'music') {
      setActiveTab('music-studio');
    } else if (featureId === 'publish') {
      setIsPublishDialogOpen(true);
    }
  };

  // Scroll features cards
  const scrollFeatures = (direction: 'left' | 'right') => {
    if (featuresScrollRef.current) {
      const scrollAmount = 300;
      featuresScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Script Editor Functions
  const calculateReadingTime = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 150);
    return { words, minutes };
  };

  const handleNewScript = () => {
    setScriptContent('');
    setScriptName('');
    setAnalysisResult(null);
    setShowAnalysis(false);
    setEnhancedScriptContent(null);
    setEnhancementChanges([]);
    setShowEnhancementChanges(false);
    setOriginalScriptContent(null);
    toast.success('Ready for a new script!');
  };

  // Script Analysis - AI powered
  const handleAnalyzeScript = async () => {
    if (!scriptContent.trim()) {
      toast.error('Please write some content first');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-script', {
        body: { scriptContent, mode: 'analyze' }
      });
      
      if (error) throw error;
      
      if (data?.stats || data?.recommendations) {
        const recs = (data.recommendations || []).map((r: any, i: number) => ({
          id: `rec-${i}`,
          type: r.type || 'readability',
          severity: r.severity || 'info',
          title: r.title,
          description: r.description,
          accepted: null
        }));
        
        setAnalysisResult({
          stats: data.stats,
          recommendations: recs
        });
        setShowAnalysis(true);
        toast.success('Script analyzed!');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('Failed to analyze script');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Script Enhancement - with change tracking
  const handleEnhanceScript = async () => {
    if (!scriptContent.trim()) {
      toast.error('Please write some content first');
      return;
    }
    
    setOriginalScriptContent(scriptContent);
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-script', {
        body: { scriptContent, mode: 'enhance' }
      });
      
      if (error) throw error;
      
      if (data?.enhancedScript) {
        setEnhancedScriptContent(data.enhancedScript);
        
        // Parse changes if provided
        if (data.changes && Array.isArray(data.changes)) {
          setEnhancementChanges(data.changes.map((c: any, i: number) => ({
            id: `change-${i}`,
            type: c.type || 'modification',
            original: c.original || '',
            enhanced: c.enhanced || '',
            reason: c.reason || 'AI improvement',
            accepted: null
          })));
        } else {
          // Generate simple diff
          const origWords = scriptContent.split(/\s+/).length;
          const enhWords = data.enhancedScript.split(/\s+/).length;
          setEnhancementChanges([{
            id: 'change-summary',
            type: 'modification',
            original: `${origWords} words`,
            enhanced: `${enhWords} words`,
            reason: 'Script enhanced for clarity and engagement',
            accepted: null
          }]);
        }
        
        setShowEnhancementChanges(true);
        toast.success('Script enhanced! Review the changes below.');
      }
    } catch (err) {
      console.error('Enhancement error:', err);
      toast.error('Failed to enhance script');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAcceptAllEnhancements = () => {
    if (enhancedScriptContent) {
      setScriptContent(enhancedScriptContent);
      setEnhancementChanges([]);
      setShowEnhancementChanges(false);
      setEnhancedScriptContent(null);
      toast.success('All enhancements applied!');
    }
  };

  const handleRejectAllEnhancements = () => {
    setEnhancementChanges([]);
    setShowEnhancementChanges(false);
    setEnhancedScriptContent(null);
    toast.info('Enhancements rejected');
  };

  const handleRevertToOriginal = () => {
    if (originalScriptContent) {
      setScriptContent(originalScriptContent);
      setOriginalScriptContent(null);
      toast.success('Reverted to original');
    }
  };

  // Generate TTS from full script
  const handleGenerateFullTTS = async () => {
    if (!scriptContent.trim()) {
      toast.error('Please write some content first');
      return;
    }
    
    const result = await generateTTS({
      provider: selectedProvider,
      voice: selectedVoice || (selectedProvider === 'openai' ? 'alloy' : 'EXAVITQu4vr4xnSDxMaL'),
      text: scriptContent
    });
    
    if (result) {
      playTTS();
      toast.success('Full script TTS generated! Save it to use in recording.');
    }
  };

  const handleScriptTTSPreview = async () => {
    if (!scriptContent.trim()) {
      toast.error('Please write some content first');
      return;
    }
    
    const previewText = scriptContent.slice(0, 500);
    const result = await generateTTS({
      provider: selectedProvider,
      voice: selectedVoice || (selectedProvider === 'openai' ? 'alloy' : 'EXAVITQu4vr4xnSDxMaL'),
      text: previewText
    });
    
    if (result) {
      playTTS();
    }
  };

  const handleLoadTemplate = (template: typeof SCRIPT_TEMPLATES[0]) => {
    setScriptContent(template.content);
    setScriptName(template.name);
    setActiveTab('script-editor');
    toast.success(`Loaded "${template.name}" template`);
  };

  // Upload handlers
  const handleUploadVoiceover = async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      saveVoiceover(url, file.name);
    } catch (err) {
      toast.error('Failed to upload voiceover');
    }
  };

  const handleUploadMusic = async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      saveMusicTrack(url, file.name);
    } catch (err) {
      toast.error('Failed to upload music');
    }
  };

  // Voice Generator Functions
  const handleGenerateVoice = async () => {
    if (!voiceText.trim()) {
      toast.error('Please enter text to generate');
      return;
    }
    
    const result = await generateTTS({
      provider: selectedProvider,
      voice: selectedVoice,
      text: voiceText
    });
    
    if (result) {
      playTTS();
    }
  };

  // Music Studio Functions
  const handleGenreSelect = (genre: typeof MUSIC_GENRES[0]) => {
    setSelectedGenre(genre.id);
    setMusicPrompt(genre.prompt);
  };

  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim()) {
      toast.error('Please describe the music you want');
      return;
    }
    
    setIsGeneratingMusic(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-music`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt: musicPrompt,
            duration: 30
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Music generation failed');
      }

      const data = await response.json();
      
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      setGeneratedMusicUrl(audioUrl);
      
      if (musicAudioRef.current) {
        musicAudioRef.current.src = audioUrl;
        musicAudioRef.current.play();
      }
      
      toast.success('Music generated!');
    } catch (err) {
      console.error('Music generation error:', err);
      toast.error('Failed to generate music. Make sure ELEVENLABS_API_KEY is configured.');
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // Show/Event Functions
  const handleGenerateSuggestions = async () => {
    if (!showTopics.trim() && !showScript.trim()) {
      toast.error('Please add topics or upload a script first');
      return;
    }
    
    setIsGeneratingSuggestions(true);
    try {
      const contentForAI = showScript.trim() || showTopics.trim();
      const showTypeLabel = newShowType === 'podcast' ? 'Podcast Episode' : 
                           newShowType === 'webcast' ? 'Webcast/Webinar' : 'Live Broadcast';
      
      const { data, error } = await supabase.functions.invoke('enhance-script', {
        body: { 
          scriptContent: `Generate a catchy title and engaging introduction for a ${showTypeLabel} about the following topics/content:\n\n${contentForAI}\n\nProvide:\n1. A compelling title (max 60 characters)\n2. A brief introduction paragraph (2-3 sentences) that hooks the audience`,
          mode: 'generate-intro'
        }
      });
      
      if (error) throw error;
      
      if (data?.enhancedScript) {
        // Parse the AI response
        const lines = data.enhancedScript.split('\n').filter((l: string) => l.trim());
        const titleLine = lines.find((l: string) => l.toLowerCase().includes('title:')) || lines[0];
        const introLines = lines.filter((l: string) => !l.toLowerCase().includes('title:'));
        
        setSuggestedTitle(titleLine?.replace(/^(title:?\s*)/i, '').replace(/^["']|["']$/g, '').trim() || '');
        setSuggestedIntro(introLines.join(' ').replace(/^(introduction:?\s*)/i, '').trim() || '');
        
        toast.success('AI suggestions generated!');
      }
    } catch (err) {
      console.error('Suggestion error:', err);
      // Fallback suggestions based on show type
      const fallbackTitles: Record<string, string> = {
        podcast: `${showTopics.split(',')[0]?.trim() || 'Episode'} Deep Dive`,
        webcast: `${showTopics.split(',')[0]?.trim() || 'Topic'} Masterclass`,
        broadcast: `Live: ${showTopics.split(',')[0]?.trim() || 'Discussion'}`
      };
      setSuggestedTitle(fallbackTitles[newShowType]);
      setSuggestedIntro(`Join us for an insightful ${newShowType} exploring ${showTopics || 'exciting topics'}. Our guests will share valuable perspectives and actionable insights.`);
      toast.success('Suggestions ready!');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleAddParticipantToShow = () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error('Please fill in participant details');
      return;
    }
    
    setShowParticipants(prev => [...prev, {
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'pending'
    }]);
    
    setInviteName('');
    setInviteEmail('');
    setInviteRole('guest');
    toast.success('Participant added!');
  };

  const handleRemoveParticipantFromShow = (index: number) => {
    setShowParticipants(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateShow = async () => {
    if (!newShowTitle.trim() || !newShowDate || !newShowTime || !hostName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const scheduledDate = new Date(`${newShowDate}T${newShowTime}`);
    
    // Add host as default participant
    const allParticipants = [
      { name: hostName, email: '', role: 'host' as const, status: 'confirmed' as const, id: crypto.randomUUID() },
      ...showParticipants.map(p => ({ ...p, id: crypto.randomUUID() }))
    ];
    
    // Create event with participants
    const newEvent = addEvent({
      type: newShowType,
      title: newShowTitle,
      description: newShowDescription,
      scheduledDate,
      participants: allParticipants,
      scriptContent: showScript,
      hostName: hostName,
      status: 'scheduled'
    });

    // Send invites to all participants (except host unless they have email)
    const participantsToInvite = showParticipants.filter(p => p.email.trim());
    if (participantsToInvite.length > 0) {
      setIsSendingInvite(true);
      for (const participant of participantsToInvite) {
        try {
          await supabase.functions.invoke('send-show-invite', {
            body: {
              to: participant.email,
              participantName: participant.name,
              role: participant.role,
              showType: newShowType,
              showTitle: newShowTitle,
              showDescription: newShowDescription,
              scheduledDate: scheduledDate.toISOString(),
              hostName: hostName,
              topics: showTopics,
              script: attachScriptToInvite ? showScript.slice(0, 500) : undefined,
              suggestedIntro: suggestedIntro
            }
          });
        } catch (err) {
          console.error('Failed to send invite to:', participant.email, err);
        }
      }
      setIsSendingInvite(false);
      toast.success(`Invites sent to ${participantsToInvite.length} participant(s)!`);
    }

    toast.success(`${newShowType.charAt(0).toUpperCase() + newShowType.slice(1)} scheduled!`);
    
    // Reset dialog state
    setIsCreateShowDialogOpen(false);
    setNewShowTitle('');
    setNewShowDescription('');
    setNewShowDate('');
    setNewShowTime('');
    setShowTopics('');
    setShowScript('');
    setShowParticipants([]);
    setSuggestedTitle('');
    setSuggestedIntro('');
    setScheduleStep('details');
    setHostName('');
    
    // Load the appropriate template with filled content
    const templateId = newShowType === 'podcast' ? 'podcast-episode' : 
                       newShowType === 'webcast' ? 'webcast-webinar' : 'live-broadcast';
    const template = SCRIPT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      let content = template.content
        .replace('[Episode Topic]', newShowTitle)
        .replace('[Webcast Title]', newShowTitle)
        .replace('[Broadcast Title]', newShowTitle);
      
      if (showScript.trim()) {
        content = showScript;
      }
      
      setScriptContent(content);
      setScriptName(`${newShowTitle} Script`);
    }
  };

  const handleSendInvite = async () => {
    if (!selectedEventForInvite || !inviteEmail.trim() || !inviteName.trim()) {
      toast.error('Please fill in all invite details');
      return;
    }

    setIsSendingInvite(true);
    try {
      // Add participant to event
      const participant = addParticipant(selectedEventForInvite.id, {
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        status: 'pending'
      });

      // Send email invite via edge function
      const { error } = await supabase.functions.invoke('send-show-invite', {
        body: {
          to: inviteEmail,
          participantName: inviteName,
          role: inviteRole,
          showType: selectedEventForInvite.type,
          showTitle: selectedEventForInvite.title,
          showDescription: selectedEventForInvite.description,
          scheduledDate: selectedEventForInvite.scheduledDate.toISOString(),
          hostName: 'Genie Studio'
        }
      });

      if (error) {
        console.error('Invite email error:', error);
        toast.success('Participant added! (Email sending requires email configuration)');
      } else {
        toast.success(`Invite sent to ${inviteEmail}!`);
      }

      setInviteEmail('');
      setInviteName('');
      setInviteRole('guest');
    } catch (err) {
      console.error('Send invite error:', err);
      toast.error('Failed to send invite');
    } finally {
      setIsSendingInvite(false);
    }
  };

  // Combine videos and audios for recent projects display
  const recentProjects = [...videos, ...audios]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
    .map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      duration: item.duration ? `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}` : '--:--',
      lastEdited: getRelativeTime(item.timestamp),
      thumbnail: item.type === 'video' ? '🎬' : '🎙️',
      url: item.url
    }));

  function getRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  }

  const { words, minutes } = calculateReadingTime(scriptContent);

  const getShowTypeIcon = (type: 'podcast' | 'webcast' | 'broadcast') => {
    switch (type) {
      case 'podcast': return Podcast;
      case 'webcast': return Tv;
      case 'broadcast': return Radio;
    }
  };

  const getShowTypeColor = (type: 'podcast' | 'webcast' | 'broadcast') => {
    switch (type) {
      case 'podcast': return 'from-purple-500 to-indigo-500';
      case 'webcast': return 'from-blue-500 to-cyan-500';
      case 'broadcast': return 'from-red-500 to-pink-500';
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5" />
          <div className="relative px-6 py-8 md:py-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                        Genie Studio
                      </h1>
                      <p className="text-muted-foreground">
                        Professional media production powered by AI
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    size="lg" 
                    onClick={() => setIsStudioOpen(true)}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105"
                  >
                    <Video className="h-5 w-5 mr-2" />
                    Start Recording
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => setIsCreateShowDialogOpen(true)}
                    className="border-border/50 hover:bg-muted/50"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Show
                  </Button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Video Scripts', value: String(videoScripts.length), icon: FileText, trend: 'Created' },
                  { label: 'Audio Scripts', value: String(audioScripts.length), icon: Headphones, trend: 'Created' },
                  { label: 'Voiceovers', value: String(audios.length + savedVoiceovers.length), icon: Mic, trend: 'Generated' },
                  { label: 'Music Tracks', value: String(mergedMusic.length), icon: Music, trend: 'Available' },
                  { label: 'Videos Created', value: String(videos.length), icon: Film, trend: 'Recorded' },
                  { label: 'Projects', value: String(mediaProjects.length), icon: Layers, trend: 'Active' }
                ].map((stat, i) => (
                  <div key={i} className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <stat.icon className="h-4 w-4" />
                      <span className="text-xs">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.trend}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Compact Tabs */}
            <TabsList className="bg-muted/50 border border-border/50 p-1 grid grid-cols-6 w-full">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-2">
                <Layers className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="script-editor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-2">
                <PenTool className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Scripts</span>
              </TabsTrigger>
              <TabsTrigger value="voice-generator" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-2">
                <Mic className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Voice</span>
              </TabsTrigger>
              <TabsTrigger value="music-studio" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-2">
                <Music className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Music</span>
              </TabsTrigger>
              <TabsTrigger value="library" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-2">
                <Library className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Library</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-2">
                <FileText className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Templates</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-8 mt-0">
              {/* Feature Cards - Horizontal Scrolling with Arrows */}
              <div className="relative group/scroll">
                {/* Left Arrow */}
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/90 backdrop-blur border-border/50 shadow-lg opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground"
                  onClick={() => scrollFeatures('left')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                {/* Scrollable Container */}
                <div 
                  ref={featuresScrollRef}
                  className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {FEATURES.map((feature) => (
                    <Card 
                      key={feature.id}
                      className={cn(
                        "relative overflow-hidden cursor-pointer transition-all duration-300",
                        "hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10",
                        "border-border/50 bg-card backdrop-blur group",
                        "min-w-[280px] max-w-[300px] flex-shrink-0 snap-start"
                      )}
                      onClick={() => handleFeatureClick(feature.id)}
                    >
                      <div className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
                        "bg-gradient-to-br", feature.color
                      )} style={{ opacity: 0.05 }} />
                      <CardContent className="p-5 flex flex-col h-full">
                        {/* Top row: Icon + Badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center shadow-lg",
                            "bg-gradient-to-br", feature.color
                          )}>
                            <feature.icon className="h-6 w-6 text-white" />
                          </div>
                          {feature.badge && (
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-[10px] font-medium px-2 py-0.5",
                                feature.badge === 'New' && "bg-green-500/10 text-green-600 border-green-500/20",
                                feature.badge === 'AI Powered' && "bg-purple-500/10 text-purple-600 border-purple-500/20",
                                feature.badge === 'Popular' && "bg-orange-500/10 text-orange-600 border-orange-500/20",
                                feature.badge === 'Coming Soon' && "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
                              )}
                            >
                              {feature.badge}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Title */}
                        <h3 className="font-semibold text-base mb-1.5">{feature.title}</h3>
                        
                        {/* Description - fixed height for alignment */}
                        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">{feature.description}</p>
                        
                        {/* Footer stats - aligned at bottom */}
                        <div className="flex items-center justify-between text-xs pt-3 border-t border-border/30">
                          <span className="text-muted-foreground">{feature.stats.label}</span>
                          <span className="font-semibold text-foreground">{feature.stats.value}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Right Arrow */}
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/90 backdrop-blur border-border/50 shadow-lg opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground"
                  onClick={() => scrollFeatures('right')}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Upcoming Shows Section */}
              {upcomingEvents.length > 0 && (
                <Card className="border-border/50 bg-card/80 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Upcoming Shows
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => setIsCreateShowDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Schedule New
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {upcomingEvents.slice(0, 3).map((event) => {
                        const TypeIcon = getShowTypeIcon(event.type);
                        return (
                          <div 
                            key={event.id}
                            className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all"
                          >
                            <div className={cn(
                              "h-12 w-12 rounded-xl flex items-center justify-center",
                              "bg-gradient-to-br", getShowTypeColor(event.type)
                            )}>
                              <TypeIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {event.type}
                                </Badge>
                                <span>•</span>
                                <span>{event.scheduledDate.toLocaleDateString()} at {event.scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {event.participants.slice(0, 3).map((p, i) => (
                                  <Avatar key={p.id} className="h-8 w-8 border-2 border-background">
                                    <AvatarFallback className="text-xs bg-primary/10">
                                      {p.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {event.participants.length > 3 && (
                                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                                    +{event.participants.length - 3}
                                  </div>
                                )}
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedEventForInvite(event);
                                  setIsInviteDialogOpen(true);
                                }}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Invite
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Projects */}
                <div className="lg:col-span-2">
                  <Card className="border-border/50 bg-card/80 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          Recent Projects
                        </h2>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('library')}>
                          View All
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {recentProjects.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Film className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No recordings yet</p>
                            <p className="text-sm">Start recording to see your projects here</p>
                          </div>
                        ) : recentProjects.map((project) => (
                          <div 
                            key={project.id}
                            className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group"
                          >
                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                              {project.thumbnail}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{project.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {project.type}
                                </Badge>
                                <span>•</span>
                                <span>{project.duration}</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {project.lastEdited}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Tips */}
                <div>
                  <Card className="border-border/50 bg-gradient-to-br from-card/80 to-primary/5 backdrop-blur">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Quick Tips
                      </h2>
                      <div className="space-y-3">
                        {QUICK_TIPS.map((tip, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <tip.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium text-foreground">{tip.title}</span>
                              <p className="text-muted-foreground text-xs">{tip.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Script Editor Tab - Using dedicated component - forceMount to preserve state */}
            <TabsContent value="script-editor" className="mt-0" forceMount hidden={activeTab !== 'script-editor'}>
              <ScriptEditorTab
                savedScripts={savedScripts}
                onSaveScript={(script) => saveScript(script)}
                onDeleteScript={deleteScript}
                onUpdateScript={updateScript}
                onSaveVoiceover={(url, name, scriptId, audioBlob, scriptMeta) => {
                  saveVoiceover(url, name, audioBlob, scriptMeta);
                  if (scriptId) {
                    updateScript(scriptId, { hasVoiceover: true });
                  }
                }}
                savedVoiceovers={mergedVoiceovers.map(v => ({
                  id: v.id,
                  name: v.name,
                  url: v.url
                }))}
              />
            </TabsContent>

            {/* Voice Generator Tab - forceMount to preserve TTS state */}
            <TabsContent value="voice-generator" className="mt-0 space-y-6" forceMount hidden={activeTab !== 'voice-generator'}>
              {/* Scripts Ready for Voice Assignment */}
              {savedScripts.filter(s => (s.enhancedContent || s.content) && !s.hasVoiceover).length > 0 && (
                <Card className="border-border/50 bg-card/80 backdrop-blur border-blue-500/30 bg-blue-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Scripts Ready for Voice</h3>
                        <p className="text-sm text-muted-foreground">Add voiceovers to your saved scripts</p>
                      </div>
                    </div>
                    
                    <Tabs defaultValue="video" className="w-full">
                      <TabsList level="child" className="mb-4">
                        <TabsTrigger value="video" level="child">
                          <Video className="h-4 w-4 mr-2 text-red-500" />
                          Video ({savedScripts.filter(s => s.type === 'video' && (s.enhancedContent || s.content) && !s.hasVoiceover).length})
                        </TabsTrigger>
                        <TabsTrigger value="audio" level="child">
                          <Mic className="h-4 w-4 mr-2 text-purple-500" />
                          Audio ({savedScripts.filter(s => s.type === 'audio' && (s.enhancedContent || s.content) && !s.hasVoiceover).length})
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="video" level="child" className="mt-0 p-0 border-0 shadow-none bg-transparent">
                        {savedScripts.filter(s => s.type === 'video' && (s.enhancedContent || s.content) && !s.hasVoiceover).length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-6">No video scripts ready for voice</p>
                        ) : (
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {savedScripts.filter(s => s.type === 'video' && (s.enhancedContent || s.content) && !s.hasVoiceover).map(script => (
                              <div 
                                key={script.id}
                                className="p-4 rounded-lg border border-border/50 bg-background hover:border-red-500/30 transition-all"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Video className="h-4 w-4 text-red-500 flex-shrink-0" />
                                  <span className="font-medium truncate">{script.name}</span>
                                  {script.enhancedContent && (
                                    <Badge variant="outline" className="text-xs bg-purple-500/10">Enhanced</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                  {(script.enhancedContent || script.content).slice(0, 80)}...
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {script.stats?.wordCount || 0} words • ~{script.stats?.estimatedSpeakingMinutes || 1}m
                                  </span>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setVoiceText(script.cleanContent || script.enhancedContent || script.content);
                                      toast.success(`Loaded "${script.name}" - Select a voice and generate TTS`);
                                    }}
                                  >
                                    <Volume2 className="h-3 w-3 mr-1" />
                                    Add Voice
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="audio" level="child" className="mt-0 p-0 border-0 shadow-none bg-transparent">
                        {savedScripts.filter(s => s.type === 'audio' && (s.enhancedContent || s.content) && !s.hasVoiceover).length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-6">No audio scripts ready for voice</p>
                        ) : (
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {savedScripts.filter(s => s.type === 'audio' && (s.enhancedContent || s.content) && !s.hasVoiceover).map(script => (
                              <div 
                                key={script.id}
                                className="p-4 rounded-lg border border-border/50 bg-background hover:border-purple-500/30 transition-all"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Mic className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                  <span className="font-medium truncate">{script.name}</span>
                                  {script.enhancedContent && (
                                    <Badge variant="outline" className="text-xs bg-purple-500/10">Enhanced</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                  {(script.enhancedContent || script.content).slice(0, 80)}...
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {script.stats?.wordCount || 0} words • ~{script.stats?.estimatedSpeakingMinutes || 1}m
                                  </span>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setVoiceText(script.cleanContent || script.enhancedContent || script.content);
                                      toast.success(`Loaded "${script.name}" - Select a voice and generate TTS`);
                                    }}
                                  >
                                    <Volume2 className="h-3 w-3 mr-1" />
                                    Add Voice
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
              
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Mic className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">AI Voice Generator</h2>
                        <p className="text-sm text-muted-foreground">Create ultra-realistic voiceovers with AI</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                      {selectedProvider === 'openai' ? '6' : '9'}+ Voice Styles
                    </Badge>
                  </div>

                  {/* Provider Selection */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label>Voice Provider</Label>
                      <Select value={selectedProvider} onValueChange={(v: 'openai' | 'elevenlabs') => setSelectedProvider(v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elevenlabs">ElevenLabs (Premium Quality)</SelectItem>
                          <SelectItem value="openai">OpenAI TTS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Voice Style</Label>
                      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(selectedProvider === 'openai' ? OPENAI_VOICES : ELEVENLABS_VOICES).map(voice => (
                            <SelectItem key={voice.value} value={voice.value}>
                              {voice.label} - {voice.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Voice Preview Cards */}
                  <div className="grid md:grid-cols-4 gap-3 mb-6">
                    {(selectedProvider === 'openai' ? OPENAI_VOICES.slice(0, 4) : ELEVENLABS_VOICES.slice(0, 4)).map((voice) => (
                      <div 
                        key={voice.value} 
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-all",
                          selectedVoice === voice.value 
                            ? "bg-purple-500/10 border-purple-500/50" 
                            : "bg-muted/50 border-border/50 hover:border-purple-500/30"
                        )}
                        onClick={() => setSelectedVoice(voice.value)}
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 mx-auto">
                          <Mic className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-medium text-center text-sm">{voice.label}</h3>
                        <p className="text-xs text-muted-foreground text-center mt-1">{voice.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Text Input */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="voice-text">Text to Convert</Label>
                      <Textarea
                        id="voice-text"
                        value={voiceText}
                        onChange={(e) => setVoiceText(e.target.value)}
                        placeholder="Enter the text you want to convert to speech, or load a script from above..."
                        className="mt-1 min-h-[150px]"
                      />
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        onClick={handleGenerateVoice}
                        disabled={isTTSGenerating || !voiceText.trim()}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      >
                        {isTTSGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Voice
                          </>
                        )}
                      </Button>
                      {ttsResult && (
                        <>
                          <Button variant="outline" onClick={playTTS}>
                            <Play className="h-4 w-4 mr-2" />
                            Play
                          </Button>
                          <Button variant="outline" onClick={stopTTS}>
                            <Pause className="h-4 w-4 mr-2" />
                            Stop
                          </Button>
                          <Button variant="outline" onClick={() => downloadTTS()}>
                            <Download className="h-4 w-4 mr-2" />
                            Download MP3
                          </Button>
                          <Button 
                            variant="default"
                            onClick={() => {
                              if (ttsResult?.audioUrl) {
                                saveVoiceover(ttsResult.audioUrl, `Voiceover - ${new Date().toLocaleTimeString()}`);
                              }
                            }}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save to Library
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Result Preview */}
                    {ttsResult && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Headphones className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-700">Voice Generated!</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="ml-2 font-medium">{ttsResult.duration.toFixed(1)}s</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Provider:</span>
                            <span className="ml-2 font-medium capitalize">{ttsResult.provider}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Characters:</span>
                            <span className="ml-2 font-medium">{ttsResult.charactersProcessed}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Custom Voice Recording Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Radio className="h-5 w-5 text-orange-500" />
                      Record Custom Voice
                    </h3>
                    <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                      Your Voice
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Record your own voice to create a custom voice profile. This voice can be used for all your TTS voiceovers, just like Alloy, Echo, or other preset voices.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Voice Sample Name</Label>
                      <Input 
                        placeholder="e.g., My Professional Voice, Casual Narrator..."
                        className="mt-1"
                        id="custom-voice-name"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          // For now, trigger file upload for voice sample
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'audio/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const voiceName = (document.getElementById('custom-voice-name') as HTMLInputElement)?.value || `Custom Voice ${Date.now()}`;
                              const url = URL.createObjectURL(file);
                              const customVoice = {
                                id: `custom-voice-${Date.now()}`,
                                name: voiceName,
                                url,
                                timestamp: Date.now(),
                                type: 'custom-voice' as const
                              };
                              // Save to custom voices
                              const existing = JSON.parse(localStorage.getItem('genieStudioCustomVoices') || '[]');
                              const updated = [...existing, customVoice];
                              localStorage.setItem('genieStudioCustomVoices', JSON.stringify(updated));
                              toast.success(`Custom voice "${voiceName}" saved! You can now use it for TTS.`);
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Voice Sample
                      </Button>
                      <Button 
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white"
                        onClick={() => {
                          toast.info('Voice cloning requires ElevenLabs Professional plan. Upload a sample above to get started.');
                        }}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Record Voice (Coming Soon)
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      <strong>Tip:</strong> For best results, record 30+ seconds of clear speech in a quiet environment. Your custom voice can then be used for all scripts.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Voiceover Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Upload className="h-5 w-5 text-purple-500" />
                      Upload Voiceover
                    </h3>
                  </div>
                  <div className="flex gap-3">
                    <input
                      ref={voiceoverUploadRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadVoiceover(file);
                        }
                        if (voiceoverUploadRef.current) voiceoverUploadRef.current.value = '';
                      }}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => voiceoverUploadRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Audio File (MP3, WAV, etc.)
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload pre-recorded voiceovers to use in your recordings.
                  </p>
                </CardContent>
              </Card>

              {/* Custom Voices Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Radio className="h-5 w-5 text-orange-500" />
                    My Custom Voices
                  </h3>
                  {(() => {
                    const customVoices = JSON.parse(localStorage.getItem('genieStudioCustomVoices') || '[]');
                    return customVoices.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                        <Radio className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No custom voices yet</p>
                        <p className="text-xs">Upload voice samples above to create custom voices</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {customVoices.map((voice: any) => (
                          <div 
                            key={voice.id}
                            className="flex items-center gap-4 p-3 rounded-lg border border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50 transition-all"
                          >
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                              <Mic className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{voice.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Custom Voice • {voice.timestamp ? new Date(voice.timestamp).toLocaleDateString() : 'Unknown'}
                              </p>
                            </div>
                            {voice.url && (
                              <audio src={voice.url} controls className="h-8 w-48" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const existing = JSON.parse(localStorage.getItem('genieStudioCustomVoices') || '[]');
                                const updated = existing.filter((v: any) => v.id !== voice.id);
                                localStorage.setItem('genieStudioCustomVoices', JSON.stringify(updated));
                                toast.success('Custom voice deleted');
                                // Force re-render
                                setActiveTab('voice');
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Saved Voiceovers Section - Categorized */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Mic className="h-5 w-5 text-purple-500" />
                      Saved Audio Files
                      {isDbLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={refreshDbMedia}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Filter Tabs */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
                      All ({mergedVoiceovers.length})
                    </Badge>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                      TTS ({dbTtsFiles.length})
                    </Badge>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                      Voiceovers ({dbVoiceovers.length})
                    </Badge>
                  </div>
                  
                  {mergedVoiceovers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No voiceovers saved yet</p>
                      <p className="text-sm">Generate TTS or upload audio files above</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {mergedVoiceovers.map((voiceover) => {
                        // Check if from database TTS or voiceover lists
                        const isTTS = dbTtsFiles.some(t => t.id === voiceover.id) || 
                          voiceover.name?.toLowerCase().includes('tts') || 
                          voiceover.name?.toLowerCase().includes('generated');
                        const isVO = dbVoiceovers.some(v => v.id === voiceover.id) || 
                          voiceover.name?.toLowerCase().includes('voiceover') || 
                          voiceover.name?.toLowerCase().includes('recording');
                        
                        return (
                          <SavedAudioCard
                            key={voiceover.id}
                            audio={{
                              id: voiceover.id,
                              name: voiceover.name,
                              url: voiceover.url,
                              timestamp: voiceover.timestamp,
                              scriptText: voiceover.scriptText,
                              originalScript: voiceover.originalScript,
                              scriptType: voiceover.scriptType,
                              metadataType: voiceover.metadataType
                            }}
                            isTTS={isTTS}
                            isVoiceover={isVO}
                            onDelete={() => {
                              const updated = savedVoiceovers.filter(v => v.id !== voiceover.id);
                              setSavedVoiceovers(updated);
                              localStorage.setItem('genieStudioVoiceovers', JSON.stringify(updated));
                              toast.success('Audio file deleted');
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Music Studio Tab - forceMount to preserve generation state */}
            <TabsContent value="music-studio" className="mt-0 space-y-6" forceMount hidden={activeTab !== 'music-studio'}>
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">AI Music Studio</h2>
                        <p className="text-sm text-muted-foreground">Generate background music and soundscapes</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      {MUSIC_GENRES.length} Genres
                    </Badge>
                  </div>

                  {/* Genre Selection */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {MUSIC_GENRES.map((genre) => (
                      <div 
                        key={genre.id} 
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-all text-center",
                          selectedGenre === genre.id 
                            ? "bg-green-500/10 border-green-500/50" 
                            : "bg-muted/50 border-border/50 hover:border-green-500/30"
                        )}
                        onClick={() => handleGenreSelect(genre)}
                      >
                        <Music className="h-6 w-6 text-green-500 mx-auto mb-2" />
                        <span className="font-medium text-sm">{genre.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Music Prompt */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="music-prompt">Describe Your Music</Label>
                      <Textarea
                        id="music-prompt"
                        value={musicPrompt}
                        onChange={(e) => setMusicPrompt(e.target.value)}
                        placeholder="E.g., Upbeat corporate music for product demo, 30 seconds..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleGenerateMusic}
                        disabled={isGeneratingMusic || !musicPrompt.trim()}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      >
                        {isGeneratingMusic ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Music
                          </>
                        )}
                      </Button>
                      {selectedGenre && (
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setSelectedGenre(null);
                            setMusicPrompt('');
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Clear
                        </Button>
                      )}
                    </div>

                    {/* Audio Player for Generated Music */}
                    {generatedMusicUrl && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Music className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-700">Music Generated!</span>
                        </div>
                        <audio 
                          ref={musicAudioRef}
                          src={generatedMusicUrl} 
                          controls 
                          className="w-full" 
                        />
                        <div className="flex gap-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = generatedMusicUrl;
                              a.download = `genie-music-${Date.now()}.mp3`;
                              a.click();
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => {
                              saveMusicTrack(generatedMusicUrl, `${selectedGenre || 'custom'} - ${new Date().toLocaleTimeString()}`);
                            }}
                          >
                            Save to Library
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upload Music Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Upload className="h-5 w-5 text-green-500" />
                      Upload Music
                    </h3>
                  </div>
                  <div className="flex gap-3">
                    <input
                      ref={musicUploadRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadMusic(file);
                        }
                        if (musicUploadRef.current) musicUploadRef.current.value = '';
                      }}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => musicUploadRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Music File (MP3, WAV, etc.)
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload background music to use in your recordings.
                  </p>
                </CardContent>
              </Card>

              {/* Saved Music Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Music className="h-5 w-5 text-green-500" />
                      Saved Music Tracks ({mergedMusic.length})
                      {isDbLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                        {dbMusic.length} from DB
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={refreshDbMedia}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {mergedMusic.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No music saved yet</p>
                      <p className="text-sm">Generate music or upload audio files above</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mergedMusic.map((track) => {
                        const isFromDb = dbMusic.some(m => m.id === track.id);
                        return (
                          <div 
                            key={track.id}
                            className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-all"
                          >
                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                              <Music className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{track.name}</p>
                                {isFromDb && (
                                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                                    DB
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(track.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            {track.url && (
                              <audio src={track.url} controls className="h-8 w-48" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = savedMusic.filter(m => m.id !== track.id);
                                setSavedMusic(updated);
                                localStorage.setItem('genieStudioMusic', JSON.stringify(updated));
                                toast.success('Music track deleted');
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Library Tab */}
            <TabsContent value="library" className="mt-0 space-y-6">
              {/* Videos Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Video className="h-5 w-5 text-red-500" />
                    <h2 className="text-lg font-semibold">Video Recordings</h2>
                    <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                      {videos.length} Videos
                    </Badge>
                  </div>
                  
                  {videos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No videos recorded yet</p>
                      <Button variant="outline" className="mt-4" onClick={() => setIsStudioOpen(true)}>
                        <Video className="h-4 w-4 mr-2" />
                        Record Your First Video
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.map((video) => (
                        <div key={video.id} className="border rounded-lg overflow-hidden bg-card group">
                          {video.url ? (
                            <video 
                              src={video.url} 
                              className="w-full aspect-video object-cover"
                              controls
                            />
                          ) : (
                            <div className="w-full aspect-video bg-muted flex items-center justify-center">
                              <Video className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="p-3 flex items-center justify-between">
                            <div>
                              <p className="font-medium truncate">{video.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(video.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                              onClick={() => deleteMedia(video.id, 'video')}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Audio Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Music className="h-5 w-5 text-purple-500" />
                    <h2 className="text-lg font-semibold">Audio & Voiceovers</h2>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
                      {audios.length} Audio Files
                    </Badge>
                  </div>
                  
                  {audios.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No audio files yet</p>
                      <Button variant="outline" className="mt-4" onClick={() => setActiveTab('voice-generator')}>
                        <Mic className="h-4 w-4 mr-2" />
                        Generate Voiceover
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {audios.map((audio) => (
                        <div key={audio.id} className="border rounded-lg p-4 bg-card flex items-center gap-4 group">
                          <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Music className="h-6 w-6 text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{audio.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(audio.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          {audio.url && (
                            <audio src={audio.url} controls className="max-w-xs" />
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={() => deleteMedia(audio.id, 'audio')}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="mt-0 space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Script Templates</h2>
                        <p className="text-sm text-muted-foreground">Pre-built templates for videos, podcasts, webcasts & broadcasts</p>
                      </div>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['All', 'Podcast', 'Webcast', 'Broadcast', 'Marketing', 'Education', 'Corporate'].map((cat) => (
                      <Badge 
                        key={cat}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SCRIPT_TEMPLATES.map((template) => {
                      const TemplateIcon = template.type === 'podcast' ? Podcast 
                        : template.type === 'webcast' ? Tv 
                        : template.type === 'broadcast' ? Radio 
                        : FileText;
                      const iconColor = template.type === 'podcast' ? 'from-purple-500 to-indigo-500'
                        : template.type === 'webcast' ? 'from-blue-500 to-cyan-500'
                        : template.type === 'broadcast' ? 'from-red-500 to-pink-500'
                        : 'from-amber-500 to-orange-500';
                      
                      return (
                        <Card 
                          key={template.id}
                          className="border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                          onClick={() => handleLoadTemplate(template)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className={cn("h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center", iconColor)}>
                                <TemplateIcon className="h-5 w-5 text-white" />
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                            </div>
                            <h3 className="font-semibold mb-1">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 italic">
                              "{template.content.slice(0, 100)}..."
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <PenTool className="h-4 w-4 mr-2" />
                              Use Template
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recording Studio Modal */}
        {isStudioOpen && (
          <RecordingStudio
            isOpen={isStudioOpen}
            onClose={handleStudioClose}
            scripts={savedScripts.map(s => ({ 
              id: s.id, 
              title: s.name, 
              content: s.enhancedContent || s.content,
              // Pass both original and enhanced versions
              originalContent: s.content,
              enhancedContent: s.enhancedContent,
              cleanContent: s.cleanContent,
              type: s.type
            }))}
            voiceovers={mergedVoiceovers.map(v => ({ 
              id: v.id, 
              name: v.name, 
              url: v.url || '',
              // Pass metadata for teleprompter sync and filtering
              scriptText: (v as any).scriptText || null,
              scriptType: (v as any).scriptType || null,
              metadataType: (v as any).metadataType || null
            }))}
            music={mergedMusic.map(m => ({ id: m.id, name: m.name, url: m.url || '' }))}
          />
        )}

        {/* Publish & Go Live Dialog */}
        <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <Radio className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span>Publish & Go Live</span>
                  <p className="text-sm font-normal text-muted-foreground">Distribute your content across platforms</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-3 py-4">
              {/* Schedule Webcast/Podcast - connects to existing flow */}
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors group border-2"
                onClick={() => {
                  setIsPublishDialogOpen(false);
                  setIsCreateShowDialogOpen(true);
                }}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Schedule Webcast / Podcast</h4>
                    <p className="text-sm text-muted-foreground">Plan and schedule your show with participants</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
              
              {/* Publish as Podcast */}
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => {
                  toast.info('Podcast Publishing', { 
                    description: 'Connect your podcast platforms to distribute automatically.',
                    action: {
                      label: 'Coming Soon',
                      onClick: () => {}
                    }
                  });
                }}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Podcast className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Publish as Podcast</h4>
                    <p className="text-sm text-muted-foreground">Spotify, Apple Podcasts, Google Podcasts</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5">Spotify</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5">Apple</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5">Google</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
              
              {/* Go Live Broadcast */}
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => {
                  toast.info('Go Live Broadcast', { 
                    description: 'Connect LinkedIn, YouTube, or X to go live.',
                    action: {
                      label: 'Setup',
                      onClick: () => {}
                    }
                  });
                }}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Tv className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Go Live Broadcast</h4>
                    <p className="text-sm text-muted-foreground">Stream live to your audience</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 bg-blue-500/10 text-blue-600 border-blue-500/30">LinkedIn</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 bg-red-500/10 text-red-600 border-red-500/30">YouTube</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 bg-gray-500/10 text-gray-600 border-gray-500/30">X</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
              
              {/* Share Recording */}
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => {
                  toast.info('Share Recording', { 
                    description: 'Connect LinkedIn or X to share your recordings.',
                    action: {
                      label: 'Setup',
                      onClick: () => {}
                    }
                  });
                }}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Share Recording</h4>
                    <p className="text-sm text-muted-foreground">Post your video to social platforms</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 bg-blue-500/10 text-blue-600 border-blue-500/30">LinkedIn</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 bg-gray-500/10 text-gray-600 border-gray-500/30">X</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <p className="text-xs text-muted-foreground flex-1">Connect your accounts to enable publishing</p>
              <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateShowDialogOpen} onOpenChange={(open) => {
          setIsCreateShowDialogOpen(open);
          if (!open) {
            setScheduleStep('details');
            setShowParticipants([]);
            setSuggestedTitle('');
            setSuggestedIntro('');
          }
        }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span>Schedule a Show</span>
                  <p className="text-sm font-normal text-muted-foreground">
                    Step {scheduleStep === 'details' ? '1' : scheduleStep === 'content' ? '2' : '3'} of 3: {
                      scheduleStep === 'details' ? 'Basic Details' : 
                      scheduleStep === 'content' ? 'Content & Script' : 
                      'Invite Participants'
                    }
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            {/* Step Progress */}
            <div className="flex items-center gap-2 py-2">
              {['details', 'content', 'participants'].map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div 
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      scheduleStep === step 
                        ? "bg-primary text-primary-foreground" 
                        : (scheduleStep === 'content' && i === 0) || (scheduleStep === 'participants' && i <= 1)
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </div>
                  {i < 2 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-2",
                      (scheduleStep === 'content' && i === 0) || (scheduleStep === 'participants')
                        ? "bg-green-500"
                        : "bg-muted"
                    )} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Basic Details */}
            {scheduleStep === 'details' && (
              <div className="space-y-4 py-4">
                <div>
                  <Label>Show Type</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {[
                      { value: 'podcast', label: 'Podcast', icon: Podcast, color: 'from-purple-500 to-indigo-500' },
                      { value: 'webcast', label: 'Webcast', icon: Tv, color: 'from-blue-500 to-cyan-500' },
                      { value: 'broadcast', label: 'Broadcast', icon: Radio, color: 'from-red-500 to-pink-500' }
                    ].map((type) => (
                      <div
                        key={type.value}
                        className={cn(
                          "p-4 rounded-lg border-2 cursor-pointer transition-all text-center",
                          newShowType === type.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => setNewShowType(type.value as 'podcast' | 'webcast' | 'broadcast')}
                      >
                        <div className={cn("h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center mx-auto mb-2", type.color)}>
                          <type.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Host Name */}
                <div>
                  <Label htmlFor="host-name">Host Name *</Label>
                  <Input
                    id="host-name"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Your name as the host..."
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">You will be automatically added as host and receive an invite.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="show-date">Date *</Label>
                    <Input
                      id="show-date"
                      type="date"
                      value={newShowDate}
                      onChange={(e) => setNewShowDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="show-time">Time *</Label>
                    <Input
                      id="show-time"
                      type="time"
                      value={newShowTime}
                      onChange={(e) => setNewShowTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Content & Script */}
            {scheduleStep === 'content' && (
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="show-topics">Topics (comma-separated)</Label>
                  <Input
                    id="show-topics"
                    value={showTopics}
                    onChange={(e) => setShowTopics(e.target.value)}
                    placeholder="e.g., AI in Healthcare, Future of Technology, Innovation..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-script">Script / Outline</Label>
                    {savedScripts.length > 0 && (
                      <Select onValueChange={(id) => {
                        const script = savedScripts.find(s => s.id === id);
                        if (script) setShowScript(script.content);
                      }}>
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue placeholder="Load saved script" />
                        </SelectTrigger>
                        <SelectContent>
                          {savedScripts.map(script => (
                            <SelectItem key={script.id} value={script.id}>
                              {script.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <Textarea
                    id="show-script"
                    value={showScript}
                    onChange={(e) => setShowScript(e.target.value)}
                    placeholder="Paste your script or outline here. This will be shared with participants..."
                    className="mt-1 min-h-[120px] font-mono text-sm"
                  />
                </div>
                
                {/* Attach Script Option */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="attach-script"
                    checked={attachScriptToInvite}
                    onChange={(e) => setAttachScriptToInvite(e.target.checked)}
                    className="rounded border-border"
                  />
                  <Label htmlFor="attach-script" className="text-sm cursor-pointer">
                    Include script preview in participant invites
                  </Label>
                </div>
                
                {/* AI Suggestions */}
                <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-purple-500" />
                      AI-Suggested Title & Introduction
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateSuggestions}
                      disabled={isGeneratingSuggestions || (!showTopics.trim() && !showScript.trim())}
                    >
                      {isGeneratingSuggestions ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-1" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {suggestedTitle && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Suggested Title</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={suggestedTitle}
                            onChange={(e) => setSuggestedTitle(e.target.value)}
                            className="bg-background"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setNewShowTitle(suggestedTitle)}
                          >
                            Use
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Suggested Introduction</Label>
                        <Textarea
                          value={suggestedIntro}
                          onChange={(e) => setSuggestedIntro(e.target.value)}
                          className="mt-1 text-sm bg-background"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="show-title">Show Title *</Label>
                  <Input
                    id="show-title"
                    value={newShowTitle}
                    onChange={(e) => setNewShowTitle(e.target.value)}
                    placeholder="Enter show title or use AI suggestion..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="show-description">Description</Label>
                  <Textarea
                    id="show-description"
                    value={newShowDescription}
                    onChange={(e) => setNewShowDescription(e.target.value)}
                    placeholder="Brief description of the show..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Invite Participants */}
            {scheduleStep === 'participants' && (
              <div className="space-y-4 py-4">
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">{newShowTitle || 'Untitled Show'}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {newShowType.charAt(0).toUpperCase() + newShowType.slice(1)} • {newShowDate} at {newShowTime}
                  </div>
                </div>

                {/* Current Participants */}
                {showParticipants.length > 0 && (
                  <div className="space-y-2">
                    <Label>Participants to Invite ({showParticipants.length})</Label>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto">
                      {showParticipants.map((p, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10">
                              {p.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                          </div>
                          <Badge variant="outline" className="capitalize text-xs">
                            {p.role}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveParticipantFromShow(index)}
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Participant Form */}
                <div className="border rounded-lg p-4 space-y-3">
                  <Label className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Participant
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="invite-name" className="text-xs">Name *</Label>
                      <Input
                        id="invite-name"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="Full name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="invite-role" className="text-xs">Role</Label>
                      <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="host">Host</SelectItem>
                          <SelectItem value="co-host">Co-Host</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                          <SelectItem value="panelist">Panelist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="invite-email" className="text-xs">Email *</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleAddParticipantToShow}
                    disabled={!inviteName.trim() || !inviteEmail.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Participant
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Participants will receive an email invite with show details, topics, and script preview.
                </p>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {scheduleStep !== 'details' && (
                <Button 
                  variant="outline" 
                  onClick={() => setScheduleStep(scheduleStep === 'participants' ? 'content' : 'details')}
                >
                  Back
                </Button>
              )}
              <div className="flex-1" />
              <Button variant="outline" onClick={() => setIsCreateShowDialogOpen(false)}>
                Cancel
              </Button>
              {scheduleStep !== 'participants' ? (
                <Button 
                  onClick={() => setScheduleStep(scheduleStep === 'details' ? 'content' : 'participants')}
                  disabled={scheduleStep === 'details' && (!newShowDate || !newShowTime || !hostName.trim())}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  Next Step
                </Button>
              ) : (
                <Button 
                  onClick={handleCreateShow}
                  disabled={isSendingInvite || !newShowTitle.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  {isSendingInvite ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending Invites...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Schedule & Send Invites
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite Participants Dialog */}
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite Participants
              </DialogTitle>
              <DialogDescription>
                {selectedEventForInvite && (
                  <span>
                    Invite guests to "{selectedEventForInvite.title}" ({selectedEventForInvite.type})
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Current Participants */}
              {selectedEventForInvite && selectedEventForInvite.participants.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Participants</Label>
                  <div className="space-y-2">
                    {selectedEventForInvite.participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {p.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </div>
                        <Badge variant="outline" className="capitalize text-xs">
                          {p.role}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            p.status === 'confirmed' && "bg-green-500/10 text-green-600",
                            p.status === 'pending' && "bg-yellow-500/10 text-yellow-600",
                            p.status === 'declined' && "bg-red-500/10 text-red-600"
                          )}
                        >
                          {p.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Invite Form */}
              <div className="border-t pt-4">
                <Label className="mb-2 block">Add New Participant</Label>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="invite-name" className="text-xs">Name *</Label>
                      <Input
                        id="invite-name"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="Full name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="invite-role" className="text-xs">Role</Label>
                      <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="host">Host</SelectItem>
                          <SelectItem value="co-host">Co-Host</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                          <SelectItem value="panelist">Panelist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="invite-email" className="text-xs">Email *</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Close
              </Button>
              <Button 
                onClick={handleSendInvite}
                disabled={isSendingInvite || !inviteEmail.trim() || !inviteName.trim()}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
              >
                {isSendingInvite ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invite
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hidden audio element for music */}
        <audio ref={musicAudioRef} className="hidden" />
      </div>
    </AppLayout>
  );
}
