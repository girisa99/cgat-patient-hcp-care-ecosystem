/**
 * Shared constants for Genie Suite
 * Centralized configuration for UI options
 */

import React from 'react';
import {
  FileText,
  Mic,
  Link,
  Video,
  Layers,
  Film,
  Presentation,
  BookOpen,
  Radio,
  GraduationCap,
  Image as ImageIcon,
} from 'lucide-react';
import type { ContentTypeOption, ToneOption, DurationOption } from './types';

export const CONTENT_TYPES: ContentTypeOption[] = [
  {
    id: 'document',
    label: 'Document → Script',
    description: 'PDF, DOCX, PPTX, TXT, MD',
    icon: React.createElement(FileText, { className: 'h-4 w-4' }),
    acceptedFiles: '.pdf,.docx,.pptx,.txt,.md,.html,.rtf',
    outputFormats: [
      { value: 'video_script', label: 'Video Script', icon: React.createElement(Film, { className: 'h-4 w-4' }) },
      { value: 'podcast_script', label: 'Podcast Script', icon: React.createElement(Mic, { className: 'h-4 w-4' }) },
      { value: 'presentation_script', label: 'Presentation', icon: React.createElement(Presentation, { className: 'h-4 w-4' }) },
      { value: 'webinar_script', label: 'Webinar Script', icon: React.createElement(BookOpen, { className: 'h-4 w-4' }) },
    ],
    defaultTone: 'professional',
    defaultDuration: 180,
  },
  {
    id: 'image',
    label: 'Image → Script',
    description: 'JPG, PNG, WebP, or generate',
    icon: React.createElement(ImageIcon, { className: 'h-4 w-4' }),
    acceptedFiles: '.jpg,.jpeg,.png,.gif,.webp,.svg',
    outputFormats: [
      { value: 'social_post', label: 'Social Post', icon: React.createElement(Radio, { className: 'h-4 w-4' }) },
      { value: 'product_video', label: 'Product Video', icon: React.createElement(Film, { className: 'h-4 w-4' }) },
      { value: 'tutorial', label: 'Tutorial', icon: React.createElement(GraduationCap, { className: 'h-4 w-4' }) },
      { value: 'presentation', label: 'Presentation', icon: React.createElement(Presentation, { className: 'h-4 w-4' }) },
    ],
    defaultTone: 'casual',
    defaultDuration: 60,
  },
  {
    id: 'audio',
    label: 'Audio → Script',
    description: 'MP3, WAV, M4A (transcribe)',
    icon: React.createElement(Mic, { className: 'h-4 w-4' }),
    acceptedFiles: '.mp3,.wav,.ogg,.m4a,.flac,.aac',
    outputFormats: [
      { value: 'transcript', label: 'Transcript', icon: React.createElement(FileText, { className: 'h-4 w-4' }) },
      { value: 'summary', label: 'Summary', icon: React.createElement(BookOpen, { className: 'h-4 w-4' }) },
      { value: 'podcast_notes', label: 'Podcast Notes', icon: React.createElement(Mic, { className: 'h-4 w-4' }) },
      { value: 'meeting_notes', label: 'Meeting Notes', icon: React.createElement(FileText, { className: 'h-4 w-4' }) },
    ],
    defaultTone: 'professional',
    defaultDuration: 300,
  },
  {
    id: 'video',
    label: 'Video → Script',
    description: 'MP4, MOV, WebM (analyze)',
    icon: React.createElement(Video, { className: 'h-4 w-4' }),
    acceptedFiles: '.mp4,.mov,.webm,.avi,.mkv',
    outputFormats: [
      { value: 'video_script', label: 'Video Script', icon: React.createElement(Film, { className: 'h-4 w-4' }) },
      { value: 'summary', label: 'Summary', icon: React.createElement(BookOpen, { className: 'h-4 w-4' }) },
      { value: 'social_clips', label: 'Social Clips', icon: React.createElement(Radio, { className: 'h-4 w-4' }) },
      { value: 'highlights', label: 'Highlights', icon: React.createElement(Layers, { className: 'h-4 w-4' }) },
    ],
    defaultTone: 'casual',
    defaultDuration: 120,
  },
  {
    id: 'url',
    label: 'URL → Script',
    description: 'Website, blog, YouTube, article',
    icon: React.createElement(Link, { className: 'h-4 w-4' }),
    acceptedFiles: '',
    outputFormats: [
      { value: 'video_script', label: 'Video Script', icon: React.createElement(Film, { className: 'h-4 w-4' }) },
      { value: 'podcast_script', label: 'Podcast Script', icon: React.createElement(Mic, { className: 'h-4 w-4' }) },
      { value: 'social_post', label: 'Social Post', icon: React.createElement(Radio, { className: 'h-4 w-4' }) },
      { value: 'blog_post', label: 'Blog Post', icon: React.createElement(FileText, { className: 'h-4 w-4' }) },
    ],
    defaultTone: 'professional',
    defaultDuration: 180,
  },
  {
    id: 'full-pipeline',
    label: 'Full Pipeline',
    description: 'Multi-source orchestration',
    icon: React.createElement(Layers, { className: 'h-4 w-4' }),
    acceptedFiles: '.pdf,.docx,.pptx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.mp4,.mov',
    outputFormats: [
      { value: 'video_script', label: 'Video Script', icon: React.createElement(Film, { className: 'h-4 w-4' }) },
      { value: 'presentation', label: 'Presentation', icon: React.createElement(Presentation, { className: 'h-4 w-4' }) },
      { value: 'course', label: 'Course', icon: React.createElement(GraduationCap, { className: 'h-4 w-4' }) },
      { value: 'webinar', label: 'Webinar', icon: React.createElement(BookOpen, { className: 'h-4 w-4' }) },
    ],
    defaultTone: 'professional',
    defaultDuration: 600,
  },
];

export const TONE_OPTIONS: ToneOption[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'educational', label: 'Educational' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'informative', label: 'Informative' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'conversational', label: 'Conversational' },
];

export const DURATION_OPTIONS: DurationOption[] = [
  { value: 30, label: '30 sec (~75 words)' },
  { value: 60, label: '1 min (~150 words)' },
  { value: 120, label: '2 min (~300 words)' },
  { value: 180, label: '3 min (~450 words)' },
  { value: 300, label: '5 min (~750 words)' },
  { value: 600, label: '10 min (~1500 words)' },
  { value: 900, label: '15 min (~2250 words)' },
  { value: 1800, label: '30 min (~4500 words)' },
];

export function getContentTypeById(id: string): ContentTypeOption | undefined {
  return CONTENT_TYPES.find(ct => ct.id === id);
}
