/**
 * Localization Services Index
 * P4 Multi-Language (10→14 scenarios complete)
 * 
 * Exports:
 * - Language Quality Service: Quality metrics per language
 * - Language Switcher: UI component for language selection
 */

export {
  languageQualityService,
  type LanguageQualityMetrics,
  type QualityIssue,
  type DialectQuality,
  type QualityFeedback,
} from './languageQualityService';

// Re-export UI component
export { LanguageSwitcher } from '@/components/localization/LanguageSwitcher';
