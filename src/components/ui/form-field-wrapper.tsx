/**
 * Form Field Wrapper with Error Handling & Accessibility
 * Addresses Ralph Wiggum findings: Error Handling, Accessibility
 * 
 * Features:
 * - Clear error messages with visual feedback
 * - Accessibility-first design (WCAG AA compliant)
 * - Tooltip explanations for complex terms
 * - Loading states with proper feedback
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, HelpCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';

export interface FormFieldError {
  type: 'required' | 'format' | 'range' | 'custom';
  message: string;
}

export interface FormFieldWrapperProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: FormFieldError | string | null;
  success?: string | null;
  hint?: string;
  tooltip?: string;
  isLoading?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Wrapper component for form fields with built-in error handling and accessibility
 */
export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  label,
  htmlFor,
  required = false,
  error,
  success,
  hint,
  tooltip,
  isLoading = false,
  className,
  children,
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const hasError = !!errorMessage;
  const hasSuccess = !!success;

  return (
    <div className={cn('space-y-1.5', className)}>
      {/* Label Row */}
      <div className="flex items-center gap-1.5">
        <Label 
          htmlFor={htmlFor}
          className={cn(
            'text-sm font-medium transition-colors',
            hasError && 'text-destructive',
            hasSuccess && 'text-green-600 dark:text-green-400'
          )}
        >
          {label}
          {required && (
            <span className="text-destructive ml-0.5" aria-label="required">*</span>
          )}
        </Label>

        {/* Loading indicator */}
        {isLoading && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-label="Loading" />
        )}

        {/* Tooltip for complex terms */}
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full"
                  aria-label={`Learn more about ${label}`}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="max-w-xs text-sm bg-popover text-popover-foreground"
              >
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Input Wrapper with visual feedback */}
      <div 
        className={cn(
          'relative rounded-md transition-all',
          hasError && 'ring-2 ring-destructive/20',
          hasSuccess && 'ring-2 ring-green-500/20'
        )}
      >
        {children}
      </div>

      {/* Feedback Messages */}
      <div className="min-h-[1.25rem]">
        {hasError && (
          <div 
            role="alert"
            className="flex items-center gap-1.5 text-sm text-destructive animate-in slide-in-from-top-1"
          >
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {hasSuccess && !hasError && (
          <div 
            className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 animate-in slide-in-from-top-1"
          >
            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>{success}</span>
          </div>
        )}

        {hint && !hasError && !hasSuccess && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    </div>
  );
};

/**
 * Common validation error messages - simple language for readability
 */
export const ValidationMessages = {
  required: (field: string) => `Please enter a ${field.toLowerCase()}`,
  email: 'Please enter a valid email address (like name@example.com)',
  phone: 'Please enter a valid phone number',
  number: 'Please enter a number only',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  url: 'Please enter a valid website address (starting with http:// or https://)',
  date: 'Please enter a valid date',
  dateRange: 'End date must be after start date',
  password: 'Password must be at least 8 characters with a mix of letters and numbers',
  passwordMatch: 'Passwords do not match',
  selection: 'Please make a selection',
  file: 'Please select a file to upload',
  fileType: (types: string) => `Please upload a file of type: ${types}`,
  fileSize: (max: string) => `File size must be less than ${max}`,
};

/**
 * Simple validation helpers
 */
export const validateField = {
  required: (value: string | undefined | null): FormFieldError | null => {
    if (!value || value.trim() === '') {
      return { type: 'required', message: 'This field is required' };
    }
    return null;
  },

  email: (value: string): FormFieldError | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { type: 'format', message: ValidationMessages.email };
    }
    return null;
  },

  number: (value: string): FormFieldError | null => {
    if (isNaN(Number(value))) {
      return { type: 'format', message: ValidationMessages.number };
    }
    return null;
  },

  url: (value: string): FormFieldError | null => {
    try {
      new URL(value);
      return null;
    } catch {
      return { type: 'format', message: ValidationMessages.url };
    }
  },

  minLength: (value: string, min: number): FormFieldError | null => {
    if (value.length < min) {
      return { type: 'range', message: ValidationMessages.minLength(min) };
    }
    return null;
  },

  maxLength: (value: string, max: number): FormFieldError | null => {
    if (value.length > max) {
      return { type: 'range', message: ValidationMessages.maxLength(max) };
    }
    return null;
  },
};

export default FormFieldWrapper;
