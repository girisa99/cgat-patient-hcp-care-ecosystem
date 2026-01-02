/**
 * Popout Recording Studio - Recording Library Module
 * Stores recordings in IndexedDB for later viewing/download
 */

export function getRecordingLibraryScript(): string {
  return `
    // =====================================================
    // RECORDING LIBRARY MODULE
    // =====================================================

    const DB_NAME = 'RecordingStudioDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'recordings';
    let libraryDB = null;

    // =====================================================
    // INDEXEDDB INITIALIZATION
    // =====================================================

    async function initLibraryDB() {
      return new Promise(function(resolve, reject) {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = function() {
          console.error('[Library] Failed to open IndexedDB');
          reject(request.error);
        };
        
        request.onsuccess = function() {
          libraryDB = request.result;
          console.log('[Library] IndexedDB initialized');
          resolve(libraryDB);
        };
        
        request.onupgradeneeded = function(event) {
          const db = event.target.result;
          
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('name', 'name', { unique: false });
            console.log('[Library] Created recordings store');
          }
        };
      });
    }

    // =====================================================
    // SAVE RECORDING TO LIBRARY
    // =====================================================

    async function saveRecordingToLibrary(blob, metadata) {
      if (!libraryDB) {
        await initLibraryDB();
      }

      return new Promise(function(resolve, reject) {
        const transaction = libraryDB.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const recording = {
          blob: blob,
          name: metadata.name || 'Recording ' + new Date().toLocaleString(),
          timestamp: Date.now(),
          duration: metadata.duration || 0,
          size: blob.size,
          type: blob.type,
          scriptTitle: metadata.scriptTitle || null,
          hasVoiceover: metadata.hasVoiceover || false,
          hasMusic: metadata.hasMusic || false
        };
        
        const request = store.add(recording);
        
        request.onsuccess = function() {
          console.log('[Library] Recording saved with ID:', request.result);
          updateLibraryUI();
          showLibraryToast('Recording saved to library!', 'success');
          resolve(request.result);
        };
        
        request.onerror = function() {
          console.error('[Library] Failed to save recording');
          reject(request.error);
        };
      });
    }

    // =====================================================
    // GET RECORDINGS FROM LIBRARY
    // =====================================================

    async function getRecordingsFromLibrary() {
      if (!libraryDB) {
        await initLibraryDB();
      }

      return new Promise(function(resolve, reject) {
        const transaction = libraryDB.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        const request = index.openCursor(null, 'prev'); // Newest first
        
        const recordings = [];
        
        request.onsuccess = function(event) {
          const cursor = event.target.result;
          if (cursor) {
            recordings.push({
              id: cursor.value.id,
              name: cursor.value.name,
              timestamp: cursor.value.timestamp,
              duration: cursor.value.duration,
              size: cursor.value.size,
              type: cursor.value.type,
              scriptTitle: cursor.value.scriptTitle,
              hasVoiceover: cursor.value.hasVoiceover,
              hasMusic: cursor.value.hasMusic
            });
            cursor.continue();
          } else {
            resolve(recordings);
          }
        };
        
        request.onerror = function() {
          reject(request.error);
        };
      });
    }

    // =====================================================
    // GET SINGLE RECORDING
    // =====================================================

    async function getRecordingById(id) {
      if (!libraryDB) {
        await initLibraryDB();
      }

      return new Promise(function(resolve, reject) {
        const transaction = libraryDB.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        
        request.onsuccess = function() {
          resolve(request.result);
        };
        
        request.onerror = function() {
          reject(request.error);
        };
      });
    }

    // =====================================================
    // DELETE RECORDING
    // =====================================================

    async function deleteRecordingFromLibrary(id) {
      if (!libraryDB) {
        await initLibraryDB();
      }

      return new Promise(function(resolve, reject) {
        const transaction = libraryDB.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = function() {
          console.log('[Library] Recording deleted:', id);
          updateLibraryUI();
          showLibraryToast('Recording deleted', 'info');
          resolve();
        };
        
        request.onerror = function() {
          reject(request.error);
        };
      });
    }

    // =====================================================
    // DOWNLOAD RECORDING
    // =====================================================

    async function downloadRecordingFromLibrary(id) {
      const recording = await getRecordingById(id);
      
      if (!recording) {
        showLibraryToast('Recording not found', 'error');
        return;
      }

      const url = URL.createObjectURL(recording.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = recording.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.webm';
      a.click();
      
      setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
      showLibraryToast('Download started!', 'success');
    }

    // =====================================================
    // PLAY RECORDING PREVIEW
    // =====================================================

    let previewVideo = null;

    async function playRecordingPreview(id) {
      const recording = await getRecordingById(id);
      
      if (!recording) {
        showLibraryToast('Recording not found', 'error');
        return;
      }

      const previewContainer = document.getElementById('libraryPreviewContainer');
      
      if (!previewContainer) return;

      // Stop existing preview
      if (previewVideo) {
        previewVideo.pause();
        previewVideo.src = '';
      }

      const url = URL.createObjectURL(recording.blob);
      
      previewContainer.innerHTML = 
        '<div class="library-preview">' +
          '<video id="libraryPreviewVideo" controls autoplay></video>' +
          '<button class="close-preview-btn" onclick="closeRecordingPreview()">✕</button>' +
        '</div>';
      
      previewContainer.style.display = 'flex';
      
      previewVideo = document.getElementById('libraryPreviewVideo');
      previewVideo.src = url;
      
      previewVideo.onended = function() {
        URL.revokeObjectURL(url);
      };
    }

    function closeRecordingPreview() {
      const previewContainer = document.getElementById('libraryPreviewContainer');
      
      if (previewVideo) {
        previewVideo.pause();
        previewVideo.src = '';
        previewVideo = null;
      }
      
      if (previewContainer) {
        previewContainer.style.display = 'none';
        previewContainer.innerHTML = '';
      }
    }

    // =====================================================
    // UPDATE LIBRARY UI
    // =====================================================

    async function updateLibraryUI() {
      const libraryList = document.getElementById('libraryList');
      const libraryCount = document.getElementById('libraryCount');
      
      if (!libraryList) return;

      try {
        const recordings = await getRecordingsFromLibrary();
        
        if (libraryCount) {
          libraryCount.textContent = recordings.length + ' recording' + (recordings.length !== 1 ? 's' : '');
        }
        
        // Also update the button count if exists
        const btnCount = document.querySelector('#libraryBtn #libraryCount, #libraryBtn .library-btn-count');
        if (btnCount) {
          btnCount.textContent = recordings.length;
        }
        
        if (recordings.length === 0) {
          libraryList.innerHTML = '<div class="library-empty">No recordings yet</div>';
          return;
        }

        let html = '';
        recordings.forEach(function(rec) {
          const date = new Date(rec.timestamp).toLocaleString();
          const sizeMB = (rec.size / (1024 * 1024)).toFixed(2);
          const duration = rec.duration ? formatLibraryDuration(rec.duration) : '--:--';
          
          html += 
            '<div class="library-item" data-id="' + rec.id + '">' +
              '<div class="library-item-info">' +
                '<div class="library-item-name">' + escapeHtmlLibrary(rec.name) + '</div>' +
                '<div class="library-item-meta">' +
                  '<span>' + date + '</span>' +
                  '<span>⏱ ' + duration + '</span>' +
                  '<span>📦 ' + sizeMB + ' MB</span>' +
                '</div>' +
              '</div>' +
              '<div class="library-item-actions">' +
                '<button class="library-btn play" onclick="playRecordingPreview(' + rec.id + ')">▶</button>' +
                '<button class="library-btn download" onclick="downloadRecordingFromLibrary(' + rec.id + ')">📥</button>' +
                '<button class="library-btn delete" onclick="confirmDeleteRecording(' + rec.id + ')">🗑️</button>' +
              '</div>' +
            '</div>';
        });
        
        libraryList.innerHTML = html;
        
      } catch (err) {
        console.error('[Library] Failed to update UI:', err);
        libraryList.innerHTML = '<div class="library-error">Failed to load recordings</div>';
      }
    }

    function formatLibraryDuration(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }

    function confirmDeleteRecording(id) {
      if (confirm('Delete this recording? This cannot be undone.')) {
        deleteRecordingFromLibrary(id);
      }
    }

    function escapeHtmlLibrary(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    // =====================================================
    // UI HELPERS
    // =====================================================

    function showLibraryToast(message, type) {
      const toast = document.getElementById('libraryToast');
      if (!toast) return;

      toast.textContent = message;
      toast.className = 'library-toast visible ' + (type || 'info');
      
      setTimeout(function() {
        toast.className = 'library-toast';
      }, 3000);
    }

    function toggleLibraryPanel() {
      const panel = document.getElementById('libraryPanel');
      if (panel) {
        panel.classList.toggle('visible');
        if (panel.classList.contains('visible')) {
          updateLibraryUI();
        }
      }
    }

    // =====================================================
    // INITIALIZATION
    // =====================================================

    function initRecordingLibrary() {
      initLibraryDB().then(function() {
        updateLibraryUI();
      }).catch(function(err) {
        console.error('[Library] Init failed:', err);
      });

      // Library toggle button
      const libraryBtn = document.getElementById('libraryBtn');
      if (libraryBtn) {
        libraryBtn.addEventListener('click', toggleLibraryPanel);
      }

      // Close library panel
      const closeLibraryBtn = document.getElementById('closeLibraryBtn');
      if (closeLibraryBtn) {
        closeLibraryBtn.addEventListener('click', function() {
          const panel = document.getElementById('libraryPanel');
          if (panel) panel.classList.remove('visible');
        });
      }

      console.log('[Library] Module initialized');
    }

    setTimeout(initRecordingLibrary, 300);

    console.log('[Library] Module loaded');
  `;
}

export function getRecordingLibraryStyles(): string {
  return `
    /* Recording Library Styles */
    
    .library-btn-toggle {
      padding: 8px 16px;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      border: none;
      border-radius: 6px;
      color: #fff;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .library-btn-toggle:hover {
      transform: translateY(-1px);
    }

    /* Library Panel */
    .library-panel {
      position: fixed;
      top: 0;
      right: -400px;
      width: 380px;
      height: 100vh;
      background: rgba(15, 15, 20, 0.98);
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 1000;
      transition: right 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .library-panel.visible {
      right: 0;
    }

    .library-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .library-header h3 {
      margin: 0;
      font-size: 1rem;
      color: #fff;
    }

    .library-count {
      font-size: 0.75rem;
      color: #888;
    }

    .close-library-btn {
      background: none;
      border: none;
      color: #888;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 4px 8px;
    }

    .close-library-btn:hover {
      color: #fff;
    }

    /* Library List */
    .library-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }

    .library-empty {
      text-align: center;
      padding: 40px 20px;
      color: #666;
      font-size: 0.875rem;
    }

    .library-error {
      text-align: center;
      padding: 20px;
      color: #ef4444;
      font-size: 0.875rem;
    }

    .library-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .library-item:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .library-item-info {
      flex: 1;
      min-width: 0;
    }

    .library-item-name {
      font-size: 0.875rem;
      color: #fff;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .library-item-meta {
      display: flex;
      gap: 12px;
      font-size: 0.7rem;
      color: #888;
    }

    .library-item-actions {
      display: flex;
      gap: 4px;
    }

    .library-btn {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      transition: all 0.2s;
    }

    .library-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .library-btn.delete:hover {
      background: rgba(239, 68, 68, 0.3);
      border-color: rgba(239, 68, 68, 0.5);
    }

    /* Preview Container */
    #libraryPreviewContainer {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 1100;
      align-items: center;
      justify-content: center;
    }

    .library-preview {
      position: relative;
      max-width: 90%;
      max-height: 90%;
    }

    .library-preview video {
      max-width: 100%;
      max-height: 80vh;
      border-radius: 8px;
    }

    .close-preview-btn {
      position: absolute;
      top: -40px;
      right: 0;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: #fff;
      font-size: 1.25rem;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
    }

    .close-preview-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Library Toast */
    .library-toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      padding: 12px 24px;
      background: #22c55e;
      color: #fff;
      border-radius: 8px;
      font-size: 0.875rem;
      opacity: 0;
      transition: all 0.3s;
      z-index: 1200;
    }

    .library-toast.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    .library-toast.error {
      background: #ef4444;
    }

    .library-toast.info {
      background: #3b82f6;
    }
  `;
}
