/**
 * GLOBAL COMPLIANCE FOOTER
 * Displays all legal links and compliance information
 * Should be included on every public page
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Lock, Cookie, AlertTriangle, Scale, Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface GlobalComplianceFooterProps {
  variant?: 'full' | 'minimal' | 'inline';
  showCopyright?: boolean;
}

export const GlobalComplianceFooter: React.FC<GlobalComplianceFooterProps> = ({
  variant = 'full',
  showCopyright = true,
}) => {
  const legalLinks = [
    { to: '/terms', label: 'Terms of Service', icon: FileText },
    { to: '/privacy', label: 'Privacy Policy', icon: Lock },
    { to: '/cookies', label: 'Cookie Policy', icon: Cookie },
    { to: '/acceptable-use', label: 'Acceptable Use', icon: AlertTriangle },
    { to: '/content-guidelines', label: 'Content Guidelines', icon: Shield },
    { to: '/dmca', label: 'DMCA Policy', icon: Scale },
  ];

  const complianceBadges = [
    { label: 'GDPR', tooltip: 'General Data Protection Regulation Compliant' },
    { label: 'CCPA', tooltip: 'California Consumer Privacy Act Compliant' },
    { label: 'HIPAA', tooltip: 'Health Insurance Portability and Accountability Act Eligible' },
    { label: 'SOC 2', tooltip: 'Service Organization Control 2 Type II' },
  ];

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground py-2">
        {legalLinks.map((link) => (
          <Link key={link.to} to={link.to} className="hover:text-primary transition-colors">
            {link.label}
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {legalLinks.slice(0, 4).map((link) => (
                <Link key={link.to} to={link.to} className="hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
            {showCopyright && (
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Genie Suite. All rights reserved.
              </p>
            )}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              Legal
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <link.icon className="h-3 w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance Badges */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Compliance
            </h4>
            <div className="flex flex-wrap gap-2">
              {complianceBadges.map((badge) => (
                <span 
                  key={badge.label}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                  title={badge.tooltip}
                >
                  {badge.label}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              We are committed to protecting your data and maintaining the highest standards of security and compliance.
            </p>
          </div>

          {/* Global Compliance */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Global Coverage
            </h4>
            <p className="text-sm text-muted-foreground">
              Our platform complies with international data protection laws including GDPR (EU), CCPA (California), 
              LGPD (Brazil), PIPEDA (Canada), and PDPA (Singapore).
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              For healthcare subscribers, HIPAA Business Associate Agreements are available.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Genie Suite. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Do Not Sell My Personal Information</span>
            <span>•</span>
            <span>Manage Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GlobalComplianceFooter;
