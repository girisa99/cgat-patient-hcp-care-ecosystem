/**
 * MULTI-SCREENSHOT GALLERY
 * 
 * Unlimited screenshot uploads per product with drag-to-reorder.
 * Supports auto-capture from Cast UI and manual uploads.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  GripVertical,
  Trash2,
  ImagePlus,
  Loader2,
  CheckCircle,
  Eye,
  RefreshCw,
  Monitor,
  Plus,
  X,
  Scan,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Products with their pages for auto-capture
export const GENIE_PRODUCTS = [
  { id: 'spark', name: 'Genie Spark', route: '/genie-spark', color: '#F97316', description: 'Idea generation' },
  { id: 'mind', name: 'Genie Mind', route: '/genie-mind', color: '#3B82F6', description: 'Script editing' },
  { id: 'vibe', name: 'Genie Vibe', route: '/genie-vibe', color: '#22C55E', description: 'Voice & audio' },
  { id: 'deck', name: 'Genie Deck', route: '/genie-deck', color: '#EAB308', description: 'Presentations' },
  { id: 'arc', name: 'Genie Arc', route: '/genie-arc', color: '#EC4899', description: 'Scheduling' },
  { id: 'studio', name: 'Genie Studio', route: '/genie-studio', color: '#9333EA', description: 'Full dashboard' },
  { id: 'ask-genie', name: 'Ask Genie', route: '/genie-support', color: '#06B6D4', description: 'AI assistant' },
  { id: 'cast', name: 'Genie Cast', route: '/genie-admin?tab=landing-videos', color: '#EF4444', description: 'Video studio' },
];

// Screen sections for each product - what to capture for video generation
export interface ProductScreen {
  id: string;
  name: string;
  description: string;
  selector?: string; // CSS selector for specific element, or captures full page
  tabValue?: string; // For tab-based products
}

export const PRODUCT_SCREENS: Record<string, ProductScreen[]> = {
  // Genie Spark - Idea to Script
  'spark': [
    { id: 'spark-hero', name: 'Hero Input', description: 'Main idea input area' },
    { id: 'spark-pipeline', name: 'Pipeline Selector', description: 'Pipeline selection grid' },
    { id: 'spark-script', name: 'Generated Script', description: 'AI-generated script output' },
    { id: 'spark-confidence', name: 'Confidence Score', description: 'AI confidence metrics' },
    { id: 'spark-export', name: 'Export Options', description: 'Export and share panel' },
  ],
  // Genie Mind - Script Enhancement
  'mind': [
    { id: 'mind-editor', name: 'Script Editor', description: 'Main editing workspace' },
    { id: 'mind-suggestions', name: 'AI Suggestions', description: 'Enhancement recommendations' },
    { id: 'mind-translation', name: 'Translation', description: 'Multi-language options' },
    { id: 'mind-versions', name: 'Version History', description: 'Script versions' },
    { id: 'mind-export', name: 'Export', description: 'Format export options' },
  ],
  // Genie Vibe - Recording Studio
  'vibe': [
    { id: 'vibe-teleprompter', name: 'Teleprompter', description: 'Script display' },
    { id: 'vibe-recorder', name: 'Recording Studio', description: 'Audio/video capture' },
    { id: 'vibe-timeline', name: 'Timeline Editor', description: 'Edit timeline' },
    { id: 'vibe-preview', name: 'Preview', description: 'Output preview' },
    { id: 'vibe-tts', name: 'TTS Generation', description: 'AI voiceover' },
  ],
  // Genie Deck - Presentations
  'deck': [
    { id: 'deck-templates', name: 'Template Gallery', description: 'Presentation templates' },
    { id: 'deck-editor', name: 'Slide Editor', description: 'Slide design workspace' },
    { id: 'deck-ai-layout', name: 'AI Layouts', description: 'Smart layout suggestions' },
    { id: 'deck-preview', name: 'Presentation Preview', description: 'Full preview mode' },
    { id: 'deck-export', name: 'Export Options', description: 'PPT/PDF export' },
  ],
  // Genie Arc - Production Hub
  'arc': [
    { id: 'arc-kanban', name: 'Kanban Board', description: 'Project workflow' },
    { id: 'arc-calendar', name: 'Calendar View', description: 'Scheduling calendar' },
    { id: 'arc-library', name: 'Asset Library', description: 'Saved content' },
    { id: 'arc-scheduler', name: 'Scheduler', description: 'Publication scheduler' },
    { id: 'arc-analytics', name: 'Analytics', description: 'Performance metrics' },
  ],
  // Genie Studio - Full Dashboard
  'studio': [
    { id: 'studio-dashboard', name: 'Dashboard', description: 'Main overview' },
    { id: 'studio-products', name: 'Product Suite', description: 'All 7 products' },
    { id: 'studio-recent', name: 'Recent Projects', description: 'Latest work' },
    { id: 'studio-settings', name: 'Settings', description: 'Configuration' },
  ],
  // Ask Genie - AI Assistant
  'ask-genie': [
    { id: 'ask-genie-chat', name: 'Chat Interface', description: 'AI conversation' },
    { id: 'ask-genie-workflows', name: 'Workflow Guide', description: 'Step-by-step help' },
    { id: 'ask-genie-help', name: 'Help Center', description: 'Documentation' },
    { id: 'ask-genie-suggestions', name: 'Suggestions', description: 'AI recommendations' },
  ],
  // Genie Cast - Video Production (tab-based)
  'cast': [
    { id: 'screenshots-tab', name: 'Screenshots Tab', tabValue: 'screenshots', description: 'Screenshot gallery view' },
    { id: 'generate-tab', name: 'Quick Generate', tabValue: 'generate', description: 'Video generation panel' },
    { id: 'matrix-tab', name: 'Matrix View', tabValue: 'matrix', description: 'Full generation matrix' },
    { id: 'library-tab', name: 'Video Library', tabValue: 'library', description: 'Generated videos list' },
    { id: 'analytics-tab', name: 'Analytics', tabValue: 'analytics', description: 'Performance metrics' },
  ],
};

// Legacy alias for Cast screens (backward compatibility)
export const GENIE_CAST_SCREENS = PRODUCT_SCREENS['cast'];

export interface ProductScreenshot {
  id: string;
  productId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  order: number;
  createdAt: Date;
  method: 'upload' | 'capture' | 'auto';
}

export interface ProductGallery {
  productId: string;
  productName: string;
  productColor: string;
  screenshots: ProductScreenshot[];
}

// Sortable screenshot item component
const SortableScreenshot: React.FC<{
  screenshot: ProductScreenshot;
  productColor: string;
  onRemove: (id: string) => void;
  onPreview: (screenshot: ProductScreenshot) => void;
}> = ({ screenshot, productColor, onRemove, onPreview }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: screenshot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border-2 transition-all",
        isDragging ? "opacity-50 scale-105 border-primary" : "border-transparent hover:border-muted-foreground/30"
      )}
    >
      <img
        src={screenshot.imageUrl}
        alt={`Screenshot ${screenshot.order + 1}`}
        className="w-full h-full object-cover"
      />
      
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 p-1 bg-black/60 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3 h-3 text-white" />
      </button>
      
      {/* Actions */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onPreview(screenshot)}
          className="p-1 bg-black/60 rounded hover:bg-black/80 transition-colors"
        >
          <Eye className="w-3 h-3 text-white" />
        </button>
        <button
          onClick={() => onRemove(screenshot.id)}
          className="p-1 bg-destructive/80 rounded hover:bg-destructive transition-colors"
        >
          <Trash2 className="w-3 h-3 text-white" />
        </button>
      </div>

      {/* Order badge */}
      <div
        className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-bold text-white rounded"
        style={{ backgroundColor: productColor }}
      >
        {screenshot.order + 1}
      </div>
    </div>
  );
};

interface MultiScreenshotGalleryProps {
  onGalleriesUpdated?: (galleries: ProductGallery[]) => void;
}

export const MultiScreenshotGallery: React.FC<MultiScreenshotGalleryProps> = ({
  onGalleriesUpdated,
}) => {
  const [galleries, setGalleries] = useState<ProductGallery[]>(
    GENIE_PRODUCTS.map(p => ({
      productId: p.id,
      productName: p.name,
      productColor: p.color,
      screenshots: [],
    }))
  );
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isAutoCapturing, setIsAutoCapturing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<ProductScreenshot | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productCaptureDialogOpen, setProductCaptureDialogOpen] = useState(false);
  const [selectedProductScreens, setSelectedProductScreens] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load existing screenshots from storage
  useEffect(() => {
    loadExistingScreenshots();
  }, []);

  const loadExistingScreenshots = async () => {
    try {
      const { data: files, error } = await supabase.storage
        .from('product-screenshots')
        .list('screenshots');

      if (error) throw error;

      const updatedGalleries = [...galleries];
      // Track seen filenames to prevent duplicates from timestamp variants
      const seenByProduct: Record<string, Set<string>> = {};
      
      for (const file of files || []) {
        const fileNameWithoutExt = file.name.replace('.png', '');
        
        // Match against known product IDs (longest match first)
        let productId = '';
        for (const product of GENIE_PRODUCTS) {
          if (fileNameWithoutExt.startsWith(`${product.id}-`)) {
            productId = product.id;
            break;
          }
        }
        if (!productId) {
          const parts = fileNameWithoutExt.split('-');
          productId = parts[0];
        }
        
        const gallery = updatedGalleries.find(g => g.productId === productId);
        if (!gallery) continue;

        if (!seenByProduct[productId]) seenByProduct[productId] = new Set();

        const { data: urlData } = supabase.storage
          .from('product-screenshots')
          .getPublicUrl(`screenshots/${file.name}`);

        // Deduplicate: skip if same URL already loaded
        if (gallery.screenshots.some(s => s.imageUrl === urlData.publicUrl)) continue;
        // Also deduplicate by base filename (same screen, different timestamp)
        if (seenByProduct[productId].has(urlData.publicUrl)) continue;
        seenByProduct[productId].add(urlData.publicUrl);

        gallery.screenshots.push({
          id: fileNameWithoutExt,
          productId,
          imageUrl: urlData.publicUrl,
          order: gallery.screenshots.length,
          createdAt: new Date(file.created_at || Date.now()),
          method: 'upload',
        });
      }

      setGalleries(updatedGalleries);
      onGalleriesUpdated?.(updatedGalleries);
    } catch (err) {
      console.error('Failed to load screenshots:', err);
    }
  };

  // Upload screenshot to storage with duplicate prevention
  // Uses deterministic naming: {productId}-{screenKey}.png to overwrite (upsert) on re-capture
  const uploadScreenshot = async (
    file: File, 
    productId: string, 
    screenKey?: string
  ): Promise<string | null> => {
    try {
      // Deterministic filename: if screenKey provided, use it for upsert (replaces old file)
      // Otherwise fallback to timestamp (manual uploads where screen is unknown)
      const fileName = screenKey 
        ? `${productId}-${screenKey}.png` 
        : `${productId}-${Date.now()}.png`;
      const filePath = `screenshots/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-screenshots')
        .upload(filePath, file, {
          contentType: 'image/png',
          upsert: true, // Replace if exists — prevents duplicates
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-screenshots')
        .getPublicUrl(filePath);

      console.log(`📸 Uploaded ${fileName} (${screenKey ? 'deterministic/upsert' : 'timestamped'})`);
      return urlData.publicUrl;
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !selectedProduct) return;

    setIsUploading(selectedProduct);
    const product = GENIE_PRODUCTS.find(p => p.id === selectedProduct);
    
    try {
      for (const file of files) {
        const imageUrl = await uploadScreenshot(file, selectedProduct);
        if (imageUrl) {
          const gallery = galleries.find(g => g.productId === selectedProduct);
          const newScreenshot: ProductScreenshot = {
            id: `${selectedProduct}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            productId: selectedProduct,
            imageUrl,
            order: gallery?.screenshots.length || 0,
            createdAt: new Date(),
            method: 'upload',
          };

          setGalleries(prev => {
            const updated = prev.map(g =>
              g.productId === selectedProduct
                ? { ...g, screenshots: [...g.screenshots, newScreenshot] }
                : g
            );
            onGalleriesUpdated?.(updated);
            return updated;
          });
        }
      }
      toast.success(`${files.length} screenshot(s) added to ${product?.name}`);
    } catch (err) {
      toast.error('Failed to upload screenshots');
    } finally {
      setIsUploading(null);
      setDialogOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle drag end for reordering
  const handleDragEnd = (productId: string) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setGalleries(prev => {
      const updated = prev.map(g => {
        if (g.productId !== productId) return g;

        const oldIndex = g.screenshots.findIndex(s => s.id === active.id);
        const newIndex = g.screenshots.findIndex(s => s.id === over.id);

        const reordered = arrayMove(g.screenshots, oldIndex, newIndex).map((s, idx) => ({
          ...s,
          order: idx,
        }));

        return { ...g, screenshots: reordered };
      });

      onGalleriesUpdated?.(updated);
      return updated;
    });
  };

  // Remove screenshot from both state and storage
  const handleRemove = async (productId: string, screenshotId: string) => {
    try {
      // Find the screenshot to get its storage path
      const gallery = galleries.find(g => g.productId === productId);
      const screenshot = gallery?.screenshots.find(s => s.id === screenshotId);
      
      if (screenshot?.imageUrl) {
        // Extract the file path from the URL
        // URL format: .../storage/v1/object/public/product-screenshots/screenshots/filename.png
        const urlParts = screenshot.imageUrl.split('/product-screenshots/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1]; // e.g., "screenshots/ask-genie-123.png"
          
          const { error } = await supabase.storage
            .from('product-screenshots')
            .remove([filePath]);
          
          if (error) {
            console.error('Failed to delete from storage:', error);
            toast.error('Failed to delete screenshot from storage');
            return;
          }
        }
      }

      // Update local state
      setGalleries(prev => {
        const updated = prev.map(g => {
          if (g.productId !== productId) return g;
          return {
            ...g,
            screenshots: g.screenshots.filter(s => s.id !== screenshotId).map((s, idx) => ({ ...s, order: idx })),
          };
        });
        onGalleriesUpdated?.(updated);
        return updated;
      });
      
      toast.success('Screenshot deleted');
    } catch (err) {
      console.error('Failed to remove screenshot:', err);
      toast.error('Failed to delete screenshot');
    }
  };

  // State for Cast screen capture dialog
  const [castCaptureDialogOpen, setCastCaptureDialogOpen] = useState(false);
  const [selectedScreens, setSelectedScreens] = useState<string[]>(GENIE_CAST_SCREENS.map(s => s.id));
  const [captureProgress, setCaptureProgress] = useState<{ current: number; total: number; screen: string } | null>(null);

  // Auto-capture Cast UI screenshots - captures separate screens/tabs
  const handleAutoCaptureCast = async () => {
    if (selectedScreens.length === 0) {
      toast.error('Please select at least one screen to capture');
      return;
    }

    setIsAutoCapturing(true);
    setCastCaptureDialogOpen(false);
    setDialogOpen(false); // Close the main dialog too
    const capturedCount = { success: 0, failed: 0 };
    const screensToCapture = GENIE_CAST_SCREENS.filter(s => selectedScreens.includes(s.id));

    // Tab value to index mapping based on UnifiedVideoGenerationPanel tab order
    const TAB_INDICES: Record<string, number> = {
      'screenshots': 0,
      'generate': 1,
      'matrix': 2,
      'library': 3,
      'analytics': 4,
    };

    // Helper to find the video generation panel's tablist (has 5 tabs)
    const findVideoGenTablist = (): Element | null => {
      const allTablists = document.querySelectorAll('[role="tablist"]');
      for (const tablist of allTablists) {
        const tabs = tablist.querySelectorAll('button[role="tab"]');
        if (tabs.length === 5) {
          return tablist;
        }
      }
      return null;
    };

    // Helper to click a tab and wait for panel to become active
    const switchToTab = async (tabIndex: number): Promise<HTMLElement | null> => {
      const tablist = findVideoGenTablist();
      if (!tablist) {
        console.warn('❌ Could not find video generation tablist');
        return null;
      }

      const allTabs = tablist.querySelectorAll('button[role="tab"]');
      const tabEl = allTabs[tabIndex] as HTMLElement;
      
      if (!tabEl) {
        console.warn(`❌ Tab at index ${tabIndex} not found`);
        return null;
      }

      // Get the current active tab to verify switch
      const currentActive = tablist.querySelector('button[role="tab"][data-state="active"]');
      const currentActiveIndex = currentActive ? Array.from(allTabs).indexOf(currentActive) : -1;
      
      console.log(`🔄 Switching from tab ${currentActiveIndex} to tab ${tabIndex}`);
      
      // Click the tab - use focus + click for more reliable activation
      tabEl.focus();
      tabEl.click();
      
      // Wait for React to process the state change
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the tab switched by checking data-state
      let attempts = 0;
      const maxAttempts = 20; // 2 seconds max
      
      while (attempts < maxAttempts) {
        const newActiveTab = tablist.querySelector('button[role="tab"][data-state="active"]');
        const newActiveIndex = newActiveTab ? Array.from(allTabs).indexOf(newActiveTab) : -1;
        
        if (newActiveIndex === tabIndex) {
          console.log(`✅ Tab ${tabIndex} is now active`);
          break;
        }
        
        // Try clicking again if not switched
        if (attempts === 5 || attempts === 10) {
          tabEl.click();
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 800));

      // Find the tabpanel that's now active - get all tabpanels and find the visible one
      const allPanels = document.querySelectorAll('[role="tabpanel"]');
      let activePanel: HTMLElement | null = null;
      
      for (const panel of allPanels) {
        const state = panel.getAttribute('data-state');
        const isHidden = (panel as HTMLElement).hidden;
        const display = window.getComputedStyle(panel).display;
        
        // Check if this panel is active and visible
        if (state === 'active' && !isHidden && display !== 'none') {
          // Additional check: make sure it's the panel associated with our tablist
          // by checking if it's a sibling or near the tablist
          const tablistParent = tablist.parentElement;
          if (tablistParent && tablistParent.contains(panel)) {
            activePanel = panel as HTMLElement;
            break;
          }
          // Fallback: just use the first active panel if parent check fails
          if (!activePanel) {
            activePanel = panel as HTMLElement;
          }
        }
      }
      
      console.log(`📋 Found active panel: ${!!activePanel}`);
      return activePanel;
    };
    
    for (let i = 0; i < screensToCapture.length; i++) {
      const screen = screensToCapture[i];
      setCaptureProgress({ current: i + 1, total: screensToCapture.length, screen: screen.name });
      
      try {
        const tabIndex = TAB_INDICES[screen.tabValue];
        
        if (tabIndex === undefined) {
          console.warn(`❌ Unknown tab value: ${screen.tabValue}`);
          capturedCount.failed++;
          continue;
        }

        toast.info(`Switching to: ${screen.name}...`);
        
        // Switch to the target tab
        const tabPanel = await switchToTab(tabIndex);
        
        if (!tabPanel) {
          console.warn(`❌ Could not switch to tab ${tabIndex} for ${screen.name}`);
          capturedCount.failed++;
          continue;
        }

        toast.info(`Capturing: ${screen.name}...`);
        
        // Additional wait for any animations to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        // Scroll to top of the panel
        tabPanel.scrollTop = 0;
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const canvas = await html2canvas(tabPanel, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#0a0a0a',
          logging: false,
          width: tabPanel.offsetWidth,
          height: Math.min(tabPanel.scrollHeight, 2000), // Cap height to avoid huge captures
          ignoreElements: (element) => {
            return element.classList?.contains('animate-spin') || 
                   element.tagName === 'VIDEO' ||
                   element.tagName === 'IFRAME';
          },
        });

        // Convert to blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to create blob'));
          }, 'image/png', 0.95);
        });

        // Upload to storage
        const imageUrl = await uploadScreenshot(new File([blob], `cast-${screen.id}.png`, { type: 'image/png' }), 'cast', screen.id);
        
        if (imageUrl) {
          const newScreenshot: ProductScreenshot = {
            id: `cast-${screen.id}-${Date.now()}`,
            productId: 'cast',
            imageUrl,
            order: galleries.find(g => g.productId === 'cast')?.screenshots.length || 0,
            createdAt: new Date(),
            method: 'capture',
            caption: screen.name,
          };

          setGalleries(prev => {
            const updated = prev.map(g =>
              g.productId === 'cast'
                ? { ...g, screenshots: [...g.screenshots, newScreenshot] }
                : g
            );
            onGalleriesUpdated?.(updated);
            return updated;
          });
          capturedCount.success++;
          console.log(`✅ Captured: ${screen.name}`);
        } else {
          capturedCount.failed++;
          console.warn(`❌ Upload failed for: ${screen.name}`);
        }
      } catch (err) {
        console.error(`Failed to capture ${screen.name}:`, err);
        capturedCount.failed++;
      }

      // Brief pause between captures
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Return to screenshots tab at the end
    console.log('🔄 Returning to Screenshots tab...');
    await switchToTab(0);

    setCaptureProgress(null);
    setIsAutoCapturing(false);

    if (capturedCount.success > 0) {
      toast.success(`Captured ${capturedCount.success} Genie Cast screen(s)${capturedCount.failed > 0 ? ` (${capturedCount.failed} failed)` : ''}`);
    } else {
      toast.error('No screens could be captured. Try uploading manually.');
    }
  };

  /**
   * GENERIC PRODUCT AUTO-CAPTURE
   * Captures screenshots for any product by navigating to its page and capturing defined screens.
   * For Cast (tab-based), it uses the tab switching logic. For other products, it captures the main page.
   */
  const handleAutoCaptureProduct = async () => {
    if (!selectedProduct || selectedProductScreens.length === 0) {
      toast.error('Please select at least one screen to capture');
      return;
    }

    // For Cast, use the specialized tab-based capture
    if (selectedProduct === 'cast') {
      // Use the existing Cast capture logic via the selectedScreens state
      setSelectedScreens(selectedProductScreens);
      setProductCaptureDialogOpen(false);
      handleAutoCaptureCast();
      return;
    }

    setIsAutoCapturing(true);
    setProductCaptureDialogOpen(false);
    const capturedCount = { success: 0, failed: 0 };
    const productConfig = GENIE_PRODUCTS.find(p => p.id === selectedProduct);
    const screens = PRODUCT_SCREENS[selectedProduct] || [];
    const screensToCapture = screens.filter(s => selectedProductScreens.includes(s.id));

    toast.info(`Starting capture for ${productConfig?.name} (${screensToCapture.length} screens)...`);
    console.log(`📸 Auto-capture starting for product: ${selectedProduct}`);

    // For non-Cast products, we capture the current page content
    // In a full implementation, this would navigate to the product page in an iframe
    // For now, we capture placeholder screens with the product branding
    
    for (let i = 0; i < screensToCapture.length; i++) {
      const screen = screensToCapture[i];
      setCaptureProgress({ current: i + 1, total: screensToCapture.length, screen: screen.name });
      toast.info(`Capturing: ${screen.name}...`);
      
      try {
        // Create a branded placeholder canvas for this screen
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Background gradient using product color
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, '#0a0a0a');
          gradient.addColorStop(1, productConfig?.color + '40' || '#33333340');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Product name
          ctx.fillStyle = productConfig?.color || '#ffffff';
          ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(productConfig?.name || 'Genie Product', canvas.width / 2, 200);
          
          // Screen name
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
          ctx.fillText(screen.name, canvas.width / 2, 280);
          
          // Description
          ctx.fillStyle = '#888888';
          ctx.font = '20px system-ui, -apple-system, sans-serif';
          ctx.fillText(screen.description, canvas.width / 2, 340);
          
          // Placeholder indicator
          ctx.fillStyle = '#666666';
          ctx.font = '16px system-ui, -apple-system, sans-serif';
          ctx.fillText('📷 Replace with actual screenshot via Upload', canvas.width / 2, 500);
          ctx.fillText(`Screen ${i + 1} of ${screensToCapture.length}`, canvas.width / 2, 540);
        }

        // Convert to blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to create blob'));
          }, 'image/png', 0.95);
        });

        // Upload to storage
        const imageUrl = await uploadScreenshot(
          new File([blob], `${selectedProduct}-${screen.id}.png`, { type: 'image/png' }), 
          selectedProduct,
          screen.id  // Pass screen key for deterministic upsert (prevents duplicates)
        );
        
        if (imageUrl) {
          const newScreenshot: ProductScreenshot = {
            id: `${selectedProduct}-${screen.id}-${Date.now()}`,
            productId: selectedProduct,
            imageUrl,
            order: galleries.find(g => g.productId === selectedProduct)?.screenshots.length || 0,
            createdAt: new Date(),
            method: 'capture',
            caption: screen.name,
          };

          setGalleries(prev => {
            const updated = prev.map(g =>
              g.productId === selectedProduct
                ? { ...g, screenshots: [...g.screenshots, newScreenshot] }
                : g
            );
            onGalleriesUpdated?.(updated);
            return updated;
          });
          capturedCount.success++;
          console.log(`✅ Captured placeholder for: ${screen.name}`);
        } else {
          capturedCount.failed++;
        }
      } catch (err) {
        console.error(`Failed to capture ${screen.name}:`, err);
        capturedCount.failed++;
      }

      // Brief pause between captures
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setCaptureProgress(null);
    setIsAutoCapturing(false);
    setSelectedProductScreens([]);

    if (capturedCount.success > 0) {
      toast.success(
        `Captured ${capturedCount.success} ${productConfig?.name} placeholder(s)${capturedCount.failed > 0 ? ` (${capturedCount.failed} failed)` : ''}. ` +
        `Replace with real screenshots via Upload.`
      );
    } else {
      toast.error('No screens could be captured. Try uploading manually.');
    }
  };

  const totalScreenshots = galleries.reduce((sum, g) => sum + g.screenshots.length, 0);
  const productsWithScreenshots = galleries.filter(g => g.screenshots.length > 0).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="w-5 h-5" />
              Product Screenshot Gallery
            </CardTitle>
            <CardDescription>
              Upload unlimited screenshots per product • Drag to reorder • Used in video generation
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <CheckCircle className="w-3 h-3 mr-1" />
              {productsWithScreenshots}/{GENIE_PRODUCTS.length} products
            </Badge>
            <Badge variant="outline">
              {totalScreenshots} screenshots
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Galleries */}
        <div className="space-y-4">
          {galleries.map(gallery => {
            const product = GENIE_PRODUCTS.find(p => p.id === gallery.productId);
            const isCast = gallery.productId === 'cast';

            return (
              <div
                key={gallery.productId}
                className={cn(
                  "p-3 rounded-lg border",
                  gallery.screenshots.length > 0 ? "border-muted" : "border-dashed border-muted-foreground/30"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: gallery.productColor }}
                  />
                  <span className="font-medium text-sm">{gallery.productName}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {gallery.screenshots.length} shot{gallery.screenshots.length !== 1 ? 's' : ''}
                  </Badge>
                  
                  {/* Add button - just opens the dialog */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto h-7 gap-1"
                    onClick={() => {
                      setSelectedProduct(gallery.productId);
                      setDialogOpen(true);
                    }}
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </Button>
                </div>

                {/* Screenshot Strip with Drag & Drop */}
                {gallery.screenshots.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd(gallery.productId)}
                  >
                    <SortableContext
                      items={gallery.screenshots.map(s => s.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex gap-2 pb-2">
                          {gallery.screenshots.map(screenshot => (
                            <SortableScreenshot
                              key={screenshot.id}
                              screenshot={screenshot}
                              productColor={gallery.productColor}
                              onRemove={(id) => handleRemove(gallery.productId, id)}
                              onPreview={setPreviewImage}
                            />
                          ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
                    <ImagePlus className="w-4 h-4 mr-2 opacity-50" />
                    No screenshots - click "Add" to upload
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Screenshots Dialog - Outside the loop */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: GENIE_PRODUCTS.find(p => p.id === selectedProduct)?.color }} 
                />
                Add Screenshots - {GENIE_PRODUCTS.find(p => p.id === selectedProduct)?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Images (supports multiple)</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={!!isUploading}
                />
              </div>
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </div>
              )}
              {/* Auto-Capture section - available for all products that have screens defined */}
              {selectedProduct && PRODUCT_SCREENS[selectedProduct] && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-2 block">
                    Or Auto-Capture {GENIE_PRODUCTS.find(p => p.id === selectedProduct)?.name} Screens
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Automatically navigate and capture different screens/sections of the product interface
                  </p>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      setDialogOpen(false);
                      setProductCaptureDialogOpen(true);
                      // Pre-select all screens for this product
                      setSelectedProductScreens(PRODUCT_SCREENS[selectedProduct]?.map(s => s.id) || []);
                    }}
                    disabled={isAutoCapturing}
                  >
                    {isAutoCapturing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {captureProgress 
                          ? `Capturing ${captureProgress.current}/${captureProgress.total}` 
                          : 'Preparing...'
                        }
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4" />
                        Select Screens to Capture ({PRODUCT_SCREENS[selectedProduct]?.length || 0} available)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Universal Product Screen Capture Dialog */}
        <Dialog open={productCaptureDialogOpen} onOpenChange={setProductCaptureDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: GENIE_PRODUCTS.find(p => p.id === selectedProduct)?.color }} 
                />
                <Scan className="w-5 h-5" />
                Capture {GENIE_PRODUCTS.find(p => p.id === selectedProduct)?.name} Screens
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select which screens/sections to capture. Each will be saved as a separate screenshot 
                that maps to a video chapter.
              </p>
              
              {/* Screen selection list */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {selectedProduct && PRODUCT_SCREENS[selectedProduct]?.map(screen => (
                  <div 
                    key={screen.id}
                    className={cn(
                      "flex items-start space-x-3 p-2.5 rounded-lg border transition-colors cursor-pointer",
                      selectedProductScreens.includes(screen.id) 
                        ? "border-primary bg-primary/5" 
                        : "border-muted hover:border-muted-foreground/30"
                    )}
                    onClick={() => {
                      if (selectedProductScreens.includes(screen.id)) {
                        setSelectedProductScreens(prev => prev.filter(id => id !== screen.id));
                      } else {
                        setSelectedProductScreens(prev => [...prev, screen.id]);
                      }
                    }}
                  >
                    <Checkbox
                      id={`capture-product-${screen.id}`}
                      checked={selectedProductScreens.includes(screen.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProductScreens(prev => [...prev, screen.id]);
                        } else {
                          setSelectedProductScreens(prev => prev.filter(id => id !== screen.id));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`capture-product-${screen.id}`} className="font-medium text-sm cursor-pointer">
                        {screen.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {screen.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Quick actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedProduct && setSelectedProductScreens(PRODUCT_SCREENS[selectedProduct]?.map(s => s.id) || [])}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProductScreens([])}
                >
                  Deselect All
                </Button>
              </div>
              
              {/* Info about sync workflow */}
              <div className="p-3 bg-muted/30 rounded-lg border border-muted text-xs space-y-1">
                <p className="font-medium flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3" />
                  How Screenshots Sync with Video
                </p>
                <p className="text-muted-foreground">
                  Each screenshot maps to a chapter in the final marketing video. The <code>genie-cast-assembler</code> 
                  aligns your screenshots with the TTS voiceover script and stitches them into a synchronized video.
                </p>
              </div>
              
              {/* Capture button */}
              <Button
                className="w-full gap-2"
                onClick={handleAutoCaptureProduct}
                disabled={selectedProductScreens.length === 0 || isAutoCapturing}
              >
                {isAutoCapturing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Capture {selectedProductScreens.length} Screen{selectedProductScreens.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cast Screen Capture Dialog - Separate */}
        <Dialog open={castCaptureDialogOpen} onOpenChange={setCastCaptureDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-destructive" />
                Capture Genie Cast Screens
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select which screens/tabs to capture. Each will be saved as a separate screenshot.
              </p>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {GENIE_CAST_SCREENS.map(screen => (
                  <div 
                    key={screen.id}
                    className={cn(
                      "flex items-start space-x-3 p-2 rounded-lg border transition-colors",
                      selectedScreens.includes(screen.id) 
                        ? "border-primary bg-primary/5" 
                        : "border-muted hover:border-muted-foreground/30"
                    )}
                  >
                    <Checkbox
                      id={`capture-${screen.id}`}
                      checked={selectedScreens.includes(screen.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedScreens(prev => [...prev, screen.id]);
                        } else {
                          setSelectedScreens(prev => prev.filter(id => id !== screen.id));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`capture-${screen.id}`} className="font-medium text-sm cursor-pointer">
                        {screen.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {screen.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedScreens(GENIE_CAST_SCREENS.map(s => s.id))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedScreens([])}
                >
                  Deselect All
                </Button>
              </div>
              <Button
                className="w-full gap-2"
                onClick={handleAutoCaptureCast}
                disabled={selectedScreens.length === 0}
              >
                <Camera className="w-4 h-4" />
                Capture {selectedScreens.length} Screen{selectedScreens.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dogfood Architecture Info */}
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-warning/20 rounded-lg">
                <RefreshCw className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  🐕 Dogfood Architecture
                  <Badge variant="outline" className="text-[10px]">Self-Referential</Badge>
                </h4>
                <p className="text-xs text-muted-foreground">
                  <strong>Genie Cast uses its own pipelines</strong> to generate marketing videos about itself:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-muted/30 rounded">
                    <span className="font-medium">Screenshots →</span> Captured from Cast UI tabs
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <span className="font-medium">TTS →</span> 4-zone regional voiceover
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <span className="font-medium">Video →</span> genie-cast-assembler Edge Function
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <span className="font-medium">Output →</span> landing_page_videos table
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/70 mt-1">
                  The same ai-universal-processor and regional routing logic powers all 206 ecosystem pipelines.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={loadExistingScreenshots}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isAutoCapturing}
              >
                {isAutoCapturing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {captureProgress ? `${captureProgress.current}/${captureProgress.total}` : 'Preparing...'}
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    Capture Cast Screens
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Scan className="w-5 h-5 text-destructive" />
                  Capture Genie Cast Screens
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select which screens/tabs to capture. Each will be saved as a separate screenshot for the Cast product.
                </p>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {GENIE_CAST_SCREENS.map(screen => (
                    <div 
                      key={screen.id}
                      className={cn(
                        "flex items-start space-x-3 p-2 rounded-lg border transition-colors",
                        selectedScreens.includes(screen.id) 
                          ? "border-primary bg-primary/5" 
                          : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      <Checkbox
                        id={`main-${screen.id}`}
                        checked={selectedScreens.includes(screen.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedScreens(prev => [...prev, screen.id]);
                          } else {
                            setSelectedScreens(prev => prev.filter(id => id !== screen.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`main-${screen.id}`} className="font-medium text-sm cursor-pointer">
                          {screen.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {screen.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedScreens(GENIE_CAST_SCREENS.map(s => s.id))}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedScreens([])}
                  >
                    Deselect All
                  </Button>
                </div>
                <DialogClose asChild>
                  <Button
                    className="w-full gap-2"
                    onClick={handleAutoCaptureCast}
                    disabled={selectedScreens.length === 0}
                  >
                    <Camera className="w-4 h-4" />
                    Capture {selectedScreens.length} Screen{selectedScreens.length !== 1 ? 's' : ''}
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Preview Dialog */}
        <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Screenshot Preview</DialogTitle>
            </DialogHeader>
            {previewImage && (
              <div className="aspect-video">
                <img
                  src={previewImage.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MultiScreenshotGallery;
