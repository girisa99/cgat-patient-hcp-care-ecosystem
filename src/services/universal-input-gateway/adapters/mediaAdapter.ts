/**
 * Media Input Adapter
 * 
 * Handles Image, Video, and Audio inputs with transcription support.
 * Uses extract-video-audio and ask-genie-voice edge functions.
 */

import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import type { InputAdapter, RawInput, StandardizedInput, ProcessingOptions, InputType } from '../types';

// Image Adapter
export const imageAdapter: InputAdapter = {
  type: 'image',
  supportedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],

  canHandle(input: RawInput): boolean {
    if (input.type === 'image') return true;
    if (input.source instanceof File) {
      return this.supportedMimeTypes.includes(input.source.type) ||
             /\.(jpe?g|png|webp|gif|svg)$/i.test(input.source.name);
    }
    return false;
  },

  validate(input: RawInput) {
    const errors: string[] = [];
    const file = input.source as File;
    
    if (!(input.source instanceof File) && !(input.source instanceof Blob)) {
      errors.push('Image input must be a File or Blob');
    } else if (file.size > 20 * 1024 * 1024) {
      errors.push('Image exceeds maximum size (20MB)');
    }
    
    return { valid: errors.length === 0, errors };
  },

  async process(input: RawInput, options?: ProcessingOptions): Promise<StandardizedInput> {
    const file = input.source as File;
    const startTime = new Date();
    
    options?.onProgress?.(20, 'Analyzing image...');
    
    // Get image dimensions
    const dimensions = await getImageDimensions(file);
    
    // Convert to base64 for OCR if enabled
    let ocrText = '';
    if (options?.ocrEnabled !== false) {
      options?.onProgress?.(50, 'Extracting text (OCR)...');
      ocrText = await performOCR(file);
    }
    
    options?.onProgress?.(80, 'Generating suggestions...');
    
    const compatibility = generateImageCompatibility(ocrText, file.name);
    
    options?.onProgress?.(100, 'Complete');
    
    return {
      id: uuidv4(),
      type: 'image',
      mode: options?.mode || 'auto',
      raw: {
        source: file,
        fileName: file.name,
        mimeType: file.type
      },
      content: {
        text: ocrText,
        images: [{
          url: URL.createObjectURL(file),
          alt: file.name
        }]
      },
      metadata: {
        fileSize: file.size,
        mimeType: file.type,
        dimensions
      },
      analysis: options?.skipAnalysis ? undefined : {
        language: { code: 'en', name: 'English', confidence: 0.5 },
        contentType: { primary: 'visual', confidence: 0.9 },
        sentiment: 'neutral',
        tone: ['visual'],
        entities: [],
        topics: [],
        keywords: [],
        wordCount: ocrText.split(/\s+/).filter(Boolean).length,
        readingTime: 0,
        complexity: 'simple'
      },
      compatibility,
      processing: {
        status: 'complete',
        startedAt: startTime,
        completedAt: new Date(),
        duration: Date.now() - startTime.getTime()
      },
      createdAt: startTime,
      updatedAt: new Date()
    };
  }
};

// Video Adapter
export const videoAdapter: InputAdapter = {
  type: 'video',
  supportedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],

  canHandle(input: RawInput): boolean {
    if (input.type === 'video') return true;
    if (input.source instanceof File) {
      return this.supportedMimeTypes.includes(input.source.type) ||
             /\.(mp4|webm|mov|avi)$/i.test(input.source.name);
    }
    return false;
  },

  validate(input: RawInput) {
    const errors: string[] = [];
    const file = input.source as File;
    
    if (!(input.source instanceof File) && !(input.source instanceof Blob)) {
      errors.push('Video input must be a File or Blob');
    } else if (file.size > 500 * 1024 * 1024) {
      errors.push('Video exceeds maximum size (500MB)');
    }
    
    return { valid: errors.length === 0, errors };
  },

  async process(input: RawInput, options?: ProcessingOptions): Promise<StandardizedInput> {
    const file = input.source as File;
    const startTime = new Date();
    
    options?.onProgress?.(10, 'Uploading video...');
    
    // Extract audio and get metadata
    const { audioBlob, metadata } = await extractVideoAudio(file, options);
    
    options?.onProgress?.(40, 'Transcribing audio...');
    
    // Transcribe the audio
    const transcription = await transcribeAudio(audioBlob, options);
    
    options?.onProgress?.(80, 'Analyzing content...');
    
    const compatibility = generateVideoCompatibility(transcription.text);
    
    options?.onProgress?.(100, 'Complete');
    
    return {
      id: uuidv4(),
      type: 'video',
      mode: options?.mode || 'auto',
      raw: {
        source: file,
        fileName: file.name,
        mimeType: file.type
      },
      content: {
        text: transcription.text,
        markdown: transcription.text
      },
      transcription,
      metadata: {
        fileSize: file.size,
        mimeType: file.type,
        duration: metadata.duration,
        dimensions: metadata.dimensions,
        frameRate: metadata.frameRate,
        hasAudio: metadata.hasAudio
      },
      analysis: options?.skipAnalysis ? undefined : generateAnalysis(transcription.text),
      compatibility,
      processing: {
        status: 'complete',
        startedAt: startTime,
        completedAt: new Date(),
        duration: Date.now() - startTime.getTime(),
        provider: 'whisper'
      },
      createdAt: startTime,
      updatedAt: new Date()
    };
  }
};

// Audio Adapter
export const audioAdapter: InputAdapter = {
  type: 'audio',
  supportedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/mp4'],

  canHandle(input: RawInput): boolean {
    if (input.type === 'audio') return true;
    if (input.source instanceof File) {
      return this.supportedMimeTypes.includes(input.source.type) ||
             /\.(mp3|wav|webm|ogg|m4a)$/i.test(input.source.name);
    }
    return false;
  },

  validate(input: RawInput) {
    const errors: string[] = [];
    const file = input.source as File;
    
    if (!(input.source instanceof File) && !(input.source instanceof Blob)) {
      errors.push('Audio input must be a File or Blob');
    } else if (file.size > 100 * 1024 * 1024) {
      errors.push('Audio exceeds maximum size (100MB)');
    }
    
    return { valid: errors.length === 0, errors };
  },

  async process(input: RawInput, options?: ProcessingOptions): Promise<StandardizedInput> {
    const file = input.source as File;
    const startTime = new Date();
    
    options?.onProgress?.(20, 'Uploading audio...');
    
    // Get audio duration
    const duration = await getAudioDuration(file);
    
    options?.onProgress?.(40, 'Transcribing...');
    
    // Transcribe
    const transcription = await transcribeAudio(file, options);
    
    options?.onProgress?.(80, 'Analyzing...');
    
    const compatibility = generateAudioCompatibility(transcription.text);
    
    options?.onProgress?.(100, 'Complete');
    
    return {
      id: uuidv4(),
      type: 'audio',
      mode: options?.mode || 'auto',
      raw: {
        source: file,
        fileName: file.name,
        mimeType: file.type
      },
      content: {
        text: transcription.text,
        markdown: transcription.text
      },
      transcription,
      metadata: {
        fileSize: file.size,
        mimeType: file.type,
        duration
      },
      analysis: options?.skipAnalysis ? undefined : generateAnalysis(transcription.text),
      compatibility,
      processing: {
        status: 'complete',
        startedAt: startTime,
        completedAt: new Date(),
        duration: Date.now() - startTime.getTime(),
        provider: transcription.provider
      },
      createdAt: startTime,
      updatedAt: new Date()
    };
  }
};

// Helper functions
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
}

async function performOCR(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    
    const { data, error } = await supabase.functions.invoke('universal-media-processor', {
      body: {
        type: 'ocr',
        image: base64,
        mimeType: file.type
      }
    });
    
    if (error) throw error;
    return data?.text || '';
  } catch (e) {
    console.error('OCR failed:', e);
    return '';
  }
}

async function extractVideoAudio(file: File, options?: ProcessingOptions) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    
    const { data, error } = await supabase.functions.invoke('extract-video-audio', {
      body: {
        video: base64,
        fileName: file.name,
        mimeType: file.type
      }
    });
    
    if (error) throw error;
    
    // Convert base64 audio back to blob
    const audioBase64 = data?.audio || '';
    const audioBytes = atob(audioBase64);
    const audioArray = new Uint8Array(audioBytes.length);
    for (let i = 0; i < audioBytes.length; i++) {
      audioArray[i] = audioBytes.charCodeAt(i);
    }
    const audioBlob = new Blob([audioArray], { type: 'audio/mp3' });
    
    return {
      audioBlob,
      metadata: {
        duration: data?.duration || 0,
        dimensions: data?.dimensions || { width: 0, height: 0 },
        frameRate: data?.frameRate || 30,
        hasAudio: true
      }
    };
  } catch (e) {
    console.error('Video audio extraction failed:', e);
    return {
      audioBlob: new Blob(),
      metadata: { duration: 0, dimensions: { width: 0, height: 0 }, frameRate: 30, hasAudio: false }
    };
  }
}

async function transcribeAudio(file: File | Blob, options?: ProcessingOptions) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    
    const { data, error } = await supabase.functions.invoke('ask-genie-voice', {
      body: {
        action: 'transcribe',
        audio: base64,
        provider: options?.transcriptionProvider || 'whisper',
        language: options?.transcriptionLanguage
      }
    });
    
    if (error) throw error;
    
    return {
      text: data?.text || '',
      segments: data?.segments || [],
      language: data?.language || 'en',
      provider: data?.provider || 'whisper'
    };
  } catch (e) {
    console.error('Transcription failed:', e);
    return { text: '', segments: [], language: 'en', provider: 'whisper' };
  }
}

async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      URL.revokeObjectURL(audio.src);
    };
    audio.onerror = () => resolve(0);
    audio.src = URL.createObjectURL(file);
  });
}

function generateAnalysis(text: string) {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return {
    language: { code: 'en', name: 'English', confidence: 0.85 },
    contentType: { primary: 'spoken', confidence: 0.9 },
    sentiment: 'neutral' as const,
    tone: ['conversational'],
    entities: [],
    topics: [],
    keywords: [],
    wordCount,
    readingTime: Math.ceil(wordCount / 200),
    complexity: 'moderate' as const
  };
}

function generateImageCompatibility(text: string, fileName: string) {
  return {
    industries: [],
    frameworks: [],
    visualFeatures: [
      { id: 'images' as const, name: 'Images', confidence: 0.95, reason: 'Image input detected' }
    ],
    outputFormats: [
      { id: 'pptx-export' as const, name: 'PowerPoint', confidence: 0.9, reason: 'Standard format' }
    ],
    templates: [],
    warnings: []
  };
}

function generateVideoCompatibility(text: string) {
  return {
    industries: [],
    frameworks: [],
    visualFeatures: [
      { id: 'video-clips' as const, name: 'Video Clips', confidence: 0.95, reason: 'Video source' }
    ],
    outputFormats: [
      { id: 'video-short' as const, name: 'Short Video', confidence: 0.9, reason: 'Video content' },
      { id: 'pptx-export' as const, name: 'PowerPoint', confidence: 0.75, reason: 'Presentation format' }
    ],
    templates: [],
    warnings: []
  };
}

function generateAudioCompatibility(text: string) {
  return {
    industries: [],
    frameworks: [],
    visualFeatures: [],
    outputFormats: [
      { id: 'pptx-export' as const, name: 'PowerPoint', confidence: 0.85, reason: 'Presentation from audio' },
      { id: 'video-short' as const, name: 'Short Video', confidence: 0.8, reason: 'Audio content' }
    ],
    templates: [],
    warnings: []
  };
}

export default { imageAdapter, videoAdapter, audioAdapter };
