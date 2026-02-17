/**
 * Screen Recording Input Adapter
 * 
 * Handles screen capture and recording using browser-native APIs.
 */

import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import type { InputAdapter, RawInput, StandardizedInput, ProcessingOptions } from '../types';

export const screenAdapter: InputAdapter = {
  type: 'screen',
  supportedMimeTypes: ['video/webm', 'video/mp4'],

  canHandle(input: RawInput): boolean {
    return input.type === 'screen' || input.source instanceof MediaStream;
  },

  validate(input: RawInput) {
    const errors: string[] = [];
    
    if (!(input.source instanceof Blob) && !(input.source instanceof MediaStream)) {
      errors.push('Screen input must be a Blob or MediaStream');
    }
    
    return { valid: errors.length === 0, errors };
  },

  async process(input: RawInput, options?: ProcessingOptions): Promise<StandardizedInput> {
    const startTime = new Date();
    let recordedBlob: Blob;
    
    if (input.source instanceof MediaStream) {
      options?.onProgress?.(10, 'Recording screen...');
      // This case is handled by the hook - we receive the final blob
      throw new Error('MediaStream should be recorded first using useScreenRecording hook');
    } else {
      recordedBlob = input.source as Blob;
    }
    
    options?.onProgress?.(30, 'Processing recording...');
    
    // Get video duration
    const duration = await getVideoDuration(recordedBlob);
    
    options?.onProgress?.(50, 'Transcribing audio...');
    
    // Transcribe if has audio
    let transcription = { text: '', segments: [], language: 'en', provider: 'whisper' };
    
    try {
      const arrayBuffer = await recordedBlob.arrayBuffer();
      const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
      
      const { data, error } = await supabase.functions.invoke('ask-genie-voice', {
        body: {
          action: 'transcribe',
          audio: base64,
          provider: options?.transcriptionProvider || 'whisper'
        }
      });
      
      if (!error && data?.text) {
        transcription = {
          text: data.text,
          segments: data.segments || [],
          language: data.language || 'en',
          provider: data.provider || 'whisper'
        };
      }
    } catch (e) {
      console.warn('Transcription failed:', e);
    }
    
    options?.onProgress?.(80, 'Analyzing content...');
    
    const wordCount = transcription.text.split(/\s+/).filter(Boolean).length;
    const compatibility = generateScreenCompatibility(transcription.text);
    
    options?.onProgress?.(100, 'Complete');
    
    return {
      id: uuidv4(),
      type: 'screen',
      mode: options?.mode || 'auto',
      raw: {
        source: recordedBlob,
        fileName: `screen-recording-${Date.now()}.webm`,
        mimeType: 'video/webm'
      },
      content: {
        text: transcription.text,
        markdown: transcription.text
      },
      transcription: transcription.text ? transcription : undefined,
      metadata: {
        fileSize: recordedBlob.size,
        mimeType: 'video/webm',
        duration
      },
      analysis: options?.skipAnalysis ? undefined : {
        language: { code: transcription.language, name: 'English', confidence: 0.85 },
        contentType: { primary: 'screen-recording', confidence: 0.95 },
        sentiment: 'neutral',
        tone: ['instructional'],
        entities: [],
        topics: [],
        keywords: [],
        wordCount,
        readingTime: Math.ceil(duration / 60),
        complexity: 'moderate'
      },
      compatibility,
      processing: {
        status: 'complete',
        startedAt: startTime,
        completedAt: new Date(),
        duration: Date.now() - startTime.getTime(),
        provider: 'browser-native'
      },
      createdAt: startTime,
      updatedAt: new Date()
    };
  }
};

async function getVideoDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve(video.duration);
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => resolve(0);
    video.src = URL.createObjectURL(blob);
  });
}

function generateScreenCompatibility(text: string) {
  const lowerText = text.toLowerCase();
  
  const industries: StandardizedInput['compatibility']['industries'] = [];
  const frameworks: StandardizedInput['compatibility']['frameworks'] = [];
  const visualFeatures: StandardizedInput['compatibility']['visualFeatures'] = [];
  const outputFormats: StandardizedInput['compatibility']['outputFormats'] = [];
  
  // Screen recordings often contain product demos
  if (/\b(click|button|menu|screen|tab)\b/.test(lowerText)) {
    frameworks.push({ id: 'product-led', name: 'Product-Led', confidence: 0.8, reason: 'UI interaction detected' });
  }
  
  // Visual features for screen content
  visualFeatures.push({ id: 'video-clips', name: 'Video Clips', confidence: 0.9, reason: 'Screen recording source' });
  
  if (/\b(step|then|next|first)\b/.test(lowerText)) {
    visualFeatures.push({ id: 'timelines', name: 'Timelines', confidence: 0.75, reason: 'Step-by-step content' });
  }
  
  // Output formats suited for screen recordings
  outputFormats.push({ id: 'video-short', name: 'Short Video', confidence: 0.9, reason: 'Screen recording content' });
  outputFormats.push({ id: 'pptx-export', name: 'PowerPoint', confidence: 0.8, reason: 'Presentation format' });
  outputFormats.push({ id: 'interactive', name: 'Interactive', confidence: 0.75, reason: 'Demo-style content' });
  
  // Templates
  const templates: StandardizedInput['compatibility']['templates'] = [
    { id: 'product-demo', name: 'Product Demo', confidence: 0.85, reason: 'Screen recording source' },
    { id: 'training-manual', name: 'Training Manual', confidence: 0.75, reason: 'Tutorial-style content' }
  ];
  
  return {
    industries,
    frameworks,
    visualFeatures,
    outputFormats,
    templates,
    warnings: []
  };
}

export default screenAdapter;
