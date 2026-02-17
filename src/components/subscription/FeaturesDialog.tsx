import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check } from 'lucide-react';
import { SubscriptionTier, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';

interface FeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: SubscriptionTier;
}

export const FeaturesDialog = ({ open, onOpenChange, tier }: FeaturesDialogProps) => {
  const config = SUBSCRIPTION_TIERS[tier];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.name} Features
            <Badge variant="outline" className="ml-2">
              {config.features.length} total
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Limits Section */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Plan Limits</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-md bg-muted/50 text-sm">
                <span className="font-medium">{config.limits.agents === -1 ? 'Unlimited' : config.limits.agents}</span>
                <span className="text-muted-foreground ml-1">Agents</span>
              </div>
              <div className="p-2 rounded-md bg-muted/50 text-sm">
                <span className="font-medium">{config.limits.apiCalls === -1 ? 'Unlimited' : config.limits.apiCalls.toLocaleString()}</span>
                <span className="text-muted-foreground ml-1">API/mo</span>
              </div>
              <div className="p-2 rounded-md bg-muted/50 text-sm">
                <span className="font-medium">{config.limits.storage}</span>
                <span className="text-muted-foreground ml-1">Storage</span>
              </div>
              <div className="p-2 rounded-md bg-muted/50 text-sm">
                <span className="font-medium">{config.limits.teamMembers === -1 ? 'Unlimited' : config.limits.teamMembers}</span>
                <span className="text-muted-foreground ml-1">Team</span>
              </div>
            </div>
          </div>
          
          {/* All Features */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">All Features</h4>
            <ul className="space-y-2">
              {config.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Restrictions if any */}
          {config.restrictions && config.restrictions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Limitations</h4>
              <ul className="space-y-1">
                {config.restrictions.map((restriction, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    {restriction}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeaturesDialog;
