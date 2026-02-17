/**
 * Popout Recording Studio - Script Enhancement Module
 * Script analysis, AI enhancement, accept/skip workflow
 */

export function getScriptEnhancementScript(supabaseUrl: string, supabaseKey: string): string {
  return `
    // =====================================================
    // SCRIPT ENHANCEMENT MODULE
    // =====================================================

    const ENHANCE_SUPABASE_URL = '${supabaseUrl}';
    const ENHANCE_SUPABASE_KEY = '${supabaseKey}';

    let pendingChanges = [];
    let acceptedChanges = [];
    let rejectedChanges = [];
    let originalScript = '';
    let enhancedScript = '';
    let isAnalyzing = false;

    // =====================================================
    // SCRIPT ANALYSIS
    // =====================================================

    async function analyzeScript(scriptContent) {
      if (!scriptContent || isAnalyzing) {
        console.warn('[Enhancement] No script or already analyzing');
        return null;
      }

      console.log('[Enhancement] Analyzing script...');
      isAnalyzing = true;
      originalScript = scriptContent;
      updateAnalysisUI('analyzing');

      // Create AbortController with 30s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(function() { controller.abort(); }, 30000);
      
      try {
        const response = await fetch(ENHANCE_SUPABASE_URL + '/functions/v1/ai-universal-processor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': ENHANCE_SUPABASE_KEY,
            'Authorization': 'Bearer ' + ENHANCE_SUPABASE_KEY
          },
          body: JSON.stringify({
            action: 'enhance_script',
            content: scriptContent,
            options: {
              checkGrammar: true,
              suggestImprovements: true,
              addPauseMarkers: true,
              optimizeForSpeaking: true
            }
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('Analysis failed: ' + response.status);
        }

        const result = await response.json();
        
        // Parse suggestions into pending changes
        pendingChanges = parseAnalysisResult(result);
        acceptedChanges = [];
        rejectedChanges = [];

        console.log('[Enhancement] Found', pendingChanges.length, 'suggestions');
        isAnalyzing = false;
        displayAnalysisResults(pendingChanges);

        return pendingChanges;

      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          console.error('[Enhancement] Request timed out after 30s');
          updateAnalysisUI('error', 'Request timed out');
        } else {
          console.error('[Enhancement] Analysis error:', err);
          updateAnalysisUI('error', err.message);
        }
        isAnalyzing = false;
        return null;
      }
    }

    // Parse AI response into structured changes
    function parseAnalysisResult(result) {
      const changes = [];
      
      // Handle different response formats
      if (result.suggestions && Array.isArray(result.suggestions)) {
        result.suggestions.forEach(function(sug, idx) {
          changes.push({
            id: 'change-' + idx,
            type: sug.type || 'improvement',
            original: sug.original || '',
            suggested: sug.suggested || sug.replacement || '',
            reason: sug.reason || sug.explanation || '',
            position: sug.position || idx,
            status: 'pending'
          });
        });
      } else if (result.changes && Array.isArray(result.changes)) {
        result.changes.forEach(function(change, idx) {
          changes.push({
            id: 'change-' + idx,
            type: change.type || 'edit',
            original: change.from || change.original || '',
            suggested: change.to || change.suggested || '',
            reason: change.reason || '',
            position: idx,
            status: 'pending'
          });
        });
      } else if (result.enhanced) {
        // Single enhanced version - create diff
        changes.push({
          id: 'change-0',
          type: 'full_rewrite',
          original: originalScript,
          suggested: result.enhanced,
          reason: 'AI-enhanced version for better clarity and delivery',
          position: 0,
          status: 'pending'
        });
      }

      // Add pause markers if present
      if (result.pauseMarkers && Array.isArray(result.pauseMarkers)) {
        result.pauseMarkers.forEach(function(marker, idx) {
          changes.push({
            id: 'pause-' + idx,
            type: 'pause',
            original: '',
            suggested: '[PAUSE ' + (marker.duration || 1) + 's]',
            reason: 'Natural pause point for emphasis',
            position: marker.position || idx,
            status: 'pending'
          });
        });
      }

      return changes;
    }

    // =====================================================
    // DISPLAY ANALYSIS RESULTS
    // =====================================================

    function displayAnalysisResults(changes) {
      const panel = document.getElementById('analysisPanel');
      const resultsEl = document.getElementById('analysisResults');
      
      if (!panel || !resultsEl) {
        console.warn('[Enhancement] Analysis panel not found');
        return;
      }

      // Show panel
      panel.style.display = 'block';
      updateAnalysisUI('complete');

      if (changes.length === 0) {
        resultsEl.innerHTML = '<div class="no-changes">✓ No improvements needed - script looks great!</div>';
        return;
      }

      // Render changes list
      let html = '<div class="changes-header">' +
        '<span>' + changes.length + ' suggestions found</span>' +
        '<button class="accept-all-btn" onclick="acceptAllChanges()">✓ Accept All</button>' +
        '<button class="skip-all-btn" onclick="skipAllChanges()">✕ Skip All</button>' +
      '</div>';

      html += '<div class="changes-list">';
      
      changes.forEach(function(change) {
        const statusClass = change.status === 'accepted' ? 'accepted' : 
                           change.status === 'rejected' ? 'rejected' : 'pending';
        
        html += '<div class="change-item ' + statusClass + '" data-change-id="' + change.id + '">' +
          '<div class="change-header">' +
            '<span class="change-type">' + getChangeIcon(change.type) + ' ' + change.type + '</span>' +
            '<div class="change-actions">' +
              '<button class="accept-btn" onclick="acceptChange(\\'' + change.id + '\\')">✓</button>' +
              '<button class="skip-btn" onclick="skipChange(\\'' + change.id + '\\')">✕</button>' +
            '</div>' +
          '</div>';
        
        if (change.original) {
          html += '<div class="change-original"><span class="label">Original:</span> ' + escapeHtmlEnhance(change.original) + '</div>';
        }
        
        html += '<div class="change-suggested"><span class="label">Suggested:</span> ' + escapeHtmlEnhance(change.suggested) + '</div>';
        
        if (change.reason) {
          html += '<div class="change-reason">' + escapeHtmlEnhance(change.reason) + '</div>';
        }
        
        html += '</div>';
      });

      html += '</div>';

      // Apply button
      html += '<div class="apply-section">' +
        '<button class="apply-btn" id="applyChangesBtn" onclick="applyAllChanges()">📝 Apply Accepted Changes</button>' +
      '</div>';

      resultsEl.innerHTML = html;
    }

    function getChangeIcon(type) {
      const icons = {
        'grammar': '📝',
        'improvement': '✨',
        'pause': '⏸️',
        'clarity': '💡',
        'emphasis': '🎯',
        'full_rewrite': '📄',
        'edit': '✏️'
      };
      return icons[type] || '📌';
    }

    function escapeHtmlEnhance(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    // =====================================================
    // ACCEPT/SKIP CHANGES
    // =====================================================

    function acceptChange(changeId) {
      const change = pendingChanges.find(function(c) { return c.id === changeId; });
      if (!change) return;

      change.status = 'accepted';
      acceptedChanges.push(change);
      
      // Update UI
      const el = document.querySelector('[data-change-id="' + changeId + '"]');
      if (el) {
        el.classList.remove('pending', 'rejected');
        el.classList.add('accepted');
      }

      updateChangeCounts();
      console.log('[Enhancement] Accepted change:', changeId);
    }

    function skipChange(changeId) {
      const change = pendingChanges.find(function(c) { return c.id === changeId; });
      if (!change) return;

      change.status = 'rejected';
      rejectedChanges.push(change);
      
      // Update UI
      const el = document.querySelector('[data-change-id="' + changeId + '"]');
      if (el) {
        el.classList.remove('pending', 'accepted');
        el.classList.add('rejected');
      }

      updateChangeCounts();
      console.log('[Enhancement] Skipped change:', changeId);
    }

    function acceptAllChanges() {
      pendingChanges.forEach(function(change) {
        if (change.status === 'pending') {
          acceptChange(change.id);
        }
      });
    }

    function skipAllChanges() {
      pendingChanges.forEach(function(change) {
        if (change.status === 'pending') {
          skipChange(change.id);
        }
      });
    }

    function updateChangeCounts() {
      const accepted = pendingChanges.filter(function(c) { return c.status === 'accepted'; }).length;
      const rejected = pendingChanges.filter(function(c) { return c.status === 'rejected'; }).length;
      const pending = pendingChanges.filter(function(c) { return c.status === 'pending'; }).length;

      const countEl = document.getElementById('changeCounts');
      if (countEl) {
        countEl.innerHTML = 
          '<span class="count accepted">' + accepted + ' accepted</span>' +
          '<span class="count rejected">' + rejected + ' skipped</span>' +
          '<span class="count pending">' + pending + ' pending</span>';
      }
    }

    // =====================================================
    // APPLY CHANGES & BUILD ENHANCED SCRIPT
    // =====================================================

    function applyAllChanges() {
      const accepted = pendingChanges.filter(function(c) { return c.status === 'accepted'; });
      
      if (accepted.length === 0) {
        showEnhancementToast('No changes accepted', 'warning');
        return;
      }

      console.log('[Enhancement] Applying', accepted.length, 'changes');

      // Build enhanced script
      enhancedScript = buildEnhancedScript(originalScript, accepted);

      // Save to localStorage
      try {
        localStorage.setItem('enhancedScript', enhancedScript);
        localStorage.setItem('enhancedScriptTimestamp', Date.now().toString());
      } catch (e) {
        console.warn('[Enhancement] Failed to save enhanced script:', e);
      }

      // Update teleprompter with enhanced script
      if (teleprompterText) {
        teleprompterText.textContent = enhancedScript;
      }

      // Show downloads section
      showEnhancedDownloads();
      showEnhancementToast('Applied ' + accepted.length + ' changes!', 'success');
    }

    function buildEnhancedScript(original, changes) {
      let result = original;

      // Sort changes by position (reverse order for proper replacement)
      const sortedChanges = changes.slice().sort(function(a, b) {
        return b.position - a.position;
      });

      sortedChanges.forEach(function(change) {
        if (change.type === 'full_rewrite') {
          result = change.suggested;
        } else if (change.original && change.suggested) {
          result = result.replace(change.original, change.suggested);
        } else if (change.type === 'pause' && change.suggested) {
          // Insert pause at position
          const words = result.split(' ');
          if (change.position < words.length) {
            words.splice(change.position, 0, change.suggested);
            result = words.join(' ');
          }
        }
      });

      return result;
    }

    // =====================================================
    // ENHANCED DOWNLOADS
    // =====================================================

    function showEnhancedDownloads() {
      const section = document.getElementById('enhancedDownloadsSection');
      if (section) {
        section.style.display = 'block';
      }
    }

    function downloadEnhancedScript() {
      if (!enhancedScript) {
        showEnhancementToast('No enhanced script available', 'error');
        return;
      }

      const blob = new Blob([enhancedScript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'enhanced-script-' + Date.now() + '.txt';
      a.click();
      URL.revokeObjectURL(url);

      console.log('[Enhancement] Downloaded enhanced script');
    }

    // =====================================================
    // UI HELPERS
    // =====================================================

    function updateAnalysisUI(status, message) {
      const statusEl = document.getElementById('analysisStatus');
      const analyzeBtn = document.getElementById('analyzeScriptBtn');

      if (status === 'analyzing') {
        if (statusEl) statusEl.innerHTML = '<span class="processing">⏳ Analyzing script...</span>';
        if (analyzeBtn) {
          analyzeBtn.disabled = true;
          analyzeBtn.textContent = 'Analyzing...';
        }
      } else if (status === 'complete') {
        if (statusEl) statusEl.innerHTML = '<span class="success">✅ Analysis complete</span>';
        if (analyzeBtn) {
          analyzeBtn.disabled = false;
          analyzeBtn.textContent = '🔍 Re-analyze';
        }
      } else if (status === 'error') {
        if (statusEl) statusEl.innerHTML = '<span class="error">❌ ' + (message || 'Analysis failed') + '</span>';
        if (analyzeBtn) {
          analyzeBtn.disabled = false;
          analyzeBtn.textContent = '🔍 Retry Analysis';
        }
      }
    }

    function showEnhancementToast(message, type) {
      const toast = document.getElementById('enhancementToast');
      if (!toast) return;

      toast.textContent = message;
      toast.className = 'enhancement-toast visible ' + (type || 'info');
      
      setTimeout(function() {
        toast.className = 'enhancement-toast';
      }, 3000);
    }

    // Initialize analysis button
    function initScriptEnhancement() {
      const analyzeBtn = document.getElementById('analyzeScriptBtn');
      if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function() {
          const scriptContent = teleprompterText ? teleprompterText.textContent : '';
          if (scriptContent) {
            analyzeScript(scriptContent);
          } else {
            showEnhancementToast('Select a script first', 'warning');
          }
        });
      }

      const downloadBtn = document.getElementById('downloadEnhancedBtn');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadEnhancedScript);
      }

      console.log('[ScriptEnhancement] Initialized');
    }

    setTimeout(initScriptEnhancement, 200);

    console.log('[ScriptEnhancement] Module loaded');
  `;
}

export function getScriptEnhancementStyles(): string {
  return `
    /* Script Enhancement Styles */
    .analysis-panel {
      display: none;
      margin-top: 16px;
    }

    .changes-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .changes-header span {
      flex: 1;
      font-size: 0.75rem;
      color: #888;
    }

    .accept-all-btn, .skip-all-btn {
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 0.7rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .accept-all-btn {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }

    .skip-all-btn {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    .changes-list {
      max-height: 300px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .change-item {
      padding: 12px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      border-left: 3px solid #fbbf24;
      transition: all 0.2s;
    }

    .change-item.accepted {
      border-left-color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
    }

    .change-item.rejected {
      border-left-color: #ef4444;
      opacity: 0.5;
    }

    .change-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .change-type {
      font-size: 0.7rem;
      color: #a78bfa;
      text-transform: uppercase;
    }

    .change-actions {
      display: flex;
      gap: 4px;
    }

    .accept-btn, .skip-btn {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .accept-btn {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }

    .skip-btn {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    .change-original, .change-suggested {
      font-size: 0.8rem;
      line-height: 1.4;
      margin-bottom: 4px;
    }

    .change-original {
      color: #888;
      text-decoration: line-through;
    }

    .change-suggested {
      color: #22c55e;
    }

    .change-original .label, .change-suggested .label {
      font-size: 0.65rem;
      color: #666;
      margin-right: 4px;
    }

    .change-reason {
      font-size: 0.7rem;
      color: #666;
      font-style: italic;
      margin-top: 4px;
    }

    .apply-section {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .apply-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .apply-btn:hover {
      transform: translateY(-1px);
    }

    .no-changes {
      text-align: center;
      padding: 20px;
      color: #22c55e;
      font-size: 0.875rem;
    }

    #changeCounts {
      display: flex;
      gap: 12px;
      font-size: 0.7rem;
      margin-top: 8px;
    }

    #changeCounts .count.accepted { color: #22c55e; }
    #changeCounts .count.rejected { color: #ef4444; }
    #changeCounts .count.pending { color: #fbbf24; }

    /* Enhanced Downloads Section */
    #enhancedDownloadsSection {
      display: none;
      margin-top: 16px;
      padding: 16px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.2);
      border-radius: 8px;
    }

    .enhancement-toast {
      position: fixed;
      bottom: 60px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      padding: 12px 24px;
      background: #8b5cf6;
      color: #fff;
      border-radius: 8px;
      font-size: 0.875rem;
      opacity: 0;
      transition: all 0.3s;
      z-index: 1001;
    }

    .enhancement-toast.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    .enhancement-toast.success { background: #22c55e; }
    .enhancement-toast.error { background: #ef4444; }
    .enhancement-toast.warning { background: #fbbf24; color: #000; }
  `;
}
