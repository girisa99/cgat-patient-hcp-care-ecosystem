/**
 * Popout Recording Studio - Voiceover Manager Module
 * Link voiceover audio to scripts, assignment UI
 */

export function getVoiceoverManagerScript(): string {
  return `
    // =====================================================
    // VOICEOVER MANAGER MODULE
    // =====================================================

    let voiceoverAssignments = {};  // scriptId -> voiceoverId mapping
    let voiceoverMetadata = {};     // voiceoverId -> metadata

    // Initialize voiceover manager
    function initVoiceoverManager() {
      console.log('[VoiceoverManager] Initializing');
      
      // Load any saved assignments
      try {
        const saved = localStorage.getItem('voiceoverAssignments');
        if (saved) {
          voiceoverAssignments = JSON.parse(saved);
          console.log('[VoiceoverManager] Loaded', Object.keys(voiceoverAssignments).length, 'assignments');
        }
      } catch (e) {
        console.warn('[VoiceoverManager] Failed to load saved assignments:', e);
      }

      updateAssignmentUI();
    }

    // Assign voiceover to script
    function assignVoiceoverToScript(scriptId, voiceoverId) {
      if (!scriptId) {
        console.warn('[VoiceoverManager] No script ID provided');
        return false;
      }

      voiceoverAssignments[scriptId] = voiceoverId;
      saveAssignments();
      updateAssignmentUI();

      console.log('[VoiceoverManager] Assigned voiceover', voiceoverId, 'to script', scriptId);
      return true;
    }

    // Remove voiceover assignment
    function removeVoiceoverAssignment(scriptId) {
      delete voiceoverAssignments[scriptId];
      saveAssignments();
      updateAssignmentUI();
      console.log('[VoiceoverManager] Removed assignment for script', scriptId);
    }

    // Get voiceover for script
    function getVoiceoverForScript(scriptId) {
      return voiceoverAssignments[scriptId] || null;
    }

    // Save assignments to localStorage
    function saveAssignments() {
      try {
        localStorage.setItem('voiceoverAssignments', JSON.stringify(voiceoverAssignments));
      } catch (e) {
        console.warn('[VoiceoverManager] Failed to save assignments:', e);
      }
    }

    // Update assignment UI
    function updateAssignmentUI() {
      const containerEl = document.getElementById('assignmentsList');
      if (!containerEl) return;

      if (Object.keys(voiceoverAssignments).length === 0) {
        containerEl.innerHTML = '<div class="no-assignments">No voiceover assignments</div>';
        return;
      }

      let html = '';
      Object.entries(voiceoverAssignments).forEach(function(entry) {
        const scriptId = entry[0];
        const voiceoverId = entry[1];
        
        // Find script and voiceover names
        const script = scriptsData.find(function(s) { return s.id === scriptId; });
        const voSelect = document.getElementById('voiceoverSelect');
        let voName = 'Unknown';
        
        if (voSelect) {
          for (let i = 0; i < voSelect.options.length; i++) {
            if (voSelect.options[i].value === voiceoverId) {
              voName = voSelect.options[i].text;
              break;
            }
          }
        }

        const scriptName = script ? script.title : 'Unknown Script';

        html += 
          '<div class="assignment-item">' +
            '<div class="assignment-info">' +
              '<span class="assignment-script">📝 ' + escapeHtmlSync(scriptName) + '</span>' +
              '<span class="assignment-arrow">→</span>' +
              '<span class="assignment-voice">🎤 ' + escapeHtmlSync(voName) + '</span>' +
            '</div>' +
            '<button class="assignment-remove" onclick="removeVoiceoverAssignment(\\'' + scriptId + '\\')">' +
              '✕' +
            '</button>' +
          '</div>';
      });

      containerEl.innerHTML = html;
    }

    // Auto-assign voiceover when selected
    function setupAutoAssignment() {
      const scriptSelectEl = document.getElementById('scriptSelect');
      const voiceoverSelectEl = document.getElementById('voiceoverSelect');
      const assignBtn = document.getElementById('assignVoiceoverBtn');

      if (assignBtn) {
        assignBtn.addEventListener('click', function() {
          const scriptId = scriptSelectEl ? scriptSelectEl.value : null;
          const voiceoverId = voiceoverSelectEl ? voiceoverSelectEl.value : null;

          if (scriptId && voiceoverId) {
            assignVoiceoverToScript(scriptId, voiceoverId);
            showAssignmentToast('Voiceover assigned to script');
          } else {
            showAssignmentToast('Select both script and voiceover', 'error');
          }
        });
      }
    }

    // Show toast notification
    function showAssignmentToast(message, type) {
      const toastEl = document.getElementById('assignmentToast');
      if (!toastEl) return;

      toastEl.textContent = message;
      toastEl.className = 'assignment-toast visible ' + (type || 'success');
      
      setTimeout(function() {
        toastEl.className = 'assignment-toast';
      }, 3000);
    }

    // Get all assignments for export
    function getAssignmentsForExport() {
      const exportData = [];

      Object.entries(voiceoverAssignments).forEach(function(entry) {
        const scriptId = entry[0];
        const voiceoverId = entry[1];
        
        const script = scriptsData.find(function(s) { return s.id === scriptId; });
        const voSelect = document.getElementById('voiceoverSelect');
        let voData = null;
        
        if (voSelect) {
          for (let i = 0; i < voSelect.options.length; i++) {
            if (voSelect.options[i].value === voiceoverId) {
              voData = {
                id: voiceoverId,
                name: voSelect.options[i].text,
                url: voSelect.options[i].dataset.url
              };
              break;
            }
          }
        }

        if (script && voData) {
          exportData.push({
            script: {
              id: scriptId,
              title: script.title,
              content: script.content
            },
            voiceover: voData
          });
        }
      });

      return exportData;
    }

    // Load assigned voiceover when script changes
    function loadAssignedVoiceover(scriptId) {
      const assignedVoId = voiceoverAssignments[scriptId];
      const voSelect = document.getElementById('voiceoverSelect');

      if (assignedVoId && voSelect) {
        voSelect.value = assignedVoId;
        voSelect.dispatchEvent(new Event('change'));
        console.log('[VoiceoverManager] Auto-loaded voiceover for script:', scriptId);
      }
    }

    // Initialize on load
    setTimeout(function() {
      initVoiceoverManager();
      setupAutoAssignment();
    }, 100);

    console.log('[VoiceoverManager] Module loaded');
  `;
}

export function getVoiceoverManagerStyles(): string {
  return `
    /* Voiceover Manager Styles */
    .voiceover-manager {
      padding: 16px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }

    .assignment-controls {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .assign-btn {
      padding: 8px 16px;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      border: none;
      border-radius: 6px;
      color: #fff;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .assign-btn:hover {
      transform: translateY(-1px);
    }

    .assignments-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .assignment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 6px;
    }

    .assignment-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
    }

    .assignment-script {
      color: #a78bfa;
    }

    .assignment-arrow {
      color: #666;
    }

    .assignment-voice {
      color: #60a5fa;
    }

    .assignment-remove {
      width: 24px;
      height: 24px;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 4px;
      color: #ef4444;
      cursor: pointer;
      font-size: 0.75rem;
      transition: all 0.2s;
    }

    .assignment-remove:hover {
      background: rgba(239, 68, 68, 0.3);
    }

    .no-assignments {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 0.75rem;
      font-style: italic;
    }

    .assignment-toast {
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
      z-index: 1000;
    }

    .assignment-toast.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    .assignment-toast.error {
      background: #ef4444;
    }
  `;
}
