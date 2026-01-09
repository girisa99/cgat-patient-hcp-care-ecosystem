/**
 * Shared types for Genie Studio components
 * Centralized type definitions for consistency
 */

import { ReactNode } from 'react';

// Content type options
export type ContentType = 'document' | 'image' | 'audio' | 'video' | 'url' | 'full-pipeline';

export interface ContentTypeOption {
  id: ContentType;
  label: string;
  description: string;
  icon: ReactNode;
  acceptedFiles: string;
  outputFormats: OutputFormatOption[];
  defaultTone: string;
  defaultDuration: number;
}

export interface OutputFormatOption {
  value: string;
  label: string;
  icon: ReactNode;
}

export interface ToneOption {
  value: string;
  label: string;
}

export interface DurationOption {
  value: number;
  label: string;
}

export interface DetectedFile {
  file: File;
  preview?: string;
}

// Generation state
export interface GenerationState {
  isProcessing: boolean;
  progress: number;
  progressMessage: string;
  error: string | null;
}

// Script generation options
export interface ScriptGenerationOptions {
  outputFormat: string;
  tone: string;
  duration: number;
  targetAudience: string;
  provider: string;
  enableKnowledgeSearch: boolean;
}

// Export for backwards compatibility
export type { GeneratedContent, PostAction } from '../PostGenerationActions';
