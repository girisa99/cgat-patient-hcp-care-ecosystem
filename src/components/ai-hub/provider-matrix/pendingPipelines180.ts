/**
 * PENDING 39 PIPELINES (Categories 16-18)
 * 
 * 16 Podcast/Webcast + 15 Editing + 5 Mobile + 3 Training
 * All wired to 12 Core Providers with 5-Zone Routing
 */

import type { PipelineIOEntry, PipelineTier } from './pipelineIORegistry';

// ═══════════════════════════════════════════════════════════════
// CATEGORY 16: PODCAST & WEBCAST (16 Pipelines)
// ═══════════════════════════════════════════════════════════════
export const PODCAST_WEBCAST_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'audio-to-podcast',
    name: 'Audio to Podcast',
    tier: 'Pro',
    inputFormats: ['mp3', 'wav', 'm4a'],
    outputFormats: ['mp3', 'wav', 'rss'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['ElevenLabs', 'Azure', 'OpenAI'],
    notes: 'Full podcast production with intro/outro, music beds'
  },
  {
    id: 'text-to-podcast',
    name: 'Text to Podcast',
    tier: 'Pro',
    inputFormats: ['txt', 'docx', 'md'],
    outputFormats: ['mp3', 'wav', 'rss'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['ElevenLabs', 'Claude', 'OpenAI'],
    notes: 'Script-to-audio with multiple voices'
  },
  {
    id: 'interview-to-podcast',
    name: 'Interview to Podcast',
    tier: 'Pro',
    inputFormats: ['mp3', 'wav', 'mp4'],
    outputFormats: ['mp3', 'wav'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['Azure', 'ElevenLabs', 'OpenAI'],
    notes: 'Auto-edit interviews with silence removal, enhancement'
  },
  {
    id: 'podcast-to-clips',
    name: 'Podcast to Clips',
    tier: 'Starter',
    inputFormats: ['mp3', 'wav'],
    outputFormats: ['mp3', 'mp4', 'wav'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['OpenAI', 'Claude', 'ElevenLabs'],
    notes: 'Extract highlight clips from long-form podcasts'
  },
  {
    id: 'podcast-to-video',
    name: 'Podcast to Video',
    tier: 'Pro',
    inputFormats: ['mp3', 'wav'],
    outputFormats: ['mp4', 'webm'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['ModelsLab', 'Alibaba', 'OpenAI'],
    notes: 'Add visuals, waveforms, captions to audio'
  },
  {
    id: 'podcast-transcription',
    name: 'Podcast Transcription',
    tier: 'Starter',
    inputFormats: ['mp3', 'wav', 'm4a'],
    outputFormats: ['txt', 'srt', 'vtt', 'docx'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['Azure', 'OpenAI', 'GCP'],
    notes: 'Multi-speaker transcription with timestamps'
  },
  {
    id: 'podcast-show-notes',
    name: 'Podcast Show Notes',
    tier: 'Starter',
    inputFormats: ['mp3', 'wav', 'txt'],
    outputFormats: ['md', 'html', 'txt'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['Claude', 'OpenAI', 'Gemini'],
    notes: 'Auto-generate show notes, timestamps, summaries'
  },
  {
    id: 'webinar-to-podcast',
    name: 'Webinar to Podcast',
    tier: 'Pro',
    inputFormats: ['mp4', 'webm', 'mov'],
    outputFormats: ['mp3', 'wav'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['Azure', 'ElevenLabs', 'OpenAI'],
    notes: 'Extract and enhance audio from webinar recordings'
  },
  {
    id: 'multi-host-podcast',
    name: 'Multi-Host Podcast',
    tier: 'Pro',
    inputFormats: ['txt', 'json'],
    outputFormats: ['mp3', 'wav'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['ElevenLabs', 'Azure', 'Alibaba'],
    notes: 'Generate conversation between multiple AI voices'
  },
  {
    id: 'podcast-intro-outro',
    name: 'Podcast Intro/Outro',
    tier: 'Starter',
    inputFormats: ['txt', 'json'],
    outputFormats: ['mp3', 'wav'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['ElevenLabs', 'Azure', 'OpenAI'],
    notes: 'Generate branded intro and outro segments'
  },
  {
    id: 'live-stream-to-podcast',
    name: 'Live Stream to Podcast',
    tier: 'Pro',
    inputFormats: ['mp4', 'flv', 'ts'],
    outputFormats: ['mp3', 'wav', 'rss'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['Azure', 'OpenAI', 'ElevenLabs'],
    notes: 'Convert live stream recordings to podcast format'
  },
  {
    id: 'podcast-enhancement',
    name: 'Podcast Enhancement',
    tier: 'Pro',
    inputFormats: ['mp3', 'wav'],
    outputFormats: ['mp3', 'wav'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['Azure', 'ElevenLabs', 'OpenAI'],
    notes: 'Audio cleanup, noise reduction, leveling'
  },
  {
    id: 'podcast-dubbing',
    name: 'Podcast Dubbing',
    tier: 'Enterprise',
    inputFormats: ['mp3', 'wav'],
    outputFormats: ['mp3', 'wav'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['ElevenLabs', 'Azure', 'Alibaba'],
    notes: 'Multi-language dubbing with voice cloning'
  },
  {
    id: 'audiogram-generator',
    name: 'Audiogram Generator',
    tier: 'Starter',
    inputFormats: ['mp3', 'wav'],
    outputFormats: ['mp4', 'gif'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['ModelsLab', 'OpenAI'],
    notes: 'Create animated waveform videos for social'
  },
  {
    id: 'podcast-to-blog',
    name: 'Podcast to Blog',
    tier: 'Pro',
    inputFormats: ['mp3', 'wav', 'txt'],
    outputFormats: ['md', 'html', 'docx'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['Claude', 'OpenAI', 'Gemini'],
    notes: 'Convert podcast content to written articles'
  },
  {
    id: 'webcast-recording',
    name: 'Webcast Recording',
    tier: 'Pro',
    inputFormats: ['rtmp', 'hls', 'webrtc'],
    outputFormats: ['mp4', 'webm', 'mp3'],
    category: 'podcast_webcast',
    isCovered: true,
    providers: ['GCP', 'Azure'],
    notes: 'Record and process live webcasts'
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 17: EDITING PIPELINES - FFmpeg Wrapper (15 Pipelines)
// ═══════════════════════════════════════════════════════════════
export const EDITING_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'video-trim',
    name: 'Video Trim',
    tier: 'Starter',
    inputFormats: ['mp4', 'webm', 'mov'],
    outputFormats: ['mp4', 'webm'],
    category: 'editing',
    isCovered: true,
    providers: ['FFmpeg'],
    notes: 'Precise frame-accurate trimming'
  },
  {
    id: 'video-crop',
    name: 'Video Crop',
    tier: 'Starter',
    inputFormats: ['mp4', 'webm', 'mov'],
    outputFormats: ['mp4', 'webm'],
    category: 'editing',
    isCovered: true,
    providers: ['FFmpeg'],
    notes: 'Aspect ratio conversion, crop to region'
  },
  {
    id: 'video-resize',
    name: 'Video Resize',
    tier: 'Starter',
    inputFormats: ['mp4', 'webm', 'mov'],
    outputFormats: ['mp4', 'webm'],
    category: 'editing',
    isCovered: true,
    providers: ['FFmpeg'],
    notes: 'Resolution scaling with quality preservation'
  },
  {
    id: 'video-concat',
    name: 'Video Concatenate',
    tier: 'Starter',
    inputFormats: ['mp4', 'webm'],
    outputFormats: ['mp4', 'webm'],
    category: 'editing',
    isCovered: true,
    providers: ['FFmpeg'],
    notes: 'Join multiple clips seamlessly'
  },
  {
    id: 'video-speed',
    name: 'Video Speed Change',
    tier: 'Starter',
    inputFormats: ['mp4', 'webm'],
    outputFormats: ['mp4', 'webm'],
    category: 'editing',
    isCovered: true,
    providers: ['FFmpeg'],
    notes: 'Speed up/slow down with audio pitch correction'
  },
  {
    id: 'video-watermark',
    name: 'Video Watermark',
    tier: 'Starter',
    inputFormats: ['mp4', 'webm'],
    outputFormats: ['mp4', 'webm'],
    category: 'editing',
    isCovered: true,
    providers: ['FFmpeg'],
    notes: 'Add image/text watermarks with positioning'
  },
  {
    id: 'video-overlay',
    name: 'Video Overlay',
    tier: 'Pro',
    inputFormats: ['mp4', 'webm', 'png'],
    outputFormats: ['mp4', 'webm'],
    category: 'editing',
    isCovered: true,
    providers: ['FFmpeg'],
    notes: 'Picture-in-picture, lower thirds, graphics'
  },
  {
    id: 'video-stabilization',
    name: 'Video Stabilization',
    tier: 'Pro',
    inputFormats: ['mp4', 'webm', 'mov'],
    outputFormats: ['mp4', 'webm'],
    category: 'editing',
    isCovered: true,
    providers: ['FFmpeg', 'ModelsLab'],
    notes: 'Reduce camera shake with AI enhancement'
  },
  {
    id: 'video-color-grade',
    name: 'Video Color Grade',
    tier: 'Pro',
    inputFormats: ['mp4', 'webm'],
    outputFormats: ['mp4', 'webm'],
    category: 'editing',
    isCovered: true,
    providers: ['FFmpeg', 'ModelsLab'],
    notes: 'LUT application, color correction'
  },
  {
    id: 'video-denoise',
    name: 'Video Denoise',
    tier: 'Pro',
    inputFormats: ['mp4', 'webm'],
    outputFormats: ['mp4', 'webm'],
    category: 'editing',
    isCovered: true,
    providers: ['FFmpeg', 'ModelsLab'],
    notes: 'AI-powered noise reduction'
  },
  {
    id: 'audio-extract',
    name: 'Audio Extract',
    tier: 'Starter',
    inputFormats: ['mp4', 'webm', 'mov'],
    outputFormats: ['mp3', 'wav', 'aac'],
    category: 'editing',
    isCovered: true,
    providers: ['FFmpeg'],
    notes: 'Extract audio track from video'
  },
  {
    id: 'audio-replace',
    name: 'Audio Replace',
    tier: 'Starter',
    inputFormats: ['mp4', 'mp3', 'wav'],
    outputFormats: ['mp4', 'webm'],
    category: 'editing',
    isCovered: true,
    providers: ['FFmpeg'],
    notes: 'Replace video audio with new track'
  },
  {
    id: 'audio-normalize',
    name: 'Audio Normalize',
    tier: 'Starter',
    inputFormats: ['mp3', 'wav', 'mp4'],
    outputFormats: ['mp3', 'wav', 'mp4'],
    category: 'editing',
    isCovered: true,
    providers: ['FFmpeg'],
    notes: 'Loudness normalization to broadcast standards'
  },
  {
    id: 'gif-to-video',
    name: 'GIF to Video',
    tier: 'Starter',
    inputFormats: ['gif'],
    outputFormats: ['mp4', 'webm'],
    category: 'editing',
    isCovered: true,
    providers: ['FFmpeg'],
    notes: 'Convert animated GIFs to video format'
  },
  {
    id: 'video-to-gif',
    name: 'Video to GIF',
    tier: 'Starter',
    inputFormats: ['mp4', 'webm'],
    outputFormats: ['gif'],
    category: 'editing',
    isCovered: true,
    providers: ['FFmpeg'],
    notes: 'Create optimized GIFs from video clips'
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 18: MOBILE PIPELINES - Record to Publish (5 Pipelines)
// ═══════════════════════════════════════════════════════════════
export const MOBILE_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'mobile-record-to-reel',
    name: 'Mobile Record to Reel',
    tier: 'Starter',
    inputFormats: ['mp4', 'mov', 'webm'],
    outputFormats: ['mp4'],
    category: 'mobile',
    isCovered: true,
    providers: ['FFmpeg', 'ModelsLab', 'OpenAI'],
    notes: '<60s record-to-publish flow for Instagram/TikTok'
  },
  {
    id: 'mobile-record-to-story',
    name: 'Mobile Record to Story',
    tier: 'Starter',
    inputFormats: ['mp4', 'mov'],
    outputFormats: ['mp4'],
    category: 'mobile',
    isCovered: true,
    providers: ['FFmpeg', 'OpenAI'],
    notes: '15s vertical story format with auto-captions'
  },
  {
    id: 'mobile-quick-edit',
    name: 'Mobile Quick Edit',
    tier: 'Starter',
    inputFormats: ['mp4', 'mov'],
    outputFormats: ['mp4'],
    category: 'mobile',
    isCovered: true,
    providers: ['FFmpeg'],
    notes: 'Fast trim, filter, caption on device'
  },
  {
    id: 'mobile-voice-memo-to-video',
    name: 'Voice Memo to Video',
    tier: 'Pro',
    inputFormats: ['m4a', 'mp3', 'wav'],
    outputFormats: ['mp4'],
    category: 'mobile',
    isCovered: true,
    providers: ['ModelsLab', 'ElevenLabs', 'OpenAI'],
    notes: 'Convert voice recordings to visual content'
  },
  {
    id: 'mobile-photo-to-video',
    name: 'Photo to Video',
    tier: 'Starter',
    inputFormats: ['jpg', 'png', 'heic'],
    outputFormats: ['mp4'],
    category: 'mobile',
    isCovered: true,
    providers: ['ModelsLab', 'Alibaba'],
    notes: 'Ken Burns effect, slideshow generation'
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 19: TRAINING ADDITIONS (3 Pipelines)
// ═══════════════════════════════════════════════════════════════
export const TRAINING_ADDITIONS: PipelineIOEntry[] = [
  {
    id: 'interactive-quiz-generator',
    name: 'Interactive Quiz Generator',
    tier: 'Pro',
    inputFormats: ['txt', 'docx', 'pdf', 'pptx'],
    outputFormats: ['html', 'scorm', 'json'],
    category: 'training_ld',
    isCovered: true,
    providers: ['Claude', 'OpenAI', 'Gemini'],
    notes: 'Generate interactive quizzes from training content'
  },
  {
    id: 'scenario-simulator',
    name: 'Scenario Simulator',
    tier: 'Enterprise',
    inputFormats: ['txt', 'json'],
    outputFormats: ['html', 'scorm', 'mp4'],
    category: 'training_ld',
    isCovered: true,
    providers: ['Claude', 'ModelsLab', 'Alibaba'],
    notes: 'Branching scenario training with AI avatars'
  },
  {
    id: 'compliance-training-generator',
    name: 'Compliance Training Generator',
    tier: 'Enterprise',
    inputFormats: ['pdf', 'docx', 'txt'],
    outputFormats: ['scorm', 'html', 'mp4'],
    category: 'training_ld',
    isCovered: true,
    providers: ['Claude', 'OpenAI', 'Azure'],
    notes: 'Auto-generate compliance courses from policies'
  }
];

// ═══════════════════════════════════════════════════════════════
// COMBINED PENDING PIPELINES (39 Total)
// ═══════════════════════════════════════════════════════════════
export const PENDING_39_PIPELINES: PipelineIOEntry[] = [
  ...PODCAST_WEBCAST_PIPELINES,
  ...EDITING_PIPELINES,
  ...MOBILE_PIPELINES,
  ...TRAINING_ADDITIONS
];

// Category metadata for the new categories
export const PENDING_CATEGORY_METADATA = {
  podcast_webcast: {
    name: 'Podcast & Webcast',
    description: 'Audio-first content creation and distribution',
    icon: 'Mic',
    color: 'purple',
    pipelineCount: 16,
    automationLevel: 95
  },
  editing: {
    name: 'Editing',
    description: 'FFmpeg-powered video and audio editing tools',
    icon: 'Scissors',
    color: 'orange',
    pipelineCount: 15,
    automationLevel: 98
  },
  mobile: {
    name: 'Mobile',
    description: 'Record-to-publish mobile-first workflows',
    icon: 'Smartphone',
    color: 'green',
    pipelineCount: 5,
    automationLevel: 95
  }
};

// Get all 180 pipelines (141 existing + 39 pending)
export function getAll180Pipelines(existingPipelines: PipelineIOEntry[]): PipelineIOEntry[] {
  return [...existingPipelines, ...PENDING_39_PIPELINES];
}

// Get pipeline stats for 180
export function get180PipelineStats() {
  return {
    total: 180,
    implemented: 141,
    pending: 39,
    categories: 18,
    podcastWebcast: PODCAST_WEBCAST_PIPELINES.length,
    editing: EDITING_PIPELINES.length,
    mobile: MOBILE_PIPELINES.length,
    trainingAdditions: TRAINING_ADDITIONS.length
  };
}
