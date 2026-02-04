/**
 * BRAND ASSETS PANEL
 * 
 * Functional UI for managing brand assets in Genie Cast:
 * - Product logos (8 official logos)
 * - Brand colors (primary, secondary, accent)
 * - Video templates
 * 
 * Integrates with brand-assets storage bucket
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Palette,
  Globe,
  Image,
  Check,
  AlertCircle,
  RefreshCw,
  Trash2,
  Download,
  Copy,
  Sparkles,
  Film,
} from 'lucide-react';
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
}

// 8 Official Products with their brand colors
const PRODUCT_BRAND_CONFIG: Record<GenieProductId, { name: string; primary: string; secondary: string; accent: string }> = {
  studio: { name: 'Genie Studio', primary: '#9333EA', secondary: '#A855F7', accent: '#C084FC' },
  spark: { name: 'Genie Spark', primary: '#F97316', secondary: '#FB923C', accent: '#FDBA74' },
  mind: { name: 'Genie Mind', primary: '#3B82F6', secondary: '#60A5FA', accent: '#93C5FD' },
  vibe: { name: 'Genie Vibe', primary: '#22C55E', secondary: '#4ADE80', accent: '#86EFAC' },
  deck: { name: 'Genie Deck', primary: '#EAB308', secondary: '#FACC15', accent: '#FDE047' },
  arc: { name: 'Genie Arc', primary: '#EC4899', secondary: '#F472B6', accent: '#F9A8D4' },
  cast: { name: 'Genie Cast', primary: '#EF4444', secondary: '#F87171', accent: '#FCA5A5' },
  ask_genie: { name: 'Ask Genie', primary: '#06B6D4', secondary: '#22D3EE', accent: '#67E8F9' },
};

// Template types
const VIDEO_TEMPLATES = [
  { id: 'product-demo', name: 'Product Demo', description: '9-chapter demo with hooks', chapters: 9 },
  { id: 'feature-spotlight', name: 'Feature Spotlight', description: 'Single feature focus', chapters: 5 },
  { id: 'comparison', name: 'Comparison', description: 'Side-by-side with competitor', chapters: 7 },
  { id: 'tutorial', name: 'Tutorial', description: 'Step-by-step walkthrough', chapters: 6 },
  { id: 'social-ad', name: 'Social Ad', description: 'Short-form for social', chapters: 3 },
  { id: 'testimonial', name: 'Testimonial', description: 'Customer success story', chapters: 4 },
];

interface LogoAsset {
  productId: GenieProductId;
  url: string | null;
  status: 'missing' | 'uploaded' | 'synced';
  lastUpdated?: string;
}

export const BrandAssetsPanel: React.FC<BrandAssetsPanelProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'logos' | 'colors' | 'templates'>('logos');
  const [logos, setLogos] = useState<LogoAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});

  // Load existing logos from storage
  const loadLogos = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: files, error } = await supabase.storage
        .from('brand-assets')
        .list('logos', { limit: 100 });

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

      const logoAssets: LogoAsset[] = Object.keys(PRODUCT_BRAND_CONFIG).map(productId => {
        const file = files?.find(f => f.name.toLowerCase().includes(productId.toLowerCase()));
        if (file) {
          const { data: urlData } = supabase.storage
            .from('brand-assets')
            .getPublicUrl(`logos/${file.name}`);
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

      setLogos(logoAssets);
    } catch (err) {
      console.error('[BrandAssets] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogos();
  }, [loadLogos]);

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

  // Upload custom logo
  const handleUploadLogo = async (productId: GenieProductId, file: File) => {
    try {
      const fileName = `logos/${productId}-logo.${file.name.split('.').pop()}`;
      
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logos" className="gap-1.5">
            <Image className="w-3.5 h-3.5" />
            Logos
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5">
            <Film className="w-3.5 h-3.5" />
            Templates
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
                        {logo.url ? (
                          <img 
                            src={logo.url} 
                            alt={config.name}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
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

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VIDEO_TEMPLATES.map((template) => (
              <Card key={template.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Film className="w-4 h-4 text-primary" />
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">
                      {template.chapters} chapters
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs gap-1">
                      <Download className="w-3 h-3" />
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Template Upload */}
          <Card className="mt-6 border-dashed">
            <CardContent className="py-8 text-center">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <h4 className="font-medium mb-1">Upload Custom Template</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Import your own video structure and chapter configurations
              </p>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandAssetsPanel;
