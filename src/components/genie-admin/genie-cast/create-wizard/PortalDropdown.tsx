/**
 * PortalDropdown — Reusable portal-based multi/single select dropdown
 * Extracted from CreateTemplateDialog for reuse in wizard steps.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

interface PortalDropdownProps {
  label: string;
  icon?: React.ReactNode;
  options: DropdownOption[];
  selected: string[];
  onToggle: (value: string) => void;
  multi?: boolean;
  placeholder?: string;
  maxHeight?: number;
  className?: string;
}

export const PortalDropdown: React.FC<PortalDropdownProps> = ({
  label,
  icon,
  options,
  selected,
  onToggle,
  multi = true,
  placeholder = 'Select...',
  maxHeight = 280,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const selectedLabels = options.filter(o => selected.includes(o.value));

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove = spaceBelow < maxHeight + 20 && rect.top > spaceBelow;
      setPosition({
        top: openAbove ? rect.top - Math.min(maxHeight + 50, rect.top - 8) : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [maxHeight]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const scrollHandler = () => updatePosition();
      window.addEventListener('scroll', scrollHandler, true);
      window.addEventListener('resize', scrollHandler);
      return () => {
        window.removeEventListener('scroll', scrollHandler, true);
        window.removeEventListener('resize', scrollHandler);
      };
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsOpen(false); setSearchQuery(''); }
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleItemClick = (value: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(value);
    if (!multi) { setIsOpen(false); setSearchQuery(''); }
  };

  const dropdownContent = isOpen ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed bg-popover border rounded-lg shadow-xl overflow-hidden"
      style={{ top: position.top, left: position.left, width: position.width, zIndex: 999999 }}
    >
      {options.length > 10 && (
        <div className="p-2 border-b bg-muted/30">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
        </div>
      )}
      <div className="overflow-y-auto p-1" style={{ maxHeight }}>
        {filteredOptions.length > 0 ? (
          filteredOptions.map(opt => (
            <div
              key={opt.value}
              onMouseDown={(e) => handleItemClick(opt.value, e)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer transition-colors",
                selected.includes(opt.value) ? "bg-primary/10 text-primary" : "hover:bg-accent"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                selected.includes(opt.value) ? "bg-primary border-primary" : "border-muted-foreground/30"
              )}>
                {selected.includes(opt.value) && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              <div className="flex-1 min-w-0">
                <span className="truncate block">{opt.label}</span>
                {opt.description && <span className="text-xs text-muted-foreground truncate block">{opt.description}</span>}
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">No options found</div>
        )}
      </div>
      {multi && selected.length > 0 && (
        <div className="p-2 border-t bg-muted/30 text-xs text-muted-foreground">{selected.length} selected</div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="flex items-center gap-2 text-sm">{icon}{label}</Label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 min-h-10 text-left",
          "border rounded-md bg-background hover:bg-accent/50 transition-colors",
          isOpen && "ring-2 ring-primary"
        )}
      >
        {selectedLabels.length > 0 ? (
          <div className="flex flex-wrap gap-1 pr-4 flex-1">
            {selectedLabels.slice(0, 3).map(opt => (
              <Badge key={opt.value} variant="secondary" className="text-xs">
                {opt.icon && <span className="mr-1">{opt.icon}</span>}{opt.label}
              </Badge>
            ))}
            {selectedLabels.length > 3 && <Badge variant="outline" className="text-xs">+{selectedLabels.length - 3}</Badge>}
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>
      {dropdownContent}
    </div>
  );
};
