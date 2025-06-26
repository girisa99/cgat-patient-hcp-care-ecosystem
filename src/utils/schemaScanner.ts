
/**
 * Automatic Schema Scanner - Main Entry Point
 * 
 * This is the main entry point that re-exports functionality from the modular components
 */

// Re-export from modular components
export { scanDatabaseSchema, detectNewModules } from './schema/moduleDetector';
export { generateHookCode, generateComponentCode } from './schema/codeGenerator';
export { SchemaAnalysis, analyzeTable, calculateConfidence, toPascalCase } from './schema/schemaAnalyzer';
export { AutoModuleConfig, AutoRegistrationConfig } from './schema/types';
