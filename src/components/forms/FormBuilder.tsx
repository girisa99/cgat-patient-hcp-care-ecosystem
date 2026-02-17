/**
 * FORM BUILDER COMPONENT
 * Unified form system following framework compliance patterns
 * Reduces FormWrapper complexity by providing reusable form building blocks
 */

import React from 'react';
import { useForm, Controller, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  validation?: z.ZodSchema;
  options?: { value: string; label: string; }[]; // For select fields
  className?: string;
}

export interface FormBuilderProps<T extends FieldValues = FieldValues> {
  title: string;
  description?: string;
  fields: FormField[];
  onSubmit: (data: T) => Promise<void> | void;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  defaultValues?: Partial<T>;
  className?: string;
  validationSchema?: z.ZodSchema<T>;
}

// Enhanced FormContainer component
export const FormContainer: React.FC<{ 
  title: string; 
  description?: string; 
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, children, className = '' }) => (
  <Card className={`w-full max-w-2xl mx-auto ${className}`}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description && <p className="text-muted-foreground">{description}</p>}
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

// Enhanced FormField component
export const FormFieldComponent: React.FC<{
  field: FormField;
  control: any;
  error?: string;
}> = ({ field, control, error }) => {
  const renderField = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <textarea
                {...controllerField}
                placeholder={field.placeholder}
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            )}
          />
        );
      case 'select':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <select
                {...controllerField}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">{field.placeholder || 'Select...'}</option>
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          />
        );
      case 'checkbox':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...controllerField}
                  checked={controllerField.value || false}
                  className="h-4 w-4 rounded border border-input"
                />
                <Label htmlFor={field.name}>{field.label}</Label>
              </div>
            )}
          />
        );
      default:
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <Input
                {...controllerField}
                type={field.type}
                placeholder={field.placeholder}
                className={field.className}
              />
            )}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {field.type !== 'checkbox' && (
        <Label htmlFor={field.name}>
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </Label>
      )}
      {renderField()}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// Enhanced FormActions component
export const FormActions: React.FC<{
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  submitDisabled?: boolean;
}> = ({ 
  submitLabel = 'Submit', 
  cancelLabel = 'Cancel', 
  onCancel, 
  loading = false,
  submitDisabled = false
}) => (
  <div className="flex justify-end space-x-2 pt-4">
    {onCancel && (
      <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
        {cancelLabel}
      </Button>
    )}
    <Button type="submit" disabled={loading || submitDisabled}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {submitLabel}
    </Button>
  </div>
);

// Main FormBuilder component
export const FormBuilder = <T extends FieldValues = FieldValues>({
  title,
  description,
  fields,
  onSubmit,
  submitLabel,
  cancelLabel,
  onCancel,
  loading = false,
  defaultValues,
  className = '',
  validationSchema
}: FormBuilderProps<T>) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<T>({
    defaultValues: defaultValues as any,
    resolver: validationSchema ? zodResolver(validationSchema) : undefined
  });

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data as T);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <FormContainer title={title} description={description} className={className}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {fields.map((field) => (
          <FormFieldComponent
            key={field.name}
            field={field}
            control={control}
            error={errors[field.name as Path<T>]?.message as string}
          />
        ))}

        <FormActions
          submitLabel={submitLabel}
          cancelLabel={cancelLabel}
          onCancel={onCancel}
          loading={loading}
          submitDisabled={Object.keys(errors).length > 0}
        />
      </form>
    </FormContainer>
  );
};

export default FormBuilder;