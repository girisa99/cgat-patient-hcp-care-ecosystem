/**
 * Template License Selector Component
 * Allows users to select Creative Commons license when sharing templates
 * Addresses legal and authorization concerns for community sharing
 */

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Globe, 
  Lock, 
  Scale, 
  Info, 
  ChevronDown,
  Share2,
  UserCheck,
  DollarSign,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type LicenseType = 
  | 'private'           // Only visible to creator
  | 'cc0'               // Public Domain (no restrictions)
  | 'cc-by'             // Attribution required
  | 'cc-by-sa'          // Attribution + ShareAlike
  | 'cc-by-nc'          // Attribution + NonCommercial
  | 'cc-by-nc-sa';      // Attribution + NonCommercial + ShareAlike

interface LicenseOption {
  id: LicenseType;
  name: string;
  description: string;
  icon: React.ReactNode;
  isPublic: boolean;
  features: {
    attribution: boolean;
    commercial: boolean;
    derivatives: boolean;
    shareAlike: boolean;
  };
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const LICENSE_OPTIONS: LicenseOption[] = [
  {
    id: 'private',
    name: 'Private',
    description: 'Only you can access and use this template',
    icon: <Lock className="h-4 w-4" />,
    isPublic: false,
    features: {
      attribution: false,
      commercial: false,
      derivatives: false,
      shareAlike: false
    }
  },
  {
    id: 'cc0',
    name: 'Public Domain (CC0)',
    description: 'No copyright, anyone can use freely without restrictions',
    icon: <Globe className="h-4 w-4" />,
    isPublic: true,
    features: {
      attribution: false,
      commercial: true,
      derivatives: true,
      shareAlike: false
    },
    badge: 'Most Open',
    badgeVariant: 'outline'
  },
  {
    id: 'cc-by',
    name: 'Attribution (CC BY)',
    description: 'Others can use if they credit you as the creator',
    icon: <UserCheck className="h-4 w-4" />,
    isPublic: true,
    features: {
      attribution: true,
      commercial: true,
      derivatives: true,
      shareAlike: false
    },
    badge: 'Recommended',
    badgeVariant: 'default'
  },
  {
    id: 'cc-by-sa',
    name: 'Attribution-ShareAlike (CC BY-SA)',
    description: 'Credit required + derivatives must use same license',
    icon: <RefreshCw className="h-4 w-4" />,
    isPublic: true,
    features: {
      attribution: true,
      commercial: true,
      derivatives: true,
      shareAlike: true
    }
  },
  {
    id: 'cc-by-nc',
    name: 'Attribution-NonCommercial (CC BY-NC)',
    description: 'Credit required + no commercial use allowed',
    icon: <DollarSign className="h-4 w-4" />,
    isPublic: true,
    features: {
      attribution: true,
      commercial: false,
      derivatives: true,
      shareAlike: false
    }
  },
  {
    id: 'cc-by-nc-sa',
    name: 'Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)',
    description: 'Credit required + non-commercial + same license',
    icon: <Scale className="h-4 w-4" />,
    isPublic: true,
    features: {
      attribution: true,
      commercial: false,
      derivatives: true,
      shareAlike: true
    },
    badge: 'Most Protective',
    badgeVariant: 'secondary'
  }
];

interface TemplateLicenseSelectorProps {
  value: LicenseType;
  onChange: (license: LicenseType) => void;
  tosAccepted: boolean;
  onTosChange: (accepted: boolean) => void;
  className?: string;
}

export function TemplateLicenseSelector({
  value,
  onChange,
  tosAccepted,
  onTosChange,
  className
}: TemplateLicenseSelectorProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const selectedLicense = LICENSE_OPTIONS.find(l => l.id === value);
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* License Selection */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Template License</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Choose how others can use your template. Creative Commons licenses are 
                  internationally recognized and legally enforceable.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <RadioGroup value={value} onValueChange={(v) => onChange(v as LicenseType)}>
          <div className="grid gap-2">
            {LICENSE_OPTIONS.map((license) => (
              <div
                key={license.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                  value === license.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
                onClick={() => onChange(license.id)}
              >
                <RadioGroupItem value={license.id} id={license.id} className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-1 rounded",
                      value === license.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {license.icon}
                    </div>
                    <Label htmlFor={license.id} className="font-medium cursor-pointer">
                      {license.name}
                    </Label>
                    {license.badge && (
                      <Badge variant={license.badgeVariant} className="text-[10px] px-1.5 py-0">
                        {license.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{license.description}</p>
                  
                  {value === license.id && license.isPublic && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {license.features.attribution && (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <UserCheck className="h-2.5 w-2.5" /> Credit Required
                        </Badge>
                      )}
                      {license.features.commercial && (
                        <Badge variant="outline" className="text-[10px] gap-1 text-green-600 border-green-200">
                          <DollarSign className="h-2.5 w-2.5" /> Commercial OK
                        </Badge>
                      )}
                      {!license.features.commercial && license.isPublic && (
                        <Badge variant="outline" className="text-[10px] gap-1 text-yellow-600 border-yellow-200">
                          <DollarSign className="h-2.5 w-2.5" /> Non-Commercial
                        </Badge>
                      )}
                      {license.features.shareAlike && (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <RefreshCw className="h-2.5 w-2.5" /> ShareAlike
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>
        
        {/* Learn More Link */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className={cn("h-3 w-3 transition-transform", showDetails && "rotate-180")} />
            Learn more about Creative Commons licenses
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="p-3 rounded-lg bg-muted/50 text-xs space-y-2">
              <p>
                <strong>Creative Commons</strong> licenses allow you to share your work while keeping 
                control over how it's used. They're recognized worldwide and provide legal protection.
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <UserCheck className="h-3 w-3" />
                  <span><strong>Attribution (BY)</strong>: Others must credit you</span>
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3" />
                  <span><strong>NonCommercial (NC)</strong>: No commercial use</span>
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="h-3 w-3" />
                  <span><strong>ShareAlike (SA)</strong>: Derivatives use same license</span>
                </li>
              </ul>
              <a 
                href="https://creativecommons.org/licenses/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Visit Creative Commons <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      {/* Terms of Service Agreement */}
      {selectedLicense?.isPublic && (
        <div className="space-y-3 pt-3 border-t">
          <div className="flex items-start gap-2">
            <Checkbox 
              id="tos-accept"
              checked={tosAccepted}
              onCheckedChange={(checked) => onTosChange(checked === true)}
            />
            <div className="grid gap-1 leading-none">
              <Label 
                htmlFor="tos-accept" 
                className="text-sm font-normal cursor-pointer"
              >
                I confirm the following:
              </Label>
              <ul className="text-xs text-muted-foreground space-y-1 mt-2 ml-2">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                  <span>I have the right to share this template (it's my original work or I have permission)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                  <span>The template does not contain copyrighted content I don't own</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                  <span>I understand the selected license is legally binding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                  <span>
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="text-primary hover:underline">
                      Terms of Service
                    </a>
                    {' '}and{' '}
                    <a href="/privacy" target="_blank" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </li>
              </ul>
            </div>
          </div>
          
          {!tosAccepted && (
            <p className="text-xs text-yellow-600 flex items-center gap-1.5">
              <Info className="h-3 w-3" />
              You must accept the terms to share publicly
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Get license display info for showing on templates
 */
export function getLicenseInfo(license: LicenseType): {
  name: string;
  shortName: string;
  icon: React.ReactNode;
  color: string;
  url?: string;
} {
  const option = LICENSE_OPTIONS.find(l => l.id === license);
  
  const licenseUrls: Record<string, string> = {
    'cc0': 'https://creativecommons.org/publicdomain/zero/1.0/',
    'cc-by': 'https://creativecommons.org/licenses/by/4.0/',
    'cc-by-sa': 'https://creativecommons.org/licenses/by-sa/4.0/',
    'cc-by-nc': 'https://creativecommons.org/licenses/by-nc/4.0/',
    'cc-by-nc-sa': 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
  };
  
  if (license === 'private') {
    return {
      name: 'Private',
      shortName: 'Private',
      icon: <Lock className="h-3 w-3" />,
      color: 'text-muted-foreground'
    };
  }
  
  return {
    name: option?.name || license,
    shortName: license.toUpperCase().replace('CC-', 'CC '),
    icon: option?.icon || <Scale className="h-3 w-3" />,
    color: 'text-primary',
    url: licenseUrls[license]
  };
}

export default TemplateLicenseSelector;
