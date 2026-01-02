/**
 * Popout Recording Studio - Script-Audio Sync Module
 * Align teleprompter with voiceover timing
 */

export function getScriptAudioSyncScript(): string {
  return `
    // =====================================================
    // SCRIPT-AUDIO SYNC MODULE
    // =====================================================

    let syncData = null;
    let syncAudioSource = null;
    let syncStartTime = 0;
    let syncAnimationFrame = null;
    let isSyncing = false;

    // Initialize sync with script and audio
    async function initSync(scriptContent, audioUrl) {
      console.log('[Sync] Initializing sync');

      // Parse script into segments
      const segments = parseScriptIntoSegments(scriptContent);
      
      // Analyze audio for timing
      const audioAnalysis = await analyzeAudio(audioUrl);
      
      if (!audioAnalysis) {
        console.error('[Sync] Failed to analyze audio');
        return null;
      }

      // Calculate timing for each segment
      const totalDuration = audioAnalysis.metadata.duration;
      const wordsPerSecond = 2.5; // Average speaking rate
      
      let currentTime = 0;
      const syncedSegments = segments.map(function(segment, index) {
        const wordCount = segment.text.split(/\\s+/).length;
        const duration = wordCount / wordsPerSecond;
        
        const result = {
          id: 'seg-' + index,
          text: segment.text,
          startTime: currentTime,
          endTime: currentTime + duration,
          wordCount: wordCount
        };
        
        currentTime += duration;
        return result;
      });

      // Adjust timing to match audio duration
      const scaleFactor = totalDuration / currentTime;
      syncedSegments.forEach(function(seg) {
        seg.startTime *= scaleFactor;
        seg.endTime *= scaleFactor;
      });

      syncData = {
        segments: syncedSegments,
        audioBuffer: audioAnalysis.buffer,
        audioUrl: audioUrl,
        totalDuration: totalDuration
      };

      console.log('[Sync] Created', syncedSegments.length, 'synced segments');
      updateSyncUI();
      
      return syncData;
    }

    // Parse script into segments (by sentence or paragraph)
    function parseScriptIntoSegments(scriptContent) {
      if (!scriptContent) return [];

      // Split by sentences
      const sentences = scriptContent
        .split(/(?<=[.!?])\\s+/)
        .filter(function(s) { return s.trim().length > 0; });

      return sentences.map(function(text, index) {
        return {
          id: index,
          text: text.trim()
        };
      });
    }

    // Start synced playback
    function startSyncedPlayback() {
      if (!syncData || isSyncing) return;

      console.log('[Sync] Starting synced playback');
      isSyncing = true;
      syncStartTime = performance.now();

      // Start audio
      const ctx = initAudioContext();
      syncAudioSource = ctx.createBufferSource();
      syncAudioSource.buffer = syncData.audioBuffer;
      syncAudioSource.connect(ctx.destination);
      syncAudioSource.start(0);

      syncAudioSource.onended = function() {
        stopSyncedPlayback();
      };

      // Start teleprompter sync
      updateSyncedTeleprompter();
    }

    // Stop synced playback
    function stopSyncedPlayback() {
      console.log('[Sync] Stopping synced playback');
      isSyncing = false;

      if (syncAudioSource) {
        try {
          syncAudioSource.stop();
        } catch (e) {}
        syncAudioSource = null;
      }

      if (syncAnimationFrame) {
        cancelAnimationFrame(syncAnimationFrame);
        syncAnimationFrame = null;
      }
    }

    // Update teleprompter based on current time
    function updateSyncedTeleprompter() {
      if (!isSyncing || !syncData) return;

      const elapsed = (performance.now() - syncStartTime) / 1000;
      
      // Find current segment
      const currentSegment = syncData.segments.find(function(seg) {
        return elapsed >= seg.startTime && elapsed < seg.endTime;
      });

      if (currentSegment) {
        highlightSegment(currentSegment);
      }

      // Update progress
      updateSyncProgress(elapsed, syncData.totalDuration);

      // Continue animation
      syncAnimationFrame = requestAnimationFrame(updateSyncedTeleprompter);
    }

    // Highlight current segment in teleprompter
    function highlightSegment(segment) {
      const teleprompterEl = document.getElementById('teleprompterText');
      if (!teleprompterEl || !syncData) return;

      // Build highlighted HTML
      let html = '';
      syncData.segments.forEach(function(seg) {
        if (seg.id === segment.id) {
          html += '<span class="sync-highlight">' + escapeHtmlSync(seg.text) + '</span> ';
        } else if (seg.startTime < segment.startTime) {
          html += '<span class="sync-past">' + escapeHtmlSync(seg.text) + '</span> ';
        } else {
          html += '<span class="sync-future">' + escapeHtmlSync(seg.text) + '</span> ';
        }
      });

      teleprompterEl.innerHTML = html;

      // Scroll to current segment
      const highlighted = teleprompterEl.querySelector('.sync-highlight');
      if (highlighted) {
        highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function escapeHtmlSync(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    // Update sync progress bar
    function updateSyncProgress(current, total) {
      const progressEl = document.getElementById('syncProgress');
      const timeEl = document.getElementById('syncTime');

      if (progressEl) {
        const percent = (current / total) * 100;
        progressEl.style.width = percent + '%';
      }

      if (timeEl) {
        timeEl.textContent = formatDuration(current) + ' / ' + formatDuration(total);
      }
    }

    // Update sync UI
    function updateSyncUI() {
      const segmentCountEl = document.getElementById('syncSegmentCount');
      const durationEl = document.getElementById('syncDuration');

      if (syncData) {
        if (segmentCountEl) segmentCountEl.textContent = syncData.segments.length + ' segments';
        if (durationEl) durationEl.textContent = formatDuration(syncData.totalDuration);
      }
    }

    // Export synced script with timestamps
    function exportSyncedScript() {
      if (!syncData) {
        console.warn('[Sync] No sync data to export');
        return;
      }

      exportTimestampedScript(syncData.segments, 'synced-script');
    }

    console.log('[ScriptAudioSync] Module loaded');
  `;
}

export function getScriptAudioSyncStyles(): string {
  return `
    /* Script-Audio Sync Styles */
    .sync-controls {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .sync-btn {
      flex: 1;
      padding: 10px;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .sync-btn-play {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }

    .sync-btn-stop {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    .sync-progress-container {
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      margin-bottom: 8px;
      overflow: hidden;
    }

    #syncProgress {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #8b5cf6, #22c55e);
      transition: width 0.1s linear;
    }

    #syncTime {
      font-size: 0.75rem;
      color: #888;
      text-align: center;
    }

    .sync-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #888;
      margin-top: 8px;
    }

    /* Teleprompter sync highlighting */
    .sync-highlight {
      color: #22c55e;
      font-weight: 600;
      background: rgba(34, 197, 94, 0.1);
      padding: 2px 4px;
      border-radius: 4px;
    }

    .sync-past {
      color: #666;
    }

    .sync-future {
      color: #888;
    }
  `;
}
