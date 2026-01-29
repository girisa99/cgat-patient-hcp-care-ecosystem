import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  category?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  groupByCategory?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  groupByCategory = false,
  disabled = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate dropdown position using fixed positioning for portal
  const getDropdownStyle = useCallback((): React.CSSProperties => {
    if (!buttonRef.current) return { display: 'none' };
    
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 320;
    
    // Decide if dropdown should open above or below
    const openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    
    return {
      position: 'fixed' as const,
      left: rect.left,
      width: rect.width,
      maxHeight: Math.min(dropdownHeight, openAbove ? spaceAbove - 8 : spaceBelow - 8),
      ...(openAbove 
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }
      ),
      zIndex: 99999,
    };
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideContainer = containerRef.current && !containerRef.current.contains(target);
      const clickedOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
      
      if (clickedOutsideContainer && clickedOutsideDropdown) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    // Use setTimeout to avoid immediate trigger on open click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape and scroll/resize repositioning
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleScrollOrResize = () => {
      // Force re-render to recalculate position
      if (dropdownRef.current) {
        const style = getDropdownStyle();
        Object.assign(dropdownRef.current.style, style);
      }
    };

    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, getDropdownStyle]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredOptions = options.filter(option =>
    !searchTerm || 
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedOptions = groupByCategory
    ? filteredOptions.reduce((acc, option) => {
        const category = option.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(option);
        return acc;
      }, {} as Record<string, SearchableSelectOption[]>)
    : { 'All': filteredOptions };

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggleOpen = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  const selectedOption = options.find(opt => opt.value === value);

  // Portal dropdown content
  const dropdownContent = isOpen ? createPortal(
    <div
      ref={dropdownRef}
      className="bg-popover border border-border rounded-lg shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100"
      style={getDropdownStyle()}
    >
      {/* Search Input */}
      <div className="p-2 border-b border-border bg-popover sticky top-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          />
        </div>
      </div>
      
      <div className="overflow-auto bg-popover" style={{ maxHeight: 'calc(100% - 52px)' }}>
        {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
          <div key={category}>
            {groupByCategory && Object.keys(groupedOptions).length > 1 && (
              <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-muted/50 border-b border-border">
                {category}
              </div>
            )}
            
            {categoryOptions.map((option) => {
              const isSelected = value === option.value;
              
              return (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center gap-2 p-2 cursor-pointer text-xs transition-colors",
                    isSelected ? "bg-primary/10 text-primary" : "hover:bg-accent"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.icon && (
                    <span className="flex-shrink-0">{option.icon}</span>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{option.label}</div>
                    {option.description && (
                      <div className="text-[10px] text-muted-foreground truncate">{option.description}</div>
                    )}
                  </div>
                  
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
        
        {filteredOptions.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No options found
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Button
        ref={buttonRef}
        variant="outline"
        onClick={handleToggleOpen}
        disabled={disabled}
        type="button"
        className={cn(
          "w-full justify-between h-8 text-xs px-3",
          isOpen && "ring-2 ring-primary ring-offset-1"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 text-left">
          {selectedOption ? (
            <>
              {selectedOption.icon}
              <span className="truncate">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 flex-shrink-0 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {dropdownContent}
    </div>
  );
};
