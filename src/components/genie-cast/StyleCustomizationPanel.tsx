/**
 * StyleCustomizationPanel — AI-generated style previews, file uploads, character sizing, custom style creation
 * 
 * Features:
 * 1. AI-generate style preview from user prompt (preview first, then save)
 * 2. Upload own reference image/video/SVG/PSD (override style visual)
 * 3. Character frame percentage slider (10-100%)
 * 4. Custom style creation with save toggle (persistent vs one-off)
 * 5. Regional/cultural fit awareness
 * 
 * Reusable across all styles and sub-styles in the ecosystem.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Upload, Image, Wand2, Save, X, Plus, Sliders, Eye,
  ChevronDown, ChevronUp, FileImage, Video, FileCode, File, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { quickEnhance } from '@/services/promptEnhancementEngine';
import type { VisualStyle } from '@/hooks/useCastContentRegistry';

interface StyleCustomizationPanelProps {
  selectedStyles: VisualStyle[];
  allStyles: VisualStyle[];
  characterFramePercent: number;
  onCharacterFrameChange: (percent: number) => void;
  onStyleCreated: () => void; // refresh registry
  onPreviewGenerated?: (styleId: string, imageUrl: string) => void;
  className?: string;
}

const UPLOAD_ACCEPT = {
  'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
  'image/svg+xml': ['.svg'],
  'video/*': ['.mp4', '.webm', '.mov'],
  'application/pdf': ['.pdf'],
  'application/octet-stream': ['.psd', '.ai'],
};

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  image: <FileImage className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  svg: <FileCode className="w-4 h-4" />,
  pdf: <File className="w-4 h-4" />,
  psd: <File className="w-4 h-4" />,
};

export const StyleCustomizationPanel: React.FC<StyleCustomizationPanelProps> = ({
  selectedStyles,
  allStyles,
  characterFramePercent,
  onCharacterFrameChange,
  onStyleCreated,
  onPreviewGenerated,
  className,
}) => {
  // AI generation state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string | null>(null);
  const [previewTargetStyleId, setPreviewTargetStyleId] = useState<string | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // Upload state
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Custom style creation state
  const [showCustomCreate, setShowCustomCreate] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('custom');
  const [saveGlobally, setSaveGlobally] = useState(false);
  const [isCreatingStyle, setIsCreatingStyle] = useState(false);

  // Sections collapsed state
  const [expandedSections, setExpandedSections] = useState({
    aiPreview: true,
    upload: false,
    sizing: true,
    customCreate: false,
  });

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ═══ ENHANCE PROMPT (local, instant) ═══
  const handleEnhancePrompt = useCallback(() => {
    if (!aiPrompt.trim()) return;
    try {
      const enhanced = quickEnhance({
        rawPrompt: aiPrompt,
        format: 'style_preview' as any,
        mode: 'auto',
      });
      if (enhanced.enhancedPrompt && enhanced.enhancedPrompt !== aiPrompt) {
        setAiPrompt(enhanced.enhancedPrompt);
        toast.success('Prompt enhanced');
      } else {
        toast.info('Prompt is already well-crafted');
      }
    } catch {
      toast.info('Enhancement unavailable — using original prompt');
    }
  }, [aiPrompt]);

  // ═══ AI GENERATE PREVIEW ═══
  const handleGeneratePreview = useCallback(async (targetStyleId?: string) => {
    if (!aiPrompt.trim()) {
      toast.error('Please describe the style you want');
      return;
    }
    setIsGeneratingPreview(true);
    setPreviewTargetStyleId(targetStyleId || null);
    try {
      const styleLabel = targetStyleId
        ? allStyles.find(s => s.id === targetStyleId)?.label
        : 'custom style';
      // Enhance prompt before sending to image generation
      let enhancedText = aiPrompt;
      try {
        const enhanced = quickEnhance({
          rawPrompt: aiPrompt,
          format: 'style_preview' as any,
          mode: 'auto',
        });
        if (enhanced.enhancedPrompt) enhancedText = enhanced.enhancedPrompt;
      } catch { /* use original if enhancement fails */ }
      const fullPrompt = `Style preview for "${styleLabel}": ${enhancedText}. Create a visually representative sample image that showcases this visual style. The image should be IP-safe, non-photorealistic, and demonstrate the aesthetic clearly.`;

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          action: 'image_generation',
          imageGeneration: true,
          prompt: fullPrompt,
          style: styleLabel,
          aspectRatio: '16:9',
          ip_safe: true,
        },
      });
      if (error) throw error;

      const imageUrl = data?.image_url || data?.imageUrl || data?.url || data?.preview_url;
      if (imageUrl) {
        setGeneratedPreviewUrl(imageUrl);
        setShowPreviewDialog(true); // Auto-open popup
        toast.success('Preview generated!');
        onPreviewGenerated?.(targetStyleId || '', imageUrl);
      } else {
        toast.info('AI preview generation queued — image will appear when ready');
        setGeneratedPreviewUrl(null);
      }
    } catch (err: any) {
      console.error('[StyleCustomization] AI preview failed:', err);
      toast.error('Preview generation failed — try again or upload manually');
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [aiPrompt, allStyles, onPreviewGenerated]);

  // ═══ SAVE GENERATED PREVIEW TO STYLE ═══
  const handleSavePreviewToStyle = useCallback(async (styleId: string) => {
    if (!generatedPreviewUrl) return;
    try {
      const { error } = await supabase
        .from('cast_visual_styles')
        .update({ preview_image_url: generatedPreviewUrl } as any)
        .eq('id', styleId);
      if (error) throw error;
      toast.success('Preview saved to style');
      onStyleCreated(); // refresh
    } catch (err: any) {
      toast.error('Failed to save preview');
    }
  }, [generatedPreviewUrl, onStyleCreated]);

  // ═══ FILE UPLOAD ═══
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let fileType = 'image';
    if (['mp4', 'webm', 'mov'].includes(ext)) fileType = 'video';
    else if (ext === 'svg') fileType = 'svg';
    else if (ext === 'pdf') fileType = 'pdf';
    else if (['psd', 'ai'].includes(ext)) fileType = 'psd';

    setIsUploading(true);
    try {
      const filePath = `style-references/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('cast-assets')
        .upload(filePath, file, { upsert: true });
      
      if (error) {
        // If bucket doesn't exist, show informative message
        if (error.message?.includes('not found')) {
          toast.error('Storage bucket "cast-assets" not configured yet. Contact admin.');
        } else {
          throw error;
        }
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('cast-assets')
        .getPublicUrl(filePath);
      
      setUploadedFileUrl(publicUrl);
      setUploadedFileType(fileType);
      toast.success(`${fileType} uploaded — apply to a style or use for custom creation`);
    } catch (err: any) {
      console.error('[StyleCustomization] Upload failed:', err);
      toast.error('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  }, []);

  // ═══ APPLY UPLOAD TO STYLE ═══
  const handleApplyUploadToStyle = useCallback(async (styleId: string) => {
    if (!uploadedFileUrl) return;
    try {
      const { error } = await supabase
        .from('cast_visual_styles')
        .update({ 
          uploaded_reference_url: uploadedFileUrl,
          uploaded_reference_type: uploadedFileType,
          preview_image_url: uploadedFileType === 'image' ? uploadedFileUrl : undefined,
        } as any)
        .eq('id', styleId);
      if (error) throw error;
      toast.success('Reference applied to style');
      onStyleCreated();
    } catch (err: any) {
      toast.error('Failed to apply reference');
    }
  }, [uploadedFileUrl, uploadedFileType, onStyleCreated]);

  // ═══ CREATE CUSTOM STYLE ═══
  const handleCreateCustomStyle = useCallback(async () => {
    if (!customName.trim()) {
      toast.error('Please name your custom style');
      return;
    }
    setIsCreatingStyle(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const styleName = customName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      
      const { error } = await supabase
        .from('cast_visual_styles')
        .insert({
          name: `custom_${styleName}_${Date.now()}`,
          label: customName,
          category: customCategory,
          icon: 'Palette',
          ip_safe: true,
          is_active: true,
          sort_order: 999,
          sub_sort_order: 0,
          complexity_score: 5,
          estimated_size_mb: 80,
          render_time_estimate: 'medium',
          character_frame_percent: characterFramePercent,
          is_user_created: true,
          created_by: user?.id || null,
          is_saved_globally: saveGlobally,
          custom_prompt: aiPrompt || null,
          uploaded_reference_url: uploadedFileUrl,
          uploaded_reference_type: uploadedFileType,
          preview_image_url: generatedPreviewUrl || (uploadedFileType === 'image' ? uploadedFileUrl : null),
        } as any);

      if (error) throw error;
      toast.success(`Custom style "${customName}" created${saveGlobally ? ' (saved globally)' : ' (project-only)'}`);
      setCustomName('');
      setAiPrompt('');
      setShowCustomCreate(false);
      onStyleCreated();
    } catch (err: any) {
      console.error('[StyleCustomization] Create failed:', err);
      toast.error('Failed to create custom style');
    } finally {
      setIsCreatingStyle(false);
    }
  }, [customName, customCategory, saveGlobally, characterFramePercent, aiPrompt, uploadedFileUrl, uploadedFileType, generatedPreviewUrl, onStyleCreated]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* ═══ AI PREVIEW GENERATOR ═══ */}
      <div className="space-y-2">
        <button onClick={() => toggleSection('aiPreview')} className="flex items-center justify-between w-full text-left">
          <Label className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
            <Wand2 className="w-3.5 h-3.5 text-primary" />
            AI Style Preview Generator
          </Label>
          {expandedSections.aiPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        <AnimatePresence>
          {expandedSections.aiPreview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2"
            >
              <textarea
                className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                placeholder="Describe the visual style you want... e.g. 'Warm watercolor aesthetic with Islamic geometric patterns for Ramadan campaign' or 'Neon cyberpunk with Japanese kanji overlays'"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={handleEnhancePrompt}
                  disabled={!aiPrompt.trim()}
                >
                  <Wand2 className="w-3 h-3" /> Enhance
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => handleGeneratePreview(selectedStyles[0]?.id)}
                  disabled={isGeneratingPreview || !aiPrompt.trim()}
                >
                  {isGeneratingPreview ? (
                    <>
                      <span className="animate-spin">⏳</span> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" /> Preview
                    </>
                  )}
                </Button>
                <span className="text-[10px] text-muted-foreground">IP-safe • No trademarks • Cultural-aware</span>
              </div>
              {/* Generated preview thumbnail — click to open full popup */}
              {generatedPreviewUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border overflow-hidden bg-muted/20 cursor-pointer"
                  onClick={() => setShowPreviewDialog(true)}
                >
                  <img src={generatedPreviewUrl} alt="AI Generated Preview" className="w-full h-32 object-cover" />
                  <div className="p-2 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Click to enlarge</span>
                    <div className="flex gap-1.5">
                      {selectedStyles.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-6 gap-1"
                          onClick={(e) => { e.stopPropagation(); handleSavePreviewToStyle(selectedStyles[0].id); }}
                        >
                          <Save className="w-3 h-3" /> Save to {selectedStyles[0].label}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] h-6"
                        onClick={(e) => { e.stopPropagation(); setGeneratedPreviewUrl(null); }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Full-size preview popup dialog */}
              <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-sm flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-primary" />
                      AI Style Preview
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      {aiPrompt || 'Generated style preview'}
                    </DialogDescription>
                  </DialogHeader>
                  {generatedPreviewUrl && (
                    <div className="space-y-3">
                      <img
                        src={generatedPreviewUrl}
                        alt="AI Generated Style Preview"
                        className="w-full rounded-lg border"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">IP-safe AI-generated preview</span>
                        <div className="flex gap-2">
                          {selectedStyles.length > 0 && (
                            <Button
                              variant="default"
                              size="sm"
                              className="text-xs gap-1.5"
                              onClick={() => {
                                handleSavePreviewToStyle(selectedStyles[0].id);
                                setShowPreviewDialog(false);
                              }}
                            >
                              <Save className="w-3.5 h-3.5" /> Save to {selectedStyles[0].label}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs gap-1.5"
                            onClick={() => handleGeneratePreview(previewTargetStyleId || selectedStyles[0]?.id)}
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Regenerate
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => { setGeneratedPreviewUrl(null); setShowPreviewDialog(false); }}
                          >
                            Discard
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Separator />

      {/* ═══ UPLOAD REFERENCE ═══ */}
      <div className="space-y-2">
        <button onClick={() => toggleSection('upload')} className="flex items-center justify-between w-full text-left">
          <Label className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-primary" />
            Upload Your Own Reference
          </Label>
          {expandedSections.upload ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        <AnimatePresence>
          {expandedSections.upload && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2"
            >
              <div className="flex gap-2 flex-wrap text-[10px] text-muted-foreground">
                {[
                  { type: 'image', label: 'PNG/JPG/WEBP', icon: '🖼️' },
                  { type: 'svg', label: 'SVG/Vector', icon: '📐' },
                  { type: 'video', label: 'MP4/WEBM', icon: '🎬' },
                  { type: 'pdf', label: 'PDF', icon: '📄' },
                  { type: 'psd', label: 'PSD/AI', icon: '🎨' },
                ].map(ft => (
                  <Badge key={ft.type} variant="outline" className="text-[9px] px-1.5">
                    {ft.icon} {ft.label}
                  </Badge>
                ))}
              </div>
              <label className={cn(
                "flex flex-col items-center justify-center h-20 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                isUploading ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/50"
              )}>
                <input
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.webp,.svg,.mp4,.webm,.mov,.pdf,.psd,.ai"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <span className="text-xs text-primary animate-pulse">Uploading...</span>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">Drop file or click to browse</span>
                  </>
                )}
              </label>
              {/* Uploaded file preview */}
              {uploadedFileUrl && (
                <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/20">
                  {uploadedFileType === 'image' || uploadedFileType === 'svg' ? (
                    <img src={uploadedFileUrl} alt="Uploaded" className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                      {FILE_TYPE_ICONS[uploadedFileType || 'image']}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium truncate">{uploadedFileType?.toUpperCase()} reference</p>
                    <p className="text-[9px] text-muted-foreground">Ready to apply</p>
                  </div>
                  <div className="flex gap-1">
                    {selectedStyles.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] h-6 gap-1"
                        onClick={() => handleApplyUploadToStyle(selectedStyles[0].id)}
                      >
                        <Check className="w-3 h-3" /> Apply
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] h-6"
                      onClick={() => { setUploadedFileUrl(null); setUploadedFileType(null); }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Separator />

      {/* ═══ CHARACTER FRAME SIZE (Percentage Slider) ═══ */}
      <div className="space-y-2">
        <button onClick={() => toggleSection('sizing')} className="flex items-center justify-between w-full text-left">
          <Label className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
            <Sliders className="w-3.5 h-3.5 text-primary" />
            Character / Element Frame Size
          </Label>
          {expandedSections.sizing ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        <AnimatePresence>
          {expandedSections.sizing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3"
            >
              <p className="text-[10px] text-muted-foreground">
                How much of the frame should the character/element occupy? Affects PPT, cinematic, video, social compositions.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Slider
                    value={[characterFramePercent]}
                    onValueChange={([v]) => onCharacterFrameChange(v)}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="w-14 text-center">
                  <span className="text-lg font-bold text-primary">{characterFramePercent}%</span>
                </div>
              </div>
              {/* Visual reference badges */}
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { pct: 15, label: 'Tiny', desc: 'Background element' },
                  { pct: 30, label: 'Small', desc: 'Supporting role' },
                  { pct: 50, label: 'Medium', desc: 'Balanced' },
                  { pct: 75, label: 'Large', desc: 'Prominent' },
                  { pct: 100, label: 'Full', desc: 'Full frame' },
                ].map(ref => (
                  <Badge
                    key={ref.pct}
                    variant={characterFramePercent === ref.pct ? 'default' : 'outline'}
                    className="text-[9px] cursor-pointer"
                    onClick={() => onCharacterFrameChange(ref.pct)}
                  >
                    {ref.label} ({ref.pct}%)
                  </Badge>
                ))}
              </div>
              {/* Preview indicator */}
              <div className="relative h-16 rounded-lg border bg-muted/30 overflow-hidden">
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-primary/20 border border-primary/30 rounded-t-lg transition-all duration-300"
                  style={{
                    width: `${characterFramePercent}%`,
                    height: `${characterFramePercent}%`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] text-primary font-medium">
                    {characterFramePercent}%
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Separator />

      {/* ═══ CUSTOM STYLE CREATION ═══ */}
      <div className="space-y-2">
        <button onClick={() => { toggleSection('customCreate'); setShowCustomCreate(!showCustomCreate); }} className="flex items-center justify-between w-full text-left">
          <Label className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5 text-primary" />
            Create Custom Style
          </Label>
          {expandedSections.customCreate ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        <AnimatePresence>
          {expandedSections.customCreate && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3"
            >
              <p className="text-[10px] text-muted-foreground">
                Create from AI prompt or uploaded reference. Works across all output types (PPT, video, social, web).
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Style name (e.g. 'Ramadan Elegance', 'Tokyo Neon')"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <select
                  className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                >
                  <option value="custom">Custom</option>
                  <option value="cinematic">Cinematic</option>
                  <option value="artistic">Artistic</option>
                  <option value="corporate">Corporate</option>
                  <option value="cultural">Cultural / Regional</option>
                  <option value="religious">Religious / Spiritual</option>
                  <option value="seasonal">Seasonal / Holiday</option>
                  <option value="gaming">Gaming / Immersive</option>
                  <option value="education">Education</option>
                  <option value="ecommerce">E-Commerce</option>
                </select>
              </div>
              {/* Save toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Save globally?</Label>
                  <p className="text-[9px] text-muted-foreground">
                    {saveGlobally 
                      ? 'Reusable across all projects in ecosystem' 
                      : 'One-off for this project only'}
                  </p>
                </div>
                <Switch checked={saveGlobally} onCheckedChange={setSaveGlobally} />
              </div>
              {/* What's included */}
              <div className="flex gap-1.5 flex-wrap">
                {aiPrompt && <Badge variant="secondary" className="text-[9px]">🤖 AI Prompt</Badge>}
                {uploadedFileUrl && <Badge variant="secondary" className="text-[9px]">📎 Reference File</Badge>}
                {generatedPreviewUrl && <Badge variant="secondary" className="text-[9px]">🖼️ Generated Preview</Badge>}
                <Badge variant="secondary" className="text-[9px]">📏 {characterFramePercent}% frame</Badge>
              </div>
              <Button
                className="w-full gap-1.5 text-xs"
                onClick={handleCreateCustomStyle}
                disabled={isCreatingStyle || !customName.trim()}
              >
                {isCreatingStyle ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Create {saveGlobally ? 'Global' : 'Project'} Style
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
