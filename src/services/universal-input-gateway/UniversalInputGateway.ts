/**
 * Universal Input Gateway (UIG)
 * 
 * Single entry point for all input types across the Genie ecosystem.
 * Auto-detects input type and routes to appropriate adapter.
 */

import { v4 as uuidv4 } from 'uuid';
import type { 
  InputType, InputAdapter, RawInput, StandardizedInput, 
  ProcessingOptions, UniversalInputGatewayConfig, GatewayResult 
} from './types';

import { textAdapter } from './adapters/textAdapter';
import { documentAdapter } from './adapters/documentAdapter';
import { imageAdapter, videoAdapter, audioAdapter } from './adapters/mediaAdapter';
import { urlAdapter } from './adapters/urlAdapter';
import { screenAdapter } from './adapters/screenAdapter';

// Adapter registry
const ADAPTERS: Record<InputType, InputAdapter> = {
  text: textAdapter,
  document: documentAdapter,
  image: imageAdapter,
  video: videoAdapter,
  audio: audioAdapter,
  url: urlAdapter,
  screen: screenAdapter
};

// MIME type to adapter mapping
const MIME_TYPE_MAP: Record<string, InputType> = {
  'text/plain': 'text',
  'text/markdown': 'text',
  'application/pdf': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'document',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/webm': 'audio'
};

export class UniversalInputGateway {
  private config: UniversalInputGatewayConfig;
  private adapters: Map<InputType, InputAdapter>;

  constructor(config?: Partial<UniversalInputGatewayConfig>) {
    this.config = {
      defaultMode: 'auto',
      autoDetect: true,
      defaultOptions: { quality: 'balanced' },
      ...config
    };
    
    this.adapters = new Map(Object.entries(ADAPTERS) as [InputType, InputAdapter][]);
    
    // Apply adapter overrides
    if (config?.adapterOverrides) {
      Object.entries(config.adapterOverrides).forEach(([type, adapter]) => {
        if (adapter) this.adapters.set(type as InputType, adapter);
      });
    }
  }

  /**
   * Detect input type from source
   */
  detectType(source: File | Blob | string | MediaStream): InputType {
    if (source instanceof MediaStream) return 'screen';
    
    if (source instanceof File) {
      const mimeType = source.type;
      if (MIME_TYPE_MAP[mimeType]) return MIME_TYPE_MAP[mimeType];
      
      // Fallback to extension
      const ext = source.name.split('.').pop()?.toLowerCase();
      if (['pdf', 'docx', 'pptx', 'xlsx'].includes(ext || '')) return 'document';
      if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) return 'image';
      if (['mp4', 'webm', 'mov'].includes(ext || '')) return 'video';
      if (['mp3', 'wav', 'm4a', 'ogg'].includes(ext || '')) return 'audio';
    }
    
    if (source instanceof Blob) {
      return MIME_TYPE_MAP[source.type] || 'document';
    }
    
    if (typeof source === 'string') {
      try {
        new URL(source);
        return 'url';
      } catch {
        return 'text';
      }
    }
    
    return 'text';
  }

  /**
   * Process any input through the gateway
   */
  async process(
    source: File | Blob | string | MediaStream,
    options?: Partial<ProcessingOptions>
  ): Promise<GatewayResult> {
    try {
      const type = this.detectType(source);
      const adapter = this.adapters.get(type);
      
      if (!adapter) {
        return {
          success: false,
          error: { code: 'NO_ADAPTER', message: `No adapter for type: ${type}` }
        };
      }
      
      const rawInput: RawInput = {
        type,
        source,
        fileName: source instanceof File ? source.name : undefined,
        mimeType: source instanceof File ? source.type : undefined,
        size: source instanceof File ? source.size : undefined
      };
      
      const validation = adapter.validate(rawInput);
      if (!validation.valid) {
        return {
          success: false,
          error: { code: 'VALIDATION_FAILED', message: validation.errors.join(', ') }
        };
      }
      
      const processOptions: ProcessingOptions = {
        mode: this.config.defaultMode,
        ...this.config.defaultOptions,
        ...options
      };
      
      const result = await adapter.process(rawInput, processOptions);
      
      return { success: true, input: result };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROCESSING_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        }
      };
    }
  }

  /**
   * Get available adapters
   */
  getAdapters(): InputType[] {
    return Array.from(this.adapters.keys());
  }
}

// Singleton instance
let gatewayInstance: UniversalInputGateway | null = null;

export function getGateway(config?: Partial<UniversalInputGatewayConfig>): UniversalInputGateway {
  if (!gatewayInstance || config) {
    gatewayInstance = new UniversalInputGateway(config);
  }
  return gatewayInstance;
}

export default UniversalInputGateway;
