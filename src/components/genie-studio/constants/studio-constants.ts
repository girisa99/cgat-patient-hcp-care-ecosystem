/**
 * Genie Suite Constants - Extracted from GenieStudio.tsx
 * Static data for features, templates, and configuration
 */

import {
  Video,
  Mic,
  FileText,
  Music,
  Layers,
  Radio,
  PenTool,
  Users,
  Film,
  Podcast,
  Tv,
  Presentation,
  Shield,
} from 'lucide-react';
import type { FeatureCard, QuickTip, MusicGenre, ScriptTemplate } from '../types/studio-types';

// Music genres with prompts
export const MUSIC_GENRES: MusicGenre[] = [
  { id: 'corporate', name: 'Corporate', prompt: 'Professional corporate background music, clean and modern, suitable for business presentations', color: 'blue' },
  { id: 'upbeat', name: 'Upbeat', prompt: 'Upbeat and energetic music, positive vibes, perfect for promotional content', color: 'orange' },
  { id: 'cinematic', name: 'Cinematic', prompt: 'Epic cinematic orchestral music with emotional depth, movie trailer style', color: 'purple' },
  { id: 'ambient', name: 'Ambient', prompt: 'Calm ambient soundscape, peaceful and relaxing, meditation style', color: 'green' },
  { id: 'motivational', name: 'Motivational', prompt: 'Inspiring motivational music with building energy, workout or achievement style', color: 'red' },
  { id: 'lofi', name: 'Lo-Fi', prompt: 'Chill lo-fi hip hop beats, relaxed and nostalgic, study music vibe', color: 'pink' },
  { id: 'electronic', name: 'Electronic', prompt: 'Modern electronic music with synths and beats, tech and innovation feel', color: 'cyan' },
  { id: 'acoustic', name: 'Acoustic', prompt: 'Warm acoustic guitar melody, natural and organic, coffeehouse atmosphere', color: 'amber' }
];

// Feature cards for the dashboard - Workflow order: Script → Voice → Music → Record → Deck
export const FEATURES: FeatureCard[] = [
  {
    id: 'productions',
    title: 'Production Hub',
    description: 'Full production pipeline with scheduling, team invites, calendar sync & multi-stage workflow',
    icon: Layers,
    color: 'from-indigo-500 to-violet-500',
    badge: 'New',
    stats: { label: 'Pipeline', value: '6 Stages' },
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
    id: 'deck',
    title: 'Genie Deck',
    description: 'AI-powered presentations with multi-language export',
    icon: Presentation,
    color: 'from-purple-500 to-violet-500',
    badge: 'New',
    stats: { label: 'Languages', value: '10+' },
    tab: 'deck',
    isExternal: true,
    route: '/genie-deck'
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
  },
  {
    id: 'admin',
    title: 'Admin Hub',
    description: 'Manage users, approvals, workspaces & team settings',
    icon: Shield,
    color: 'from-slate-600 to-slate-800',
    badge: 'Internal',
    stats: { label: 'Access', value: 'Admin' },
    tab: 'admin',
    isExternal: true,
    route: '/genie-hub',
    internalOnly: true,
  }
];

// Quick Tips for Users - Updated for Production Hub workflow
export const QUICK_TIPS: QuickTip[] = [
  { icon: Layers, title: '1. Create Production', text: 'Start in Production Hub - create podcast, webcast, or video project' },
  { icon: Users, title: '2. Outreach', text: 'Invite participants, hosts, and guests - track confirmations' },
  { icon: PenTool, title: '3. Write Script', text: 'Upload or write your script - AI enhance for clarity and engagement' },
  { icon: Music, title: '4. Add Music', text: 'Generate or upload background music (podcasts) or intro/outro music' },
  { icon: Video, title: '5. Record/Rehearse', text: 'Open Genie Vibe with teleprompter - for webcasts, TTS preview available' },
  { icon: Film, title: '6. Post-Production', text: 'Edit, trim, and polish your recording in the studio' },
  { icon: Radio, title: '7. Publish', text: 'Go live with landing page and embeddable widget' }
];

// Script Templates - Video templates
export const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  {
    id: 'product-demo',
    name: 'Product Demo',
    description: 'Showcase your product features',
    category: 'Marketing',
    type: 'video',
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
    type: 'video',
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
    type: 'video',
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
    type: 'video',
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
    type: 'video',
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
    type: 'podcast',
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
    type: 'webcast',
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
  }
];
