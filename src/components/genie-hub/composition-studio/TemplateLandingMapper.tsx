/**
 * TEMPLATE-LANDING PAGE MAPPER
 * 
 * Visual component showing which templates map to which landing page sections.
 * Provides admin control over template-section alignment and user interactivity settings.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  ArrowRight, Globe, Play, Eye, Edit3, Trash2, Plus,
  Sparkles, Video, User, Box, FileVideo, MapPin, Settings,
  Monitor, Smartphone, MousePointer, Check, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TEMPLATE_DEFINITIONS, LANDING_PAGE_SECTIONS, LandingPageSection } from './TemplatePreviewDialog';

interface TemplateLandingMapperProps {
  onSelectTemplate?: (templateId: string) => void;
  onEditTemplate?: (templateId: string) => void;
  className?: string;
}

interface MappingItem {
  templateId: string;
  sectionId: LandingPageSection;
  isActive: boolean;
  userInteractive: boolean;
}

export const TemplateLandingMapper: React.FC<TemplateLandingMapperProps> = ({
  onSelectTemplate,
  onEditTemplate,
  className,
}) => {
  // Map templates to their landing sections
  const [mappings, setMappings] = useState<MappingItem[]>(() => {
    return TEMPLATE_DEFINITIONS.map(template => {
      // Determine section ID from template's landingPageSection text
      const sectionId = getSectionIdFromLabel(template.landingPageSection);
      const sectionConfig = LANDING_PAGE_SECTIONS[sectionId];
      
      return {
        templateId: template.id,
        sectionId,
        isActive: true,
        userInteractive: sectionConfig?.userInteractive || false,
      };
    });
  });

  const toggleMapping = (templateId: string, field: 'isActive' | 'userInteractive') => {
    setMappings(prev => prev.map(m => 
      m.templateId === templateId 
        ? { ...m, [field]: !m[field] }
        : m
    ));
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Template → Landing Page Mapping
            </CardTitle>
            <CardDescription>
              Visual overview of which templates populate which landing page sections
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Template
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {/* Group by landing section */}
            {Object.entries(LANDING_PAGE_SECTIONS).map(([sectionId, section]) => {
              const sectionTemplates = TEMPLATE_DEFINITIONS.filter(t => {
                const mapping = mappings.find(m => m.templateId === t.id);
                return mapping?.sectionId === sectionId;
              });

              if (sectionTemplates.length === 0) return null;

              return (
                <div key={sectionId} className="space-y-3">
                  {/* Section Header */}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{section.label}</h3>
                        <p className="text-xs text-muted-foreground">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {section.userInteractive && (
                        <Badge variant="secondary" className="gap-1">
                          <MousePointer className="w-3 h-3" />
                          User Interactive
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {section.component}
                      </Badge>
                    </div>
                  </div>

                  {/* Templates for this section */}
                  <div className="ml-6 space-y-2">
                    {sectionTemplates.map(template => {
                      const mapping = mappings.find(m => m.templateId === template.id);
                      
                      return (
                        <div 
                          key={template.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border transition-all",
                            mapping?.isActive 
                              ? "bg-card border-primary/30" 
                              : "bg-muted/30 border-transparent opacity-60"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                              {template.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{template.label}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {template.chapters.length} chapters
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {Math.floor(template.totalDuration / 60)}:{(template.totalDuration % 60).toString().padStart(2, '0')} • {template.regionalSupport[0]}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* User interactive toggle */}
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`interactive-${template.id}`} className="text-xs text-muted-foreground">
                                Interactive
                              </Label>
                              <Switch
                                id={`interactive-${template.id}`}
                                checked={mapping?.userInteractive || false}
                                onCheckedChange={() => toggleMapping(template.id, 'userInteractive')}
                                disabled={!section.userInteractive}
                              />
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`active-${template.id}`} className="text-xs text-muted-foreground">
                                Active
                              </Label>
                              <Switch
                                id={`active-${template.id}`}
                                checked={mapping?.isActive || false}
                                onCheckedChange={() => toggleMapping(template.id, 'isActive')}
                              />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => onEditTemplate?.(template.id)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => onSelectTemplate?.(template.id)}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-primary" />
            <span><strong>User Interactive:</strong> Users can enter prompts/select dialects</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span><strong>View Only:</strong> Content displayed, no user input</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-accent" />
            <span><strong>Active:</strong> Template published to landing page</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper to map section labels to IDs
function getSectionIdFromLabel(label: string): LandingPageSection {
  const labelMap: Record<string, LandingPageSection> = {
    'Hero Showcase': 'hero_showcase',
    'Product Demo / Use Cases': 'product_demo',
    'Tutorial / How-to': 'tutorial_howto',
    'Testimonials / Social Proof': 'testimonials',
    'True Localization Demo': 'dialect_demo',
    'Industry Showcases': 'industry_showcases',
    'Global Success Stories': 'global_success_stories',
    'Explore Use Cases': 'explore_use_cases',
  };
  return labelMap[label] || 'hero_showcase';
}

export default TemplateLandingMapper;
