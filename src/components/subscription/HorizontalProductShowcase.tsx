import React from 'react';
import { GENIE_PRODUCTS, GenieProduct } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Import logos from assets - using horizontal/combined versions for better visibility
import genieStudioLogo from '@/assets/logos/genie-studio-horizontal.png';
import genieSparkLogo from '@/assets/logos/genie-spark-combined.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined.png';
import genieMindLogo from '@/assets/logos/genie-mind-combined.png';
// Production Hub uses Arc logo (Arc is consolidated into Production Hub per architecture)
import genieProductionHubLogo from '@/assets/logos/genie-arc-combined.png';

const productLogos: Record<GenieProduct, string> = {
  mind: genieMindLogo,
  spark: genieSparkLogo,
  vibe: genieVibeLogo,
  studio: genieStudioLogo,
  productionHub: genieProductionHubLogo
};

const productRoutes: Record<GenieProduct, string> = {
  mind: '/genie-mind',
  spark: '/genie-spark',
  vibe: '/genie-vibe',
  studio: '/genie-studio',
  productionHub: '/production-hub'
};

// Order: Mind (pre-prod) → Spark (generation) → Studio (center/hub) → Vibe (production) → Hub (coordination)
const productOrder: GenieProduct[] = ['mind', 'spark', 'studio', 'vibe', 'productionHub'];

export const HorizontalProductShowcase = () => {
  const navigate = useNavigate();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll to center (Genie Studio) on mount
  React.useEffect(() => {
    if (scrollRef.current) {
      // Scroll to center where Genie Studio is (position 2)
      const cardWidth = 280;
      const gap = 16;
      const centerOffset = (cardWidth + gap) * 2;
      scrollRef.current.scrollLeft = centerOffset - 100;
    }
  }, []);

  const handleProductClick = (key: GenieProduct) => {
    navigate(productRoutes[key], { state: { from: '/subscription' } });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Complete Genie Suite</h2>
        <p className="text-sm text-muted-foreground">Five powerful AI products working together</p>
      </div>

      {/* Carousel with side navigation */}
      <div className="relative group">
        {/* Left scroll button */}
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/90 backdrop-blur shadow-lg opacity-80 hover:opacity-100 transition-opacity"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Right scroll button */}
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/90 backdrop-blur shadow-lg opacity-80 hover:opacity-100 transition-opacity"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Horizontal scroll container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto px-12 py-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {productOrder.map((key) => {
            const product = GENIE_PRODUCTS[key];
            const isStudio = key === 'studio';
            
            return (
              <div
                key={key}
                onClick={() => handleProductClick(key)}
                className={cn(
                  "flex-shrink-0 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 snap-center bg-card",
                  "hover:shadow-lg hover:scale-[1.02]",
                  product.borderColor,
                  isStudio 
                    ? "w-[300px] ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20" 
                    : "w-[260px]"
                )}
              >
                {/* Featured badge for Studio */}
                {isStudio && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                      Flagship Product
                    </span>
                  </div>
                )}

                {/* Product Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "rounded-lg bg-white shadow flex items-center justify-center overflow-hidden",
                    product.borderColor, "border",
                    isStudio ? "h-16 w-auto min-w-[100px] p-2" : "h-12 w-12 p-1.5"
                  )}>
                    <img 
                      src={productLogos[key]} 
                      alt={product.name}
                      className={cn(
                        "object-contain",
                        isStudio ? "h-12 w-auto max-w-[120px]" : "h-8 w-8"
                      )}
                    />
                  </div>
                  {!isStudio && (
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate text-base">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{product.tagline}</p>
                    </div>
                  )}
                </div>
                {/* Genie Studio title below logo */}
                {isStudio && (
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.tagline}</p>
                  </div>
                )}
                
                {/* Description */}
                <p className={cn(
                  "text-muted-foreground mb-3",
                  isStudio ? "text-sm line-clamp-3" : "text-xs line-clamp-2"
                )}>
                  {product.description}
                </p>
                
                {/* Features Preview */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.features.slice(0, isStudio ? 4 : 2).map((feature, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className={cn(
                        "px-1.5 py-0",
                        isStudio ? "text-xs" : "text-[10px]"
                      )}
                    >
                      {feature.split(' ').slice(0, 2).join(' ')}
                    </Badge>
                  ))}
                </div>
                
                {/* Action - consistent for all products */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full text-xs h-8"
                >
                  Explore
                  <ArrowRight className="ml-1.5 h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HorizontalProductShowcase;
