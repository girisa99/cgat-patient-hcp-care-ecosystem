/**
 * AI MODEL REGISTRY — DB Health Check
 *
 * Queries the ai_model_registry table directly and reports status.
 * Run from browser console after app loads.
 *
 * Usage:
 *   import { checkModelRegistryDB } from '@/tests/model-registry-db-check';
 *   await checkModelRegistryDB();
 */

import { supabase } from '@/integrations/supabase/client';

export async function checkModelRegistryDB() {
  console.log('🗄️ Checking ai_model_registry DB table...\n');

  // 1. Total model count
  const { data: allModels, error } = await supabase
    .from('ai_model_registry')
    .select('model_id, provider, status, capabilities, replaced_by, sunset_date, model_alias');

  if (error) {
    console.error('❌ DB query failed:', error.message);
    console.log('💡 Make sure the migration has been applied: 20260409030000_ai_model_registry.sql');
    return;
  }

  console.log(`📊 Total models in DB: ${allModels.length}\n`);

  // 2. By status
  const byStatus: Record<string, number> = {};
  for (const m of allModels) {
    byStatus[m.status] = (byStatus[m.status] ?? 0) + 1;
  }
  console.log('📈 By Status:');
  for (const [status, count] of Object.entries(byStatus).sort()) {
    const icon = status === 'active' ? '🟢' : status === 'preview' ? '🟡' : status === 'deprecated' ? '🟠' : status === 'retired' ? '🔴' : '⚪';
    console.log(`  ${icon} ${status}: ${count}`);
  }

  // 3. By provider
  const byProvider: Record<string, number> = {};
  for (const m of allModels) {
    byProvider[m.provider] = (byProvider[m.provider] ?? 0) + 1;
  }
  console.log('\n🏢 By Provider:');
  for (const [provider, count] of Object.entries(byProvider).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${provider}: ${count}`);
  }

  // 4. Active models by capability
  const activeModels = allModels.filter(m => m.status === 'active' || m.status === 'preview');
  const byCap: Record<string, string[]> = {};
  for (const m of activeModels) {
    for (const cap of m.capabilities) {
      if (!byCap[cap]) byCap[cap] = [];
      byCap[cap].push(`${m.model_id} (${m.provider})`);
    }
  }
  console.log('\n🎯 Active Models by Capability:');
  for (const [cap, models] of Object.entries(byCap).sort()) {
    console.log(`  ${cap}: ${models.length} → [${models.join(', ')}]`);
  }

  // 5. Alias coverage
  let totalAliases = 0;
  for (const m of allModels) {
    totalAliases += (m.model_alias ?? []).length;
  }
  console.log(`\n🔗 Total aliases registered: ${totalAliases}`);

  // 6. Retired models without replacement
  const retiredNoReplacement = allModels.filter(
    m => (m.status === 'retired' || m.status === 'sunset') && !m.replaced_by
  );
  if (retiredNoReplacement.length > 0) {
    console.log('\n⚠️ Retired models WITHOUT replacement:');
    for (const m of retiredNoReplacement) {
      console.log(`  ❗ ${m.model_id} (${m.provider}) — no replaced_by set!`);
    }
  } else {
    console.log('\n✅ All retired models have replacements');
  }

  // 7. Sunset warnings (within 30 days)
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sunsetting = allModels.filter(m => {
    if (!m.sunset_date) return false;
    const sd = new Date(m.sunset_date);
    return sd > now && sd < thirtyDays;
  });
  if (sunsetting.length > 0) {
    console.log('\n⏰ Sunsetting within 30 days:');
    for (const m of sunsetting) {
      console.log(`  ⚠️ ${m.model_id} (${m.provider}) — sunset: ${m.sunset_date} → replaced by: ${m.replaced_by ?? 'NONE'}`);
    }
  } else {
    console.log('\n✅ No models sunsetting in next 30 days');
  }

  // 8. Regional routing
  const { data: routes } = await supabase
    .from('ai_model_regional_routing')
    .select('region, capability, primary_model_id, fallback_model_ids')
    .eq('is_active', true);

  if (routes) {
    console.log(`\n🌍 Regional routes: ${routes.length}`);
    const routesByCap: Record<string, number> = {};
    for (const r of routes) {
      routesByCap[r.capability] = (routesByCap[r.capability] ?? 0) + 1;
    }
    for (const [cap, count] of Object.entries(routesByCap).sort()) {
      console.log(`  ${cap}: ${count} regions`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ DB health check complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
