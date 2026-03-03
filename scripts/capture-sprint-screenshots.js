#!/usr/bin/env node
/**
 * Automated Sprint Tracker Screenshot Capture
 *
 * Captures all 19 sprint tracker tab screenshots using Puppeteer headless browser,
 * then uploads them to Supabase Storage (product-screenshots bucket).
 *
 * Usage:
 *   npx puppeteer browsers install chrome  # first time only
 *   node scripts/capture-sprint-screenshots.js
 *
 * Requires: Puppeteer (installed via npx), dev server running on localhost:8080
 */

const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase DEV credentials
const SUPABASE_URL = 'https://ithspbabhmdntioslfqe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aHNwYmFiaG1kbnRpb3NsZnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MjU5OTMsImV4cCI6MjA2MjUwMTk5M30.yUZZHsz2wIHboVuWWfqXeAH5oHRxzJIz20NWSUmHPhw';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// The deployed app URL — use Vercel production (no auth wall for sprint tracker)
const BASE_URL = process.env.APP_URL || 'https://cgat-patient-hcp-care-ecosystem.vercel.app';

// Sprint tracker screens — matches PRODUCT_SCREENS['sprint-tracker'] in MultiScreenshotGallery.tsx
const SPRINT_SCREENS = [
  { id: 'po-mission-control', name: 'PO Mission Control', tabValue: 'mission-control' },
  { id: 'po-actions', name: 'PO Actions & Notes', tabValue: 'po-gate' },
  { id: 'qa-signoff', name: 'QA Sign-off', tabValue: 'qa-signoff' },
  { id: 'eod-handoff', name: 'EOD Auto-Handoff', tabValue: 'eod-handoff' },
  { id: 'sprint-charter', name: 'Sprint Charter', tabValue: 'charter' },
  { id: 'governance-guide', name: 'Governance Guide', tabValue: 'governance' },
  { id: 'day-1-view', name: 'Day 1 — Foundation', tabValue: 'day-1' },
  { id: 'day-2-view', name: 'Day 2 — Velocity', tabValue: 'day-2' },
  { id: 'day-3-view', name: 'Day 3 — Velocity Mismatch', tabValue: 'day-3' },
  { id: 'day-4-view', name: 'Day 4 — Mission Control', tabValue: 'day-4' },
  { id: 'day-5-view', name: 'Day 5 — QA & Ship', tabValue: 'day-5' },
  { id: 'backlog-view', name: 'Backlog', tabValue: 'backlog' },
  { id: 'velocity-metrics', name: 'Velocity & Metrics', tabValue: 'metrics' },
  { id: 'effort-tracking', name: 'Effort Tracking', tabValue: 'effort' },
  { id: 'project-plan', name: 'Project Plan (41 tasks)', tabValue: 'planning' },
  { id: 'findings-qa', name: 'Findings & QA', tabValue: 'findings' },
  { id: 'standup-entries', name: 'Standup Entries', tabValue: 'day-3' },
  { id: 'shared-infra-feed', name: 'Shared Infra Feed', tabValue: 'shared-infra' },
  { id: 'territory-guardrails', name: 'Territory Guardrails', tabValue: 'territory' },
];

async function uploadToSupabase(filePath, screenId) {
  const fileBuffer = fs.readFileSync(filePath);
  const storagePath = `screenshots/sprint-tracker-${screenId}.png`;

  const { data, error } = await supabase.storage
    .from('product-screenshots')
    .upload(storagePath, fileBuffer, {
      contentType: 'image/png',
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error(`  ❌ Upload failed for ${screenId}:`, error.message);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('product-screenshots')
    .getPublicUrl(storagePath);

  return urlData?.publicUrl || null;
}

async function main() {
  console.log('📸 Sprint Tracker Screenshot Capture');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Screens: ${SPRINT_SCREENS.length}`);
  console.log('');

  // Create temp directory for screenshots
  const tmpDir = path.join(__dirname, '..', '.tmp-screenshots');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
      defaultViewport: { width: 1920, height: 1080 },
    });

    const page = await browser.newPage();

    // Set dark mode preference
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < SPRINT_SCREENS.length; i++) {
      const screen = SPRINT_SCREENS[i];
      const url = `${BASE_URL}/genie-admin?tab=sprint-tracker&subtab=${screen.tabValue}`;

      console.log(`  [${i + 1}/${SPRINT_SCREENS.length}] ${screen.name} (${screen.tabValue})`);

      try {
        // Navigate to the sprint tracker tab
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for content to render
        await page.waitForTimeout(2000);

        // Click the correct tab if subtab URL param doesn't work
        try {
          // Try clicking the tab button directly
          const tabSelector = `[data-tab="${screen.tabValue}"], button[value="${screen.tabValue}"]`;
          await page.waitForSelector(tabSelector, { timeout: 3000 });
          await page.click(tabSelector);
          await page.waitForTimeout(1500);
        } catch {
          // Tab click failed — URL param might have worked, or tab doesn't exist
          console.log(`    (tab click skipped — using URL param)`);
        }

        // Screenshot the main content area
        const filePath = path.join(tmpDir, `sprint-tracker-${screen.id}.png`);

        // Try to find the sprint tracker content panel
        const contentSelector = '[role="tabpanel"][data-state="active"], .sprint-tracker-content, main';
        await page.screenshot({
          path: filePath,
          fullPage: false,
          clip: { x: 0, y: 0, width: 1920, height: 1080 },
        });

        // Upload to Supabase
        const publicUrl = await uploadToSupabase(filePath, screen.id);
        if (publicUrl) {
          console.log(`    ✅ Uploaded → ${publicUrl.substring(0, 80)}...`);
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(`    ❌ Failed: ${err.message}`);
        failCount++;
      }
    }

    console.log('');
    console.log(`📊 Results: ${successCount} captured, ${failCount} failed`);

    // Cleanup temp directory
    fs.rmSync(tmpDir, { recursive: true, force: true });
    console.log('🧹 Temp files cleaned up');

  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    if (browser) await browser.close();
  }
}

main().catch(console.error);
