/**
 * BRAND ASSETS PANEL (UNIFIED)
 * 
 * Single source of truth for all visual/branding assets:
 * - Product logos (8 official logos)
 * - Screenshots (consolidated from Screenshots tab)
 * - Brand colors (primary, secondary, accent)
 * 
 * Templates are handled separately via the CREATE > Templates sub-tab.
 * Integrates with brand-assets and product-screenshots storage buckets
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Palette,
  Image,
  Check,
  AlertCircle,
  RefreshCw,
  Trash2,
  Copy,
  Sparkles,
  Camera,
  Eye,
  BarChart3,
} from 'lucide-react';
import { AssetInventoryTracker } from './AssetInventoryTracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { type GenieProductId, GENIE_PRODUCTS } from '@/services/marketing/productVersionTrackingService';


interface BrandAssetsPanelProps {
  className?: string;
  onScreenshotsUpdated?: (galleries: any[]) => void;
  /** Auto-filter assets to this product (from session context) */
  selectedProductId?: string;
}

// 8 Official Products with their brand colors
const PRODUCT_BRAND_CONFIG: Record<GenieProductId, { name: string; primary: string; secondary: string; accent: string }> = {
  studio: { name: 'Genie Suite', primary: '#9333EA', secondary: '#A855F7', accent: '#C084FC' },
  spark: { name: 'Genie Spark', primary: '#F97316', secondary: '#FB923C', accent: '#FDBA74' },
  mind: { name: 'Genie Mind', primary: '#3B82F6', secondary: '#60A5FA', accent: '#93C5FD' },
  vibe: { name: 'Genie Vibe', primary: '#22C55E', secondary: '#4ADE80', accent: '#86EFAC' },
  deck: { name: 'Genie Deck', primary: '#EAB308', secondary: '#FACC15', accent: '#FDE047' },
  arc: { name: 'Genie Hub', primary: '#10B981', secondary: '#34D399', accent: '#6EE7B7' },
  cast: { name: 'Genie Cast', primary: '#EF4444', secondary: '#F87171', accent: '#FCA5A5' },
  ask_genie: { name: 'Ask Genie', primary: '#06B6D4', secondary: '#22D3EE', accent: '#67E8F9' },
};

// VIDEO_TEMPLATES removed - now using database-driven BlueprintTemplatesGrid

interface LogoAsset {
  productId: GenieProductId;
  url: string | null;
  status: 'missing' | 'uploaded' | 'synced';
  lastUpdated?: string;
}

interface ScreenshotAsset {
  productId: string;
  url: string;
  name: string;
  createdAt: string;
}

export const BrandAssetsPanel: React.FC<BrandAssetsPanelProps> = ({ 
  className, 
  onScreenshotsUpdated,
  selectedProductId,
}) => {
  const [activeTab, setActiveTab] = useState<'logos' | 'screenshots' | 'colors' | 'inventory'>('logos');
  const [logos, setLogos] = useState<LogoAsset[]>([]);
  const [screenshots, setScreenshots] = useState<ScreenshotAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});

  // Load existing logos from storage - check root level (where files actually are)
  const loadLogos = useCallback(async () => {
    setIsLoading(true);
    try {
      // Files are stored at ROOT level, not in logos/ subfolder
      const { data: files, error } = await supabase.storage
        .from('brand-assets')
        .list('', { limit: 100 });

      if (error) {
        console.error('[BrandAssets] Error loading logos:', error);
        toast.error('Failed to load brand assets');
        // Initialize with empty state
        setLogos(Object.keys(PRODUCT_BRAND_CONFIG).map(id => ({
          productId: id as GenieProductId,
          url: null,
          status: 'missing',
        })));
        return;
      }

      console.log('[BrandAssets] Found files:', files?.length, files?.map(f => f.name));

      const logoAssets: LogoAsset[] = Object.keys(PRODUCT_BRAND_CONFIG).map(productId => {
        // Map ask_genie to ask-genie for file matching
        const searchId = productId === 'ask_genie' ? 'ask-genie' : productId;
        // Look for files like genie-spark-logo.png or genie-spark-logo.jpg
        const file = files?.find(f => 
          f.name.toLowerCase().includes(`genie-${searchId}-logo`) ||
          f.name.toLowerCase().includes(`${searchId}-logo`)
        );
        
        if (file) {
          // Get public URL from ROOT level
          const { data: urlData } = supabase.storage
            .from('brand-assets')
            .getPublicUrl(file.name);
          return {
            productId: productId as GenieProductId,
            url: urlData.publicUrl,
            status: 'synced' as const,
            lastUpdated: file.updated_at,
          };
        }
        return {
          productId: productId as GenieProductId,
          url: null,
          status: 'missing' as const,
        };
      });

      console.log('[BrandAssets] Logo assets:', logoAssets.map(l => `${l.productId}: ${l.status}`));
      setLogos(logoAssets);
    } catch (err) {
      console.error('[BrandAssets] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load screenshots from storage
  const loadScreenshots = useCallback(async () => {
    try {
      const { data: files, error } = await supabase.storage
        .from('product-screenshots')
        .list('screenshots', { limit: 100 });

      if (error) {
        console.error('[BrandAssets] Error loading screenshots:', error);
        return;
      }

      const screenshotAssets: ScreenshotAsset[] = (files || []).map(file => {
        const productId = file.name.split('-')[0];
        const { data: urlData } = supabase.storage
          .from('product-screenshots')
          .getPublicUrl(`screenshots/${file.name}`);
        return {
          productId,
          url: urlData.publicUrl,
          name: file.name,
          createdAt: file.created_at || '',
        };
      });

      setScreenshots(screenshotAssets);
      
      // Group by product for callback
      if (onScreenshotsUpdated) {
        const grouped = Object.keys(PRODUCT_BRAND_CONFIG).map(productId => ({
          productId,
          screenshots: screenshotAssets.filter(s => s.productId === productId),
        }));
        onScreenshotsUpdated(grouped);
      }
    } catch (err) {
      console.error('[BrandAssets] Screenshot load error:', err);
    }
  }, [onScreenshotsUpdated]);

  useEffect(() => {
    loadLogos();
    loadScreenshots();
  }, [loadLogos, loadScreenshots]);

  // Sync official logos
  const handleSyncLogos = async () => {
    setIsSyncing(true);
    try {
      toast.info('Syncing official product logos...');
      
      // Call edge function to sync logos (if exists)
      const { data, error } = await supabase.functions.invoke('generate-brand-assets', {
        body: { action: 'sync-logos' }
      });

      if (error) {
        throw error;
      }

      toast.success('Logos synced successfully');
      await loadLogos();
    } catch (err) {
      console.error('[BrandAssets] Sync error:', err);
      toast.error('Sync failed. Make sure storage bucket exists.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Upload custom logo - upload to ROOT level
  const handleUploadLogo = async (productId: GenieProductId, file: File) => {
    try {
      // Map ask_genie to ask-genie for consistent naming
      const fileId = productId === 'ask_genie' ? 'ask-genie' : productId;
      const extension = file.name.split('.').pop() || 'png';
      const fileName = `genie-${fileId}-logo.${extension}`;
      
      const { error } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      toast.success(`${PRODUCT_BRAND_CONFIG[productId].name} logo uploaded`);
      await loadLogos();
    } catch (err) {
      console.error('[BrandAssets] Upload error:', err);
      toast.error('Upload failed');
    }
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`${color} copied to clipboard`);
  };

  const syncedCount = logos.filter(l => l.status === 'synced').length;
  const totalProducts = Object.keys(PRODUCT_BRAND_CONFIG).length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Brand Assets Manager
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage logos, colors, and templates for video production
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Image className="w-3 h-3" />
            {syncedCount}/{totalProducts} Logos
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncLogos}
            disabled={isSyncing}
            className="gap-1.5"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
            Sync Logos
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logos" className="gap-1.5">
            <Image className="w-3.5 h-3.5" />
            Logos
            <Badge variant="secondary" className="ml-1 text-[10px] px-1">{syncedCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="screenshots" className="gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            Screenshots
            <Badge variant="secondary" className="ml-1 text-[10px] px-1">{screenshots.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Colors
          </TabsTrigger>
        </TabsList>

        {/* Logos Tab */}
        <TabsContent value="logos" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {logos.map((logo) => {
                const config = PRODUCT_BRAND_CONFIG[logo.productId];
                return (
                  <Card 
                    key={logo.productId}
                    className={cn(
                      "relative overflow-hidden transition-all",
                      logo.status === 'synced' && "border-green-200 bg-green-50/30 dark:bg-green-950/10",
                      logo.status === 'missing' && "border-dashed"
                    )}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Logo Preview */}
                      <div 
                        className="aspect-square rounded-lg flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: `${config.primary}15` }}
                      >
                        {logo.url && logo.status === 'synced' ? (
                          <img 
                            src={`${logo.url}?t=${Date.now()}`} 
                            alt={config.name}
                            className="w-full h-full object-contain p-2"
                            loading="lazy"
                            onError={(e) => {
                              console.log(`[BrandAssets] Image load failed for ${logo.productId}:`, logo.url);
                              // Try alternative extension
                              const currentSrc = e.currentTarget.src;
                              if (currentSrc.includes('.png')) {
                                e.currentTarget.src = currentSrc.replace('.png', '.jpg').split('?')[0];
                              } else if (currentSrc.includes('.jpg')) {
                                e.currentTarget.src = currentSrc.replace('.jpg', '.png').split('?')[0];
                              } else {
                                e.currentTarget.style.display = 'none';
                              }
                            }}
                          />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">No logo</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="text-center">
                        <p className="text-sm font-medium">{config.name}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {logo.status === 'synced' ? (
                            <Badge variant="outline" className="text-[10px] text-green-600 border-green-200">
                              <Check className="w-2.5 h-2.5 mr-0.5" />
                              Synced
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200">
                              <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
                              Missing
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Upload Button */}
                      <div className="pt-2">
                        <Label 
                          htmlFor={`upload-${logo.productId}`}
                          className="cursor-pointer"
                        >
                          <Button variant="outline" size="sm" className="w-full text-xs gap-1" asChild>
                            <span>
                              <Upload className="w-3 h-3" />
                              {logo.url ? 'Replace' : 'Upload'}
                            </span>
                          </Button>
                        </Label>
                        <input
                          id={`upload-${logo.productId}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadLogo(logo.productId, file);
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Sync Progress */}
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Sparkles className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Logo Coverage</h4>
                    <span className="text-sm text-muted-foreground">
                      {syncedCount}/{totalProducts} products
                    </span>
                  </div>
                  <Progress value={(syncedCount / totalProducts) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Screenshots Tab */}
        <TabsContent value="screenshots" className="mt-6">
          <div className="space-y-4">
            {/* Screenshot Grid by Product */}
            {Object.entries(PRODUCT_BRAND_CONFIG).map(([productId, config]) => {
              const productScreenshots = screenshots.filter(s => s.productId === productId);
              
              return (
                <Card key={productId}>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: config.primary }}
                        />
                        {config.name}
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          {productScreenshots.length} screenshots
                        </Badge>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {productScreenshots.length > 0 ? (
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {productScreenshots.map((screenshot, idx) => (
                          <div 
                            key={screenshot.name}
                            className="aspect-video rounded-md border overflow-hidden bg-muted relative group"
                          >
                            <img 
                              src={screenshot.url}
                              alt={`${config.name} screenshot ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-white">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-white">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <Badge 
                              className="absolute bottom-1 left-1 text-[8px] px-1 py-0"
                              variant="secondary"
                            >
                              {idx + 1}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Camera className="w-6 h-6 mx-auto mb-2 opacity-30" />
                        <p className="text-xs">No screenshots captured yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* Total Summary */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Camera className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Screenshot Coverage</h4>
                      <span className="text-sm text-muted-foreground">
                        {screenshots.length} total across {Object.keys(PRODUCT_BRAND_CONFIG).length} products
                      </span>
                    </div>
                    <Progress 
                      value={(Object.keys(PRODUCT_BRAND_CONFIG).filter(p => 
                        screenshots.some(s => s.productId === p)
                      ).length / Object.keys(PRODUCT_BRAND_CONFIG).length) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={loadScreenshots} className="gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="mt-6">
          <AssetInventoryTracker />
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(PRODUCT_BRAND_CONFIG).map(([productId, config]) => (
              <Card key={productId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: config.primary }}
                    />
                    {config.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Primary */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: config.primary }}
                      />
                      <span className="text-xs">Primary</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => copyColor(config.primary)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  {/* Secondary */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: config.secondary }}
                      />
                      <span className="text-xs">Secondary</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => copyColor(config.secondary)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  {/* Accent */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: config.accent }}
                      />
                      <span className="text-xs">Accent</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => copyColor(config.accent)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default BrandAssetsPanel;
