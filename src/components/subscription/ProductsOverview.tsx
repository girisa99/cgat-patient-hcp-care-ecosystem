import React from 'react';
import { GENIE_PRODUCTS, GenieProduct } from '@/constants/genie-products';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowRight, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const productRoutes: Record<GenieProduct, string> = {
  mind: '/genie-mind',
  spark: '/genie-spark',
  vibe: '/genie-vibe',
  hub: '/production-hub',
  studio: '/genie-studio',
  arc: '/production-hub',
  deck: '/genie-deck',
  cast: '/genie-cast',
};

export const ProductsOverview = () => {
  const navigate = useNavigate();
  const products = Object.entries(GENIE_PRODUCTS) as [GenieProduct, typeof GENIE_PRODUCTS[GenieProduct]][];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">The Complete Genie Suite</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Seven powerful products designed to work together seamlessly — Mind to Media
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(([key, product]) => (
          <Card 
            key={key}
            className={cn(
              "group relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer",
              product.borderColor,
              "border-2 hover:scale-[1.02]"
            )}
            onClick={() => navigate(productRoutes[key])}
          >
            {/* Gradient overlay */}
            <div className={cn(
              "absolute inset-0 opacity-5 bg-gradient-to-br",
              product.color
            )} />
            
            <CardHeader className="relative">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "h-16 w-16 rounded-xl bg-white shadow-lg flex items-center justify-center p-2",
                  product.borderColor, "border"
                )}>
                  <img 
                    src={product.logos.combined} 
                    alt={product.name}
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {product.name}
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    className={cn("mt-1", product.bgColor, product.borderColor)}
                  >
                    {product.tagline}
                  </Badge>
                </div>
              </div>
              <CardDescription className="mt-3">
                {product.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative">
              <div className="space-y-2">
                {product.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="ghost" 
                className="w-full mt-4 group-hover:bg-muted/50"
              >
                Explore {product.name.replace('Genie ', '')}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductsOverview;