/**
 * CONTENT AUTHENTICITY SERVICE (C2PA-style)
 *
 * Builds provenance metadata for AI-generated content, following the
 * C2PA (Coalition for Content Provenance and Authenticity) data model.
 *
 * This module provides the DATA LAYER only — it creates structured metadata
 * that gets embedded in output files (video JSON metadata, image EXIF, etc.).
 *
 * Full C2PA cryptographic signing requires a certificate authority and signing
 * service, which is a future enhancement. This layer ensures the provenance
 * DATA is captured from day one.
 *
 * Wired into:
 * - genie-cast-assembler edge function (video assembly)
 * - ai-image-generator edge function (image generation)
 * - ai-video-generator edge function (video generation)
 */

// ─── TYPES ─────────────────────────────────────────────────────────────────

export type ContentSourceType = 'ai_generated' | 'ai_modified' | 'user_uploaded' | 'hybrid';

export interface ContentProvenanceMetadata {
  /** C2PA-compatible schema version */
  schemaVersion: '1.0';
  /** Application that produced this content */
  generatedBy: 'GenieSuite Cast';
  /** ISO 8601 timestamp of generation */
  generationDate: string;
  /** List of AI model IDs used in production */
  aiModelsUsed: string[];
  /** How the content was created */
  sourceType: ContentSourceType;
  /** GenieSuite project ID for traceability */
  projectId: string;
  /** Visual style applied during generation */
  styleApplied: string;
  /** Region code for cultural context */
  regionCode: string;
  /** Whether content contains AI-generated faces */
  containsAIFaces: boolean;
  /** Whether content was watermarked */
  watermarked: boolean;
  /** Production quality tier */
  qualityTier: string;
  /** Hash of the generation parameters (for reproducibility) */
  parameterHash?: string;
}

export interface ProvenanceEmbedding {
  /** JSON string for embedding in file metadata */
  json: string;
  /** Key-value pairs for flat metadata fields (EXIF, MP4 metadata) */
  flatFields: Record<string, string>;
}

// ─── BUILD PROVENANCE ──────────────────────────────────────────────────────

/**
 * Build C2PA-style provenance metadata for generated content.
 */
export function buildProvenanceMetadata(
  projectId: string,
  modelsUsed: string[],
  sourceType: ContentSourceType,
  styleLabel: string,
  regionCode: string,
  options?: {
    containsAIFaces?: boolean;
    watermarked?: boolean;
    qualityTier?: string;
  },
): ContentProvenanceMetadata {
  return {
    schemaVersion: '1.0',
    generatedBy: 'GenieSuite Cast',
    generationDate: new Date().toISOString(),
    aiModelsUsed: modelsUsed,
    sourceType,
    projectId,
    styleApplied: styleLabel,
    regionCode,
    containsAIFaces: options?.containsAIFaces ?? false,
    watermarked: options?.watermarked ?? false,
    qualityTier: options?.qualityTier ?? 'production',
    parameterHash: generateParameterHash(projectId, modelsUsed, styleLabel),
  };
}

/**
 * Serialize provenance metadata for embedding in file metadata.
 * Returns both a JSON string (for rich metadata fields) and flat key-value pairs
 * (for systems that only support flat metadata like EXIF or MP4 atoms).
 */
export function serializeForEmbedding(metadata: ContentProvenanceMetadata): ProvenanceEmbedding {
  const json = JSON.stringify(metadata);

  const flatFields: Record<string, string> = {
    'GenieSuite:GeneratedBy': metadata.generatedBy,
    'GenieSuite:GenerationDate': metadata.generationDate,
    'GenieSuite:SourceType': metadata.sourceType,
    'GenieSuite:AIModels': metadata.aiModelsUsed.join(','),
    'GenieSuite:Style': metadata.styleApplied,
    'GenieSuite:Region': metadata.regionCode,
    'GenieSuite:ContainsAIFaces': String(metadata.containsAIFaces),
    'GenieSuite:Watermarked': String(metadata.watermarked),
    'GenieSuite:Quality': metadata.qualityTier,
    'GenieSuite:ProjectId': metadata.projectId,
  };

  return { json, flatFields };
}

/**
 * Create metadata for user-uploaded content that has been AI-modified.
 */
export function buildModifiedContentMetadata(
  projectId: string,
  originalSourceType: 'user_uploaded',
  modificationsApplied: string[],
  modelsUsed: string[],
  regionCode: string,
): ContentProvenanceMetadata {
  return buildProvenanceMetadata(
    projectId,
    modelsUsed,
    'ai_modified',
    modificationsApplied.join(', '),
    regionCode,
  );
}

// ─── INTERNAL HELPERS ──────────────────────────────────────────────────────

/**
 * Simple hash of generation parameters for reproducibility tracking.
 * Not cryptographic — just a fingerprint for matching identical generations.
 */
function generateParameterHash(
  projectId: string,
  models: string[],
  style: string,
): string {
  const input = `${projectId}|${models.sort().join(',')}|${style}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
