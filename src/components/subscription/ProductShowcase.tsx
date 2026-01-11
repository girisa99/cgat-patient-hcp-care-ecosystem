import React from 'react';
import { GENIE_PRODUCTS, GenieProduct } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

// Import combined logos from assets - matching architecture
import genieStudioLogo from '@/assets/logos/genie-studio-combined.png';
import genieSparkLogo from '@/assets/logos/genie-spark-combined.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined.png';
import genieMindLogo from '@/assets/logos/genie-mind-combined.png';
// Production Hub uses Arc logo (Arc is consolidated into Production Hub per architecture)
import genieProductionHubLogo from '@/assets/logos/genie-arc-combined.png';

// Consistent logo mapping across all subscription components
const productLogos: Record<GenieProduct, string> = {
  mind: genieMindLogo,
  spark: genieSparkLogo,
  vibe: genieVibeLogo,
  studio: genieStudioLogo,
  productionHub: genieProductionHubLogo
};

// Display order: Mind → Spark → Studio (center) → Vibe → Production Hub
const productDisplayOrder: GenieProduct[] = ['mind', 'spark', 'studio', 'vibe', 'productionHub'];

interface ProductShowcaseProps {
  includedProducts: readonly GenieProduct[];
  variant?: 'compact' | 'detailed';
  className?: string;
}

export const ProductShowcase = ({ 
  includedProducts, 
  variant = 'compact',
  className 
}: ProductShowcaseProps) => {
  const allProducts = productDisplayOrder;

  if (variant === 'compact') {
    return (
      <div className={cn("grid grid-cols-1 gap-1.5", className)}>
        {allProducts.map((productKey) => {
          const product = GENIE_PRODUCTS[productKey];
          const isIncluded = includedProducts.includes(productKey);
          const isStudio = productKey === 'studio';
          
          return (
            <div
              key={productKey}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                isIncluded 
                  ? `${product.bgColor} ${product.borderColor} border` 
                  : "bg-transparent text-muted-foreground/40",
                isStudio && isIncluded && "ring-1 ring-blue-500/30"
              )}
            >
              <img 
                src={productLogos[productKey]} 
                alt={product.name}
                className={cn(
                  "h-4 w-4 object-contain shrink-0",
                  !isIncluded && "opacity-30 grayscale"
                )}
              />
              <span className={cn(
                "flex-1 truncate",
                !isIncluded && "line-through"
              )}>
                {product.name.replace('Genie ', '')}
              </span>
              {isIncluded ? (
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 gap-4", className)}>
      {allProducts.map((productKey) => {
        const product = GENIE_PRODUCTS[productKey];
        const isIncluded = includedProducts.includes(productKey);
        const isStudio = productKey === 'studio';
        
        return (
          <div
            key={productKey}
            className={cn(
              "relative p-4 rounded-xl border transition-all",
              isIncluded 
                ? `${product.bgColor} ${product.borderColor} shadow-sm` 
                : "bg-muted/20 border-muted/30 opacity-50",
              isStudio && isIncluded && "ring-2 ring-blue-500/30 shadow-md"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "h-12 w-12 rounded-lg bg-white/80 flex items-center justify-center shadow-sm",
                !isIncluded && "grayscale"
              )}>
                <img 
                  src={productLogos[productKey]} 
                  alt={product.name}
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={cn(
                    "font-semibold text-sm",
                    !isIncluded && "text-muted-foreground"
                  )}>
                    {product.name}
                  </h4>
                  {isIncluded && (
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {product.tagline}
                </p>
              </div>
            </div>
            
            {isIncluded && (
              <div className="mt-3 space-y-1">
                {product.features.slice(0, 2).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-green-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProductShowcase;