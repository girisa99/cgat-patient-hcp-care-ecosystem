/**
 * GENIE SUPPORT PAGE
 * Tier-aware support with Ask Genie AI and ticket submission
 * - All tiers: Ask Genie AI chat
 * - Pro+: Submit formal tickets
 * - Business+: Priority support & dedicated agent
 */
import React, { useState } from 'react';
import { GenieStudioLayout } from '@/components/layout/GenieStudioLayout';
import { AskGenie } from '@/components/genie-studio/AskGenie';
import SupportTicketCreator from '@/components/genie-support/SupportTicketCreator';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';
import { useGenieStudioNavigation } from '@/hooks/useGenieStudioNavigation';
import { 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft,
  FileText, 
  MessageSquare,
  Crown,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

// SLA response times by tier
const TIER_SLA = {
  free: { responseTime: '48 hours', priority: 'Standard' },
  starter: { responseTime: '24 hours', priority: 'Standard' },
  creator: { responseTime: '24 hours', priority: 'Standard' },
  pro: { responseTime: '12 hours', priority: 'Priority' },
  business: { responseTime: '4 hours', priority: 'High Priority' },
  enterprise: { responseTime: '1 hour', priority: 'Dedicated' },
};

const GenieSupportPage: React.FC = () => {
  const { isAuthenticated, genieUser } = useGenieStudioAuth();
  const { userTier, tierInfo } = useGenieStudioNavigation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'chat' | 'ticket'>('chat');

  const currentSLA = TIER_SLA[userTier] || TIER_SLA.free;
  const canSubmitTickets = ['pro', 'business', 'enterprise'].includes(userTier);
  
  return (
    <GenieStudioLayout variant="topbar" requireAuth={false}>
      <div className="container max-w-4xl py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/genie-studio')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Studio
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Genie Support Center
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Get help instantly with Ask Genie AI
            {canSubmitTickets && ' or submit a formal support ticket'}
          </p>
          
          {/* Tier Badge & SLA */}
          {isAuthenticated && tierInfo && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="gap-1">
                {(() => {
                  const TierIcon = tierInfo.icon;
                  return TierIcon ? <TierIcon className={`h-3 w-3 ${tierInfo.color}`} /> : null;
                })()}
                {tierInfo.name} Plan
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {currentSLA.priority} · {currentSLA.responseTime} response
              </Badge>
            </div>
          )}
        </div>
        
        {/* Auth prompt for better experience */}
        {!isAuthenticated && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">Sign in for personalized support</p>
                <p className="text-sm text-muted-foreground">
                  Track your conversations and get faster responses
                </p>
              </div>
              <Button onClick={() => navigate('/genie-studio-auth')} size="sm">
                Sign In <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Support Interface */}
        {canSubmitTickets ? (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'ticket')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Ask Genie
              </TabsTrigger>
              <TabsTrigger value="ticket" className="gap-2">
                <FileText className="h-4 w-4" />
                Submit Ticket
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat">
              <AskGenie
                product="support"
                position="inline"
                isOpen={true}
                className="w-full min-h-[500px]"
              />
            </TabsContent>
            
            <TabsContent value="ticket">
              <SupportTicketCreator />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            {/* Ask Genie AI for all users */}
            <AskGenie
              product="support"
              position="inline"
              isOpen={true}
              className="w-full min-h-[500px]"
            />
            
            {/* Upgrade prompt for ticket access */}
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  Need More Support Options?
                </CardTitle>
                <CardDescription>
                  Upgrade to Pro or higher for formal ticket submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>Priority support with faster response times</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Submit and track formal support tickets</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span>Direct escalation to human agents</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => navigate('/subscription')}
                >
                  View Plans
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => window.open('https://docs.genieaisuite.com', '_blank')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Browse guides and tutorials
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/genie-studio?tab=help')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">FAQs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Common questions answered
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => window.open('https://discord.gg/genieai', '_blank')}
          >
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
