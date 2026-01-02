/**
 * Popout Recording Studio - Real Background Blur Module
 * Uses MediaPipe Selfie Segmentation for accurate person isolation
 */

export function getBackgroundBlurScript(): string {
  return `
    // =====================================================
    // REAL BACKGROUND BLUR MODULE (MediaPipe Selfie Segmentation)
    // =====================================================

    let selfieSegmentation = null;
    let blurCanvas = null;
    let blurCtx = null;
    let isBlurEnabled = false;
    let blurIntensity = 10; // Blur strength in pixels
    let blurAnimationFrame = null;
    let originalStream = null;
    let processedStream = null;
    let mediaPipeLoaded = false;

    // =====================================================
    // MEDIAPIPE INITIALIZATION
    // =====================================================

    async function loadMediaPipe() {
      if (mediaPipeLoaded) return true;

      try {
        console.log('[BackgroundBlur] Loading MediaPipe...');
        
        // Load MediaPipe CDN scripts
        const script1 = document.createElement('script');
        script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js';
        script1.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          script1.onload = resolve;
          script1.onerror = reject;
          document.head.appendChild(script1);
        });

        console.log('[BackgroundBlur] MediaPipe script loaded');
        mediaPipeLoaded = true;
        return true;

      } catch (err) {
        console.error('[BackgroundBlur] Failed to load MediaPipe:', err);
        return false;
      }
    }

    async function initSelfieSegmentation() {
      if (!mediaPipeLoaded) {
        const loaded = await loadMediaPipe();
        if (!loaded) return false;
      }

      try {
        // Check if SelfieSegmentation is available
        if (typeof SelfieSegmentation === 'undefined') {
          console.error('[BackgroundBlur] SelfieSegmentation not available');
          return false;
        }

        selfieSegmentation = new SelfieSegmentation({
          locateFile: function(file) {
            return 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/' + file;
          }
        });

        selfieSegmentation.setOptions({
          modelSelection: 1, // 0 = general, 1 = landscape (faster)
          selfieMode: true
        });

        selfieSegmentation.onResults(onSegmentationResults);
        
        console.log('[BackgroundBlur] Selfie Segmentation initialized');
        return true;

      } catch (err) {
        console.error('[BackgroundBlur] Init error:', err);
        return false;
      }
    }

    // =====================================================
    // SEGMENTATION PROCESSING
    // =====================================================

    function onSegmentationResults(results) {
      if (!blurCtx || !blurCanvas) return;

      const width = blurCanvas.width;
      const height = blurCanvas.height;

      // Save context
      blurCtx.save();

      // Clear canvas
      blurCtx.clearRect(0, 0, width, height);

      // Draw blurred background
      blurCtx.filter = 'blur(' + blurIntensity + 'px)';
      blurCtx.drawImage(results.image, 0, 0, width, height);

      // Reset filter for person
      blurCtx.filter = 'none';

      // Use segmentation mask to draw person sharply
      blurCtx.globalCompositeOperation = 'destination-out';
      blurCtx.drawImage(results.segmentationMask, 0, 0, width, height);

      blurCtx.globalCompositeOperation = 'destination-over';
      blurCtx.drawImage(results.image, 0, 0, width, height);

      // Restore context
      blurCtx.restore();
    }

    async function processVideoFrame() {
      if (!isBlurEnabled || !selfieSegmentation || !videoPreview) {
        blurAnimationFrame = requestAnimationFrame(processVideoFrame);
        return;
      }

      try {
        await selfieSegmentation.send({ image: videoPreview });
      } catch (err) {
        // Silently handle frame errors
      }

      blurAnimationFrame = requestAnimationFrame(processVideoFrame);
    }

    // =====================================================
    // BLUR TOGGLE
    // =====================================================

    async function toggleBackgroundBlur() {
      if (isBlurEnabled) {
        disableBackgroundBlur();
      } else {
        await enableBackgroundBlur();
      }
    }

    async function enableBackgroundBlur() {
      console.log('[BackgroundBlur] Enabling...');

      // Initialize if needed
      if (!selfieSegmentation) {
        const initialized = await initSelfieSegmentation();
        if (!initialized) {
          showBlurStatus('Failed to initialize background blur', 'error');
          return false;
        }
      }

      // Create canvas for processing
      if (!blurCanvas) {
        blurCanvas = document.createElement('canvas');
        blurCanvas.id = 'blurCanvas';
        blurCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;pointer-events:none;';
        
        const container = videoPreview.parentElement;
        if (container) {
          container.style.position = 'relative';
          container.appendChild(blurCanvas);
        }
      }

      // Set canvas size to match video
      blurCanvas.width = videoPreview.videoWidth || 1920;
      blurCanvas.height = videoPreview.videoHeight || 1080;
      blurCtx = blurCanvas.getContext('2d');

      // Hide original video, show canvas
      videoPreview.style.opacity = '0';
      blurCanvas.style.display = 'block';

      isBlurEnabled = true;

      // Start processing loop
      if (!blurAnimationFrame) {
        processVideoFrame();
      }

      // Update UI
      updateBlurButton(true);
      showBlurStatus('Background blur enabled', 'success');
      
      console.log('[BackgroundBlur] Enabled');
      return true;
    }

    function disableBackgroundBlur() {
      console.log('[BackgroundBlur] Disabling...');

      isBlurEnabled = false;

      // Show original video
      if (videoPreview) {
        videoPreview.style.opacity = '1';
      }

      // Hide blur canvas
      if (blurCanvas) {
        blurCanvas.style.display = 'none';
      }

      // Update UI
      updateBlurButton(false);
      showBlurStatus('Background blur disabled', 'info');
      
      console.log('[BackgroundBlur] Disabled');
    }

    // =====================================================
    // BLUR INTENSITY CONTROL
    // =====================================================

    function setBlurIntensity(intensity) {
      blurIntensity = Math.max(1, Math.min(30, intensity));
      console.log('[BackgroundBlur] Intensity set to:', blurIntensity);
      
      const slider = document.getElementById('blurIntensitySlider');
      const label = document.getElementById('blurIntensityLabel');
      
      if (slider) slider.value = blurIntensity;
      if (label) label.textContent = blurIntensity + 'px';
    }

    // =====================================================
    // UI HELPERS
    // =====================================================

    function updateBlurButton(enabled) {
      const btn = document.getElementById('blurToggleBtn') || document.getElementById('blurBtn');
      if (!btn) return;

      if (enabled) {
        btn.classList.remove('toggle-off');
        btn.classList.add('toggle-on', 'active');
        btn.innerHTML = '🔵 BG Blur: ON';
      } else {
        btn.classList.remove('toggle-on', 'active');
        btn.classList.add('toggle-off');
        btn.innerHTML = '🔵 BG Blur: OFF';
      }
    }

    function showBlurStatus(message, type) {
      const statusEl = document.getElementById('blurStatus');
      if (!statusEl) return;

      statusEl.textContent = message;
      statusEl.className = 'blur-status ' + type;
      
      setTimeout(function() {
        statusEl.textContent = '';
        statusEl.className = 'blur-status';
      }, 3000);
    }

    // =====================================================
    // FALLBACK CSS BLUR (for unsupported browsers)
    // =====================================================

    function enableCSSFallbackBlur() {
      console.log('[BackgroundBlur] Using CSS fallback');
      
      if (videoPreview) {
        videoPreview.style.filter = 'none'; // Can't blur background only with CSS
        showBlurStatus('MediaPipe not available - using camera only', 'warning');
      }
    }

    // =====================================================
    // CLEANUP
    // =====================================================

    function cleanupBackgroundBlur() {
      if (blurAnimationFrame) {
        cancelAnimationFrame(blurAnimationFrame);
        blurAnimationFrame = null;
      }

      if (blurCanvas && blurCanvas.parentElement) {
        blurCanvas.parentElement.removeChild(blurCanvas);
      }

      blurCanvas = null;
      blurCtx = null;
      isBlurEnabled = false;

      console.log('[BackgroundBlur] Cleaned up');
    }

    // =====================================================
    // INITIALIZATION
    // =====================================================

    function initBackgroundBlurModule() {
      // Blur toggle button - check both possible IDs
      const blurBtn = document.getElementById('blurToggleBtn') || document.getElementById('blurBtn');
      if (blurBtn) {
        blurBtn.addEventListener('click', toggleBackgroundBlur);
      }

      // Intensity slider
      const intensitySlider = document.getElementById('blurIntensitySlider');
      if (intensitySlider) {
        intensitySlider.addEventListener('input', function() {
          setBlurIntensity(parseInt(this.value));
        });
      }

      // Cleanup on window close
      window.addEventListener('beforeunload', cleanupBackgroundBlur);

      console.log('[BackgroundBlur] Module initialized');
    }

    setTimeout(initBackgroundBlurModule, 400);

    console.log('[BackgroundBlur] Module loaded');
  `;
}

export function getBackgroundBlurStyles(): string {
  return `
    /* Background Blur Controls */
    
    .blur-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 8px;
      margin-bottom: 8px;
    }

    #blurToggleBtn {
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      color: #fff;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    #blurToggleBtn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    #blurToggleBtn.active {
      background: rgba(59, 130, 246, 0.3);
      border-color: rgba(59, 130, 246, 0.5);
      color: #60a5fa;
    }

    .blur-intensity-control {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .blur-intensity-control label {
      font-size: 0.7rem;
      color: #888;
      white-space: nowrap;
    }

    #blurIntensitySlider {
      flex: 1;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      outline: none;
    }

    #blurIntensitySlider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      background: #60a5fa;
      border-radius: 50%;
      cursor: pointer;
    }

    #blurIntensitySlider::-moz-range-thumb {
      width: 14px;
      height: 14px;
      background: #60a5fa;
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }

    #blurIntensityLabel {
      font-size: 0.7rem;
      color: #60a5fa;
      min-width: 30px;
      text-align: right;
    }

    .blur-status {
      font-size: 0.7rem;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.3s;
    }

    .blur-status.success {
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }

    .blur-status.error {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .blur-status.warning {
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
    }

    .blur-status.info {
      color: #60a5fa;
      background: rgba(96, 165, 250, 0.1);
    }

    /* Blur Canvas Overlay */
    #blurCanvas {
      z-index: 1;
    }
  `;
}
