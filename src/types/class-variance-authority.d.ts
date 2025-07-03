declare module 'class-variance-authority' {
  import * as React from 'react';
  type ClassValue = string | Record<string, boolean> | ClassValue[];
  export interface CVAConfig<V extends string = string> {
    variants?: Record<V, ClassValue>;
    defaultVariants?: Partial<Record<V, ClassValue>>;
  }
  export type VariantProps<T> = T extends CVAConfig<infer V>
    ? { variant?: V }
    : never;
  export function cva<T extends CVAConfig>(base: ClassValue, config?: T): (...classes: ClassValue[]) => string;
}