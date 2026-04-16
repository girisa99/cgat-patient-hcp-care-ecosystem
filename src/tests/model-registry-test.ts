/**
 * AI MODEL REGISTRY — Comprehensive Test Suite
 *
 * Tests all model resolution paths, alias chains, fallback mechanisms,
 * and regional routing. Run in browser console or as a standalone test.
 *
 * Usage:
 *   import { runModelRegistryTests } from '@/tests/model-registry-test';
 *   const results = await runModelRegistryTests();
 */

import { supabase } from '@/integrations/supabase/client';
import {
  resolveModelId,
  getActiveModel,
  getModelsForCapability,
  initializeFromDB,
  isDBInitialized,
  migrateModelId,
  PROVIDER_VERSIONS,
} from '@/config/provider-version-registry';

// ─── TEST TYPES ─────────────────────────────────────────────────────────────

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  fallbackUsed?: string;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  dbConnected: boolean;
  dbModelCount: number;
  results: TestResult[];
  fallbackChains: Record<string, string[]>;
  regionalRouting: Record<string, { primary: string; fallbacks: string[] }>;
}

// ─── ALIAS RESOLUTION TESTS ────────────────────────────────────────────────
// These are the critical tests: old broken model → current working model

const ALIAS_TESTS: Array<{ input: string; expected: string; description: string }> = [
  // ANTHROPIC — Retired models
  { input: 'claude-3-5-sonnet-20241022', expected: 'claude-sonnet-4-6', description: 'Retired Claude 3.5 Sonnet → Sonnet 4.6' },
  { input: 'claude-3-5-sonnet', expected: 'claude-sonnet-4-6', description: 'Short alias Claude 3.5 Sonnet' },
  { input: 'claude-sonnet-latest', expected: 'claude-sonnet-4-6', description: 'Latest alias → current Sonnet' },
  { input: 'claude-sonnet-4-20250514', expected: 'claude-sonnet-4-6', description: 'Previous Sonnet 4 version' },
  { input: 'claude-3-5-haiku-20241022', expected: 'claude-haiku-4-5', description: 'Retired Claude 3.5 Haiku → Haiku 4.5' },
  { input: 'claude-3-5-haiku', expected: 'claude-haiku-4-5', description: 'Short alias Claude 3.5 Haiku' },
  { input: 'claude-haiku-latest', expected: 'claude-haiku-4-5', description: 'Latest alias → current Haiku' },
  { input: 'claude-opus-4-1-20250805', expected: 'claude-opus-4-7', description: 'Previous Opus 4.1 → current Opus 4.7' },
  { input: 'claude-opus-4-6', expected: 'claude-opus-4-7', description: 'Deprecated Opus 4.6 → current Opus 4.7' },
  { input: 'claude-opus-latest', expected: 'claude-opus-4-7', description: 'Latest alias → current Opus' },

  // OPENAI — DALL-E retirement (May 12, 2025)
  { input: 'dall-e-3', expected: 'gpt-image-1', description: 'DALL-E 3 (sunsetting) → GPT Image 1' },
  { input: 'dall-e-2', expected: 'gpt-image-1', description: 'DALL-E 2 (sunsetting) → GPT Image 1' },

  // GOOGLE — Gemini 1.5 shutdown
  { input: 'gemini-1.5-pro', expected: 'gemini-2.5-pro', description: 'Gemini 1.5 Pro (shutdown) → 2.5 Pro' },
  { input: 'gemini-1.5-flash', expected: 'gemini-2.5-flash', description: 'Gemini 1.5 Flash (shutdown) → 2.5 Flash' },
  { input: 'gemini-pro', expected: 'gemini-2.5-pro', description: 'Old Gemini Pro → 2.5 Pro' },

  // ELEVENLABS — V1 retirement
  { input: 'eleven_monolingual_v1', expected: 'eleven_multilingual_v2', description: 'ElevenLabs Mono V1 → Multi V2' },
  { input: 'eleven_multilingual_v1', expected: 'eleven_multilingual_v2', description: 'ElevenLabs Multi V1 → Multi V2' },

  // DEEPGRAM
  { input: 'nova-2', expected: 'nova-3', description: 'Deepgram Nova 2 → Nova 3' },

  // MESHY
  { input: 'meshy-4', expected: 'meshy-6', description: 'Meshy 4 (sunset) → Meshy 6' },

  // ALIBABA — Video
  { input: 'wan2.1-t2v', expected: 'wan2.6-t2v', description: 'Wan 2.1 T2V → 2.6 T2V' },
  { input: 'wan2.1-i2v', expected: 'wan2.6-i2v', description: 'Wan 2.1 I2V → 2.6 I2V' },
];

// ACTIVE MODEL TESTS — these should return themselves
const ACTIVE_MODEL_TESTS: Array<{ input: string; description: string }> = [
  { input: 'claude-sonnet-4-6', description: 'Current Claude Sonnet 4.6' },
  { input: 'claude-haiku-4-5', description: 'Current Claude Haiku 4.5' },
  { input: 'claude-opus-4-7', description: 'Current Claude Opus 4.7' },
  { input: 'gpt-4o', description: 'Current GPT-4o' },
  { input: 'gpt-4o-mini', description: 'Current GPT-4o Mini' },
  { input: 'gpt-image-1', description: 'Current GPT Image 1' },
  { input: 'sora-2.0-turbo', description: 'Current Sora 2.0 Turbo' },
  { input: 'o3-2025-04-16', description: 'Current O3' },
  { input: 'gemini-2.5-pro', description: 'Current Gemini 2.5 Pro' },
  { input: 'gemini-2.5-flash', description: 'Current Gemini 2.5 Flash' },
  { input: 'qwen-max', description: 'Current Qwen Max' },
  { input: 'deepseek-chat', description: 'Current DeepSeek Chat' },
  { input: 'wan2.6-t2v', description: 'Current Wan 2.6 T2V' },
  { input: 'eleven_multilingual_v2', description: 'Current ElevenLabs V2' },
  { input: 'whisper-1', description: 'Current Whisper 1' },
  { input: 'flux-pro', description: 'Current FLUX Pro' },
  { input: 'sadtalker', description: 'Current SadTalker' },
  { input: 'animatediff', description: 'Current AnimateDiff' },
  { input: 'meshy-6', description: 'Current Meshy 6' },
  { input: 'nova-3', description: 'Current Deepgram Nova 3' },
  { input: 'stable-diffusion-xl', description: 'Current Stable Diffusion XL' },
];

// PROVIDER + CAPABILITY TESTS
const PROVIDER_CAPABILITY_TESTS: Array<{ provider: string; capability: string; expectedModel: string; description: string }> = [
  { provider: 'anthropic', capability: 'llm', expectedModel: 'claude-sonnet-4-6', description: 'Anthropic LLM → Sonnet 4.6' },
  { provider: 'openai', capability: 'llm', expectedModel: 'gpt-4o', description: 'OpenAI LLM → GPT-4o' },
  { provider: 'gemini', capability: 'llm', expectedModel: 'gemini-2.5-pro', description: 'Gemini LLM → 2.5 Pro' },
  { provider: 'alibaba', capability: 'llm', expectedModel: 'qwen-max', description: 'Alibaba LLM → Qwen Max' },
  { provider: 'deepseek', capability: 'llm', expectedModel: 'deepseek-chat', description: 'DeepSeek LLM → Chat' },
  { provider: 'openai', capability: 'image-gen', expectedModel: 'gpt-image-1', description: 'OpenAI Image → GPT Image 1' },
  { provider: 'alibaba', capability: 'text-to-video', expectedModel: 'wan2.6-t2v', description: 'Alibaba Video → Wan 2.6' },
  { provider: 'elevenlabs', capability: 'tts', expectedModel: 'eleven_multilingual_v2', description: 'ElevenLabs TTS → V2' },
  { provider: 'openai', capability: 'stt', expectedModel: 'whisper-1', description: 'OpenAI STT → Whisper 1' },
  { provider: 'alibaba', capability: 'tts', expectedModel: 'cosyvoice-v3-flash', description: 'Alibaba TTS → CosyVoice' },
  { provider: 'meshy', capability: 'text-to-3d', expectedModel: 'meshy-6', description: 'Meshy 3D → Meshy 6' },
  { provider: 'flux', capability: 'text-to-image', expectedModel: 'flux-pro', description: 'FLUX Image → Pro' },
  { provider: 'replicate', capability: 'lipsync', expectedModel: 'sadtalker', description: 'Replicate Lipsync → SadTalker' },
  { provider: 'modelslab', capability: 'text-to-video', expectedModel: 'animatediff', description: 'ModelsLab Video → AnimateDiff' },
];

// ─── FALLBACK CHAIN DOCUMENTATION ──────────────────────────────────────────

export const FALLBACK_CHAINS = {
  'Model Resolution': [
    '1. DB lookup (ai_model_registry table) — 5 min cache',
    '2. In-memory ALIAS_MAP (loaded from DB model_alias arrays)',
    '3. Hardcoded _seedHardcodedAliases() fallback (DB unreachable)',
    '4. PROVIDER_VERSIONS hardcoded registry (migrateModelId)',
    '5. Pass through unchanged (provider handles unknown)',
  ],
  'Regional LLM Routing': {
    'nam':        { primary: 'claude-sonnet-4-6',  fallbacks: ['gpt-4o', 'deepseek-chat', 'gemini-2.5-pro'] },
    'eu':         { primary: 'claude-sonnet-4-6',  fallbacks: ['gpt-4o', 'deepseek-chat', 'gemini-2.5-pro'] },
    'latam':      { primary: 'claude-sonnet-4-6',  fallbacks: ['gpt-4o', 'deepseek-chat', 'gemini-2.5-pro'] },
    'oceania':    { primary: 'claude-sonnet-4-6',  fallbacks: ['gpt-4o', 'deepseek-chat', 'gemini-2.5-pro'] },
    'turkey':     { primary: 'claude-sonnet-4-6',  fallbacks: ['gpt-4o', 'gemini-2.5-pro'] },
    'eurasia':    { primary: 'claude-sonnet-4-6',  fallbacks: ['gpt-4o', 'gemini-2.5-pro'] },
    'cjk':        { primary: 'qwen-max',           fallbacks: ['gpt-4o', 'deepseek-chat', 'gemini-2.5-pro'] },
    'mena':       { primary: 'qwen-max',           fallbacks: ['gpt-4o', 'claude-sonnet-4-6', 'gemini-2.5-pro'] },
    'india':      { primary: 'gemini-2.5-pro',     fallbacks: ['gpt-4o', 'claude-sonnet-4-6', 'deepseek-chat'] },
    'bangladesh': { primary: 'gemini-2.5-pro',     fallbacks: ['gpt-4o', 'claude-sonnet-4-6'] },
    'south_asia': { primary: 'gemini-2.5-pro',     fallbacks: ['gpt-4o', 'claude-sonnet-4-6'] },
    'sea':        { primary: 'gemini-2.5-pro',     fallbacks: ['gpt-4o', 'qwen-max', 'claude-sonnet-4-6'] },
    'africa':     { primary: 'gemini-2.5-pro',     fallbacks: ['gpt-4o', 'claude-sonnet-4-6'] },
    'pakistan':    { primary: 'gpt-4o',             fallbacks: ['claude-sonnet-4-6', 'deepseek-chat', 'gemini-2.5-pro'] },
    'caribbean':  { primary: 'gpt-4o',             fallbacks: ['claude-sonnet-4-6', 'gemini-2.5-pro'] },
    'central_asia':{ primary: 'gpt-4o',            fallbacks: ['qwen-max', 'claude-sonnet-4-6', 'gemini-2.5-pro'] },
  },
  'TTS Routing': {
    'nam/eu/latam/oceania': { primary: 'eleven_multilingual_v2', fallbacks: ['azure-neural-tts', 'tts-1-hd'] },
    'cjk':                   { primary: 'cosyvoice-v3-flash',    fallbacks: ['qwen3-tts', 'azure-neural-tts'] },
    'mena/india/sea/africa': { primary: 'azure-neural-tts',       fallbacks: ['eleven_multilingual_v2', 'cosyvoice-v3-flash'] },
  },
  'Image Generation': {
    'nam/eu':  { primary: 'gpt-image-1',   fallbacks: ['flux-pro', 'gemini-nano-banana', 'wan2.6-t2i'] },
    'cjk/sea': { primary: 'wan2.6-t2i',    fallbacks: ['gpt-image-1', 'flux-pro'] },
    'default': { primary: 'gpt-image-1',   fallbacks: ['flux-pro', 'wan2.6-t2i'] },
  },
  'Video Generation': {
    'all regions': { primary: 'wan2.6-t2v', fallbacks: ['sora-2.0-turbo', 'veo-3.1-generate', 'animatediff'] },
  },
  'STT': {
    'western':  { primary: 'whisper-1',    fallbacks: ['paraformer', 'nova-3'] },
    'cjk/sea':  { primary: 'paraformer',   fallbacks: ['whisper-1', 'nova-3'] },
  },
};

// ─── TEST RUNNER ────────────────────────────────────────────────────────────

export async function runModelRegistryTests(): Promise<TestSummary> {
  const results: TestResult[] = [];

  // ── Step 0: Initialize from DB ──────────────────────────────────────
  console.log('🔄 Initializing model registry from DB...');
  await initializeFromDB();
  const dbConnected = isDBInitialized();
  console.log(dbConnected ? '✅ DB connected' : '⚠️ DB unreachable, using hardcoded fallbacks');

  // Check DB model count
  let dbModelCount = 0;
  if (dbConnected) {
    const { count } = await (supabase as any).from('ai_model_registry').select('*', { count: 'exact', head: true });
    dbModelCount = count ?? 0;
    console.log(`📊 DB has ${dbModelCount} models`);
  }

  // ── Test 1: Alias Resolution (Retired → Current) ───────────────────
  console.log('\n━━━ TEST 1: Alias Resolution (Retired → Current) ━━━');
  for (const test of ALIAS_TESTS) {
    const actual = resolveModelId(test.input);
    const passed = actual === test.expected;
    results.push({
      name: test.description,
      category: 'Alias Resolution',
      passed,
      input: test.input,
      expected: test.expected,
      actual,
      fallbackUsed: dbConnected ? 'DB' : 'Hardcoded Aliases',
    });
    console.log(`${passed ? '✅' : '❌'} ${test.description}: ${test.input} → ${actual} ${passed ? '' : `(expected: ${test.expected})`}`);
  }

  // ── Test 2: Active Models (Should Return Themselves) ────────────────
  console.log('\n━━━ TEST 2: Active Models (Identity Resolution) ━━━');
  for (const test of ACTIVE_MODEL_TESTS) {
    const actual = resolveModelId(test.input);
    const passed = actual === test.input;
    results.push({
      name: test.description,
      category: 'Active Model Identity',
      passed,
      input: test.input,
      expected: test.input,
      actual,
    });
    console.log(`${passed ? '✅' : '❌'} ${test.description}: ${test.input} → ${actual}`);
  }

  // ── Test 3: Provider + Capability Lookup ────────────────────────────
  console.log('\n━━━ TEST 3: Provider + Capability Lookup ━━━');
  for (const test of PROVIDER_CAPABILITY_TESTS) {
    const actual = getActiveModel(test.provider, test.capability);
    const passed = actual === test.expectedModel;
    results.push({
      name: test.description,
      category: 'Provider Capability',
      passed,
      input: `${test.provider}/${test.capability}`,
      expected: test.expectedModel,
      actual: actual ?? 'undefined',
    });
    console.log(`${passed ? '✅' : '❌'} ${test.description}: ${test.provider}/${test.capability} → ${actual} ${passed ? '' : `(expected: ${test.expectedModel})`}`);
  }

  // ── Test 4: Capability Catalog (UI Dropdowns) ──────────────────────
  console.log('\n━━━ TEST 4: Capability Catalog ━━━');
  const capabilities = ['llm', 'tts', 'stt', 'text-to-image', 'text-to-video', 'lipsync', 'text-to-3d'];
  for (const cap of capabilities) {
    const models = getModelsForCapability(cap);
    const passed = models.length > 0;
    results.push({
      name: `Models for ${cap}`,
      category: 'Capability Catalog',
      passed,
      input: cap,
      expected: '>0 models',
      actual: `${models.length} models: ${models.map(m => m.modelId).join(', ')}`,
    });
    console.log(`${passed ? '✅' : '❌'} ${cap}: ${models.length} models → [${models.map(m => m.modelId).slice(0, 3).join(', ')}${models.length > 3 ? '...' : ''}]`);
  }

  // ── Test 5: DB Regional Routing ────────────────────────────────────
  console.log('\n━━━ TEST 5: Regional Routing (DB) ━━━');
  if (dbConnected) {
    const { data: routes } = await (supabase as any)
      .from('ai_model_regional_routing')
      .select('region, capability, primary_model_id, fallback_model_ids')
      .eq('is_active', true)
      .eq('capability', 'llm') as { data: Array<{ region: string; capability: string; primary_model_id: string; fallback_model_ids: string[] | null }> | null; error: any };

    if (routes) {
      for (const route of routes) {
        const passed = !!route.primary_model_id;
        results.push({
          name: `Region ${route.region} LLM`,
          category: 'Regional Routing',
          passed,
          input: `${route.region}/llm`,
          expected: 'has primary model',
          actual: `${route.primary_model_id} → [${(route.fallback_model_ids ?? []).join(', ')}]`,
        });
        console.log(`${passed ? '✅' : '⚠️'} ${route.region}: ${route.primary_model_id} → [${(route.fallback_model_ids ?? []).slice(0, 3).join(', ')}]`);
      }
    }
  } else {
    console.log('⚠️ Skipped — DB not connected');
  }

  // ── Test 6: Unknown Model Pass-Through ─────────────────────────────
  console.log('\n━━━ TEST 6: Unknown Model Pass-Through ━━━');
  const unknownModels = ['some-future-model-v99', 'custom-finetuned-model', 'my-company/private-llm'];
  for (const model of unknownModels) {
    const actual = resolveModelId(model);
    const passed = actual === model; // Should pass through unchanged
    results.push({
      name: `Unknown: ${model}`,
      category: 'Pass-Through',
      passed,
      input: model,
      expected: model,
      actual,
    });
    console.log(`${passed ? '✅' : '❌'} Unknown pass-through: ${model} → ${actual}`);
  }

  // ── Summary ────────────────────────────────────────────────────────
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  const summary: TestSummary = {
    total: results.length,
    passed,
    failed,
    dbConnected,
    dbModelCount,
    results,
    fallbackChains: FALLBACK_CHAINS as any,
    regionalRouting: (FALLBACK_CHAINS['Regional LLM Routing'] ?? {}) as any,
  };

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 RESULTS: ${passed}/${results.length} passed, ${failed} failed`);
  console.log(`🗄️ DB: ${dbConnected ? `Connected (${dbModelCount} models)` : 'Using hardcoded fallbacks'}`);
  if (failed > 0) {
    console.log('\n❌ FAILURES:');
    for (const r of results.filter(r => !r.passed)) {
      console.log(`  ${r.category}: ${r.name} — got "${r.actual}", expected "${r.expected}"`);
    }
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return summary;
}

// ─── QUICK SMOKE TEST (for console) ─────────────────────────────────────────

export function smokeTest(): void {
  console.log('🔥 Quick Smoke Test (hardcoded fallback only, no DB):');
  const tests = [
    ['claude-3-5-sonnet-20241022', 'claude-sonnet-4-6'],
    ['dall-e-3', 'gpt-image-1'],
    ['gemini-1.5-pro', 'gemini-2.5-pro'],
    ['gpt-4o', 'gpt-4o'],
    ['claude-sonnet-4-6', 'claude-sonnet-4-6'],
    ['unknown-model', 'unknown-model'],
  ] as const;

  for (const [input, expected] of tests) {
    const actual = resolveModelId(input);
    const ok = actual === expected;
    console.log(`${ok ? '✅' : '❌'} resolveModelId('${input}') → '${actual}' ${ok ? '' : `(expected '${expected}')`}`);
  }
}
