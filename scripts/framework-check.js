#!/usr/bin/env node

/**
 * Framework Check Script - Validate and initialize the stability framework
 */

import { Framework } from '../stability-framework/core/framework.js';
import { getEnvironmentConfig } from '../stability-framework/config/framework.config.js';

async function main() {
  console.log('🔍 Starting Stability Framework Check...');
  
  try {
    // Get configuration
    const config = getEnvironmentConfig();
    
    // Initialize framework
    const framework = new Framework(config.framework);
    await framework.initialize();
    
    // Perform health check
    const health = await framework.healthCheck();
    console.log('🏥 Health Check Results:', health);
    
    // Generate initial report
    const report = await framework.generateReport();
    console.log('📊 Framework initialized successfully');
    
    // Cleanup
    await framework.stop();
    
  } catch (error) {
    console.error('❌ Framework check failed:', error);
    process.exit(1);
  }
}

main();