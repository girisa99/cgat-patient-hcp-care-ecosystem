import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, Sparkles, Zap, TrendingUp, Gift, Loader2, RefreshCw } from 'lucide-react';
import { useAICredits, CreditPackage } from '@/hooks/useAICredits';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const packageIcons: Record<string, React.ReactNode> = {
  'credits_50': <Coins className="h-5 w-5" />,
  'credits_150': <Zap className="h-5 w-5" />,
  'credits_500': <Sparkles className="h-5 w-5" />,
  'credits_1000': <TrendingUp className="h-5 w-5" />,
  'credits_2500': <Gift className="h-5 w-5" />,
};

const packageColors: Record<string, string> = {
  'credits_50': 'border-muted-foreground/20',
  'credits_150': 'border-blue-500/30',
  'credits_500': 'border-purple-500/50 ring-1 ring-purple-500/20',
  'credits_1000': 'border-amber-500/50',
  'credits_2500': 'border-emerald-500/50',
};

export const CreditPurchaseSection = () => {
  const { 
    credits, 
    packages, 
    featureCosts,
    isLoading, 
    purchaseCredits, 
    refreshCredits,
    formatPrice,
    getPackageValue 
  } = useAICredits();
  const { toast } = useToast();
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePurchase = async (pkg: CreditPackage) => {
    setLoadingPackage(pkg.id);
    try {
      const url = await purchaseCredits(pkg.id);
      if (url) {
        window.open(url, '_blank');
        toast({
          title: "Redirecting to checkout",
          description: "Complete your purchase in the new tab"
        });
      }
    } finally {
      setLoadingPackage(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshCredits();
    setIsRefreshing(false);
    toast({
      title: "Credits refreshed",
      description: `Current balance: ${credits?.credits_balance || 0} credits`
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Credits Display */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Your AI Credits</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-bold">{credits?.credits_balance || 0}</span>
            <span className="text-muted-foreground mb-1">credits available</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Used</span>
              <p className="font-medium">{credits?.credits_used_total || 0} credits</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Purchased</span>
              <p className="font-medium">{credits?.credits_purchased_total || 0} credits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Costs Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Credit Costs by Feature</CardTitle>
          <CardDescription>See how many credits each AI feature costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {featureCosts.slice(0, 6).map((feature) => (
              <div 
                key={feature.id}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <span className="text-sm truncate">{feature.display_name}</span>
                <Badge variant="secondary" className="ml-2 shrink-0">
                  {feature.credits_per_unit} / {feature.unit_type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Buy More Credits</h3>
            <p className="text-muted-foreground">One-time purchases, use anytime</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {packages.map((pkg) => {
            const value = getPackageValue(pkg);
            const isPopular = pkg.id === 'credits_500';
            const isBestValue = pkg.id === 'credits_2500';

            return (
              <Card 
                key={pkg.id}
                className={cn(
                  "relative flex flex-col transition-all duration-300 hover:shadow-lg",
                  packageColors[pkg.id] || 'border-muted-foreground/20'
                )}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white">
                    Most Popular
                  </Badge>
                )}
                {isBestValue && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white">
                    Best Value
                  </Badge>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-2 rounded-full bg-muted p-3 w-fit">
                    {packageIcons[pkg.id] || <Coins className="h-5 w-5" />}
                  </div>
                  <CardTitle className="text-lg">{pkg.credits} Credits</CardTitle>
                  {pkg.bonus_credits > 0 && (
                    <Badge variant="outline" className="mx-auto mt-1 text-emerald-600 border-emerald-500/30">
                      +{pkg.bonus_credits} Bonus
                    </Badge>
                  )}
                  <CardDescription className="text-2xl font-bold text-foreground mt-2">
                    {formatPrice(pkg.price_cents)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 text-center">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{value}</span> credits per $
                  </div>
                  {pkg.discount_percent > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      Save {pkg.discount_percent}%
                    </Badge>
                  )}
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isPopular ? "default" : "secondary"}
                    disabled={loadingPackage === pkg.id}
                    onClick={() => handlePurchase(pkg)}
                  >
                    {loadingPackage === pkg.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Buy ${pkg.credits + pkg.bonus_credits} Credits`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Value Proposition */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="font-semibold mb-1">Never Expires</h4>
              <p className="text-sm text-muted-foreground">Credits don't expire - use them whenever you need</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Works Everywhere</h4>
              <p className="text-sm text-muted-foreground">Use across all AI features in Genie Suite</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Bulk Savings</h4>
              <p className="text-sm text-muted-foreground">Bigger packs = more credits per dollar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
