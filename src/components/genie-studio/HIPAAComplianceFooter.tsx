/**
 * HIPAA Compliance Footer
 * Displays HIPAA compliance notice and security information
 * Addresses Ralph Wiggum critical finding: Missing HIPAA Compliance Notice
 */

import React, { useState } from 'react';
import { Shield, Lock, FileCheck, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HIPAAComplianceFooterProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const HIPAAComplianceFooter: React.FC<HIPAAComplianceFooterProps> = ({ 
  className,
  variant = 'compact'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const complianceItems = [
    {
      icon: Lock,
      label: 'End-to-End Encryption',
      description: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256)'
    },
    {
      icon: Shield,
      label: 'HIPAA Compliant',
      description: 'Infrastructure meets HIPAA security and privacy requirements'
    },
    {
      icon: FileCheck,
      label: 'Audit Logging',
      description: 'Complete audit trail of all PHI access and modifications'
    }
  ];

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <div className={cn(
          "flex items-center justify-center gap-3 py-2 px-4 bg-muted/30 border-t text-xs text-muted-foreground",
          className
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <Shield className="h-3.5 w-3.5 text-green-600" />
                <span>HIPAA Compliant</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">
                All Protected Health Information (PHI) is handled in accordance with HIPAA 
                security and privacy regulations. Data is encrypted and access is strictly controlled.
              </p>
            </TooltipContent>
          </Tooltip>
          
          <span className="text-muted-foreground/50">•</span>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-help">
                <Lock className="h-3.5 w-3.5 text-blue-600" />
                <span>Encrypted</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">
                End-to-end encryption using TLS 1.3 for data in transit and AES-256 for data at rest.
              </p>
            </TooltipContent>
          </Tooltip>
          
          <span className="text-muted-foreground/50">•</span>
          
          <a 
            href="/privacy-policy" 
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            Privacy Policy
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn(
      "border-t bg-gradient-to-b from-muted/20 to-muted/40",
      className
    )}>
      <Button
        variant="ghost"
        className="w-full py-2 px-4 flex items-center justify-between hover:bg-transparent"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Security & Compliance</span>
          <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-700 border-green-200">
            HIPAA
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <p className="text-xs text-muted-foreground">
            Genie Studio is designed to handle Protected Health Information (PHI) in compliance 
            with HIPAA regulations. Your data security is our priority.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {complianceItems.map((item) => (
              <div 
                key={item.label}
                className="flex items-start gap-2 p-2 rounded-lg bg-card border"
              >
                <item.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-[10px] text-muted-foreground">
              Last security audit: January 2026
            </p>
            <div className="flex gap-2">
              <a 
                href="/privacy-policy" 
                className="text-[10px] text-primary hover:underline flex items-center gap-1"
              >
                Privacy Policy <ExternalLink className="h-2.5 w-2.5" />
              </a>
              <a 
                href="/security" 
                className="text-[10px] text-primary hover:underline flex items-center gap-1"
              >
                Security Details <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HIPAAComplianceFooter;
