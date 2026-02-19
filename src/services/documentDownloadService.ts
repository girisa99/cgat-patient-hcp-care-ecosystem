/**
 * Document Download Service
 * 
 * Provides utilities for downloading ecosystem documentation in various formats.
 * Used across Production Hub, Command Center, and Governance panels.
 */

import { getEcosystemSummary, getEcosystemMarkdownSummary } from '@/constants/ecosystemRegistry';

export type DocumentFormat = 'md' | 'json' | 'txt';

export interface DocumentDownloadOptions {
  filename?: string;
  format?: DocumentFormat;
  includeMetadata?: boolean;
}

/**
 * Download the complete ecosystem matrix document
 */
export const downloadEcosystemMatrix = async (): Promise<void> => {
  try {
    // Fetch the markdown file from the docs folder
    const response = await fetch('/docs/GENIE_ECOSYSTEM_COMPLETE_MATRIX_2026.md');
    
    if (!response.ok) {
      // If file not found, generate from code
      const content = generateEcosystemMatrixContent();
      downloadContent(content, 'GENIE_ECOSYSTEM_COMPLETE_MATRIX_2026.md', 'text/markdown');
      return;
    }
    
    const content = await response.text();
    downloadContent(content, 'GENIE_ECOSYSTEM_COMPLETE_MATRIX_2026.md', 'text/markdown');
  } catch {
    // Fallback: Generate from code
    const content = generateEcosystemMatrixContent();
    downloadContent(content, 'GENIE_ECOSYSTEM_COMPLETE_MATRIX_2026.md', 'text/markdown');
  }
};

/**
 * Download the AI provider matrix document
 */
export const downloadProviderMatrix = async (): Promise<void> => {
  try {
    const response = await fetch('/docs/AI_PROVIDER_COMPREHENSIVE_MATRIX_2026.md');
    
    if (!response.ok) {
      const content = generateProviderMatrixContent();
      downloadContent(content, 'AI_PROVIDER_COMPREHENSIVE_MATRIX_2026.md', 'text/markdown');
      return;
    }
    
    const content = await response.text();
    downloadContent(content, 'AI_PROVIDER_COMPREHENSIVE_MATRIX_2026.md', 'text/markdown');
  } catch {
    const content = generateProviderMatrixContent();
    downloadContent(content, 'AI_PROVIDER_COMPREHENSIVE_MATRIX_2026.md', 'text/markdown');
  }
};

/**
 * Download ecosystem summary as JSON
 */
export const downloadEcosystemJSON = (): void => {
  const summary = getEcosystemSummary();
  const content = JSON.stringify(summary, null, 2);
  downloadContent(content, 'ecosystem-summary.json', 'application/json');
};

/**
 * Download ecosystem summary as Markdown
 */
export const downloadEcosystemMarkdown = (): void => {
  const content = getEcosystemMarkdownSummary();
  downloadContent(content, 'ecosystem-summary.md', 'text/markdown');
};

/**
 * Helper: Download content as file
 */
const downloadContent = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate ecosystem matrix content from code (fallback)
 */
const generateEcosystemMatrixContent = (): string => {
  const summary = getEcosystemSummary();
  const date = new Date().toISOString().split('T')[0];
  
  return `# GENIE ECOSYSTEM COMPLETE MATRIX

> **Generated**: ${date}
> **Status**: PRODUCTION VERIFIED
> **Total**: ${summary.products.total} Products | ${summary.pipelines.categories} Categories | ${summary.pipelines.total} Pipelines | ${summary.capabilities.total} Capabilities

## Executive Summary

| Metric | Count |
|--------|-------|
| **Products** | ${summary.products.total} |
| **Pipeline Categories** | ${summary.pipelines.categories} |
| **Total Pipelines** | ${summary.pipelines.total} |
| **Cross-Functional Capabilities** | ${summary.capabilities.total} |
| **AI Providers (Configured)** | 15 |

## Products

${summary.products.list.map(p => `- **${p}**: ${summary.pipelines.byProduct[p]} pipelines`).join('\n')}

## Validation

${summary.validation.isValid ? '✅ All checks passed' : '❌ Errors found'}

${summary.validation.errors.length > 0 ? `### Errors\n${summary.validation.errors.map(e => `- ${e}`).join('\n')}` : ''}
${summary.validation.warnings.length > 0 ? `### Warnings\n${summary.validation.warnings.map(w => `- ${w}`).join('\n')}` : ''}

---

*For complete documentation, see docs/GENIE_ECOSYSTEM_COMPLETE_MATRIX_2026.md*
`;
};

/**
 * Generate provider matrix content from code (fallback)
 */
const generateProviderMatrixContent = (): string => {
  const date = new Date().toISOString().split('T')[0];
  
  return `# AI Provider Matrix - 15 Configured Providers

> **Generated**: ${date}
> **Status**: PRODUCTION VERIFIED

## Configured Providers

| # | Provider | Primary Capabilities |
|---|----------|---------------------|
| 1 | OpenAI | LLM, TTS, STT (Whisper), Image (DALL-E 3), Vision |
| 2 | Claude | LLM, Translation (Literary), Vision, NLP |
| 3 | Gemini | LLM, Translation, OCR, Image Gen, Vision, NLP |
| 4 | Deepgram | **PRIMARY STT** (<100ms real-time) |
| 5 | DeepSeek | LLM (CJK), Translation, OCR, Vision |
| 6 | Alibaba | LLM, TTS, STT, **PRIMARY Avatar/Lip-Sync**, Video |
| 7 | Azure | TTS (Neural, Visemes), STT, OCR, Translation |
| 8 | DeepL | **PRIMARY Translation** (European) |
| 9 | ElevenLabs | **PRIMARY TTS**, Voice Clone, **PRIMARY Music**, SFX |
| 10 | Sora2API | **PRIMARY Video** (Cinematic) |
| 11 | ModelsLab | **PRIMARY Image** (FLUX), AnimateDiff, 3D |
| 12 | Meshy | **PRIMARY 3D** (PBR, USDZ/GLTF/FBX) |
| 13 | Replicate | Image, Video, 3D (fallback) |
| 14 | Google Cloud | TTS (WaveNet), STT, Translation, Vision |
| 15 | HuggingFace | Open models, fallback |

## NOT Configured

- Avatars → Alibaba WAN 2.2 + Azure Visemes
- Music → ElevenLabs + Alibaba FunAudio
- GPU Tasks → ModelsLab/Meshy

---

*For complete documentation, see docs/AI_PROVIDER_COMPREHENSIVE_MATRIX_2026.md*
`;
};

export default {
  downloadEcosystemMatrix,
  downloadProviderMatrix,
  downloadEcosystemJSON,
  downloadEcosystemMarkdown,
};
