/**
 * Layer 0: CONTEXT
 * Brand Kit | Project History | User Preferences | Team Style
 */

import React, { useState } from 'react';
import { 
  Palette, History, Settings, Users, ChevronDown, 
  Check, Image, Type, Mic, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useEditor } from '../context/EditorContext';
import type { BrandKit, TeamStyle } from '../types';

// ============================================================================
// BRAND KIT SELECTOR
// ============================================================================

interface BrandKitSelectorProps {
  brandKits: BrandKit[];
  activeBrandKit?: BrandKit;
  onSelect: (kit: BrandKit) => void;
  className?: string;
}

export function BrandKitSelector({ 
  brandKits, 
  activeBrandKit, 
  onSelect,
  className 
}: BrandKitSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <Palette className="h-4 w-4" />
          <span className="max-w-[100px] truncate">
            {activeBrandKit?.name || 'Select Brand'}
          </span>
          {activeBrandKit && (
            <div 
              className="h-3 w-3 rounded-full border" 
              style={{ backgroundColor: activeBrandKit.primaryColor }}
            />
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {brandKits.map((kit) => (
          <DropdownMenuItem
            key={kit.id}
            onClick={() => onSelect(kit)}
            className="gap-2"
          >
            <div className="flex gap-1">
              <div 
                className="h-4 w-4 rounded-sm" 
                style={{ backgroundColor: kit.primaryColor }}
              />
              <div 
                className="h-4 w-4 rounded-sm" 
                style={{ backgroundColor: kit.secondaryColor }}
              />
            </div>
            <span className="flex-1 truncate">{kit.name}</span>
            {activeBrandKit?.id === kit.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// PROJECT HISTORY
// ============================================================================

interface ProjectHistoryProps {
  className?: string;
}

export function ProjectHistory({ className }: ProjectHistoryProps) {
  const { project } = useEditor();
  const [isOpen, setIsOpen] = useState(false);

  const recentProjects = project.context.projectHistory.slice(0, 5);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Recent Projects</span>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {recentProjects.length}
          </Badge>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-1">
        {recentProjects.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-4 text-center">
            No recent projects
          </p>
        ) : (
          recentProjects.map((proj) => (
            <button
              key={proj.id}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-left text-sm"
            >
              {proj.thumbnail ? (
                <img 
                  src={proj.thumbnail} 
                  alt="" 
                  className="h-8 w-12 rounded object-cover"
                />
              ) : (
                <div className="h-8 w-12 rounded bg-muted flex items-center justify-center">
                  <Image className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-xs">{proj.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(proj.lastEditedAt).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// USER PREFERENCES QUICK ACCESS
// ============================================================================

interface UserPreferencesQuickProps {
  className?: string;
}

export function UserPreferencesQuick({ className }: UserPreferencesQuickProps) {
  const { project } = useEditor();
  const { userPreferences } = project.context;

  const presets = [
    { key: 'speed', label: 'Speed', icon: '⚡', active: userPreferences.qualityPreset === 'speed' },
    { key: 'balanced', label: 'Balanced', icon: '⚖️', active: userPreferences.qualityPreset === 'balanced' },
    { key: 'quality', label: 'Quality', icon: '✨', active: userPreferences.qualityPreset === 'quality' },
  ];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {presets.map((preset) => (
        <Button
          key={preset.key}
          variant={preset.active ? "secondary" : "ghost"}
          size="sm"
          className="h-7 px-2 text-xs"
        >
          <span className="mr-1">{preset.icon}</span>
          {preset.label}
        </Button>
      ))}
    </div>
  );
}

// ============================================================================
// TEAM STYLE INDICATOR
// ============================================================================

interface TeamStyleIndicatorProps {
  teamStyle?: TeamStyle;
  className?: string;
}

export function TeamStyleIndicator({ teamStyle, className }: TeamStyleIndicatorProps) {
  if (!teamStyle) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/5 border border-primary/10",
      className
    )}>
      <Users className="h-4 w-4 text-primary" />
      <span className="text-xs font-medium">{teamStyle.name}</span>
      <div className="flex gap-0.5">
        <div 
          className="h-3 w-3 rounded-full" 
          style={{ backgroundColor: teamStyle.brandKit.primaryColor }}
        />
        <div 
          className="h-3 w-3 rounded-full" 
          style={{ backgroundColor: teamStyle.brandKit.secondaryColor }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// COMPLETE LAYER 0 BAR
// ============================================================================

interface Layer0ContextBarProps {
  className?: string;
}

export function Layer0ContextBar({ className }: Layer0ContextBarProps) {
  const { project } = useEditor();
  
  // Mock brand kits - would come from API/context
  const mockBrandKits: BrandKit[] = [
    {
      id: '1',
      name: 'Corporate Blue',
      primaryColor: '#2563eb',
      secondaryColor: '#3b82f6',
      accentColor: '#60a5fa',
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    {
      id: '2',
      name: 'Healthcare Green',
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      accentColor: '#34d399',
      fonts: { heading: 'Plus Jakarta Sans', body: 'Inter' },
    },
    {
      id: '3',
      name: 'Tech Purple',
      primaryColor: '#7c3aed',
      secondaryColor: '#8b5cf6',
      accentColor: '#a78bfa',
      fonts: { heading: 'Space Grotesk', body: 'Inter' },
    },
  ];

  return (
    <div className={cn(
      "flex items-center justify-between gap-4 px-4 py-2 bg-muted/30 border-b",
      className
    )}>
      {/* Left: Brand & Team */}
      <div className="flex items-center gap-3">
        <BrandKitSelector
          brandKits={mockBrandKits}
          activeBrandKit={project.context.brandKit}
          onSelect={(kit) => console.log('Selected brand kit:', kit)}
        />
        <TeamStyleIndicator teamStyle={project.context.teamStyle} />
      </div>

      {/* Center: Quick Preferences */}
      <UserPreferencesQuick />

      {/* Right: History & Settings */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default Layer0ContextBar;
