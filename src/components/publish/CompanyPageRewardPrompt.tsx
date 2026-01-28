/**
 * CompanyPageRewardPrompt - Reward incentive prompt for company page sharing
 * 
 * Shows when user publishes content, offering bonus credits for
 * allowing their content to be shared on company pages.
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Gift, 
  Building2, 
  Sparkles, 
  Shield, 
  Users,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanyPage {
  id: string;
  name: string;
  platform: string;
  logoUrl?: string;
}

interface CompanyPageRewardPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePages: CompanyPage[];
  bonusCredits: number;
  onAccept: (selectedPages: string[]) => void;
  onDecline: () => void;
  contentTitle?: string;
  isBetaUser?: boolean;
  currentStreak?: number;
}

export const CompanyPageRewardPrompt: React.FC<CompanyPageRewardPromptProps> = ({
  open,
  onOpenChange,
  availablePages,
  bonusCredits,
  onAccept,
  onDecline,
  contentTitle,
  isBetaUser = false,
  currentStreak = 0,
}) => {
  const [selectedPages, setSelectedPages] = React.useState<string[]>([]);
  const [selectAll, setSelectAll] = React.useState(false);

  // Calculate total bonus based on selections + beta + streak
  const calculateTotalBonus = () => {
    let base = bonusCredits * selectedPages.length;
    if (isBetaUser) base *= 1.5; // 50% beta bonus
    if (currentStreak >= 7) base *= 1.25; // 25% streak bonus
    return Math.round(base);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedPages(checked ? availablePages.map(p => p.id) : []);
  };

  const handlePageToggle = (pageId: string) => {
    setSelectedPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleAccept = () => {
    onAccept(selectedPages);
    onOpenChange(false);
  };

  const handleDecline = () => {
    onDecline();
    onOpenChange(false);
  };

  const totalBonus = calculateTotalBonus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Earn Bonus Credits!
          </DialogTitle>
          <DialogDescription>
            Share your content on company pages and earn rewards
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Content being published */}
          {contentTitle && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">Publishing:</p>
              <p className="font-medium truncate">{contentTitle}</p>
            </div>
          )}

          {/* Reward summary */}
          <motion.div 
            className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">
                    +{totalBonus} Credits
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bonusCredits} per page × {selectedPages.length} selected
                  </p>
                </div>
              </div>
              
              {/* Bonus badges */}
              <div className="flex flex-col gap-1">
                {isBetaUser && (
                  <Badge variant="secondary" className="text-xs">
                    +50% Beta Bonus
                  </Badge>
                )}
                {currentStreak >= 7 && (
                  <Badge variant="outline" className="text-xs">
                    +25% Streak Bonus
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>

          {/* Company pages selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Select Company Pages
              </label>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-xs text-muted-foreground cursor-pointer">
                  Select All
                </label>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2">
              <AnimatePresence>
                {availablePages.map((page, index) => (
                  <motion.div
                    key={page.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPages.includes(page.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handlePageToggle(page.id)}
                  >
                    <Checkbox 
                      checked={selectedPages.includes(page.id)}
                      onCheckedChange={() => handlePageToggle(page.id)}
                    />
                    {page.logoUrl ? (
                      <img 
                        src={page.logoUrl} 
                        alt={page.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Building2 className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{page.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{page.platform}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      +{bonusCredits}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Your content remains yours</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Expanded reach</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={handleDecline}
            className="w-full sm:w-auto"
          >
            No Thanks
          </Button>
          <Button
            onClick={handleAccept}
            disabled={selectedPages.length === 0}
            className="w-full sm:w-auto gap-2"
          >
            Earn {totalBonus} Credits
            <ChevronRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyPageRewardPrompt;
