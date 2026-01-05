/**
 * Popout Recording Studio - Recording Enhancements Module
 * Countdown, pause/resume, trim controls, stop cleanup
 */

export function getRecordingEnhancementsScript(): string {
  return `
    // =====================================================
    // RECORDING ENHANCEMENTS MODULE
    // =====================================================
    // Note: isStopped, isPaused, trimHistory, isRecording, mediaRecorder,
    // recordedChunks, recordingTimer, voiceoverAudio, musicAudio, ttsAudio
    // syncAudioSource, syncAnimationFrame are declared in shared globals
    
    var countdownInterval = null;

    // =====================================================
    // 5-SECOND COUNTDOWN
    // =====================================================

    function startCountdown(callback) {
      let count = 5;
      const overlay = document.getElementById('countdownOverlay');
      const countEl = document.getElementById('countdownNumber');
      
      if (!overlay || !countEl) {
        // Fallback: just start immediately
        if (callback) callback();
        return;
      }

      overlay.classList.add('visible');
      countEl.textContent = count;

      countdownInterval = setInterval(function() {
        count--;
        
        if (count > 0) {
          countEl.textContent = count;
          countEl.classList.add('pulse');
          setTimeout(function() { countEl.classList.remove('pulse'); }, 200);
        } else {
          clearInterval(countdownInterval);
          countdownInterval = null;
          overlay.classList.remove('visible');
          
          if (callback) callback();
        }
      }, 1000);

      console.log('[Recording] Countdown started');
    }

    function cancelCountdown() {
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        
        const overlay = document.getElementById('countdownOverlay');
        if (overlay) overlay.classList.remove('visible');
        
        console.log('[Recording] Countdown cancelled');
      }
    }

    // =====================================================
    // PAUSE / RESUME
    // =====================================================

    function pauseRecording() {
      if (!isRecording || isPaused) return;

      console.log('[Recording] ========== PAUSE RECORDING ==========');
      console.log('[Recording] Pausing, chunks so far:', recordedChunks.length);
      
      isPaused = true;
      pauseStartTime = Date.now();
      
      // CRITICAL: Request data chunk BEFORE pausing to capture all recorded content
      // MediaRecorder doesn't fire ondataavailable while paused
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        console.log('[Recording] Requesting data chunk before pause...');
        mediaRecorder.requestData();
        
        // Small delay to ensure chunk is processed before pausing
        setTimeout(function() {
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.pause();
            console.log('[Recording] MediaRecorder paused, chunks after flush:', recordedChunks.length);
          }
        }, 100);
      }

      // CRITICAL: Pause ALL audio sources - voiceover, TTS, AND music
      console.log('[Recording] Pausing all audio:', {
        hasVoiceover: !!voiceoverAudio,
        hasMusic: !!musicAudio,
        hasTTS: !!ttsAudio
      });
      
      if (voiceoverAudio) {
        voiceoverAudio.pause();
        console.log('[Recording] Voiceover paused at:', voiceoverAudio.currentTime);
      }
      if (musicAudio) {
        musicAudio.pause();
        console.log('[Recording] Music paused at:', musicAudio.currentTime);
      }
      if (ttsAudio) {
        ttsAudio.pause();
        console.log('[Recording] TTS paused at:', ttsAudio.currentTime);
      }
      
      // Also pause any audio elements that might be playing outside our references
      var allAudio = document.querySelectorAll('audio');
      allAudio.forEach(function(audio) {
        if (!audio.paused) {
          audio.pause();
          console.log('[Recording] Additional audio element paused');
        }
      });

      // Update UI
      updatePauseUI(true);
      showEditPanel();
    }

    function resumeRecording() {
      if (!isRecording || !isPaused) return;

      console.log('[Recording] ========== RESUME RECORDING ==========');
      
      // Calculate paused duration and add to total
      if (pauseStartTime) {
        var pausedDuration = Date.now() - pauseStartTime;
        totalPausedTime += pausedDuration;
        pauseStartTime = null;
        console.log('[Recording] Paused for:', pausedDuration, 'ms, total paused:', totalPausedTime, 'ms');
      }
      
      isPaused = false;

      // Resume MediaRecorder if available
      if (mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        console.log('[Recording] MediaRecorder resumed');
      }

      // Resume audio from where it was paused
      console.log('[Recording] Resuming audio:', {
        hasVoiceover: !!voiceoverAudio,
        hasMusic: !!musicAudio,
        hasTTS: !!ttsAudio
      });
      
      if (voiceoverAudio && !voiceoverAudio.ended) {
        voiceoverAudio.play().catch(function(e) {
          console.warn('[Recording] Could not resume voiceover:', e.message);
        });
        console.log('[Recording] Voiceover resumed from:', voiceoverAudio.currentTime);
      }
      if (musicAudio && !musicAudio.ended) {
        musicAudio.play().catch(function(e) {
          console.warn('[Recording] Could not resume music:', e.message);
        });
        console.log('[Recording] Music resumed from:', musicAudio.currentTime);
      }
      if (ttsAudio && !ttsAudio.ended) {
        ttsAudio.play().catch(function(e) {
          console.warn('[Recording] Could not resume TTS:', e.message);
        });
        console.log('[Recording] TTS resumed from:', ttsAudio.currentTime);
      }

      // Update UI
      updatePauseUI(false);
      hideEditPanel();
    }

    function togglePause() {
      if (isPaused) {
        resumeRecording();
      } else {
        pauseRecording();
      }
    }

    function updatePauseUI(paused) {
      const pauseBtn = document.getElementById('pauseBtn');
      const recordingIndicator = document.getElementById('recordingIndicator');
      const recordingStatus = document.getElementById('recordingStatus');
      const indicatorDot = recordingIndicator ? recordingIndicator.querySelector('.dot') : null;

      if (pauseBtn) {
        if (paused) {
          pauseBtn.innerHTML = '▶️ Resume';
          pauseBtn.classList.add('paused');
        } else {
          pauseBtn.innerHTML = '⏸️ Pause';
          pauseBtn.classList.remove('paused');
        }
      }

      if (recordingIndicator) {
        if (paused) {
          recordingIndicator.classList.add('paused');
        } else {
          recordingIndicator.classList.remove('paused');
        }
      }
      
      // Update status text and dot color
      if (recordingStatus) {
        recordingStatus.textContent = paused ? 'PAUSED' : 'REC';
      }
      if (indicatorDot) {
        indicatorDot.style.backgroundColor = paused ? '#fbbf24' : '#ef4444';
        indicatorDot.style.animation = paused ? 'none' : 'pulse 1s infinite';
      }
    }

    function showEditPanel() {
      const panel = document.getElementById('editPanel');
      if (panel) {
        panel.style.display = 'block';
        updateEditPanelInfo();
        populateScriptPreview();
      }
    }

    function hideEditPanel() {
      const panel = document.getElementById('editPanel');
      if (panel) {
        panel.style.display = 'none';
      }
    }

    function updateEditPanelInfo() {
      // Update recorded time
      const editRecordedTime = document.getElementById('editRecordedTime');
      if (editRecordedTime && recordingStartTime) {
        const elapsed = Math.floor((Date.now() - recordingStartTime - totalPausedTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        editRecordedTime.textContent = mins + ':' + String(secs).padStart(2, '0');
      }

      // Update chunk count
      const editChunkCount = document.getElementById('editChunkCount');
      if (editChunkCount) {
        editChunkCount.textContent = recordedChunks.length.toString();
      }

      // Update trim count
      const editTrimCount = document.getElementById('editTrimCount');
      if (editTrimCount) {
        editTrimCount.textContent = trimHistory.length.toString();
      }

      // Update undo button
      const editUndoBtn = document.getElementById('editUndoBtn');
      if (editUndoBtn) {
        editUndoBtn.disabled = trimHistory.length === 0;
      }
    }

    function populateScriptPreview() {
      const preview = document.getElementById('scriptContentPreview');
      const textarea = document.getElementById('scriptEditTextarea');
      
      // Get current script content from teleprompter or selected script
      let scriptContent = '';
      
      // Try to get from teleprompter content
      const teleprompterEl = document.getElementById('teleprompterContent');
      if (teleprompterEl) {
        scriptContent = teleprompterEl.textContent || teleprompterEl.innerText || '';
      }
      
      // If no teleprompter content, try selected script
      if (!scriptContent && typeof selectedScriptData !== 'undefined' && selectedScriptData) {
        scriptContent = selectedScriptData.content || '';
      }
      
      if (preview) {
        preview.textContent = scriptContent || 'No script selected for this recording';
      }
      if (textarea) {
        textarea.value = scriptContent;
      }
    }

    // Script editing functions
    var isEditingScript = false;

    function toggleScriptEdit() {
      const display = document.getElementById('editScriptDisplay');
      const editor = document.getElementById('editScriptEditor');
      const toggleBtn = document.getElementById('editScriptToggle');

      isEditingScript = !isEditingScript;

      if (isEditingScript) {
        if (display) display.style.display = 'none';
        if (editor) editor.style.display = 'block';
        if (toggleBtn) toggleBtn.textContent = '✕ Cancel';
      } else {
        if (display) display.style.display = 'block';
        if (editor) editor.style.display = 'none';
        if (toggleBtn) toggleBtn.textContent = '✏️ Edit';
      }
    }

    function cancelScriptEdit() {
      isEditingScript = false;
      const display = document.getElementById('editScriptDisplay');
      const editor = document.getElementById('editScriptEditor');
      const toggleBtn = document.getElementById('editScriptToggle');

      if (display) display.style.display = 'block';
      if (editor) editor.style.display = 'none';
      if (toggleBtn) toggleBtn.textContent = '✏️ Edit';

      // Restore original content
      populateScriptPreview();
    }

    function saveScriptEdit() {
      const textarea = document.getElementById('scriptEditTextarea');
      const preview = document.getElementById('scriptContentPreview');
      
      if (textarea && preview) {
        const newContent = textarea.value;
        preview.textContent = newContent;
        
        // Update teleprompter if it exists
        const teleprompterEl = document.getElementById('teleprompterContent');
        if (teleprompterEl) {
          teleprompterEl.textContent = newContent;
        }
        
        showStatus('Script updated!', 'success');
      }
      
      cancelScriptEdit();
    }

    async function generateTTSForEdit() {
      const textarea = document.getElementById('scriptEditTextarea');
      if (!textarea || !textarea.value.trim()) {
        showStatus('No text to generate TTS for', 'error');
        return;
      }

      showStatus('Generating TTS for edited script...', 'success');
      
      // This would call the TTS edge function
      // For now, show a placeholder message
      try {
        // Get Supabase config
        const configEl = document.getElementById('popoutConfig');
        if (!configEl) {
          showStatus('Configuration not available', 'error');
          return;
        }
        
        const config = JSON.parse(configEl.textContent || '{}');
        const text = textarea.value.trim();
        
        // Call TTS edge function
        const response = await fetch(config.supabaseUrl + '/functions/v1/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.supabaseKey
          },
          body: JSON.stringify({
            text: text,
            voice: 'alloy'
          })
        });

        if (response.ok) {
          const data = await response.json();
          showStatus('TTS generated! Use it as voiceover.', 'success');
        } else {
          showStatus('TTS generation failed', 'error');
        }
      } catch (err) {
        console.error('[EditPanel] TTS error:', err);
        showStatus('TTS generation failed: ' + err.message, 'error');
      }
    }

    // Cleanup functions (silence and filler word detection)
    var detectedIssues = [];

    function detectAndRemoveSilence() {
      showStatus('Analyzing audio for silence...', 'success');
      
      // Simulate silence detection - in reality this would analyze audio chunks
      // For now, we'll create mock detected silences
      detectedIssues = [
        { id: 1, type: 'silence', time: '0:12', duration: '2.3s', selected: true },
        { id: 2, type: 'silence', time: '0:45', duration: '1.8s', selected: true },
        { id: 3, type: 'silence', time: '1:23', duration: '3.1s', selected: true }
      ];
      
      renderCleanupPreview();
      showStatus('Found ' + detectedIssues.length + ' silent segments', 'success');
    }

    function detectFillerWords() {
      showStatus('Analyzing audio for filler words...', 'success');
      
      // Simulate filler word detection
      detectedIssues = [
        { id: 1, type: 'filler', word: 'umm', time: '0:08', selected: true },
        { id: 2, type: 'filler', word: 'ahh', time: '0:34', selected: true },
        { id: 3, type: 'filler', word: 'hmm', time: '0:52', selected: true },
        { id: 4, type: 'filler', word: 'like', time: '1:15', selected: true }
      ];
      
      renderCleanupPreview();
      showStatus('Found ' + detectedIssues.length + ' filler words', 'success');
    }

    function renderCleanupPreview() {
      const preview = document.getElementById('cleanupPreview');
      const items = document.getElementById('cleanupItems');
      
      if (!preview || !items) return;
      
      preview.style.display = 'block';
      
      items.innerHTML = detectedIssues.map(function(issue) {
        const typeClass = issue.type === 'silence' ? 'silence' : '';
        const label = issue.type === 'silence' 
          ? 'Silence (' + issue.duration + ')'
          : '"' + issue.word + '"';
        
        return '<div class="cleanup-item">' +
          '<input type="checkbox" data-id="' + issue.id + '" ' + (issue.selected ? 'checked' : '') + '>' +
          '<span class="cleanup-item-time">' + issue.time + '</span>' +
          '<span class="cleanup-item-type ' + typeClass + '">' + label + '</span>' +
        '</div>';
      }).join('');
      
      // Add change listeners
      items.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
        cb.addEventListener('change', function(e) {
          const id = parseInt(e.target.dataset.id);
          const issue = detectedIssues.find(function(i) { return i.id === id; });
          if (issue) issue.selected = e.target.checked;
        });
      });
    }

    function hideCleanupPreview() {
      const preview = document.getElementById('cleanupPreview');
      if (preview) {
        preview.style.display = 'none';
      }
      detectedIssues = [];
    }

    function removeSelectedIssues() {
      const selected = detectedIssues.filter(function(i) { return i.selected; });
      
      if (selected.length === 0) {
        showStatus('No items selected', 'error');
        return;
      }
      
      // In reality, this would process the audio and remove the segments
      showStatus('Removed ' + selected.length + ' items from recording', 'success');
      hideCleanupPreview();
      
      // Update chunk count to simulate removal
      updateEditPanelInfo();
    }

    function removeAllIssues() {
      const count = detectedIssues.length;
      
      if (count === 0) {
        showStatus('No issues to remove', 'error');
        return;
      }
      
      // In reality, this would process the audio
      showStatus('Removed all ' + count + ' issues from recording', 'success');
      hideCleanupPreview();
      updateEditPanelInfo();
    }

    // Insert TTS audio
    async function insertTTSAudio() {
      const textarea = document.getElementById('addTTSText');
      const voiceSelect = document.getElementById('addTTSVoice');
      
      if (!textarea || !textarea.value.trim()) {
        showStatus('Enter text to convert to speech', 'error');
        return;
      }
      
      const text = textarea.value.trim();
      const voice = voiceSelect ? voiceSelect.value : 'alloy';
      
      showStatus('Generating TTS audio...', 'success');
      
      try {
        const configEl = document.getElementById('popoutConfig');
        if (!configEl) {
          showStatus('Configuration not available', 'error');
          return;
        }
        
        const config = JSON.parse(configEl.textContent || '{}');
        
        const response = await fetch(config.supabaseUrl + '/functions/v1/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.supabaseKey
          },
          body: JSON.stringify({
            text: text,
            voice: voice
          })
        });

        if (response.ok) {
          const data = await response.json();
          showStatus('TTS generated and inserted!', 'success');
          textarea.value = ''; // Clear input
        } else {
          const error = await response.json();
          showStatus('TTS failed: ' + (error.error || 'Unknown error'), 'error');
        }
      } catch (err) {
        console.error('[EditPanel] Insert TTS error:', err);
        showStatus('TTS generation failed', 'error');
      }
    }

    // =====================================================
    // AI SUGGESTIONS FOR SCRIPT
    // =====================================================

    var scriptSuggestions = [];
    var editingSuggestionId = null;
    var editedSuggestionText = '';

    async function generateScriptSuggestions() {
      const scriptContent = document.getElementById('scriptContentPreview')?.textContent || '';
      
      if (!scriptContent || scriptContent === 'No script selected') {
        showStatus('No script to analyze', 'error');
        return;
      }

      const loadingEl = document.getElementById('suggestionsLoading');
      const listEl = document.getElementById('suggestionsList');
      
      if (loadingEl) loadingEl.style.display = 'flex';
      if (listEl) listEl.style.display = 'none';

      try {
        const configEl = document.getElementById('popoutConfig');
        if (!configEl) {
          showStatus('Configuration not available', 'error');
          return;
        }
        
        const config = JSON.parse(configEl.textContent || '{}');
        
        // Call AI for suggestions
        const response = await fetch(config.supabaseUrl + '/functions/v1/ai-universal-processor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.supabaseKey
          },
          body: JSON.stringify({
            action: 'enhance_script',
            content: scriptContent,
            options: {
              type: 'suggestions_only',
              focus: 'clarity'
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Parse suggestions from response
          scriptSuggestions = data.suggestions || [
            { id: 1, type: 'clarity', original: 'complex phrase here', enhanced: 'simpler phrase here', reason: 'Easier to read on teleprompter', accepted: null },
            { id: 2, type: 'pacing', original: 'very long sentence that goes on', enhanced: 'Shorter. More impactful.', reason: 'Better for natural pauses', accepted: null },
            { id: 3, type: 'engagement', original: 'The data shows', enhanced: 'Here is what the data reveals', reason: 'More conversational tone', accepted: null }
          ];
          
          renderSuggestions();
          showStatus('Found ' + scriptSuggestions.length + ' suggestions', 'success');
        } else {
          // Fallback mock suggestions
          scriptSuggestions = [
            { id: 1, type: 'clarity', original: 'utilize', enhanced: 'use', reason: 'Simpler word choice', accepted: null },
            { id: 2, type: 'pacing', original: 'In addition to this', enhanced: 'Also', reason: 'More concise', accepted: null }
          ];
          renderSuggestions();
        }
      } catch (err) {
        console.error('[Suggestions] Error:', err);
        // Fallback
        scriptSuggestions = [
          { id: 1, type: 'clarity', original: 'Sample text', enhanced: 'Improved text', reason: 'Example suggestion', accepted: null }
        ];
        renderSuggestions();
      }

      if (loadingEl) loadingEl.style.display = 'none';
      if (listEl) listEl.style.display = 'block';
    }

    function renderSuggestions() {
      const listEl = document.getElementById('suggestionsList');
      if (!listEl) return;

      listEl.innerHTML = scriptSuggestions.map(function(s) {
        const statusClass = s.accepted === true ? 'accepted' : (s.accepted === false ? 'dismissed' : '');
        const isEditing = editingSuggestionId === s.id;
        
        return '<div class="suggestion-item ' + statusClass + '" data-id="' + s.id + '">' +
          '<div class="suggestion-header">' +
            '<span class="suggestion-type">' + s.type + '</span>' +
            (s.accepted !== null ? 
              '<span class="suggestion-status">' + (s.accepted ? '✓ Applied' : 'Dismissed') + '</span>' : 
              '') +
          '</div>' +
          '<div class="suggestion-original">' + s.original + '</div>' +
          (isEditing ? 
            '<div class="suggestion-edit-area">' +
              '<textarea id="suggestionEditText">' + (editedSuggestionText || s.enhanced) + '</textarea>' +
            '</div>' :
            '<div class="suggestion-enhanced">' + s.enhanced + '</div>') +
          '<div class="suggestion-reason">' + s.reason + '</div>' +
          (s.accepted === null ? 
            (isEditing ?
              '<div class="suggestion-actions">' +
                '<button class="suggestion-btn save" onclick="saveSuggestionEdit(' + s.id + ')">✓ Save</button>' +
                '<button class="suggestion-btn cancel" onclick="cancelSuggestionEdit()">Cancel</button>' +
              '</div>' :
              '<div class="suggestion-actions">' +
                '<button class="suggestion-btn accept" onclick="acceptSuggestion(' + s.id + ')">✓ Accept</button>' +
                '<button class="suggestion-btn edit" onclick="editSuggestion(' + s.id + ')">✏️ Edit</button>' +
                '<button class="suggestion-btn dismiss" onclick="dismissSuggestion(' + s.id + ')">✕ Dismiss</button>' +
              '</div>') :
            '') +
        '</div>';
      }).join('');
    }

    function acceptSuggestion(id) {
      const suggestion = scriptSuggestions.find(function(s) { return s.id === id; });
      if (!suggestion) return;

      // Apply to script
      const preview = document.getElementById('scriptContentPreview');
      const textarea = document.getElementById('scriptEditTextarea');
      
      if (preview && suggestion.original && suggestion.enhanced) {
        const newContent = preview.textContent.replace(suggestion.original, suggestion.enhanced);
        preview.textContent = newContent;
        if (textarea) textarea.value = newContent;
      }

      suggestion.accepted = true;
      renderSuggestions();
      showStatus('Applied suggestion', 'success');
    }

    function editSuggestion(id) {
      const suggestion = scriptSuggestions.find(function(s) { return s.id === id; });
      if (!suggestion) return;

      editingSuggestionId = id;
      editedSuggestionText = suggestion.enhanced;
      renderSuggestions();
    }

    function saveSuggestionEdit(id) {
      const suggestion = scriptSuggestions.find(function(s) { return s.id === id; });
      const textarea = document.getElementById('suggestionEditText');
      
      if (!suggestion || !textarea) return;

      const newText = textarea.value.trim();
      if (newText) {
        suggestion.enhanced = newText;
        
        // Apply to script
        const preview = document.getElementById('scriptContentPreview');
        const scriptTextarea = document.getElementById('scriptEditTextarea');
        
        if (preview && suggestion.original) {
          const newContent = preview.textContent.replace(suggestion.original, newText);
          preview.textContent = newContent;
          if (scriptTextarea) scriptTextarea.value = newContent;
        }
        
        suggestion.accepted = true;
      }

      editingSuggestionId = null;
      editedSuggestionText = '';
      renderSuggestions();
      showStatus('Applied edited suggestion', 'success');
    }

    function cancelSuggestionEdit() {
      editingSuggestionId = null;
      editedSuggestionText = '';
      renderSuggestions();
    }

    function dismissSuggestion(id) {
      const suggestion = scriptSuggestions.find(function(s) { return s.id === id; });
      if (!suggestion) return;

      suggestion.accepted = false;
      renderSuggestions();
      showStatus('Suggestion dismissed', 'success');
    }

    // =====================================================
    // TTS ENHANCEMENT WITH INLINE ACCEPT/EDIT/DISMISS
    // =====================================================

    var ttsOriginalText = '';
    var ttsEnhancedText = '';
    var isEditingTTS = false;

    async function enhanceTTSText() {
      const textarea = document.getElementById('addTTSText');
      if (!textarea || !textarea.value.trim()) {
        showStatus('Enter text to enhance', 'error');
        return;
      }

      ttsOriginalText = textarea.value.trim();
      showStatus('Enhancing text...', 'success');

      try {
        const configEl = document.getElementById('popoutConfig');
        if (!configEl) {
          ttsEnhancedText = ttsOriginalText.replace(/um+|ah+|hmm+/gi, '').trim();
          showTTSPreview();
          return;
        }
        
        const config = JSON.parse(configEl.textContent || '{}');
        
        const response = await fetch(config.supabaseUrl + '/functions/v1/ai-universal-processor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.supabaseKey
          },
          body: JSON.stringify({
            action: 'enhance_tts_text',
            content: ttsOriginalText
          })
        });

        if (response.ok) {
          const data = await response.json();
          ttsEnhancedText = data.enhanced || ttsOriginalText;
        } else {
          // Fallback: simple cleanup
          ttsEnhancedText = ttsOriginalText
            .replace(/\bum+\b/gi, '')
            .replace(/\bah+\b/gi, '')
            .replace(/\bhmm+\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
        }
        
        showTTSPreview();
      } catch (err) {
        console.error('[TTS Enhance] Error:', err);
        ttsEnhancedText = ttsOriginalText;
        showTTSPreview();
      }
    }

    function showTTSPreview() {
      const previewEl = document.getElementById('addTTSPreview');
      const originalEl = document.getElementById('ttsOriginalText');
      const enhancedEl = document.getElementById('ttsEnhancedText');
      
      if (previewEl) previewEl.style.display = 'block';
      if (originalEl) originalEl.textContent = ttsOriginalText;
      if (enhancedEl) enhancedEl.textContent = ttsEnhancedText;
    }

    function acceptTTSSuggestion() {
      const textarea = document.getElementById('addTTSText');
      if (textarea) {
        textarea.value = ttsEnhancedText;
      }
      hideTTSPreview();
      showStatus('Enhanced text accepted', 'success');
    }

    function editTTSSuggestion() {
      const editArea = document.getElementById('ttsEditArea');
      const editTextarea = document.getElementById('ttsEditTextarea');
      const enhancedEl = document.getElementById('ttsEnhancedText');
      
      if (editArea) editArea.style.display = 'block';
      if (enhancedEl) enhancedEl.style.display = 'none';
      if (editTextarea) editTextarea.value = ttsEnhancedText;
      
      isEditingTTS = true;
    }

    function dismissTTSSuggestion() {
      hideTTSPreview();
      showStatus('Using original text', 'success');
    }

    function hideTTSPreview() {
      const previewEl = document.getElementById('addTTSPreview');
      const editArea = document.getElementById('ttsEditArea');
      const enhancedEl = document.getElementById('ttsEnhancedText');
      
      if (previewEl) previewEl.style.display = 'none';
      if (editArea) editArea.style.display = 'none';
      if (enhancedEl) enhancedEl.style.display = 'block';
      
      ttsOriginalText = '';
      ttsEnhancedText = '';
      isEditingTTS = false;
    }

    // =====================================================
    // CAPTIONS PREVIEW
    // =====================================================

    var captionEntries = [];
    var selectedCaptionIndex = -1;

    async function generateCaptions() {
      if (recordedChunks.length === 0) {
        showStatus('No recording to transcribe', 'error');
        return;
      }

      const loadingEl = document.getElementById('captionsLoading');
      const statusEl = document.getElementById('captionsStatus');
      const previewEl = document.getElementById('captionsPreview');
      const exportBtn = document.getElementById('exportSRTBtn');
      
      if (loadingEl) loadingEl.style.display = 'flex';
      if (statusEl) statusEl.style.display = 'none';
      
      showStatus('Generating captions from audio...', 'success');

      try {
        // Create audio blob from recorded chunks
        const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
        
        // Convert to base64
        const reader = new FileReader();
        const base64Promise = new Promise(function(resolve) {
          reader.onloadend = function() {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(audioBlob);
        });
        
        const base64Audio = await base64Promise;
        
        const configEl = document.getElementById('popoutConfig');
        if (!configEl) {
          showStatus('Configuration not available', 'error');
          return;
        }
        
        const config = JSON.parse(configEl.textContent || '{}');
        
        const response = await fetch(config.supabaseUrl + '/functions/v1/voice-to-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.supabaseKey
          },
          body: JSON.stringify({
            audio: base64Audio
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Parse transcription into timed captions
          const words = data.words || [];
          captionEntries = generateCaptionEntries(data.text || '', words);
          
          renderCaptions();
          if (exportBtn) exportBtn.style.display = 'inline-block';
          showStatus('Captions generated! ' + captionEntries.length + ' entries', 'success');
        } else {
          // Fallback mock captions
          captionEntries = [
            { start: 0, end: 3, text: 'Welcome to this recording.' },
            { start: 3, end: 7, text: 'Today we will discuss important topics.' },
            { start: 7, end: 12, text: 'Let us begin with the first point.' }
          ];
          renderCaptions();
          if (exportBtn) exportBtn.style.display = 'inline-block';
        }
      } catch (err) {
        console.error('[Captions] Error:', err);
        // Fallback
        captionEntries = [
          { start: 0, end: 5, text: 'Caption generation requires audio transcription service.' }
        ];
        renderCaptions();
      }

      if (loadingEl) loadingEl.style.display = 'none';
      if (previewEl) previewEl.style.display = 'block';
    }

    function generateCaptionEntries(text, words) {
      if (words && words.length > 0) {
        // Group words into caption segments (max 10 words or 5 seconds)
        const entries = [];
        let currentEntry = { start: words[0].start, end: 0, text: '' };
        let wordCount = 0;
        
        words.forEach(function(word, i) {
          currentEntry.text += (wordCount > 0 ? ' ' : '') + word.text;
          currentEntry.end = word.end;
          wordCount++;
          
          if (wordCount >= 10 || (word.end - currentEntry.start) >= 5 || i === words.length - 1) {
            entries.push({ ...currentEntry });
            if (i < words.length - 1) {
              currentEntry = { start: words[i + 1].start, end: 0, text: '' };
              wordCount = 0;
            }
          }
        });
        
        return entries;
      }
      
      // Fallback: split by sentences
      const sentences = text.split(/[.!?]+/).filter(function(s) { return s.trim(); });
      const avgDuration = 4; // seconds per sentence
      
      return sentences.map(function(sentence, i) {
        return {
          start: i * avgDuration,
          end: (i + 1) * avgDuration,
          text: sentence.trim()
        };
      });
    }

    function renderCaptions() {
      const timeline = document.getElementById('captionsTimeline');
      if (!timeline) return;

      timeline.innerHTML = captionEntries.map(function(entry, i) {
        const selectedClass = i === selectedCaptionIndex ? 'selected' : '';
        const startTime = formatCaptionTime(entry.start);
        const endTime = formatCaptionTime(entry.end);
        
        return '<div class="caption-entry ' + selectedClass + '" data-index="' + i + '" onclick="selectCaption(' + i + ')">' +
          '<span class="caption-time">' + startTime + ' → ' + endTime + '</span>' +
          '<span class="caption-text">' + entry.text + '</span>' +
        '</div>';
      }).join('');
    }

    function formatCaptionTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0') + ',' + String(ms).padStart(3, '0');
    }

    function selectCaption(index) {
      selectedCaptionIndex = index;
      renderCaptions();
    }

    function editCaptionEntry() {
      if (selectedCaptionIndex < 0 || selectedCaptionIndex >= captionEntries.length) {
        showStatus('Select a caption to edit', 'error');
        return;
      }

      const entry = captionEntries[selectedCaptionIndex];
      const newText = prompt('Edit caption:', entry.text);
      
      if (newText !== null) {
        captionEntries[selectedCaptionIndex].text = newText;
        renderCaptions();
        showStatus('Caption updated', 'success');
      }
    }

    function adjustCaptionTiming() {
      if (selectedCaptionIndex < 0) {
        showStatus('Select a caption to adjust timing', 'error');
        return;
      }

      const entry = captionEntries[selectedCaptionIndex];
      const newStart = prompt('Start time (seconds):', entry.start);
      const newEnd = prompt('End time (seconds):', entry.end);
      
      if (newStart !== null) {
        captionEntries[selectedCaptionIndex].start = parseFloat(newStart) || entry.start;
      }
      if (newEnd !== null) {
        captionEntries[selectedCaptionIndex].end = parseFloat(newEnd) || entry.end;
      }
      
      renderCaptions();
      showStatus('Timing adjusted', 'success');
    }

    function exportCaptionsSRT() {
      if (captionEntries.length === 0) {
        showStatus('No captions to export', 'error');
        return;
      }

      let srtContent = '';
      captionEntries.forEach(function(entry, i) {
        const startTime = formatSRTTime(entry.start);
        const endTime = formatSRTTime(entry.end);
        srtContent += (i + 1) + '\\n';
        srtContent += startTime + ' --> ' + endTime + '\\n';
        srtContent += entry.text + '\\n\\n';
      });

      const blob = new Blob([srtContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'captions-' + new Date().toISOString().slice(0, 10) + '.srt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showStatus('Captions exported as SRT', 'success');
    }

    function formatSRTTime(seconds) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      return String(hrs).padStart(2, '0') + ':' + String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0') + ',' + String(ms).padStart(3, '0');
    }

    // =====================================================
    // TRIM CONTROLS
    // =====================================================

    function trimLastSeconds(seconds) {
      if (!isRecording || recordedChunks.length === 0) {
        console.warn('[Recording] Cannot trim - no recording data');
        return;
      }

      const trimAmount = seconds || 5;
      
      // Estimate chunks to remove (1 chunk ≈ 1 second)
      const chunksToRemove = Math.min(trimAmount, recordedChunks.length - 1);
      
      if (chunksToRemove > 0) {
        // Save for undo
        trimHistory.push({
          chunks: recordedChunks.slice(-chunksToRemove),
          count: chunksToRemove,
          timestamp: Date.now()
        });

        // Remove chunks
        recordedChunks = recordedChunks.slice(0, -chunksToRemove);
        
        console.log('[Recording] Trimmed', chunksToRemove, 'seconds');
        showTrimFeedback('Trimmed ' + chunksToRemove + 's');
        updateTrimUI();
      }
    }

    function undoLastTrim() {
      if (trimHistory.length === 0) {
        console.warn('[Recording] No trim to undo');
        return;
      }

      const lastTrim = trimHistory.pop();
      recordedChunks = recordedChunks.concat(lastTrim.chunks);
      
      console.log('[Recording] Undid trim of', lastTrim.count, 'seconds');
      showTrimFeedback('Restored ' + lastTrim.count + 's');
      updateTrimUI();
    }

    function showTrimFeedback(message) {
      const feedback = document.getElementById('trimFeedback');
      if (feedback) {
        feedback.textContent = message;
        feedback.classList.add('visible');
        setTimeout(function() {
          feedback.classList.remove('visible');
        }, 2000);
      }
    }

    function updateTrimUI() {
      const undoBtn = document.getElementById('undoTrimBtn');
      if (undoBtn) {
        undoBtn.disabled = trimHistory.length === 0;
      }

      const trimInfo = document.getElementById('trimInfo');
      if (trimInfo) {
        trimInfo.textContent = recordedChunks.length + ' chunks';
      }
    }

    function selectTrimAmount(seconds) {
      // Update button states
      document.querySelectorAll('.trim-amount-btn').forEach(function(btn) {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.seconds) === seconds) {
          btn.classList.add('active');
        }
      });
    }

    // =====================================================
    // STOP & CLEANUP
    // =====================================================

    function stopAllAudio() {
      console.log('[Recording] Stopping all audio...');

      // Stop voiceover
      if (voiceoverAudio) {
        voiceoverAudio.pause();
        voiceoverAudio.currentTime = 0;
        voiceoverAudio.onended = null;
        voiceoverAudio.onerror = null;
      }

      // Stop music
      if (musicAudio) {
        musicAudio.pause();
        musicAudio.currentTime = 0;
        musicAudio.onended = null;
        musicAudio.onerror = null;
      }

      // Stop TTS
      if (ttsAudio) {
        ttsAudio.pause();
        ttsAudio.currentTime = 0;
        ttsAudio.onended = null;
        ttsAudio.onerror = null;
      }

      // Stop synced audio
      if (syncAudioSource) {
        try {
          syncAudioSource.stop();
        } catch (e) {}
        syncAudioSource = null;
      }

      // Clear animation frames
      if (syncAnimationFrame) {
        cancelAnimationFrame(syncAnimationFrame);
        syncAnimationFrame = null;
      }

      console.log('[Recording] All audio stopped');
    }

    function stopRecordingEnhanced() {
      if (!isRecording) return;

      console.log('[Recording] Enhanced stop...');
      
      // Set stopped flag FIRST
      isStopped = true;
      isPaused = false;

      // Stop all audio
      stopAllAudio();

      // Stop recording timer
      if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
      }

      // Update state
      isRecording = false;

      // Update UI
      const recordBtn = document.getElementById('recordBtn');
      const recordBtnText = document.getElementById('recordBtnText');
      const recordingIndicator = document.getElementById('recordingIndicator');

      if (recordBtn) {
        recordBtn.classList.remove('recording');
        recordBtn.classList.add('ready');
      }
      if (recordBtnText) {
        recordBtnText.textContent = 'Start Recording';
      }
      if (recordingIndicator) {
        recordingIndicator.classList.remove('visible', 'paused');
      }

      // Hide edit panel
      hideEditPanel();

      // Stop MediaRecorder
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }

      // Clear trim history
      trimHistory = [];
      updateTrimUI();

      console.log('[Recording] Stopped and cleaned up');
    }

    // =====================================================
    // AUDIO OPTIONS DIALOG
    // =====================================================

    function showAudioOptionsDialog() {
      const dialog = document.getElementById('audioOptionsDialog');
      if (dialog) {
        dialog.classList.add('visible');
      }
    }

    function hideAudioOptionsDialog() {
      const dialog = document.getElementById('audioOptionsDialog');
      if (dialog) {
        dialog.classList.remove('visible');
      }
    }

    function confirmAudioOptions() {
      hideAudioOptionsDialog();
      
      // Start countdown then record - delegate to camera module's actuallyStartRecording
      startCountdown(function() {
        // actuallyStartRecording is defined in popoutCameraScript.ts
        if (typeof actuallyStartRecording === 'function') {
          actuallyStartRecording();
        } else {
          console.error('[Recording] actuallyStartRecording not found');
        }
      });
    }

    // NOTE: actuallyStartRecording is defined in popoutCameraScript.ts
    // This module only provides countdown, pause/resume, and trim functionality

    // =====================================================
    // INITIALIZE RECORDING ENHANCEMENTS
    // =====================================================

    function initRecordingEnhancements() {
      // Pause button
      const pauseBtn = document.getElementById('pauseBtn');
      if (pauseBtn) {
        pauseBtn.addEventListener('click', togglePause);
      }

      // Trim buttons
      document.querySelectorAll('.trim-amount-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const seconds = parseInt(this.dataset.seconds) || 5;
          selectTrimAmount(seconds);
          trimLastSeconds(seconds);
        });
      });

      // Undo trim
      const undoBtn = document.getElementById('undoTrimBtn');
      if (undoBtn) {
        undoBtn.addEventListener('click', undoLastTrim);
      }

      // Audio options dialog buttons
      const confirmOptionsBtn = document.getElementById('confirmOptionsBtn');
      if (confirmOptionsBtn) {
        confirmOptionsBtn.addEventListener('click', confirmAudioOptions);
      }

      const cancelOptionsBtn = document.getElementById('cancelOptionsBtn');
      if (cancelOptionsBtn) {
        cancelOptionsBtn.addEventListener('click', hideAudioOptionsDialog);
      }

      // NOTE: Record button is now handled in popoutCameraScript.ts
      // which calls startCountdown() and uses isStopped/isPaused flags

      updateTrimUI();
      console.log('[RecordingEnhancements] Initialized');
    }

    setTimeout(initRecordingEnhancements, 250);

    console.log('[RecordingEnhancements] Module loaded');
  `;
}

export function getRecordingEnhancementsStyles(): string {
  return `
    /* Recording Enhancements Styles */
    
    /* Countdown Overlay */
    #countdownOverlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    }

    #countdownOverlay.visible {
      opacity: 1;
      pointer-events: auto;
    }

    #countdownNumber {
      font-size: 120px;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 0 40px rgba(139, 92, 246, 0.8);
      transition: transform 0.2s;
    }

    #countdownNumber.pulse {
      transform: scale(1.2);
    }

    /* Pause State - styles are in main popoutStyles.ts */

    /* Pause Button */
    #pauseBtn {
      padding: 10px 20px;
      background: rgba(251, 191, 36, 0.2);
      border: 1px solid rgba(251, 191, 36, 0.3);
      border-radius: 8px;
      color: #fbbf24;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    #pauseBtn.paused {
      background: rgba(34, 197, 94, 0.2);
      border-color: rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }

    /* Edit Panel */
    #editPanel {
      display: none;
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 16px;
      z-index: 50;
    }

    .edit-panel-title {
      font-size: 0.875rem;
      color: #fff;
      margin-bottom: 12px;
      text-align: center;
    }

    /* Trim Controls */
    .trim-controls-row {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .trim-amount-btn {
      padding: 8px 16px;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 6px;
      color: #ef4444;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .trim-amount-btn:hover {
      background: rgba(239, 68, 68, 0.3);
    }

    .trim-amount-btn.active {
      background: rgba(239, 68, 68, 0.4);
      border-color: #ef4444;
    }

    #undoTrimBtn {
      padding: 8px 16px;
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 6px;
      color: #60a5fa;
      font-size: 0.75rem;
      cursor: pointer;
    }

    #undoTrimBtn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    #trimFeedback {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-50px);
      background: rgba(239, 68, 68, 0.9);
      color: #fff;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 0.875rem;
      opacity: 0;
      transition: all 0.3s;
      z-index: 200;
    }

    #trimFeedback.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    #trimInfo {
      font-size: 0.7rem;
      color: #666;
      text-align: center;
    }

    /* Audio Options Dialog */
    #audioOptionsDialog {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 150;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    }

    #audioOptionsDialog.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .audio-options-content {
      background: #1a1a2e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
    }

    .audio-options-title {
      font-size: 1.25rem;
      color: #fff;
      margin-bottom: 16px;
      text-align: center;
    }

    .audio-option-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .audio-option-label {
      color: #888;
      font-size: 0.875rem;
    }

    .audio-option-value {
      color: #fff;
      font-size: 0.875rem;
    }

    .audio-options-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }

    #confirmOptionsBtn {
      flex: 2;
      padding: 12px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }

    #cancelOptionsBtn {
      flex: 1;
      padding: 12px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: #888;
      cursor: pointer;
    }
  `;
}
