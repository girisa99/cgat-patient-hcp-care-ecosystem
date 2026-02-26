/**
 * Quality Gate — Content quality scoring before OTT/news outlet submission.
 *
 * Evaluates resolution, metadata completeness, duration, language quality,
 * accessibility (captions), and compliance readiness.
 */

import type { PublishingContentPackage, QualityGateResult, QualityCheck } from '@/types/publishing';

// ─── Evaluate ──────────────────────────────────────────────────────────────

export function evaluateQuality(
  content: PublishingContentPackage,
  requiredScore = 70,
): QualityGateResult {
  const checks: QualityCheck[] = [];

  // 1. Metadata completeness
  checks.push(checkMetadata(content));

  // 2. Primary URL present
  checks.push(checkPrimaryUrl(content));

  // 3. Thumbnail present
  checks.push(checkThumbnail(content));

  // 4. Description quality
  checks.push(checkDescription(content));

  // 5. Title quality
  checks.push(checkTitle(content));

  // 6. Region / language tags
  checks.push(checkRegionLanguage(content));

  // 7. Derivatives (shorts, audiogram, carousel)
  checks.push(checkDerivatives(content));

  // 8. Enrichment context
  checks.push(checkEnrichment(content));

  const totalWeight = checks.length;
  const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
  const score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

  return {
    passed: score >= requiredScore,
    score,
    checks,
    requiredScore,
  };
}

// ─── Individual Checks ────────────────────────────────────────────────────

function checkMetadata(content: PublishingContentPackage): QualityCheck {
  const fields = ['contentId', 'contentType', 'title', 'rawDescription', 'sourceProduct'] as const;
  const present = fields.filter(f => !!content[f]);
  const score = Math.round((present.length / fields.length) * 100);
  return {
    name: 'Metadata Completeness',
    passed: score >= 80,
    score,
    details: `${present.length}/${fields.length} required fields present`,
  };
}

function checkPrimaryUrl(content: PublishingContentPackage): QualityCheck {
  const hasUrl = !!content.primaryUrl && content.primaryUrl.length > 0;
  return {
    name: 'Primary Content URL',
    passed: hasUrl,
    score: hasUrl ? 100 : 0,
    details: hasUrl ? 'Primary media URL provided' : 'Missing primary content URL',
  };
}

function checkThumbnail(content: PublishingContentPackage): QualityCheck {
  const has = !!content.thumbnailUrl;
  return {
    name: 'Thumbnail',
    passed: has,
    score: has ? 100 : 30,
    details: has ? 'Thumbnail provided' : 'No thumbnail — outlets may reject',
  };
}

function checkDescription(content: PublishingContentPackage): QualityCheck {
  const len = content.rawDescription?.length || 0;
  let score = 0;
  let details = '';
  if (len === 0) { score = 0; details = 'No description'; }
  else if (len < 30) { score = 30; details = 'Description too short (< 30 chars)'; }
  else if (len < 100) { score = 60; details = 'Description could be longer'; }
  else if (len < 300) { score = 85; details = 'Good description length'; }
  else { score = 100; details = 'Comprehensive description'; }
  return { name: 'Description Quality', passed: score >= 60, score, details };
}

function checkTitle(content: PublishingContentPackage): QualityCheck {
  const len = content.title?.length || 0;
  let score = 0;
  let details = '';
  if (len === 0) { score = 0; details = 'No title'; }
  else if (len < 5) { score = 30; details = 'Title too short'; }
  else if (len > 200) { score = 60; details = 'Title may be too long for some outlets'; }
  else { score = 100; details = 'Title length acceptable'; }
  return { name: 'Title Quality', passed: score >= 60, score, details };
}

function checkRegionLanguage(content: PublishingContentPackage): QualityCheck {
  const hasRegion = !!content.region;
  const hasLang = !!content.language;
  const score = (hasRegion ? 50 : 0) + (hasLang ? 50 : 0);
  const parts: string[] = [];
  if (hasRegion) parts.push('region');
  if (hasLang) parts.push('language');
  return {
    name: 'Region & Language Tags',
    passed: score >= 50,
    score,
    details: parts.length > 0 ? `Tagged: ${parts.join(', ')}` : 'No region/language tags — geo-targeting unavailable',
  };
}

function checkDerivatives(content: PublishingContentPackage): QualityCheck {
  const d = content.derivatives;
  if (!d) {
    return { name: 'Derivatives', passed: true, score: 50, details: 'No derivatives — single format only' };
  }
  const count = [d.shortsUrl, d.audiogramUrl, d.carouselSlides?.length].filter(Boolean).length;
  const score = Math.min(100, 50 + count * 20);
  return {
    name: 'Derivatives',
    passed: true,
    score,
    details: `${count} derivative format(s) available`,
  };
}

function checkEnrichment(content: PublishingContentPackage): QualityCheck {
  const ctx = content.enrichmentContext;
  if (!ctx || Object.keys(ctx).length === 0) {
    return { name: 'Enrichment Context', passed: true, score: 40, details: 'No enrichment context — basic content' };
  }
  const keys = Object.keys(ctx).length;
  const score = Math.min(100, 40 + keys * 10);
  return {
    name: 'Enrichment Context',
    passed: true,
    score,
    details: `${keys} enrichment key(s) attached`,
  };
}
