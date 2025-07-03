#!/usr/bin/env ts-node
import { postgresAdapter } from '@/utils/db/PostgresAdapter';
import { DatabaseSchemaAnalyzer } from '@/utils/verification/DatabaseSchemaAnalyzer';

async function run() {
  console.log('🔌 Connecting to database...');
  try {
    const tables = await postgresAdapter.getTableList();
    console.log(`📋 Found ${tables.length} tables:`, tables.join(', '));

    const analysis = await DatabaseSchemaAnalyzer.analyzeCompleteSchema();
    console.log('\n✅ Registry & Schema analysis complete');
    console.log(`   - Tables inspected : ${analysis.tables.length}`);
    console.log(`   - Duplicate risks  : ${analysis.duplicateRisks.length}`);
    console.log(`   - Quality score    : ${analysis.schemaQualityScore}/100`);

    const duplicates = analysis.duplicateRisks.filter(r => r.severity !== 'low');
    if (duplicates.length === 0) {
      console.log('\n🎉 No critical duplicate schema elements found.');
    } else {
      console.warn(`\n⚠️  Found ${duplicates.length} potential duplicate risks:`);
      duplicates.forEach(r => console.warn(` - ${r.description}`));
    }
  } catch (err) {
    console.error('❌ Error during test run:', err);
    process.exit(1);
  }
}

run();