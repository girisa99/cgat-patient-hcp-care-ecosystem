/**
 * Popout Recording Studio - Enhanced Controls Module
 * Camera on/off, microphone toggle, logo upload & drag
 */

export function getEnhancedControlsScript(): string {
  return `
    // =====================================================
    // ENHANCED CONTROLS MODULE
    // =====================================================

    let cameraEnabled = true;
    let micEnabled = true;
    let logoPosition = { x: 20, y: 20 };
    let isDraggingLogo = false;
    let dragOffset = { x: 0, y: 0 };

    // =====================================================
    // CAMERA ON/OFF
    // =====================================================

    function toggleCamera() {
      if (!mediaStream) return;

      const videoTracks = mediaStream.getVideoTracks();
      cameraEnabled = !cameraEnabled;

      videoTracks.forEach(function(track) {
        track.enabled = cameraEnabled;
      });

      updateCameraButton();
      console.log('[Controls] Camera:', cameraEnabled ? 'ON' : 'OFF');
    }

    function updateCameraButton() {
      const btn = document.getElementById('cameraToggleBtn');
      if (!btn) return;

      if (cameraEnabled) {
        btn.classList.remove('toggle-off');
        btn.classList.add('toggle-on');
        btn.innerHTML = '📹 Camera: ON';
      } else {
        btn.classList.remove('toggle-on');
        btn.classList.add('toggle-off');
        btn.innerHTML = '📹 Camera: OFF';
      }
    }

    // =====================================================
    // MICROPHONE ON/OFF
    // =====================================================

    function toggleMicrophone() {
      if (!mediaStream) return;

      const audioTracks = mediaStream.getAudioTracks();
      micEnabled = !micEnabled;

      audioTracks.forEach(function(track) {
        track.enabled = micEnabled;
      });

      updateMicButton();
      console.log('[Controls] Microphone:', micEnabled ? 'ON' : 'OFF');
    }

    function updateMicButton() {
      const btn = document.getElementById('micToggleBtn');
      if (!btn) return;

      if (micEnabled) {
        btn.classList.remove('toggle-off');
        btn.classList.add('toggle-on');
        btn.innerHTML = '🎤 Mic: ON';
      } else {
        btn.classList.remove('toggle-on');
        btn.classList.add('toggle-off');
        btn.innerHTML = '🎤 Mic: OFF';
      }
    }

    // =====================================================
    // LOGO UPLOAD
    // =====================================================

    function handleLogoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showStatus('Please select an image file', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        const logoImg = document.getElementById('logoImage');
        if (logoImg) {
          logoImg.src = e.target.result;
          console.log('[Controls] Logo uploaded');
          
          // Auto-enable logo
          logoEnabled = true;
          const logoOverlay = document.getElementById('logoOverlay');
          if (logoOverlay) logoOverlay.classList.add('visible');
          
          const logoBtn = document.getElementById('logoBtn');
          if (logoBtn) {
            logoBtn.classList.remove('toggle-off');
            logoBtn.classList.add('toggle-on');
            logoBtn.innerHTML = '🖼️ Logo: ON';
          }
        }
      };
      reader.readAsDataURL(file);
    }

    // =====================================================
    // LOGO DRAG & DROP POSITIONING
    // =====================================================

    function initLogoDrag() {
      const logoOverlay = document.getElementById('logoOverlay');
      if (!logoOverlay) return;

      logoOverlay.addEventListener('mousedown', function(e) {
        if (!logoEnabled) return;
        
        isDraggingLogo = true;
        const rect = logoOverlay.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        logoOverlay.style.cursor = 'grabbing';
        e.preventDefault();
      });

      document.addEventListener('mousemove', function(e) {
        if (!isDraggingLogo) return;

        const container = document.querySelector('.video-container');
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const logoOverlay = document.getElementById('logoOverlay');
        
        let newX = e.clientX - containerRect.left - dragOffset.x;
        let newY = e.clientY - containerRect.top - dragOffset.y;

        // Constrain to container
        const maxX = containerRect.width - logoOverlay.offsetWidth;
        const maxY = containerRect.height - logoOverlay.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        logoOverlay.style.left = newX + 'px';
        logoOverlay.style.top = newY + 'px';
        logoOverlay.style.right = 'auto';
        logoOverlay.style.bottom = 'auto';

        logoPosition = { x: newX, y: newY };
      });

      document.addEventListener('mouseup', function() {
        if (isDraggingLogo) {
          isDraggingLogo = false;
          const logoOverlay = document.getElementById('logoOverlay');
          if (logoOverlay) logoOverlay.style.cursor = 'grab';
          console.log('[Controls] Logo position:', logoPosition);
        }
      });

      // Make logo draggable visually
      logoOverlay.style.cursor = 'grab';
    }

    // Logo size controls
    function setLogoSize(size) {
      const logoOverlay = document.getElementById('logoOverlay');
      if (!logoOverlay) return;

      const sizes = {
        small: { width: '60px', height: '60px' },
        medium: { width: '100px', height: '100px' },
        large: { width: '150px', height: '150px' }
      };

      const sizeConfig = sizes[size] || sizes.medium;
      logoOverlay.style.width = sizeConfig.width;
      logoOverlay.style.height = sizeConfig.height;
      console.log('[Controls] Logo size:', size);
    }

    // Logo position presets
    function setLogoPosition(position) {
      const logoOverlay = document.getElementById('logoOverlay');
      if (!logoOverlay) return;

      const positions = {
        'top-left': { top: '20px', left: '20px', right: 'auto', bottom: 'auto' },
        'top-right': { top: '20px', right: '20px', left: 'auto', bottom: 'auto' },
        'bottom-left': { bottom: '20px', left: '20px', right: 'auto', top: 'auto' },
        'bottom-right': { bottom: '20px', right: '20px', left: 'auto', top: 'auto' },
        'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', right: 'auto', bottom: 'auto' }
      };

      const posConfig = positions[position] || positions['bottom-right'];
      Object.assign(logoOverlay.style, posConfig);
      console.log('[Controls] Logo position preset:', position);
    }

    // Initialize enhanced controls
    function initEnhancedControls() {
      // Camera toggle
      const cameraBtn = document.getElementById('cameraToggleBtn');
      if (cameraBtn) {
        cameraBtn.addEventListener('click', toggleCamera);
      }

      // Mic toggle
      const micBtn = document.getElementById('micToggleBtn');
      if (micBtn) {
        micBtn.addEventListener('click', toggleMicrophone);
      }

      // Logo upload
      const logoUpload = document.getElementById('logoUploadInput');
      if (logoUpload) {
        logoUpload.addEventListener('change', handleLogoUpload);
      }

      // Logo upload button trigger
      const logoUploadBtn = document.getElementById('logoUploadBtn');
      if (logoUploadBtn) {
        logoUploadBtn.addEventListener('click', function() {
          document.getElementById('logoUploadInput').click();
        });
      }

      // Logo size buttons
      document.querySelectorAll('[data-logo-size]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          setLogoSize(this.dataset.logoSize);
        });
      });

      // Logo position buttons
      document.querySelectorAll('[data-logo-position]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          setLogoPosition(this.dataset.logoPosition);
        });
      });

      // Initialize logo drag
      initLogoDrag();

      console.log('[EnhancedControls] Initialized');
    }

    // Initialize after DOM ready
    setTimeout(initEnhancedControls, 100);

    console.log('[EnhancedControls] Module loaded');
  `;
}

export function getEnhancedControlsStyles(): string {
  return `
    /* Enhanced Controls Styles */
    .control-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .control-btn-small {
      padding: 6px 12px;
      font-size: 0.75rem;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.3);
      color: #888;
      cursor: pointer;
      transition: all 0.2s;
    }

    .control-btn-small:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .control-btn-small.active {
      background: rgba(139, 92, 246, 0.3);
      border-color: rgba(139, 92, 246, 0.5);
      color: #a78bfa;
    }

    /* Logo controls */
    .logo-controls {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo-controls-row {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .logo-controls-label {
      font-size: 0.7rem;
      color: #666;
      margin-bottom: 4px;
    }

    .logo-upload-btn {
      width: 100%;
      padding: 10px;
      background: rgba(139, 92, 246, 0.2);
      border: 1px dashed rgba(139, 92, 246, 0.4);
      border-radius: 8px;
      color: #a78bfa;
      cursor: pointer;
      font-size: 0.75rem;
      transition: all 0.2s;
    }

    .logo-upload-btn:hover {
      background: rgba(139, 92, 246, 0.3);
    }

    /* Draggable logo */
    .logo-overlay {
      cursor: grab;
      transition: box-shadow 0.2s;
    }

    .logo-overlay:hover {
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
    }

    .logo-overlay.dragging {
      cursor: grabbing;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.8);
    }

    /* Hidden file input */
    #logoUploadInput {
      display: none;
    }
  `;
}
