/**
 * Universal Input Gateway - Public API
 */

export * from './types';
export * from './UniversalInputGateway';

// Adapters (for custom usage)
export { textAdapter } from './adapters/textAdapter';
export { documentAdapter } from './adapters/documentAdapter';
export { imageAdapter, videoAdapter, audioAdapter } from './adapters/mediaAdapter';
export { urlAdapter } from './adapters/urlAdapter';
export { screenAdapter } from './adapters/screenAdapter';
