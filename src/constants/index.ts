/**
 * Genie Studio Constants - Central Export
 * 
 * Single source of truth for all product definitions, capabilities, and mappings.
 * 
 * ECOSYSTEM OVERVIEW:
 * - 7 Products: Spark, Mind, Vibe, Deck, Arc, Cast, Studio
 * - 181 Pipelines across 21 Categories
 * - 25 Cross-Functional Capabilities
 * 
 * TO ADD NEW PIPELINES/PRODUCTS:
 * See ecosystemRegistry.ts for validation utilities and patterns.
 */

// Core Product Definitions
export * from './genie-products';

// Cross-Functional Capabilities (Avatar, 3D, Lip-sync, etc.)
export * from './crossFunctionalCapabilities';

// Pipeline to Product Mapping
export * from './pipelineProductMapping';

// Ecosystem Registry (Validation, Counts, Extensibility)
export * from './ecosystemRegistry';
