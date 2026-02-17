/**
 * Side Panel Component - Collapsible accordion-style panels
 * Fixed layout, no overlap
 */

import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, FileText, Music, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidePanelSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

interface SidePanelProps {
  sections: SidePanelSection[];
  className?: string;
}

export function SidePanel({ sections, className }: SidePanelProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.defaultOpen).map(s => s.id))
  );

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={cn("flex flex-col gap-1 overflow-hidden", className)}>
      {sections.map((section) => (
        <Collapsible
          key={section.id}
          open={openSections.has(section.id)}
          onOpenChange={() => toggleSection(section.id)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between px-3 py-2 h-auto hover:bg-accent/50",
                openSections.has(section.id) && "bg-accent/30"
              )}
            >
              <div className="flex items-center gap-2">
                {section.icon}
                <span className="font-medium text-sm">{section.title}</span>
              </div>
              <ChevronDown 
                className={cn(
                  "w-4 h-4 transition-transform",
                  openSections.has(section.id) && "rotate-180"
                )} 
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden">
            <div className="p-2 border-l-2 border-primary/20 ml-3">
              {section.content}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

// Default section icons
export const SectionIcons = {
  script: <FileText className="w-4 h-4 text-green-500" />,
  audio: <Mic className="w-4 h-4 text-blue-500" />,
  music: <Music className="w-4 h-4 text-purple-500" />,
};
