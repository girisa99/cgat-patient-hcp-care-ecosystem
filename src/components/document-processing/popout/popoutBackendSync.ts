/**
 * Popout Backend Sync Module
 * Handles saving recordings and assets to Supabase backend
 * Links assets to shows/projects when context is available
 */

export interface BackendSyncConfig {
  supabaseUrl: string;
  supabaseKey: string;
  userAccessToken?: string;
  showId?: string;
}

/**
 * Get the backend sync script to inject into the popout HTML
 */
export function getBackendSyncScript(config: BackendSyncConfig): string {
  const { supabaseUrl, supabaseKey, userAccessToken, showId } = config;
  
  return `
    // =====================================================
    // BACKEND SYNC MODULE
    // Saves recordings and assets to Supabase
    // =====================================================
    console.log('[BackendSync] Module loading...');
    
    var SUPABASE_URL = '${supabaseUrl}';
    var SUPABASE_KEY = '${supabaseKey}';
    var USER_ACCESS_TOKEN = '${userAccessToken || ''}';
    var CURRENT_SHOW_ID = '${showId || ''}';
    var isSavingToBackend = false;
    
    // =====================================================
    // SUPABASE STORAGE UPLOAD
    // =====================================================
    
    async function uploadToSupabaseStorage(blob, fileName, bucket) {
      bucket = bucket || 'generated-audio';
      console.log('[BackendSync] Uploading to storage:', fileName, 'bucket:', bucket);
      
      var authHeader = USER_ACCESS_TOKEN ? 'Bearer ' + USER_ACCESS_TOKEN : 'Bearer ' + SUPABASE_KEY;
      
      var response = await fetch(SUPABASE_URL + '/storage/v1/object/' + bucket + '/' + fileName, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'apikey': SUPABASE_KEY,
          'Content-Type': blob.type || 'application/octet-stream',
          'x-upsert': 'true'
        },
        body: blob
      });
      
      if (!response.ok) {
        var errorText = await response.text();
        console.error('[BackendSync] Storage upload failed:', response.status, errorText);
        throw new Error('Upload failed: ' + response.status);
      }
      
      var result = await response.json();
      console.log('[BackendSync] Upload success:', result);
      
      // Get public URL
      var publicUrl = SUPABASE_URL + '/storage/v1/object/public/' + bucket + '/' + fileName;
      return {
        path: fileName,
        bucket: bucket,
        publicUrl: publicUrl
      };
    }
    
    // =====================================================
    // SAVE TO GENERATED_MEDIA TABLE
    // =====================================================
    
    async function saveToGeneratedMedia(fileData, metadata) {
      console.log('[BackendSync] Saving to generated_media:', metadata.name);
      
      var authHeader = USER_ACCESS_TOKEN ? 'Bearer ' + USER_ACCESS_TOKEN : 'Bearer ' + SUPABASE_KEY;
      
      var payload = {
        name: metadata.name,
        file_type: metadata.file_type || 'video',
        storage_bucket: fileData.bucket,
        storage_path: fileData.path,
        file_url: fileData.publicUrl,
        file_size_bytes: metadata.size || 0,
        duration_seconds: metadata.duration || 0,
        source: 'recording',
        metadata: {
          scriptId: metadata.scriptId || null,
          scriptTitle: metadata.scriptTitle || null,
          hasVoiceover: metadata.hasVoiceover || false,
          hasMusic: metadata.hasMusic || false,
          voiceoverName: metadata.voiceoverName || null,
          musicName: metadata.musicName || null,
          hasCaptions: metadata.hasCaptions || false,
          captionsText: metadata.captionsText || null,
          recordedAt: new Date().toISOString(),
          showId: CURRENT_SHOW_ID || null
        }
      };
      
      var response = await fetch(SUPABASE_URL + '/rest/v1/generated_media', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        var errorText = await response.text();
        console.error('[BackendSync] Save to generated_media failed:', response.status, errorText);
        throw new Error('Database save failed: ' + response.status);
      }
      
      var result = await response.json();
      console.log('[BackendSync] Saved to generated_media:', result);
      return result[0] || result;
    }
    
    // =====================================================
    // LINK TO SHOW ASSETS
    // =====================================================
    
    async function linkToShowAssets(showId, assetData) {
      if (!showId) {
        console.log('[BackendSync] No showId, skipping show_assets link');
        return null;
      }
      
      console.log('[BackendSync] Linking to show_assets for show:', showId);
      
      var authHeader = USER_ACCESS_TOKEN ? 'Bearer ' + USER_ACCESS_TOKEN : 'Bearer ' + SUPABASE_KEY;
      
      var payload = {
        show_id: showId,
        asset_type: assetData.asset_type || 'recording',
        name: assetData.name,
        file_url: assetData.file_url,
        file_size: assetData.file_size || 0,
        duration_seconds: assetData.duration_seconds || null,
        stage: assetData.stage || 'recording',
        metadata: assetData.metadata || {}
      };
      
      var response = await fetch(SUPABASE_URL + '/rest/v1/show_assets', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        var errorText = await response.text();
        console.error('[BackendSync] Link to show_assets failed:', response.status, errorText);
        // Don't throw - this is optional
        return null;
      }
      
      var result = await response.json();
      console.log('[BackendSync] Linked to show_assets:', result);
      return result[0] || result;
    }
    
    // =====================================================
    // MAIN SAVE FUNCTION
    // =====================================================
    
    async function saveRecordingToBackend(blob, options) {
      options = options || {};
      
      if (isSavingToBackend) {
        console.warn('[BackendSync] Save already in progress');
        showBackendStatus('Save in progress...', 'warning');
        return null;
      }
      
      if (!USER_ACCESS_TOKEN && !SUPABASE_KEY) {
        console.warn('[BackendSync] No auth available, saving locally only');
        showBackendStatus('Saved locally (no auth)', 'info');
        return null;
      }
      
      isSavingToBackend = true;
      showBackendStatus('Saving to cloud...', 'info');
      
      try {
        // Generate file name
        var timestamp = Date.now();
        var safeName = (options.name || 'recording').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        var ext = blob.type.includes('webm') ? 'webm' : 'mp4';
        var fileName = 'recording_' + timestamp + '_' + safeName + '.' + ext;
        
        // 1. Upload to storage
        var storageResult = await uploadToSupabaseStorage(blob, fileName, 'generated-audio');
        
        // 2. Save to generated_media
        var mediaResult = await saveToGeneratedMedia(storageResult, {
          name: options.name || 'Recording ' + new Date().toLocaleString(),
          file_type: 'video',
          size: blob.size,
          duration: options.duration || 0,
          scriptId: options.scriptId || null,
          scriptTitle: options.scriptTitle || null,
          hasVoiceover: options.hasVoiceover || false,
          hasMusic: options.hasMusic || false,
          voiceoverName: options.voiceoverName || null,
          musicName: options.musicName || null,
          hasCaptions: options.hasCaptions || false,
          captionsText: options.captionsText || null
        });
        
        // 3. Link to show if we have a showId
        if (CURRENT_SHOW_ID) {
          await linkToShowAssets(CURRENT_SHOW_ID, {
            asset_type: 'recording',
            name: options.name || 'Recording',
            file_url: storageResult.publicUrl,
            file_size: blob.size,
            duration_seconds: Math.round(options.duration || 0),
            stage: 'recording',
            metadata: {
              generatedMediaId: mediaResult.id,
              scriptId: options.scriptId,
              scriptTitle: options.scriptTitle,
              hasVoiceover: options.hasVoiceover,
              hasMusic: options.hasMusic
            }
          });
        }
        
        showBackendStatus('✓ Saved to cloud!', 'success');
        console.log('[BackendSync] ✅ Recording saved successfully');
        
        // Notify parent window
        notifyParentWindow('recording_saved', {
          mediaId: mediaResult.id,
          showId: CURRENT_SHOW_ID,
          url: storageResult.publicUrl
        });
        
        return {
          mediaId: mediaResult.id,
          url: storageResult.publicUrl,
          showId: CURRENT_SHOW_ID
        };
        
      } catch (err) {
        console.error('[BackendSync] Save failed:', err);
        showBackendStatus('Save failed: ' + err.message, 'error');
        return null;
      } finally {
        isSavingToBackend = false;
      }
    }
    
    // =====================================================
    // UPDATE SCRIPT TO BACKEND
    // =====================================================
    
    async function saveScriptToBackend(scriptId, content, version) {
      if (!scriptId || !USER_ACCESS_TOKEN) {
        console.log('[BackendSync] Cannot save script - no ID or auth');
        return null;
      }
      
      version = version || 'draft';
      console.log('[BackendSync] Saving script:', scriptId, 'version:', version);
      
      try {
        var authHeader = 'Bearer ' + USER_ACCESS_TOKEN;
        
        // First check if draft exists
        var checkResponse = await fetch(
          SUPABASE_URL + '/rest/v1/script_drafts?script_id=eq.' + scriptId + '&select=id',
          {
            method: 'GET',
            headers: {
              'Authorization': authHeader,
              'apikey': SUPABASE_KEY
            }
          }
        );
        
        var existingDrafts = await checkResponse.json();
        var method = existingDrafts.length > 0 ? 'PATCH' : 'POST';
        var endpoint = existingDrafts.length > 0 
          ? SUPABASE_URL + '/rest/v1/script_drafts?script_id=eq.' + scriptId
          : SUPABASE_URL + '/rest/v1/script_drafts';
        
        var payload = {
          script_id: scriptId,
          content: content,
          version: version,
          status: 'draft',
          updated_at: new Date().toISOString()
        };
        
        var response = await fetch(endpoint, {
          method: method,
          headers: {
            'Authorization': authHeader,
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          console.log('[BackendSync] Script saved');
          showBackendStatus('Script saved', 'success');
        }
        
      } catch (err) {
        console.error('[BackendSync] Script save failed:', err);
      }
    }
    
    // =====================================================
    // CROSS-WINDOW COMMUNICATION
    // =====================================================
    
    function notifyParentWindow(eventType, data) {
      try {
        // Use BroadcastChannel
        if (typeof BroadcastChannel !== 'undefined') {
          var channel = new BroadcastChannel('genie_vibe_sync');
          channel.postMessage({
            type: eventType,
            data: data,
            timestamp: Date.now()
          });
          channel.close();
        }
        
        // Also try localStorage event
        var eventData = JSON.stringify({
          type: eventType,
          data: data,
          timestamp: Date.now()
        });
        localStorage.setItem('genie_vibe_event', eventData);
        
        // Trigger storage event for other windows
        setTimeout(function() {
          localStorage.removeItem('genie_vibe_event');
        }, 100);
        
        console.log('[BackendSync] Notified parent:', eventType);
      } catch (e) {
        console.warn('[BackendSync] Could not notify parent:', e);
      }
    }
    
    // =====================================================
    // UI HELPERS
    // =====================================================
    
    function showBackendStatus(message, type) {
      type = type || 'info';
      
      // Remove existing status
      var existing = document.getElementById('backendSyncStatus');
      if (existing) existing.remove();
      
      var statusEl = document.createElement('div');
      statusEl.id = 'backendSyncStatus';
      statusEl.className = 'backend-sync-status ' + type;
      statusEl.innerHTML = '<span class="sync-icon">' + 
        (type === 'success' ? '✓' : type === 'error' ? '✗' : '↻') + 
        '</span> ' + message;
      
      document.body.appendChild(statusEl);
      
      // Auto-hide success/info messages
      if (type === 'success' || type === 'info') {
        setTimeout(function() {
          statusEl.classList.add('fade-out');
          setTimeout(function() { statusEl.remove(); }, 300);
        }, 3000);
      }
    }
    
    // =====================================================
    // HOOK INTO EXISTING SAVE FLOW
    // =====================================================
    
    // Override the library save to also save to backend
    var originalSaveToLibrary = typeof saveRecordingToLibrary === 'function' ? saveRecordingToLibrary : null;
    
    saveRecordingToLibrary = async function(blob, metadata) {
      // First save to local IndexedDB
      var localResult = null;
      if (originalSaveToLibrary) {
        localResult = await originalSaveToLibrary(blob, metadata);
      }
      
      // Then save to backend
      var backendResult = await saveRecordingToBackend(blob, {
        name: metadata.name,
        duration: metadata.duration,
        scriptId: metadata.scriptId || (typeof getCurrentScriptId === 'function' ? getCurrentScriptId() : null),
        scriptTitle: metadata.scriptTitle,
        hasVoiceover: metadata.hasVoiceover,
        hasMusic: metadata.hasMusic,
        voiceoverName: getSelectedVoiceoverName(),
        musicName: getSelectedMusicName(),
        hasCaptions: metadata.hasCaptions || false,
        captionsText: metadata.captionsText || null
      });
      
      return localResult || backendResult;
    };
    
    // Helper to get selected names
    function getSelectedVoiceoverName() {
      var select = document.getElementById('voiceoverSelect');
      if (!select || !select.value) return null;
      var option = select.options[select.selectedIndex];
      return option ? option.text : null;
    }
    
    function getSelectedMusicName() {
      var select = document.getElementById('musicSelect');
      if (!select || !select.value) return null;
      var option = select.options[select.selectedIndex];
      return option ? option.text : null;
    }
    
    function getCurrentScriptId() {
      var select = document.getElementById('scriptSelect');
      return select ? select.value : null;
    }
    
    console.log('[BackendSync] ✅ Module loaded');
    console.log('[BackendSync] ShowId:', CURRENT_SHOW_ID || 'none');
    console.log('[BackendSync] Auth available:', !!USER_ACCESS_TOKEN);
  `;
}

/**
 * Get CSS styles for backend sync UI elements
 */
export function getBackendSyncStyles(): string {
  return `
    /* Backend Sync Status Styles */
    .backend-sync-status {
      position: fixed;
      top: 16px;
      right: 16px;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10001;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideInRight 0.3s ease-out;
    }
    
    .backend-sync-status.info {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
    }
    
    .backend-sync-status.success {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
    }
    
    .backend-sync-status.error {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
    }
    
    .backend-sync-status.warning {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
    }
    
    .backend-sync-status .sync-icon {
      font-size: 16px;
    }
    
    .backend-sync-status.fade-out {
      opacity: 0;
      transform: translateX(20px);
      transition: all 0.3s ease-out;
    }
    
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    /* Save to Project Button */
    .save-to-project-btn {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    
    .save-to-project-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
    }
    
    .save-to-project-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .save-to-project-btn .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Project context indicator */
    .project-context-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 4px;
      font-size: 11px;
      color: #a78bfa;
    }
    
    .project-context-badge .project-icon {
      font-size: 12px;
    }
  `;
}
