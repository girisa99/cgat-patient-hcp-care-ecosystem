/**
 * useVisualElementEditor - Hook for managing visual element editing
 * Handles layered content, regeneration, and export
 */

import { useState, useCallback } from 'react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { 
  VisualElement, 
  VisualLayer, 
  ExportFormat, 
  ExportResult,
  TextLayerContent,
  VisualLayerContent,
  VectorLayerContent
} from '../types';

interface UseVisualElementEditorOptions {
  onRegenerateRequest?: (elementId: string, prompt?: string) => Promise<VisualElement>;
  onEnhanceRequest?: (elementId: string, instructions?: string) => Promise<VisualElement>;
}

export function useVisualElementEditor(options: UseVisualElementEditorOptions = {}) {
  const { showSuccess, showError, showInfo } = useMasterToast();
  const [elements, setElements] = useState<Map<string, VisualElement>>(new Map());
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Register a visual element for editing
  const registerElement = useCallback((element: VisualElement) => {
    setElements(prev => new Map(prev).set(element.id, element));
  }, []);

  // Update element properties
  const updateElement = useCallback((elementId: string, updates: Partial<VisualElement>) => {
    setElements(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(elementId);
      if (existing) {
        newMap.set(elementId, { ...existing, ...updates });
      }
      return newMap;
    });
  }, []);

  // Update a specific layer
  const updateLayer = useCallback((elementId: string, layerId: string, updates: Partial<VisualLayer>) => {
    setElements(prev => {
      const newMap = new Map(prev);
      const element = newMap.get(elementId);
      if (element) {
        const updatedLayers = element.layers.map(layer =>
          layer.id === layerId ? { ...layer, ...updates } : layer
        );
        newMap.set(elementId, { ...element, layers: updatedLayers });
      }
      return newMap;
    });
  }, []);

  // Toggle layer visibility
  const toggleLayerVisibility = useCallback((elementId: string, layerId: string) => {
    setElements(prev => {
      const newMap = new Map(prev);
      const element = newMap.get(elementId);
      if (element) {
        const updatedLayers = element.layers.map(layer =>
          layer.id === layerId ? { ...layer, isVisible: !layer.isVisible } : layer
        );
        newMap.set(elementId, { ...element, layers: updatedLayers });
      }
      return newMap;
    });
  }, []);

  // Toggle layer lock
  const toggleLayerLock = useCallback((elementId: string, layerId: string) => {
    setElements(prev => {
      const newMap = new Map(prev);
      const element = newMap.get(elementId);
      if (element) {
        const updatedLayers = element.layers.map(layer =>
          layer.id === layerId ? { ...layer, isLocked: !layer.isLocked } : layer
        );
        newMap.set(elementId, { ...element, layers: updatedLayers });
      }
      return newMap;
    });
  }, []);

  // Regenerate element with AI
  const regenerateElement = useCallback(async (elementId: string, prompt?: string) => {
    const element = elements.get(elementId);
    if (!element) return;

    // Store original for revert
    if (!element.originalLayers) {
      updateElement(elementId, { 
        originalLayers: [...element.layers],
        isRegenerating: true 
      });
    } else {
      updateElement(elementId, { isRegenerating: true });
    }

    showInfo('Regenerating visual element...');

    try {
      if (options.onRegenerateRequest) {
        const newElement = await options.onRegenerateRequest(elementId, prompt);
        updateElement(elementId, { 
          ...newElement, 
          isRegenerating: false,
          originalLayers: element.originalLayers || element.layers
        });
        showSuccess('Visual regenerated successfully');
      } else {
        // Mock regeneration for demo
        await new Promise(resolve => setTimeout(resolve, 2000));
        updateElement(elementId, { 
          isRegenerating: false,
          generatedAt: new Date().toISOString()
        });
        showSuccess('Visual regenerated');
      }
    } catch (error) {
      updateElement(elementId, { isRegenerating: false });
      showError('Failed to regenerate visual');
      throw error;
    } finally {
    }
  }, [elements, updateElement, options, showInfo, showSuccess, showError]);

  // Enhance element with AI
  const enhanceElement = useCallback(async (elementId: string, instructions?: string) => {
    const element = elements.get(elementId);
    if (!element) return;

    // Store original for revert
    if (!element.originalLayers) {
      updateElement(elementId, { 
        originalLayers: [...element.layers],
        isEnhancing: true 
      });
    } else {
      updateElement(elementId, { isEnhancing: true });
    }

    const dismiss = showLoading('Enhancing visual element...');

    try {
      if (options.onEnhanceRequest) {
        const enhancedElement = await options.onEnhanceRequest(elementId, instructions);
        updateElement(elementId, { 
          ...enhancedElement, 
          isEnhancing: false,
          originalLayers: element.originalLayers || element.layers
        });
        showSuccess('Visual enhanced successfully');
      } else {
        // Mock enhancement for demo
        await new Promise(resolve => setTimeout(resolve, 1500));
        updateElement(elementId, { 
          isEnhancing: false,
          generatedAt: new Date().toISOString()
        });
        showSuccess('Visual enhanced');
      }
    } catch (error) {
      updateElement(elementId, { isEnhancing: false });
      showError('Failed to enhance visual');
      throw error;
    } finally {
      dismiss();
    }
  }, [elements, updateElement, options, showLoading, showSuccess, showError]);

  // Revert to original
  const revertElement = useCallback((elementId: string) => {
    const element = elements.get(elementId);
    if (!element || !element.originalLayers) return;

    updateElement(elementId, {
      layers: element.originalLayers,
      originalLayers: undefined
    });
    showSuccess('Reverted to original');
  }, [elements, updateElement, showSuccess]);

  // Export element to various formats
  const exportElement = useCallback(async (
    elementId: string, 
    format: ExportFormat
  ): Promise<ExportResult | null> => {
    const element = elements.get(elementId);
    if (!element) return null;

    const dismiss = showLoading(`Exporting as ${format.toUpperCase()}...`);

    try {
      // Create a canvas or SVG based on format
      const result = await generateExport(element, format);
      showSuccess(`Exported as ${format.toUpperCase()}`);
      return result;
    } catch (error) {
      showError(`Failed to export as ${format.toUpperCase()}`);
      throw error;
    } finally {
      dismiss();
    }
  }, [elements, showLoading, showSuccess, showError]);

  // Get element by ID
  const getElement = useCallback((elementId: string) => {
    return elements.get(elementId);
  }, [elements]);

  // Check if element has original (can revert)
  const canRevert = useCallback((elementId: string) => {
    const element = elements.get(elementId);
    return element?.originalLayers && element.originalLayers.length > 0;
  }, [elements]);

  return {
    elements,
    selectedElementId,
    setSelectedElementId,
    registerElement,
    updateElement,
    updateLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    regenerateElement,
    enhanceElement,
    revertElement,
    exportElement,
    getElement,
    canRevert,
  };
}

// Helper function to generate exports
async function generateExport(
  element: VisualElement, 
  format: ExportFormat
): Promise<ExportResult> {
  // Create a container for rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '1920px';
  container.style.height = '1080px';
  document.body.appendChild(container);

  try {
    // Sort and render layers
    const sortedLayers = [...element.layers]
      .filter(l => l.isVisible)
      .sort((a, b) => a.zIndex - b.zIndex);

    for (const layer of sortedLayers) {
      const layerEl = createLayerElement(layer);
      if (layerEl) container.appendChild(layerEl);
    }

    // Generate based on format
    let blob: Blob;
    let mimeType: string;

    switch (format) {
      case 'svg':
        const svgContent = generateSVG(element);
        blob = new Blob([svgContent], { type: 'image/svg+xml' });
        mimeType = 'image/svg+xml';
        break;

      case 'png':
      case 'webp':
        // Use html2canvas for raster formats
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(container, {
          width: 1920,
          height: 1080,
          scale: 2,
          useCORS: true,
          backgroundColor: element.style.backgroundColor || '#ffffff',
        });
        
        blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (b) => resolve(b!),
            format === 'png' ? 'image/png' : 'image/webp',
            0.95
          );
        });
        mimeType = format === 'png' ? 'image/png' : 'image/webp';
        break;

      case 'pdf':
        // Use jspdf for PDF
        const { jsPDF } = await import('jspdf');
        const html2canvasPdf = (await import('html2canvas')).default;
        const pdfCanvas = await html2canvasPdf(container, {
          width: 1920,
          height: 1080,
          scale: 2,
          useCORS: true,
        });
        
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [1920, 1080],
        });
        
        const imgData = pdfCanvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080);
        
        blob = pdf.output('blob');
        mimeType = 'application/pdf';
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    const url = URL.createObjectURL(blob);
    const filename = `${element.id}-${Date.now()}.${format}`;

    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    return {
      format,
      blob,
      url,
      filename,
      size: blob.size,
      dimensions: { width: 1920, height: 1080 },
    };
  } finally {
    document.body.removeChild(container);
  }
}

// Helper to create DOM element from layer
function createLayerElement(layer: VisualLayer): HTMLElement | null {
  const el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.left = `${layer.position.x}px`;
  el.style.top = `${layer.position.y}px`;
  el.style.width = `${layer.size.width}px`;
  el.style.height = `${layer.size.height}px`;
  el.style.zIndex = String(layer.zIndex);

  switch (layer.content.type) {
    case 'text':
      const textContent = layer.content as TextLayerContent;
      el.textContent = textContent.text;
      el.style.fontFamily = textContent.style.fontFamily;
      el.style.fontSize = `${textContent.style.fontSize}px`;
      el.style.fontWeight = String(textContent.style.fontWeight);
      el.style.color = textContent.style.color;
      el.style.textAlign = textContent.style.alignment;
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      break;

    case 'visual':
      const visualContent = layer.content as VisualLayerContent;
      const img = document.createElement('img');
      img.src = visualContent.url;
      img.alt = visualContent.alt;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      el.appendChild(img);
      break;

    case 'vector':
      const vectorContent = layer.content as VectorLayerContent;
      el.innerHTML = vectorContent.svgContent;
      break;

    default:
      return null;
  }

  return el;
}

// Helper to generate SVG from element
function generateSVG(element: VisualElement): string {
  const sortedLayers = [...element.layers]
    .filter(l => l.isVisible)
    .sort((a, b) => a.zIndex - b.zIndex);

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">`;
  
  // Background
  if (element.style.backgroundColor) {
    svgContent += `<rect width="100%" height="100%" fill="${element.style.backgroundColor}"/>`;
  }

  for (const layer of sortedLayers) {
    const { x, y } = layer.position;
    const { width, height } = layer.size;

    switch (layer.content.type) {
      case 'text':
        const textContent = layer.content as TextLayerContent;
        svgContent += `
          <text 
            x="${x + width / 2}" 
            y="${y + height / 2}"
            text-anchor="middle"
            dominant-baseline="middle"
            font-family="${textContent.style.fontFamily}"
            font-size="${textContent.style.fontSize}"
            font-weight="${textContent.style.fontWeight}"
            fill="${textContent.style.color}"
          >${escapeXml(textContent.text)}</text>
        `;
        break;

      case 'visual':
        const visualContent = layer.content as VisualLayerContent;
        svgContent += `
          <image 
            x="${x}" 
            y="${y}" 
            width="${width}" 
            height="${height}"
            href="${visualContent.url}"
            preserveAspectRatio="xMidYMid slice"
          />
        `;
        break;

      case 'vector':
        const vectorContent = layer.content as VectorLayerContent;
        svgContent += `<g transform="translate(${x}, ${y})">${vectorContent.svgContent}</g>`;
        break;
    }
  }

  svgContent += '</svg>';
  return svgContent;
}

// Helper to escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
