import React from 'react';
import { GENIE_PRODUCTS, GenieProduct } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Import logos
import genieStudioLogo from '@/assets/logos/genie-studio-combined.png';
import genieSparkLogo from '@/assets/logos/genie-spark-combined.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined.png';
import genieArcLogo from '@/assets/logos/genie-arc-combined.png';
import genieMindLogo from '@/assets/logos/genie-mind-combined.png';
import genieProductionLogo from '@/assets/logos/genie-studio-product.png';

const productLogos: Record<GenieProduct, string> = {
  studio: genieStudioLogo,
  spark: genieSparkLogo,
  vibe: genieVibeLogo,
  arc: genieArcLogo,
  mind: genieMindLogo,
  productionHub: genieProductionLogo
};

const productRoutes: Record<GenieProduct, string> = {
  studio: '/genie-studio',
  spark: '/genie-spark',
  vibe: '/genie-vibe',
  arc: '/genie-arc',
  mind: '/genie-mind',
  productionHub: '/production-hub'
};

export const HorizontalProductShowcase = () => {
  const navigate = useNavigate();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const products = Object.entries(GENIE_PRODUCTS) as [GenieProduct, typeof GENIE_PRODUCTS[GenieProduct]][];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with scroll controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Complete Genie Suite</h2>
          <p className="text-sm text-muted-foreground">Six powerful AI products working together</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent snap-x snap-mandatory"
        style={{ scrollbarWidth: 'thin' }}
      >
        {products.map(([key, product]) => (
          <div
            key={key}
            onClick={() => navigate(productRoutes[key])}
            className={cn(
              "flex-shrink-0 w-[280px] p-4 rounded-xl border-2 cursor-pointer transition-all duration-300",
              "hover:shadow-lg hover:scale-[1.02] snap-start bg-card",
              product.borderColor
            )}
          >
            {/* Product Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "h-12 w-12 rounded-lg bg-white shadow flex items-center justify-center p-1.5",
                product.borderColor, "border"
              )}>
                <img 
                  src={productLogos[key]} 
                  alt={product.name}
                  className="h-9 w-9 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{product.tagline}</p>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {product.description}
            </p>
            
            {/* Features Preview */}
            <div className="flex flex-wrap gap-1 mb-3">
              {product.features.slice(0, 3).map((feature, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0"
                >
                  {feature.split(' ').slice(0, 2).join(' ')}
                </Badge>
              ))}
            </div>
            
            {/* Action */}
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full text-xs h-8"
            >
              Explore
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalProductShowcase;
