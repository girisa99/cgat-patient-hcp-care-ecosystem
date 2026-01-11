import React from 'react';
import { GENIE_PRODUCTS, GenieProduct } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Import combined logos from assets
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

// Order products with Genie Studio in the center (position 3 of 6)
const productOrder: GenieProduct[] = ['spark', 'vibe', 'studio', 'arc', 'mind', 'productionHub'];

export const HorizontalProductShowcase = () => {
  const navigate = useNavigate();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll to center (Genie Studio) on mount
  React.useEffect(() => {
    if (scrollRef.current) {
      // Scroll to center where Genie Studio is (position 2, so scroll 2 card widths + gaps)
      const cardWidth = 280;
      const gap = 16;
      const centerOffset = (cardWidth + gap) * 2;
      scrollRef.current.scrollLeft = centerOffset - 40; // Slight adjustment for visual centering
    }
  }, []);

  const handleProductClick = (key: GenieProduct) => {
    // Navigate to product page with return state
    navigate(productRoutes[key], { state: { from: '/subscription' } });
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
        {productOrder.map((key) => {
          const product = GENIE_PRODUCTS[key];
          const isStudio = key === 'studio';
          
          return (
            <div
              key={key}
              onClick={() => handleProductClick(key)}
              className={cn(
                "flex-shrink-0 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 snap-start bg-card",
                "hover:shadow-lg hover:scale-[1.02]",
                product.borderColor,
                isStudio 
                  ? "w-[320px] ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20" 
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
                  "rounded-lg bg-white shadow flex items-center justify-center",
                  product.borderColor, "border",
                  isStudio ? "h-14 w-14 p-2" : "h-12 w-12 p-1.5"
                )}>
                  <img 
                    src={productLogos[key]} 
                    alt={product.name}
                    className={cn(
                      "object-contain",
                      isStudio ? "h-10 w-10" : "h-8 w-8"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-semibold text-foreground truncate",
                    isStudio ? "text-lg" : "text-base"
                  )}>
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">{product.tagline}</p>
                </div>
              </div>
              
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
              
              {/* Action */}
              <Button 
                variant={isStudio ? "default" : "ghost"} 
                size="sm"
                className={cn(
                  "w-full text-xs h-8",
                  isStudio && "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                )}
              >
                {isStudio ? "Get Started" : "Explore"}
                <ArrowRight className="ml-1.5 h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalProductShowcase;
