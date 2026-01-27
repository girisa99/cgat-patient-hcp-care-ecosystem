/**
 * GENIE SUPPORT PAGE
 * Support page with AI chat and ticket submission
 * Accessible to all authenticated Genie Studio users
 */
import React from 'react';
import { GenieStudioLayout } from '@/components/layout/GenieStudioLayout';
import SupportTicketCreator from '@/components/genie-support/SupportTicketCreator';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const GenieSupportPage: React.FC = () => {
  const { isAuthenticated } = useGenieStudioAuth();
  const navigate = useNavigate();
  
  return (
    <GenieStudioLayout variant="topbar">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Genie Support Center
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Get help instantly with our AI assistant or submit a ticket for detailed support
          </p>
        </div>
        
        {/* Auth prompt for better experience */}
        {!isAuthenticated && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">Sign in for personalized support</p>
                <p className="text-sm text-muted-foreground">
                  Track your tickets and get faster responses
                </p>
              </div>
              <Button onClick={() => navigate('/genie-studio-auth')} size="sm">
                Sign In <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Support Ticket Creator */}
        <SupportTicketCreator />
        
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Browse guides and tutorials
              </p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">FAQs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Common questions answered
              </p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Connect with other users
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </GenieStudioLayout>
  );
};

export default GenieSupportPage;
