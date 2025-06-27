
/**
 * Legacy Module Registry Export
 * 
 * This file maintains backward compatibility by re-exporting 
 * everything from the refactored moduleRegistry structure.
 */

// Re-export everything from the new modular structure
export * from './moduleRegistry/index';

// Re-export the main registry instance as default
export { moduleRegistry as default } from './moduleRegistry/index';
