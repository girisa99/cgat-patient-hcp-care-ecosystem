/**
 * Pipeline to Product Mapping Registry
 * 
 * Maps all 181 pipelines to their primary product owners.
 * Used by wizard, editor, and Ask Genie for routing.
 * 
 * Structure: Each category maps to a primary product with cross-functional sharing.
 */

import { GenieProduct } from './genie-products';

export interface PipelineCategoryMapping {
  categoryId: string;
  categoryName: string;
  primaryProduct: GenieProduct;
  sharedProducts: GenieProduct[];
  pipelineCount: number;
  description: string;
  wizardSteps: number[];
  editorMode: 'canvas' | 'timeline' | 'document' | 'hybrid';
}

/**
 * 18 Pipeline Categories mapped to products
 */
export const PIPELINE_CATEGORY_MAPPING: PipelineCategoryMapping[] = [
  // ============================================
  // SPARK - Script Generation (Input to Script)
  // ============================================
  {
    categoryId: 'input-processing',
    categoryName: 'Input Processing',
    primaryProduct: 'spark',
    sharedProducts: ['studio'],
    pipelineCount: 8,
    description: 'Document, PPT, Video, Audio, URL, Image input processing',
    wizardSteps: [0],
    editorMode: 'document',
  },
  {
    categoryId: 'script-generation',
    categoryName: 'Script Generation',
    primaryProduct: 'spark',
    sharedProducts: ['mind', 'studio'],
    pipelineCount: 12,
    description: 'AI script creation from any input type',
    wizardSteps: [0, 1, 2, 3],
    editorMode: 'document',
  },
  {
    categoryId: 'content-extraction',
    categoryName: 'Content Extraction',
    primaryProduct: 'spark',
    sharedProducts: ['mind'],
    pipelineCount: 8,
    description: 'OCR, STT, summarization, key point extraction',
    wizardSteps: [0],
    editorMode: 'document',
  },
  
  // ============================================
  // MIND - Script Enhancement (Edit & Enhance)
  // ============================================
  {
    categoryId: 'script-enhancement',
    categoryName: 'Script Enhancement',
    primaryProduct: 'mind',
    sharedProducts: ['spark', 'studio'],
    pipelineCount: 10,
    description: 'AI editing, tone adjustment, style refinement',
    wizardSteps: [2, 3],
    editorMode: 'document',
  },
  {
    categoryId: 'tts-generation',
    categoryName: 'TTS & Voice',
    primaryProduct: 'mind',
    sharedProducts: ['vibe', 'deck', 'cast'],
    pipelineCount: 8,
    description: 'Text-to-speech, voice cloning, narration',
    wizardSteps: [5, 6],
    editorMode: 'timeline',
  },
  {
    categoryId: 'music-generation',
    categoryName: 'Music & Audio',
    primaryProduct: 'mind',
    sharedProducts: ['vibe'],
    pipelineCount: 6,
    description: 'Background music, SFX, audio enhancement',
    wizardSteps: [5, 6],
    editorMode: 'timeline',
  },
  {
    categoryId: 'translation',
    categoryName: 'Translation',
    primaryProduct: 'mind',
    sharedProducts: ['deck', 'cast'],
    pipelineCount: 6,
    description: 'Multi-language translation and localization',
    wizardSteps: [1],
    editorMode: 'document',
  },
  
  // ============================================
  // VIBE - Audio/Video Production
  // ============================================
  {
    categoryId: 'video-generation',
    categoryName: 'Video Generation',
    primaryProduct: 'vibe',
    sharedProducts: ['deck', 'cast'],
    pipelineCount: 15,
    description: 'AI video creation, text-to-video, image-to-video',
    wizardSteps: [6, 7],
    editorMode: 'timeline',
  },
  {
    categoryId: 'video-editing',
    categoryName: 'Video Editing',
    primaryProduct: 'vibe',
    sharedProducts: [],
    pipelineCount: 15,
    description: 'Trim, crop, stitch, enhance, effects',
    wizardSteps: [7],
    editorMode: 'timeline',
  },
  {
    categoryId: 'audio-production',
    categoryName: 'Audio Production',
    primaryProduct: 'vibe',
    sharedProducts: ['mind'],
    pipelineCount: 10,
    description: 'Recording, mixing, enhancement, mastering',
    wizardSteps: [5, 6, 7],
    editorMode: 'timeline',
  },
  {
    categoryId: 'podcast-webcast',
    categoryName: 'Podcast & Webcast',
    primaryProduct: 'vibe',
    sharedProducts: ['cast'],
    pipelineCount: 16,
    description: 'Podcast recording, editing, publishing, webcast',
    wizardSteps: [0, 5, 6, 7],
    editorMode: 'timeline',
  },
  {
    categoryId: 'avatar-lipsync',
    categoryName: 'Avatar & Lip-sync',
    primaryProduct: 'vibe',
    sharedProducts: ['deck', 'cast'],
    pipelineCount: 10,
    description: 'AI avatars, lip-sync, talking heads',
    wizardSteps: [5, 6, 7],
    editorMode: 'timeline',
  },
  {
    categoryId: 'dubbing',
    categoryName: 'Dubbing & Localization',
    primaryProduct: 'vibe',
    sharedProducts: ['cast'],
    pipelineCount: 8,
    description: 'Multi-language dubbing, voice replacement',
    wizardSteps: [1, 5, 6, 7],
    editorMode: 'timeline',
  },
  
  // ============================================
  // DECK - Presentation & Slides
  // ============================================
  {
    categoryId: 'presentation',
    categoryName: 'Presentation Generation',
    primaryProduct: 'deck',
    sharedProducts: ['studio'],
    pipelineCount: 12,
    description: 'AI slide creation, layouts, visual design',
    wizardSteps: [3, 4, 5, 7],
    editorMode: 'canvas',
  },
  {
    categoryId: 'visual-design',
    categoryName: 'Visual Design',
    primaryProduct: 'deck',
    sharedProducts: ['vibe'],
    pipelineCount: 10,
    description: 'Infographics, charts, diagrams, icons',
    wizardSteps: [4, 5],
    editorMode: 'canvas',
  },
  {
    categoryId: '3d-immersive',
    categoryName: '3D & Immersive',
    primaryProduct: 'deck',
    sharedProducts: ['vibe', 'cast'],
    pipelineCount: 12,
    description: '3D models, AR/VR, immersive experiences',
    wizardSteps: [4, 5, 7],
    editorMode: 'canvas',
  },
  
  // ============================================
  // ARC - Project Management
  // ============================================
  {
    categoryId: 'scheduling',
    categoryName: 'Scheduling & Workflow',
    primaryProduct: 'arc',
    sharedProducts: ['cast'],
    pipelineCount: 8,
    description: 'Project scheduling, Kanban, task management',
    wizardSteps: [],
    editorMode: 'canvas',
  },
  {
    categoryId: 'collaboration',
    categoryName: 'Collaboration',
    primaryProduct: 'arc',
    sharedProducts: ['studio'],
    pipelineCount: 6,
    description: 'Team workflows, review, approval chains',
    wizardSteps: [],
    editorMode: 'canvas',
  },
  
  // ============================================
  // CAST - Distribution & Marketing
  // ============================================
  {
    categoryId: 'distribution',
    categoryName: 'Distribution',
    primaryProduct: 'cast',
    sharedProducts: [],
    pipelineCount: 12,
    description: 'Multi-platform publishing, social media',
    wizardSteps: [8],
    editorMode: 'canvas',
  },
  {
    categoryId: 'marketing',
    categoryName: 'Marketing Engine',
    primaryProduct: 'cast',
    sharedProducts: [],
    pipelineCount: 8,
    description: 'Automated marketing, regional campaigns',
    wizardSteps: [8],
    editorMode: 'canvas',
  },
  {
    categoryId: 'analytics',
    categoryName: 'Analytics',
    primaryProduct: 'cast',
    sharedProducts: ['arc', 'studio'],
    pipelineCount: 6,
    description: 'Performance tracking, insights, reporting',
    wizardSteps: [8],
    editorMode: 'canvas',
  },
];

/**
 * Product Pipeline Summary
 */
export const PRODUCT_PIPELINE_SUMMARY: Record<GenieProduct, {
  primaryPipelines: number;
  sharedPipelines: number;
  totalAccess: number;
  categories: string[];
}> = {
  spark: {
    primaryPipelines: 28,
    sharedPipelines: 12,
    totalAccess: 40,
    categories: ['input-processing', 'script-generation', 'content-extraction'],
  },
  mind: {
    primaryPipelines: 30,
    sharedPipelines: 15,
    totalAccess: 45,
    categories: ['script-enhancement', 'tts-generation', 'music-generation', 'translation'],
  },
  vibe: {
    primaryPipelines: 64,
    sharedPipelines: 20,
    totalAccess: 84,
    categories: ['video-generation', 'video-editing', 'audio-production', 'podcast-webcast', 'avatar-lipsync', 'dubbing'],
  },
  deck: {
    primaryPipelines: 34,
    sharedPipelines: 18,
    totalAccess: 52,
    categories: ['presentation', 'visual-design', '3d-immersive'],
  },
  arc: {
    primaryPipelines: 14,
    sharedPipelines: 10,
    totalAccess: 24,
    categories: ['scheduling', 'collaboration'],
  },
  cast: {
    primaryPipelines: 26,
    sharedPipelines: 24,
    totalAccess: 50,
    categories: ['distribution', 'marketing', 'analytics'],
  },
  studio: {
    primaryPipelines: 0, // Orchestrator, not pipeline owner
    sharedPipelines: 181, // Access to all
    totalAccess: 181,
    categories: ['all'],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get primary product for a pipeline category
 */
export const getPrimaryProductForCategory = (categoryId: string): GenieProduct | null => {
  const mapping = PIPELINE_CATEGORY_MAPPING.find(m => m.categoryId === categoryId);
  return mapping?.primaryProduct || null;
};

/**
 * Get all products that can access a category
 */
export const getProductsForCategory = (categoryId: string): GenieProduct[] => {
  const mapping = PIPELINE_CATEGORY_MAPPING.find(m => m.categoryId === categoryId);
  if (!mapping) return [];
  return [mapping.primaryProduct, ...mapping.sharedProducts];
};

/**
 * Get categories owned by a product
 */
export const getCategoriesForProduct = (product: GenieProduct): PipelineCategoryMapping[] => {
  return PIPELINE_CATEGORY_MAPPING.filter(
    m => m.primaryProduct === product || m.sharedProducts.includes(product)
  );
};

/**
 * Get editor mode for category
 */
export const getEditorModeForCategory = (categoryId: string): 'canvas' | 'timeline' | 'document' | 'hybrid' => {
  const mapping = PIPELINE_CATEGORY_MAPPING.find(m => m.categoryId === categoryId);
  return mapping?.editorMode || 'canvas';
};

/**
 * Get wizard steps for category
 */
export const getWizardStepsForCategory = (categoryId: string): number[] => {
  const mapping = PIPELINE_CATEGORY_MAPPING.find(m => m.categoryId === categoryId);
  return mapping?.wizardSteps || [];
};

/**
 * Get total pipeline count for product
 */
export const getPipelineCountForProduct = (product: GenieProduct): number => {
  return PRODUCT_PIPELINE_SUMMARY[product]?.totalAccess || 0;
};
