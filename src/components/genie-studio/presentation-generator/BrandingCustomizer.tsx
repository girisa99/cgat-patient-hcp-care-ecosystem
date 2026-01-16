/**
 * Branding Customizer - Logo upload and brand color customization
 * Supports logo upload, color extraction, and manual branding
 */

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Upload,
  Image as ImageIcon,
  Palette,
  Check,
  X,
  Trash2,
  Eye,
  Loader2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface BrandConfig {
  logo?: {
    url: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    size: 'small' | 'medium' | 'large';
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  companyName?: string;
  tagline?: string;
}

interface BrandingCustomizerProps {
  brandConfig: BrandConfig;
  onBrandConfigChange: (config: BrandConfig) => void;
  onExtractColorsFromLogo?: (logoUrl: string) => Promise<string[]>;
  className?: string;
}

const LOGO_POSITIONS = [
  { id: 'top-left', label: 'Top Left' },
  { id: 'top-right', label: 'Top Right' },
  { id: 'bottom-left', label: 'Bottom Left' },
  { id: 'bottom-right', label: 'Bottom Right' },
  { id: 'center', label: 'Center' }
];

const LOGO_SIZES = [
  { id: 'small', label: 'Small', size: '40px' },
  { id: 'medium', label: 'Medium', size: '60px' },
  { id: 'large', label: 'Large', size: '80px' }
];

const PRESET_COLORS = [
  { name: 'Blue', primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa' },
  { name: 'Green', primary: '#16a34a', secondary: '#22c55e', accent: '#4ade80' },
  { name: 'Purple', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
  { name: 'Red', primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
  { name: 'Orange', primary: '#ea580c', secondary: '#f97316', accent: '#fb923c' },
  { name: 'Teal', primary: '#0d9488', secondary: '#14b8a6', accent: '#2dd4bf' },
  { name: 'Pink', primary: '#db2777', secondary: '#ec4899', accent: '#f472b6' },
  { name: 'Slate', primary: '#475569', secondary: '#64748b', accent: '#94a3b8' }
];

export function BrandingCustomizer({
  brandConfig,
  onBrandConfigChange,
  onExtractColorsFromLogo,
  className
}: BrandingCustomizerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo must be under 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = async (event) => {
        const logoUrl = event.target?.result as string;
        
        onBrandConfigChange({
          ...brandConfig,
          logo: {
            url: logoUrl,
            position: brandConfig.logo?.position || 'top-left',
            size: brandConfig.logo?.size || 'medium'
          }
        });

        // Extract colors from logo if handler provided
        if (onExtractColorsFromLogo) {
          setIsExtractingColors(true);
          try {
            const colors = await onExtractColorsFromLogo(logoUrl);
            if (colors.length >= 3) {
              onBrandConfigChange({
                ...brandConfig,
                logo: {
                  url: logoUrl,
                  position: brandConfig.logo?.position || 'top-left',
                  size: brandConfig.logo?.size || 'medium'
                },
                colors: {
                  ...brandConfig.colors,
                  primary: colors[0],
                  secondary: colors[1],
                  accent: colors[2]
                }
              });
              toast.success('Colors extracted from logo!');
            }
          } catch (err) {
            console.error('Error extracting colors:', err);
          } finally {
            setIsExtractingColors(false);
          }
        }

        toast.success('Logo uploaded!');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  }, [brandConfig, onBrandConfigChange, onExtractColorsFromLogo]);

  const removeLogo = () => {
    onBrandConfigChange({
      ...brandConfig,
      logo: undefined
    });
  };

  const updateColor = (colorKey: keyof BrandConfig['colors'], value: string) => {
    onBrandConfigChange({
      ...brandConfig,
      colors: {
        ...brandConfig.colors,
        [colorKey]: value
      }
    });
  };

  const applyPresetColors = (preset: typeof PRESET_COLORS[0]) => {
    onBrandConfigChange({
      ...brandConfig,
      colors: {
        ...brandConfig.colors,
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent
      }
    });
    toast.success(`Applied ${preset.name} color preset`);
  };

  const updateLogoPosition = (position: BrandConfig['logo']['position']) => {
    if (!brandConfig.logo) return;
    onBrandConfigChange({
      ...brandConfig,
      logo: { ...brandConfig.logo, position }
    });
  };

  const updateLogoSize = (size: BrandConfig['logo']['size']) => {
    if (!brandConfig.logo) return;
    onBrandConfigChange({
      ...brandConfig,
      logo: { ...brandConfig.logo, size }
    });
  };

  return (
    <Card className={cn("border-muted", className)}>
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Brand Customization
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-4">
        {/* Logo Upload */}
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-2">
            <ImageIcon className="h-3 w-3" />
            Company Logo
          </Label>
          
          {brandConfig.logo?.url ? (
            <div className="space-y-2">
              {/* Logo Preview */}
              <div className="relative inline-block">
                <img
                  src={brandConfig.logo.url}
                  alt="Company logo"
                  className="max-h-16 max-w-32 object-contain rounded border p-1"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-5 w-5"
                  onClick={removeLogo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Logo Position */}
              <div className="flex flex-wrap gap-1">
                {LOGO_POSITIONS.map(pos => (
                  <Button
                    key={pos.id}
                    variant={brandConfig.logo?.position === pos.id ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => updateLogoPosition(pos.id as any)}
                  >
                    {pos.label}
                  </Button>
                ))}
              </div>

              {/* Logo Size */}
              <div className="flex gap-1">
                {LOGO_SIZES.map(size => (
                  <Button
                    key={size.id}
                    variant={brandConfig.logo?.size === size.id ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => updateLogoSize(size.id as any)}
                  >
                    {size.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="h-6 w-6 mx-auto mb-1 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
              )}
              <p className="text-xs text-muted-foreground">
                Click to upload logo
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                PNG, JPG, SVG up to 5MB
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>

        <Separator />

        {/* Company Info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Company Name</Label>
            <Input
              placeholder="Your Company"
              value={brandConfig.companyName || ''}
              onChange={(e) => onBrandConfigChange({ ...brandConfig, companyName: e.target.value })}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Tagline</Label>
            <Input
              placeholder="Your tagline"
              value={brandConfig.tagline || ''}
              onChange={(e) => onBrandConfigChange({ ...brandConfig, tagline: e.target.value })}
              className="h-7 text-xs"
            />
          </div>
        </div>

        <Separator />

        {/* Color Presets */}
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Color Presets
          </Label>
          <div className="grid grid-cols-4 gap-1">
            {PRESET_COLORS.map(preset => (
              <button
                key={preset.name}
                className="p-1.5 rounded border hover:border-primary/50 transition-all group"
                onClick={() => applyPresetColors(preset)}
                title={preset.name}
              >
                <div className="flex gap-0.5">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <p className="text-[8px] mt-0.5 text-muted-foreground group-hover:text-foreground">
                  {preset.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-2">
          <Label className="text-xs">Custom Brand Colors</Label>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(brandConfig.colors).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <Label className="text-[9px] text-muted-foreground capitalize">{key}</Label>
                <div className="relative">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => updateColor(key as any, e.target.value)}
                    className="w-full h-7 rounded cursor-pointer border"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-2">
            <Eye className="h-3 w-3" />
            Brand Preview
          </Label>
          <div 
            className="rounded-lg p-3 border"
            style={{ backgroundColor: brandConfig.colors.background }}
          >
            <div className="flex items-center gap-2 mb-2">
              {brandConfig.logo?.url && (
                <img
                  src={brandConfig.logo.url}
                  alt="Logo"
                  className="h-6 object-contain"
                />
              )}
              <span 
                className="font-semibold text-sm"
                style={{ color: brandConfig.colors.text }}
              >
                {brandConfig.companyName || 'Company Name'}
              </span>
            </div>
            <div className="flex gap-1">
              <div 
                className="px-2 py-0.5 rounded text-[10px] text-white"
                style={{ backgroundColor: brandConfig.colors.primary }}
              >
                Primary
              </div>
              <div 
                className="px-2 py-0.5 rounded text-[10px] text-white"
                style={{ backgroundColor: brandConfig.colors.secondary }}
              >
                Secondary
              </div>
              <div 
                className="px-2 py-0.5 rounded text-[10px] text-white"
                style={{ backgroundColor: brandConfig.colors.accent }}
              >
                Accent
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  colors: {
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#1f2937'
  }
};
