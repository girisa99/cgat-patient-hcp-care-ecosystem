/**
 * ProductSelector - Top-bar product picker for Genie Cast
 * 
 * Sets the active product context across CREATE/PRODUCE/PUBLISH tabs.
 * Loads products from the Content Pool (system defaults + user's products).
 */

import React from 'react';
import { Package, ChevronDown, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ContentPoolProduct } from '@/hooks/useContentPool';

interface ProductSelectorProps {
  products: ContentPoolProduct[];
  selectedProductId: string | null;
  onProductChange: (productId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProductId,
  onProductChange,
  isLoading = false,
  className,
}) => {
  const selectedProduct = products.find(p => p.id === selectedProductId);

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground text-xs", className)}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Loading products…</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground text-xs", className)}>
        <Package className="w-3.5 h-3.5" />
        <span>No products configured</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Package className="w-4 h-4 text-primary flex-shrink-0" />
      <Select value={selectedProductId || ''} onValueChange={onProductChange}>
        <SelectTrigger className="h-8 w-[200px] text-xs bg-background border-border">
          <SelectValue placeholder="Select product…" />
        </SelectTrigger>
        <SelectContent className="z-[100000] bg-popover border-border shadow-lg">
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id} className="text-xs">
              <div className="flex items-center gap-2">
                <span className="truncate max-w-[140px]">{product.name}</span>
                {product.is_system_default && (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                    Genie
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedProduct && (
        <span className="text-[10px] text-muted-foreground truncate max-w-[120px] hidden lg:block">
          {selectedProduct.tagline}
        </span>
      )}
    </div>
  );
};
