/**
 * SCRIPT TEMPLATES
 *
 * Industry × Format script structure templates for auto-generation.
 * Each template defines the narrative flow, scene purposes, timing ratios,
 * and content guidelines for a specific format.
 *
 * Used by scriptAutoGenerator.ts to produce full production scripts
 * from a simple user prompt.
 *
 * @see src/services/cast/scriptAutoGenerator.ts — consumes templates
 * @see src/config/universal-script-schema.ts — output schema
 */

import type { EmotionalTone, ScriptPurpose } from './universal-script-schema';

// ─── TEMPLATE TYPES ─────────────────────────────────────────────────────────

/** A single beat/section in a script template */
export interface ScriptTemplateBeat {
  /** Beat name (e.g., "Hook", "Problem Statement") */
  name: string;
  /** Purpose of this beat */
  purpose: string;
  /** Scene type to use from registry */
  sceneType: string;
  /** Percentage of total duration this beat should occupy */
  durationRatio: number;
  /** Emotional tone for this beat */
  tone: EmotionalTone;
  /** Content guideline for AI script generation */
  contentGuide: string;
  /** Whether this beat requires speaker on camera */
  requiresSpeaker: boolean;
  /** Minimum number of script lines */
  minLines: number;
  /** Maximum number of script lines */
  maxLines: number;
}

/** Complete script template for a format */
export interface ScriptTemplate {
  /** Template ID */
  id: string;
  /** Format this template applies to */
  format: ScriptPurpose;
  /** Human-readable name */
  name: string;
  /** Description */
  description: string;
  /** Ordered beats that form the narrative structure */
  beats: ScriptTemplateBeat[];
  /** Default tone for the whole template */
  defaultTone: EmotionalTone;
  /** Typical duration range in seconds */
  durationRange: { min: number; max: number };
  /** Minimum speakers required */
  minSpeakers: number;
  /** Content guidelines for script generation */
  guidelines: string[];
}

// ─── FORMAT TEMPLATES ───────────────────────────────────────────────────────

export const SCRIPT_TEMPLATES: Record<string, ScriptTemplate> = {
  // ─── DOCUMENTARY ──────────────────────────────────────────
  documentary: {
    id: 'documentary',
    format: 'documentary',
    name: 'Documentary',
    description: 'Long-form narrative with interviews, B-roll, and data visualization',
    defaultTone: 'dramatic',
    durationRange: { min: 180, max: 1800 },
    minSpeakers: 1,
    guidelines: [
      'Open with a compelling hook that raises a question',
      'Build tension through the middle acts',
      'Use data and evidence to support claims',
      'Close with resolution and call to reflection',
      'Vary pacing: fast for tension, slow for emotional beats',
    ],
    beats: [
      {
        name: 'Hook',
        purpose: 'Grab attention with a provocative question or striking visual',
        sceneType: 'b-roll-narration',
        durationRatio: 0.08,
        tone: 'mysterious',
        contentGuide: 'Start with an unexpected fact, question, or visual that creates curiosity',
        requiresSpeaker: false,
        minLines: 1,
        maxLines: 3,
      },
      {
        name: 'Problem / Context',
        purpose: 'Establish the problem or historical context',
        sceneType: 'talking-head',
        durationRatio: 0.15,
        tone: 'educational',
        contentGuide: 'Explain the problem, its scope, and why it matters to the audience',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 5,
      },
      {
        name: 'Origin Story',
        purpose: 'How we got here — the backstory',
        sceneType: 'b-roll-narration',
        durationRatio: 0.15,
        tone: 'nostalgic',
        contentGuide: 'Trace the origin of the topic, key milestones, turning points',
        requiresSpeaker: false,
        minLines: 2,
        maxLines: 5,
      },
      {
        name: 'Expert Insight',
        purpose: 'Subject matter expert explains the core concept',
        sceneType: 'talking-head',
        durationRatio: 0.15,
        tone: 'authoritative',
        contentGuide: 'Deep dive into the technical or conceptual heart of the topic',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 6,
      },
      {
        name: 'Evidence / Data',
        purpose: 'Support claims with data visualization',
        sceneType: 'data-viz-narrative',
        durationRatio: 0.12,
        tone: 'educational',
        contentGuide: 'Present key statistics, charts, or evidence that proves the narrative',
        requiresSpeaker: false,
        minLines: 1,
        maxLines: 4,
      },
      {
        name: 'Impact / Testimonial',
        purpose: 'Show real-world impact through testimonials',
        sceneType: 'testimonial',
        durationRatio: 0.15,
        tone: 'empathetic',
        contentGuide: 'Personal stories, testimonials, or case studies showing impact',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 5,
      },
      {
        name: 'Resolution',
        purpose: 'What this means for the future',
        sceneType: 'b-roll-narration',
        durationRatio: 0.12,
        tone: 'inspiring',
        contentGuide: 'Paint the vision of the future, what the audience should take away',
        requiresSpeaker: false,
        minLines: 1,
        maxLines: 4,
      },
      {
        name: 'Call to Action',
        purpose: 'Close with a clear next step',
        sceneType: 'cta-outro',
        durationRatio: 0.08,
        tone: 'inspiring',
        contentGuide: 'Direct the audience to take a specific action',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 2,
      },
    ],
  },

  // ─── EXPLAINER ────────────────────────────────────────────
  explainer: {
    id: 'explainer',
    format: 'explainer',
    name: 'Explainer',
    description: 'Educational content that breaks down complex topics simply',
    defaultTone: 'educational',
    durationRange: { min: 120, max: 600 },
    minSpeakers: 1,
    guidelines: [
      'Hook with the "why should I care?" angle',
      'Explain WHAT it is in simple terms',
      'Show HOW it works with visuals/demos',
      'Explain WHY it matters',
      'Close with actionable next steps',
    ],
    beats: [
      {
        name: 'Hook',
        purpose: 'Why should the audience care about this topic?',
        sceneType: 'title-card',
        durationRatio: 0.10,
        tone: 'conversational',
        contentGuide: 'Open with a relatable problem or surprising fact',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 2,
      },
      {
        name: 'What',
        purpose: 'Define the topic in simple, accessible terms',
        sceneType: 'talking-head',
        durationRatio: 0.20,
        tone: 'educational',
        contentGuide: 'Explain the concept as if to a smart 12-year-old',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 5,
      },
      {
        name: 'How',
        purpose: 'Show how it works with visual demonstration',
        sceneType: 'whiteboard-explainer',
        durationRatio: 0.30,
        tone: 'educational',
        contentGuide: 'Step-by-step walkthrough with diagrams or screen captures',
        requiresSpeaker: true,
        minLines: 3,
        maxLines: 8,
      },
      {
        name: 'Why',
        purpose: 'Why does this matter? Benefits and impact',
        sceneType: 'data-viz-narrative',
        durationRatio: 0.20,
        tone: 'inspiring',
        contentGuide: 'Connect to real-world benefits, use data to prove value',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 4,
      },
      {
        name: 'Call to Action',
        purpose: 'What should the audience do next?',
        sceneType: 'cta-outro',
        durationRatio: 0.10,
        tone: 'conversational',
        contentGuide: 'Clear, specific next step the audience can take right now',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 2,
      },
    ],
  },

  // ─── PODCAST ──────────────────────────────────────────────
  podcast: {
    id: 'podcast',
    format: 'podcast',
    name: 'Podcast',
    description: 'Multi-speaker conversational format with visual enhancement',
    defaultTone: 'conversational',
    durationRange: { min: 300, max: 3600 },
    minSpeakers: 2,
    guidelines: [
      'Natural conversational flow, not scripted monologue',
      'Host introduces topics, guests provide depth',
      'Include banter and personality between speakers',
      'Each topic block should have a clear takeaway',
      'Music bed under the entire conversation',
    ],
    beats: [
      {
        name: 'Intro',
        purpose: 'Host introduces the episode and guest(s)',
        sceneType: 'talking-head',
        durationRatio: 0.08,
        tone: 'conversational',
        contentGuide: 'Warm greeting, episode topic teaser, guest introduction',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 4,
      },
      {
        name: 'Guest Intro',
        purpose: 'Guest shares their background and expertise',
        sceneType: 'interview-2shot',
        durationRatio: 0.10,
        tone: 'conversational',
        contentGuide: 'Guest talks about their background, what they do, why this topic matters to them',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 5,
      },
      {
        name: 'Topic 1',
        purpose: 'First main discussion topic',
        sceneType: 'split-screen-debate',
        durationRatio: 0.22,
        tone: 'educational',
        contentGuide: 'Deep dive into the first topic, host asks questions, guest provides insights',
        requiresSpeaker: true,
        minLines: 4,
        maxLines: 10,
      },
      {
        name: 'Topic 2',
        purpose: 'Second main discussion topic',
        sceneType: 'split-screen-debate',
        durationRatio: 0.22,
        tone: 'dramatic',
        contentGuide: 'Second topic with more depth, potentially controversial or challenging angles',
        requiresSpeaker: true,
        minLines: 4,
        maxLines: 10,
      },
      {
        name: 'Topic 3',
        purpose: 'Third topic or rapid-fire segment',
        sceneType: 'split-screen-debate',
        durationRatio: 0.18,
        tone: 'playful',
        contentGuide: 'Lighter topic or rapid-fire questions, more personality-driven',
        requiresSpeaker: true,
        minLines: 3,
        maxLines: 8,
      },
      {
        name: 'Recap',
        purpose: 'Key takeaways from the conversation',
        sceneType: 'talking-head',
        durationRatio: 0.12,
        tone: 'inspiring',
        contentGuide: 'Host and guest summarize key takeaways, actionable insights',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 4,
      },
      {
        name: 'Outro',
        purpose: 'Sign-off and call to action',
        sceneType: 'cta-outro',
        durationRatio: 0.08,
        tone: 'conversational',
        contentGuide: 'Thank guest, ask audience to subscribe/share, preview next episode',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 3,
      },
    ],
  },

  // ─── PRODUCT DEMO ─────────────────────────────────────────
  'product-demo': {
    id: 'product-demo',
    format: 'product-demo',
    name: 'Product Demo',
    description: 'Feature walkthrough with problem-solution-benefit structure',
    defaultTone: 'conversational',
    durationRange: { min: 60, max: 300 },
    minSpeakers: 1,
    guidelines: [
      'Lead with the pain point, not the feature',
      'Show, don\'t tell — use screen captures and demos',
      'Highlight 3-5 key features maximum',
      'Include before/after or comparison when possible',
      'End with clear pricing or next-step CTA',
    ],
    beats: [
      {
        name: 'Problem',
        purpose: 'Identify the pain point your product solves',
        sceneType: 'talking-head',
        durationRatio: 0.15,
        tone: 'empathetic',
        contentGuide: 'Describe the audience pain point in relatable terms',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 3,
      },
      {
        name: 'Solution Intro',
        purpose: 'Introduce your product as the solution',
        sceneType: 'title-card',
        durationRatio: 0.10,
        tone: 'inspiring',
        contentGuide: 'Introduce the product name and one-line value proposition',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 2,
      },
      {
        name: 'Feature Walkthrough',
        purpose: 'Demo the key features',
        sceneType: 'product-demo',
        durationRatio: 0.35,
        tone: 'educational',
        contentGuide: 'Walk through 3-5 key features with screen captures, show real usage',
        requiresSpeaker: true,
        minLines: 3,
        maxLines: 8,
      },
      {
        name: 'Results / Proof',
        purpose: 'Show results, testimonials, or data',
        sceneType: 'data-viz-narrative',
        durationRatio: 0.20,
        tone: 'authoritative',
        contentGuide: 'Share metrics, testimonials, or before/after comparisons',
        requiresSpeaker: false,
        minLines: 1,
        maxLines: 4,
      },
      {
        name: 'CTA',
        purpose: 'Drive conversion with clear next step',
        sceneType: 'cta-outro',
        durationRatio: 0.10,
        tone: 'conversational',
        contentGuide: 'Clear CTA: sign up, free trial, book demo, pricing page',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 2,
      },
    ],
  },

  // ─── SOCIAL CLIP ──────────────────────────────────────────
  'social-short': {
    id: 'social-short',
    format: 'social-short',
    name: 'Social Clip',
    description: 'Short-form social media content (15-60 seconds)',
    defaultTone: 'playful',
    durationRange: { min: 15, max: 60 },
    minSpeakers: 1,
    guidelines: [
      'Hook in the first 3 seconds or lose the viewer',
      'One key message, not three',
      'Text overlays for sound-off viewing',
      'Vertical format (9:16) for TikTok/Reels/Shorts',
      'Strong visual identity — brand colors, consistent style',
    ],
    beats: [
      {
        name: 'Hook',
        purpose: 'Stop the scroll in 3 seconds',
        sceneType: 'title-card',
        durationRatio: 0.15,
        tone: 'provocative',
        contentGuide: 'Bold statement, surprising stat, or pattern interrupt',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 1,
      },
      {
        name: 'Value',
        purpose: 'Deliver the one key insight or message',
        sceneType: 'talking-head',
        durationRatio: 0.60,
        tone: 'conversational',
        contentGuide: 'The main content — one clear message delivered with energy',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 4,
      },
      {
        name: 'CTA',
        purpose: 'Drive engagement',
        sceneType: 'cta-outro',
        durationRatio: 0.15,
        tone: 'playful',
        contentGuide: 'Follow, like, comment, or link in bio',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 1,
      },
    ],
  },

  // ─── TRAINING ─────────────────────────────────────────────
  training: {
    id: 'training',
    format: 'training',
    name: 'Training Module',
    description: 'Corporate L&D training with learning objectives and assessments',
    defaultTone: 'educational',
    durationRange: { min: 180, max: 1200 },
    minSpeakers: 1,
    guidelines: [
      'State learning objectives upfront',
      'Teach one concept per section',
      'Include practice/assessment after each concept',
      'Use examples and demonstrations',
      'Summarize key takeaways at the end',
    ],
    beats: [
      {
        name: 'Learning Objectives',
        purpose: 'Tell the learner what they will learn',
        sceneType: 'title-card',
        durationRatio: 0.08,
        tone: 'educational',
        contentGuide: 'List 2-4 specific learning objectives for this module',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 3,
      },
      {
        name: 'Concept Introduction',
        purpose: 'Introduce the core concept',
        sceneType: 'talking-head',
        durationRatio: 0.15,
        tone: 'educational',
        contentGuide: 'Explain the concept clearly with analogies or real-world examples',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 5,
      },
      {
        name: 'Demonstration',
        purpose: 'Show the concept in action',
        sceneType: 'screen-capture-vo',
        durationRatio: 0.25,
        tone: 'educational',
        contentGuide: 'Step-by-step walkthrough, screen capture, or whiteboard explanation',
        requiresSpeaker: true,
        minLines: 3,
        maxLines: 8,
      },
      {
        name: 'Practice Exercise',
        purpose: 'Let the learner apply what they learned',
        sceneType: 'quiz-interactive',
        durationRatio: 0.20,
        tone: 'conversational',
        contentGuide: 'Quiz, scenario exercise, or reflection prompt',
        requiresSpeaker: false,
        minLines: 2,
        maxLines: 5,
      },
      {
        name: 'Additional Concepts',
        purpose: 'Teach secondary concepts',
        sceneType: 'whiteboard-explainer',
        durationRatio: 0.15,
        tone: 'educational',
        contentGuide: 'Additional concepts, nuances, or advanced topics',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 5,
      },
      {
        name: 'Summary',
        purpose: 'Recap key takeaways',
        sceneType: 'talking-head',
        durationRatio: 0.10,
        tone: 'inspiring',
        contentGuide: 'Summarize the 2-4 key takeaways from this module',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 3,
      },
      {
        name: 'Next Steps',
        purpose: 'What to do after this module',
        sceneType: 'cta-outro',
        durationRatio: 0.07,
        tone: 'conversational',
        contentGuide: 'Direct to next module, additional resources, or practice activities',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 2,
      },
    ],
  },

  // ─── TESTIMONIAL ──────────────────────────────────────────
  testimonial: {
    id: 'testimonial',
    format: 'testimonial',
    name: 'Testimonial',
    description: 'Customer story with before/after narrative',
    defaultTone: 'empathetic',
    durationRange: { min: 60, max: 180 },
    minSpeakers: 1,
    guidelines: [
      'Lead with the customer, not the product',
      'Show the before state (pain) authentically',
      'Transition to the solution naturally',
      'Use specific metrics or outcomes when possible',
      'End with the customer\'s own words about the impact',
    ],
    beats: [
      {
        name: 'Introduction',
        purpose: 'Meet the customer and their context',
        sceneType: 'testimonial',
        durationRatio: 0.15,
        tone: 'conversational',
        contentGuide: 'Customer introduces themselves and their situation/challenge',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 3,
      },
      {
        name: 'Challenge',
        purpose: 'The pain point before the solution',
        sceneType: 'talking-head',
        durationRatio: 0.25,
        tone: 'empathetic',
        contentGuide: 'Customer describes the challenge they faced, the impact on their work/life',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 4,
      },
      {
        name: 'Discovery',
        purpose: 'How they found the solution',
        sceneType: 'b-roll-narration',
        durationRatio: 0.20,
        tone: 'conversational',
        contentGuide: 'Customer describes discovering and trying the solution',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 3,
      },
      {
        name: 'Results',
        purpose: 'Measurable outcomes and impact',
        sceneType: 'data-viz-narrative',
        durationRatio: 0.25,
        tone: 'inspiring',
        contentGuide: 'Specific metrics, time saved, revenue gained, problems solved',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 4,
      },
      {
        name: 'Recommendation',
        purpose: 'Customer\'s endorsement',
        sceneType: 'cta-outro',
        durationRatio: 0.15,
        tone: 'inspiring',
        contentGuide: 'Customer\'s closing recommendation, who should use this product',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 2,
      },
    ],
  },

  // ─── INTERVIEW ────────────────────────────────────────────
  interview: {
    id: 'interview',
    format: 'interview',
    name: 'Interview',
    description: 'Two-person interview format with host and guest',
    defaultTone: 'conversational',
    durationRange: { min: 180, max: 1800 },
    minSpeakers: 2,
    guidelines: [
      'Host drives the conversation with prepared questions',
      'Allow guest to tell stories, don\'t rush',
      'Include follow-up questions that show active listening',
      'Mix serious and lighter questions',
      'End with rapid-fire or personal questions',
    ],
    beats: [
      {
        name: 'Welcome',
        purpose: 'Host introduces the guest',
        sceneType: 'interview-2shot',
        durationRatio: 0.10,
        tone: 'conversational',
        contentGuide: 'Host warmly introduces the guest, their credentials, why they\'re here',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 4,
      },
      {
        name: 'Background',
        purpose: 'Guest shares their journey',
        sceneType: 'interview-2shot',
        durationRatio: 0.20,
        tone: 'conversational',
        contentGuide: 'Guest shares their background, career journey, how they got to where they are',
        requiresSpeaker: true,
        minLines: 3,
        maxLines: 8,
      },
      {
        name: 'Core Discussion',
        purpose: 'Deep dive into the main topic',
        sceneType: 'interview-2shot',
        durationRatio: 0.35,
        tone: 'educational',
        contentGuide: 'Host asks probing questions about the core topic, guest provides insights',
        requiresSpeaker: true,
        minLines: 5,
        maxLines: 12,
      },
      {
        name: 'Audience Questions',
        purpose: 'Address common audience questions',
        sceneType: 'split-screen-debate',
        durationRatio: 0.20,
        tone: 'conversational',
        contentGuide: 'Address 2-3 common questions the audience would have',
        requiresSpeaker: true,
        minLines: 3,
        maxLines: 6,
      },
      {
        name: 'Closing',
        purpose: 'Final thoughts and where to find the guest',
        sceneType: 'cta-outro',
        durationRatio: 0.10,
        tone: 'inspiring',
        contentGuide: 'Guest shares final wisdom, host thanks guest, links to guest\'s work',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 3,
      },
    ],
  },

  // ─── TUTORIAL ─────────────────────────────────────────────
  tutorial: {
    id: 'tutorial',
    format: 'tutorial',
    name: 'Tutorial',
    description: 'Step-by-step how-to guide with screen captures',
    defaultTone: 'educational',
    durationRange: { min: 120, max: 600 },
    minSpeakers: 1,
    guidelines: [
      'Show the end result first to motivate the learner',
      'Break steps into small, achievable chunks',
      'Narrate every click and action on screen',
      'Pause after complex steps for comprehension',
      'Include troubleshooting tips for common errors',
    ],
    beats: [
      {
        name: 'Preview',
        purpose: 'Show what the learner will build/achieve',
        sceneType: 'title-card',
        durationRatio: 0.10,
        tone: 'inspiring',
        contentGuide: 'Quick preview of the final result to motivate the learner',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 2,
      },
      {
        name: 'Prerequisites',
        purpose: 'What the learner needs before starting',
        sceneType: 'talking-head',
        durationRatio: 0.08,
        tone: 'educational',
        contentGuide: 'List tools, accounts, or knowledge needed',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 2,
      },
      {
        name: 'Step-by-Step Guide',
        purpose: 'Main tutorial walkthrough',
        sceneType: 'screen-capture-vo',
        durationRatio: 0.55,
        tone: 'educational',
        contentGuide: 'Detailed step-by-step walkthrough with screen captures and narration',
        requiresSpeaker: true,
        minLines: 5,
        maxLines: 15,
      },
      {
        name: 'Common Issues',
        purpose: 'Troubleshooting tips',
        sceneType: 'talking-head',
        durationRatio: 0.12,
        tone: 'empathetic',
        contentGuide: 'Address 2-3 common errors or issues learners encounter',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 4,
      },
      {
        name: 'Summary',
        purpose: 'Recap what was learned',
        sceneType: 'cta-outro',
        durationRatio: 0.10,
        tone: 'conversational',
        contentGuide: 'Quick recap of what was built, next steps for learning more',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 2,
      },
    ],
  },

  // ─── PRESENTATION ─────────────────────────────────────────
  presentation: {
    id: 'presentation',
    format: 'presentation',
    name: 'Presentation',
    description: 'Slide-per-scene presentation with data and visuals',
    defaultTone: 'authoritative',
    durationRange: { min: 120, max: 600 },
    minSpeakers: 1,
    guidelines: [
      'One idea per slide/scene',
      'Use visuals, not walls of text',
      'Include data to back up claims',
      'Tell a story, don\'t just list features',
      'End with clear next steps',
    ],
    beats: [
      {
        name: 'Title Slide',
        purpose: 'Set the agenda and credibility',
        sceneType: 'title-card',
        durationRatio: 0.08,
        tone: 'authoritative',
        contentGuide: 'Title, presenter name, agenda preview',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 2,
      },
      {
        name: 'Context',
        purpose: 'Why this presentation matters',
        sceneType: 'talking-head',
        durationRatio: 0.15,
        tone: 'educational',
        contentGuide: 'Market context, problem statement, or industry landscape',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 4,
      },
      {
        name: 'Key Points',
        purpose: 'Main content slides',
        sceneType: 'data-viz-narrative',
        durationRatio: 0.40,
        tone: 'authoritative',
        contentGuide: 'Core content with data, charts, and supporting evidence',
        requiresSpeaker: true,
        minLines: 4,
        maxLines: 10,
      },
      {
        name: 'Impact',
        purpose: 'Results, metrics, or projections',
        sceneType: 'data-viz-narrative',
        durationRatio: 0.20,
        tone: 'inspiring',
        contentGuide: 'Show the impact, results, ROI, or projections',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 4,
      },
      {
        name: 'Next Steps',
        purpose: 'Call to action and Q&A',
        sceneType: 'cta-outro',
        durationRatio: 0.10,
        tone: 'conversational',
        contentGuide: 'Clear next steps, ask for questions, contact info',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 2,
      },
    ],
  },

  // ─── PROMO ────────────────────────────────────────────────
  promo: {
    id: 'promo',
    format: 'promo',
    name: 'Promotional',
    description: 'Marketing promotional content with high energy',
    defaultTone: 'inspiring',
    durationRange: { min: 30, max: 120 },
    minSpeakers: 1,
    guidelines: [
      'Energy from the first frame',
      'Show benefits, not features',
      'Create urgency or FOMO',
      'Visual-heavy, minimal talking',
      'One clear CTA at the end',
    ],
    beats: [
      {
        name: 'Attention',
        purpose: 'Grab attention immediately',
        sceneType: 'montage-reel',
        durationRatio: 0.20,
        tone: 'dramatic',
        contentGuide: 'Fast-paced montage, bold text, high-energy visuals',
        requiresSpeaker: false,
        minLines: 1,
        maxLines: 2,
      },
      {
        name: 'Value Proposition',
        purpose: 'What makes this special',
        sceneType: 'talking-head',
        durationRatio: 0.35,
        tone: 'inspiring',
        contentGuide: 'The unique value, what sets this apart, why now',
        requiresSpeaker: true,
        minLines: 2,
        maxLines: 4,
      },
      {
        name: 'Social Proof',
        purpose: 'Build trust with evidence',
        sceneType: 'testimonial',
        durationRatio: 0.25,
        tone: 'empathetic',
        contentGuide: 'Quick testimonials, stats, logos, or trust signals',
        requiresSpeaker: false,
        minLines: 1,
        maxLines: 2,
      },
      {
        name: 'CTA',
        purpose: 'Drive immediate action',
        sceneType: 'cta-outro',
        durationRatio: 0.15,
        tone: 'urgent',
        contentGuide: 'Limited time offer, discount code, or urgent reason to act now',
        requiresSpeaker: true,
        minLines: 1,
        maxLines: 2,
      },
    ],
  },
};

// ─── TEMPLATE LOOKUP HELPERS ────────────────────────────────────────────────

/**
 * Get the best-matching script template for a format.
 */
export function getScriptTemplate(format: string): ScriptTemplate | undefined {
  // Direct match
  if (SCRIPT_TEMPLATES[format]) return SCRIPT_TEMPLATES[format];

  // Alias mapping
  const aliases: Record<string, string> = {
    'social-clip': 'social-short',
    'webcast': 'podcast',
    'product-demo': 'product-demo',
  };
  const aliased = aliases[format];
  if (aliased && SCRIPT_TEMPLATES[aliased]) return SCRIPT_TEMPLATES[aliased];

  // Fallback to explainer
  return SCRIPT_TEMPLATES.explainer;
}

/**
 * Get all available template IDs.
 */
export function getAvailableTemplates(): string[] {
  return Object.keys(SCRIPT_TEMPLATES);
}

/**
 * Scale template beats to a specific duration.
 * Returns beats with calculated durations in seconds.
 */
export function scaleTemplateToDuration(
  template: ScriptTemplate,
  targetDuration: number
): Array<ScriptTemplateBeat & { durationSeconds: number }> {
  return template.beats.map(beat => ({
    ...beat,
    durationSeconds: Math.round(beat.durationRatio * targetDuration),
  }));
}
