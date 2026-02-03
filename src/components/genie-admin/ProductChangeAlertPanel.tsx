/**
 * ProductChangeAlertPanel
 * 
 * Dashboard panel showing product change alerts for Genie Cast.
 * Allows admins to manage screenshots and video regeneration.
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Camera,
  Film,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useProductChangeAlerts } from '@/hooks/useProductChangeAlerts';
import { useAIMessaging } from '@/hooks/useAIMessaging';
import { type GenieProductId, GENIE_PRODUCTS } from '@/services/marketing/productVersionTrackingService';
import { toast } from 'sonner';

interface ProductChangeAlertPanelProps {
  onCaptureScreenshots?: (productId: string) => void;
  onRegenerateVideo?: (productId: string) => void;
  className?: string;
}

export const ProductChangeAlertPanel: React.FC<ProductChangeAlertPanelProps> = ({
  onCaptureScreenshots,
  onRegenerateVideo,
  className,
}) => {
  const {
    alerts,
    criticalAlerts,
    warningAlerts,
    infoAlerts,
    productsNeedingAttention,
    summary,
    resolveAlert,
    markScreenshotsCaptured,
    markVideoGenerated,
    refresh,
  } = useProductChangeAlerts({ showNotifications: true });

  const {
    generateMessaging,
    isGenerating,
    latestMessaging,
  } = useAIMessaging();

  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const toggleProduct = (productId: string) => {
    const next = new Set(expandedProducts);
    if (next.has(productId)) {
      next.delete(productId);
    } else {
      next.add(productId);
    }
    setExpandedProducts(next);
  };

  const handleCaptureScreenshots = (productId: string) => {
    if (onCaptureScreenshots) {
      onCaptureScreenshots(productId);
    }
    markScreenshotsCaptured(productId);
  };

  const handleRegenerateVideo = (productId: string) => {
    if (onRegenerateVideo) {
      onRegenerateVideo(productId);
    }
    markVideoGenerated(productId);
  };

  const handleGenerateMessaging = async (productId: GenieProductId) => {
    await generateMessaging(productId, {
      type: 'product',
      targetAudience: ['content_creators', 'marketers'],
      competitors: ['canva', 'beautiful_ai'],
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="text-[10px]">Critical</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-[10px] border-warning text-warning">Warning</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">Info</Badge>;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className={cn("border-muted", className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
          <h3 className="font-semibold text-lg">All Products Up to Date</h3>
          <p className="text-sm text-muted-foreground mt-1">
            No pending changes requiring screenshot or video updates.
          </p>
          <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={refresh}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-warning/30", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Product Change Alerts
            </CardTitle>
            <CardDescription className="mt-1">
              {summary.productsNeedingUpdate} of {summary.totalProducts} products need attention
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {criticalAlerts.length > 0 && (
              <Badge variant="destructive">{criticalAlerts.length} Critical</Badge>
            )}
            {warningAlerts.length > 0 && (
              <Badge variant="outline" className="border-warning text-warning">
                {warningAlerts.length} Warning
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={refresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3">
            {productsNeedingAttention.map((product) => {
              const productAlerts = alerts.filter(a => a.productId === product.productId);
              const productInfo = GENIE_PRODUCTS[product.productId as GenieProductId];
              const isExpanded = expandedProducts.has(product.productId);

              return (
                <Collapsible
                  key={product.productId}
                  open={isExpanded}
                  onOpenChange={() => toggleProduct(product.productId)}
                >
                  <div className={cn(
                    "border rounded-lg overflow-hidden transition-colors",
                    product.severity === 'critical' ? "border-destructive/50 bg-destructive/5" :
                    product.severity === 'warning' ? "border-warning/50 bg-warning/5" :
                    "border-muted"
                  )}>
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: productInfo?.features ? '#9333EA' : '#6B7280' }}
                          />
                          <span className="font-medium text-sm">{product.productName}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            {product.alertCount} alert{product.alertCount !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        {getSeverityBadge(product.severity)}
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-3 pb-3 space-y-2 border-t border-muted/50 pt-2">
                        {/* Individual alerts */}
                        {productAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="flex items-start gap-2 p-2 bg-background/50 rounded-md"
                          >
                            {getSeverityIcon(alert.severity)}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium">{alert.message}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {alert.actionRequired}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                resolveAlert(alert.id, product.productId);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs h-7"
                            onClick={() => handleCaptureScreenshots(product.productId)}
                          >
                            <Camera className="w-3 h-3" />
                            Capture Screenshots
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs h-7"
                            onClick={() => handleRegenerateVideo(product.productId)}
                          >
                            <Film className="w-3 h-3" />
                            Regenerate Video
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs h-7"
                            onClick={() => handleGenerateMessaging(product.productId as GenieProductId)}
                            disabled={isGenerating}
                          >
                            <Sparkles className="w-3 h-3" />
                            {isGenerating ? 'Generating...' : 'AI Messaging'}
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>

        {/* Latest generated messaging preview */}
        {latestMessaging && (
          <div className="mt-4 p-3 border rounded-lg bg-muted/30">
            <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" />
              Latest AI Messaging (Pending Approval)
            </h4>
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-muted-foreground">Headline:</span>{' '}
                <span className="font-medium">{latestMessaging.headline}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Hook:</span>{' '}
                <span>{latestMessaging.hook}</span>
              </div>
              <div>
                <span className="text-muted-foreground">CTA:</span>{' '}
                <span className="text-primary">{latestMessaging.cta}</span>
              </div>
              <div className="flex gap-1 flex-wrap mt-2">
                {latestMessaging.hashtags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[9px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductChangeAlertPanel;
