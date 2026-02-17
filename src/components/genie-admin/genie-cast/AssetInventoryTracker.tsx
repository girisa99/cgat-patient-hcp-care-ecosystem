/**
 * Asset Inventory Tracker
 * Dashboard showing per-product, per-screen coverage with missing/outdated/new indicators
 */

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useProductAssetInventory, type ProductCoverage } from '@/hooks/useProductAssetInventory';
import { PRODUCT_SCREENS } from '@/components/genie-admin/MultiScreenshotGallery';

interface AssetInventoryTrackerProps {
  onCaptureProduct?: (productId: string) => void;
  className?: string;
}

function CoverageRow({ 
  coverage, 
  onCapture,
  onMarkOutdated,
}: { 
  coverage: ProductCoverage;
  onCapture?: (productId: string) => void;
  onMarkOutdated?: (productId: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const screens = PRODUCT_SCREENS[coverage.productId] || [];

  const statusIcon = coverage.coveragePercent === 100 
    ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    : coverage.coveragePercent > 0
    ? <AlertTriangle className="h-4 w-4 text-amber-500" />
    : <XCircle className="h-4 w-4 text-destructive" />;

  const statusColor = coverage.coveragePercent === 100 
    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
    : coverage.coveragePercent > 0
    ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/30'
    : 'text-destructive bg-red-50 dark:bg-red-950/30';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-border/50 rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: coverage.productColor }} 
            />
            
            <span className="text-sm font-medium flex-1 text-left">{coverage.productName}</span>
            
            <div className="flex items-center gap-2">
              {coverage.outdatedScreens > 0 && (
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  {coverage.outdatedScreens} outdated
                </Badge>
              )}
              
              <Badge variant="outline" className={cn("text-[10px]", statusColor)}>
                {coverage.capturedScreens}/{coverage.totalScreens}
              </Badge>
              
              {statusIcon}
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Progress bar */}
        <div className="px-3 pb-2">
          <Progress 
            value={coverage.coveragePercent} 
            className="h-1.5"
          />
        </div>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2">
            {/* Screen-by-screen status */}
            <div className="space-y-1">
              {screens.map(screen => {
                const captured = coverage.capturedItems.find(i => i.screen_key === screen.id);
                const isMissing = !captured;
                
                return (
                  <div 
                    key={screen.id}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded text-xs",
                      isMissing ? "bg-destructive/5" : "bg-muted/30"
                    )}
                  >
                    {isMissing ? (
                      <XCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                    )}
                    
                    <span className={cn("flex-1", isMissing && "text-destructive")}>
                      {screen.name}
                    </span>
                    
                    {captured && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(captured.captured_at).toLocaleDateString()}
                      </span>
                    )}
                    
                    {isMissing && (
                      <Badge variant="outline" className="text-[9px] text-destructive border-destructive/30 h-4">
                        Missing
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              {coverage.missingScreens.length > 0 && onCapture && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => onCapture(coverage.productId)}
                >
                  <Camera className="h-3 w-3" />
                  Capture Missing ({coverage.missingScreens.length})
                </Button>
              )}
              {coverage.capturedScreens > 0 && onMarkOutdated && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-muted-foreground"
                  onClick={() => onMarkOutdated(coverage.productId)}
                >
                  <RefreshCw className="h-3 w-3" />
                  Mark All Outdated
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function AssetInventoryTracker({ onCaptureProduct, className }: AssetInventoryTrackerProps) {
  const { coverage, isLoading, markOutdated } = useProductAssetInventory();

  const totalScreens = coverage.reduce((sum, c) => sum + c.totalScreens, 0);
  const totalCaptured = coverage.reduce((sum, c) => sum + c.capturedScreens, 0);
  const totalMissing = coverage.reduce((sum, c) => sum + c.missingScreens.length, 0);
  const totalOutdated = coverage.reduce((sum, c) => sum + c.outdatedScreens, 0);
  const overallPercent = totalScreens > 0 ? Math.round((totalCaptured / totalScreens) * 100) : 0;

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-32 text-muted-foreground", className)}>
        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        Loading inventory...
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Asset Inventory</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn(
            "text-[10px]",
            overallPercent === 100 ? "text-emerald-600" : "text-amber-600"
          )}>
            {overallPercent}% coverage
          </Badge>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50">
          <div className="text-lg font-bold text-emerald-600">{totalCaptured}</div>
          <div className="text-[10px] text-emerald-600/80">Captured</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-destructive/5 border border-destructive/20">
          <div className="text-lg font-bold text-destructive">{totalMissing}</div>
          <div className="text-[10px] text-destructive/80">Missing</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50">
          <div className="text-lg font-bold text-amber-600">{totalOutdated}</div>
          <div className="text-[10px] text-amber-600/80">Outdated</div>
        </div>
      </div>

      <Progress value={overallPercent} className="h-2" />

      {/* Per-Product Breakdown */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2 pr-2">
          {coverage.map(c => (
            <CoverageRow
              key={c.productId}
              coverage={c}
              onCapture={onCaptureProduct}
              onMarkOutdated={markOutdated}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
