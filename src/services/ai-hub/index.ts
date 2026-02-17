/**
 * Universal AI Hub - Entry Point
 * 
 * Single entry point for ALL AI capabilities across the Genie Suite
 */

// Types
export * from './types';

// Provider Registry
export * from './providerRegistry';

// Configured Providers (status based on secrets)
export * from './configuredProviders';

// Main Hub
export { 
  UniversalAIHub, 
  getUniversalAIHub,
  default as UniversalAIHubClass 
} from './UniversalAIHub';
