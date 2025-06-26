
/**
 * Automatic Schema Scanner - Main Entry Point
 * 
 * This is the main entry point that re-exports functionality from the modular components
 */

// Re-export functions from modular components
export { scanDatabaseSchema, detectNewModules } from './schema/moduleDetector';
export { generateHookCode, generateComponentCode } from './schema/codeGenerator';
export { analyzeTable, calculateConfidence, toPascalCase } from './schema/schemaAnalyzer';

// Re-export types separately
export type { SchemaAnalysis } from './schema/schemaAnalyzer';
export type { AutoModuleConfig, AutoRegistrationConfig } from './schema/types';
