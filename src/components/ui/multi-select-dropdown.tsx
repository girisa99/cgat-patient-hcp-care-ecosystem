import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  id: string;
  label: string;
  value: string;
  category?: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface MultiSelectDropdownProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  groupByCategory?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options...",
  maxSelections,
  groupByCategory = false,
  searchable = false,
  disabled = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculate dropdown position using fixed positioning for portal
  const getDropdownStyle = useCallback((): React.CSSProperties => {
    if (!buttonRef.current) return { display: 'none' };
    
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 360;
    
    // Decide if dropdown should open above or below
    const openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    
    return {
      position: 'fixed' as const,
      left: rect.left,
      width: Math.max(rect.width, 280),
      maxHeight: Math.min(dropdownHeight, openAbove ? spaceAbove - 8 : spaceBelow - 8),
      ...(openAbove 
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }
      ),
      zIndex: 99999,
    };
  }, []);

  // Update position on scroll/resize
  const updatePosition = useCallback(() => {
    if (dropdownRef.current && isOpen) {
      const style = getDropdownStyle();
      Object.assign(dropdownRef.current.style, {
        position: style.position,
        left: `${style.left}px`,
        width: `${style.width}px`,
        maxHeight: `${style.maxHeight}px`,
        zIndex: style.zIndex,
        ...(style.top !== undefined ? { top: `${style.top}px`, bottom: 'auto' } : {}),
        ...(style.bottom !== undefined ? { bottom: `${style.bottom}px`, top: 'auto' } : {}),
      });
    }
  }, [getDropdownStyle, isOpen]);

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

  // Close on escape and handle scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, searchable]);

  const filteredOptions = useMemo(() => 
    options.filter(option =>
      !searchTerm || option.label.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [options, searchTerm]
  );

  const groupedOptions = useMemo(() => {
    if (!groupByCategory) return { 'All': filteredOptions };
    
    return filteredOptions.reduce((acc, option) => {
      const category = option.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(option);
      return acc;
    }, {} as Record<string, MultiSelectOption[]>);
  }, [filteredOptions, groupByCategory]);

  const handleToggleOption = (optionValue: string) => {
    if (disabled) return;

    const isSelected = selectedValues.includes(optionValue);
    let newSelection: string[];

    if (isSelected) {
      newSelection = selectedValues.filter(value => value !== optionValue);
    } else {
      if (maxSelections && selectedValues.length >= maxSelections) {
        return;
      }
      newSelection = [...selectedValues, optionValue];
    }

    onSelectionChange(newSelection);
  };

  const handleRemoveSelection = (valueToRemove: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelection = selectedValues.filter(value => value !== valueToRemove);
    onSelectionChange(newSelection);
  };

  const selectedLabels = useMemo(() => {
    return selectedValues.map(value => {
      const option = options.find(opt => opt.value === value);
      return option?.label || value;
    });
  }, [selectedValues, options]);

  const handleToggleOpen = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  // Portal dropdown content
  const dropdownContent = isOpen ? createPortal(
    <div
      ref={dropdownRef}
      className="bg-popover border border-border rounded-lg shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100"
      style={getDropdownStyle()}
    >
      {searchable && (
        <div className="p-2 border-b border-border bg-popover sticky top-0">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full pl-7 pr-2 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}
      
      <div className="overflow-auto bg-popover" style={{ maxHeight: searchable ? 'calc(100% - 52px)' : '100%' }}>
        {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
          <div key={category}>
            {groupByCategory && Object.keys(groupedOptions).length > 1 && (
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/50 sticky top-0 border-b border-border">
                {category}
              </div>
            )}
            
            {categoryOptions.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              const isDisabledOption = option.disabled || (maxSelections && !isSelected && selectedValues.length >= maxSelections);
              
              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent transition-colors",
                    isSelected && "bg-accent/50",
                    isDisabledOption && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => !isDisabledOption && handleToggleOption(option.value)}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={!!isDisabledOption}
                    className="pointer-events-none"
                  />
                  
                  {option.icon && (
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground truncate">{option.description}</div>
                    )}
                  </div>
                  
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
        
        {filteredOptions.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No options found
          </div>
        )}
      </div>
      
      {maxSelections && (
        <div className="p-2 border-t border-border text-xs text-muted-foreground text-center bg-muted/30">
          {selectedValues.length} of {maxSelections} selected
        </div>
      )}
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
          "w-full justify-between min-h-10 h-auto py-2 px-3",
          isOpen && "ring-2 ring-primary ring-offset-2"
        )}
      >
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {selectedLabels.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : selectedLabels.length <= 3 ? (
            selectedLabels.map((label, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs"
              >
                {label}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={(e) => handleRemoveSelection(selectedValues[index], e)}
                />
              </Badge>
            ))
          ) : (
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {selectedLabels.length} selected
              </Badge>
              {selectedLabels.slice(0, 2).map((label, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs"
                >
                  {label}
                </Badge>
              ))}
              {selectedLabels.length > 2 && (
                <span className="text-xs text-muted-foreground">+{selectedLabels.length - 2} more</span>
              )}
            </div>
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform shrink-0", isOpen && "rotate-180")} />
      </Button>

      {dropdownContent}
    </div>
  );
};
