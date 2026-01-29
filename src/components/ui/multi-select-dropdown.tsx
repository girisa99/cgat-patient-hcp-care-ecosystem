import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, X } from 'lucide-react';
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position based on button
  const updateDropdownPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
    }
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideContainer = containerRef.current && !containerRef.current.contains(target);
      const clickedOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
      
      if (clickedOutsideContainer && clickedOutsideDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    !searchTerm || option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedOptions = groupByCategory
    ? filteredOptions.reduce((acc, option) => {
        const category = option.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(option);
        return acc;
      }, {} as Record<string, MultiSelectOption[]>)
    : { 'All': filteredOptions };

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

  const getSelectedLabels = () => {
    return selectedValues.map(value => {
      const option = options.find(opt => opt.value === value);
      return option?.label || value;
    });
  };

  const selectedLabels = getSelectedLabels();

  // Dropdown content rendered via portal
  const dropdownContent = isOpen ? (
    <div
      ref={dropdownRef}
      className="fixed bg-background border border-border rounded-md shadow-xl overflow-hidden"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 99999,
        maxHeight: '320px',
      }}
    >
      {searchable && (
        <div className="p-2 border-b bg-background">
          <input
            type="text"
            placeholder="Search options..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      
      <div className="max-h-64 overflow-auto p-1 bg-background">
        {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
          <div key={category}>
            {groupByCategory && Object.keys(groupedOptions).length > 1 && (
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30 sticky top-0">
                {category}
              </div>
            )}
            
            {categoryOptions.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              const isDisabled = option.disabled || (maxSelections && !isSelected && selectedValues.length >= maxSelections);
              
              return (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center gap-2 p-2 cursor-pointer hover:bg-accent rounded-sm transition-colors",
                    isSelected && "bg-accent/50",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => !isDisabled && handleToggleOption(option.value)}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={!!isDisabled}
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
        <div className="p-2 border-t text-xs text-muted-foreground text-center bg-muted/30">
          {selectedValues.length} of {maxSelections} selected
        </div>
      )}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Button
        ref={buttonRef}
        variant="outline"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
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
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {/* Render dropdown via portal to escape container overflow */}
      {createPortal(dropdownContent, document.body)}
    </div>
  );
};
