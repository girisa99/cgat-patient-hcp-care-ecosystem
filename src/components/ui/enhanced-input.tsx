
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  error,
  success,
  hint,
  required,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const successId = success ? `${inputId}-success` : undefined;

  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

  return (
    <div className="space-y-2">
      {label && (
        <Label 
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            hasError && 'text-destructive',
            hasSuccess && 'text-green-600'
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
        </Label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        <Input
          id={inputId}
          className={cn(
            'transition-all duration-200',
            'focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-primary',
            leftIcon && 'pl-10',
            (rightIcon || hasError || hasSuccess) && 'pr-10',
            hasError && 'border-destructive focus:border-destructive focus:ring-destructive',
            hasSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={cn(
            errorId,
            hintId,
            successId
          )}
          required={required}
          {...props}
        />
        
        {(rightIcon || hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {hasError && <AlertCircle className="h-4 w-4 text-destructive" />}
            {hasSuccess && <CheckCircle className="h-4 w-4 text-green-600" />}
            {!hasError && !hasSuccess && rightIcon}
          </div>
        )}
      </div>
      
      {hint && !error && !success && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-xs text-destructive flex items-center gap-1" role="alert">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      
      {success && !error && (
        <p id={successId} className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {success}
        </p>
      )}
    </div>
  );
};
