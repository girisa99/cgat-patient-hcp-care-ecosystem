/**
 * ENROLLMENT DEMO PAGE
 * Demonstrates various ways to integrate conversational enrollment
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnrollmentLauncher } from '@/components/global/EnrollmentLauncher';
import { UniversalEnrollmentHub } from '@/components/universal-enrollment/UniversalEnrollmentHub';
import { useGlobalConversationalEnrollment } from '@/hooks/useGlobalConversationalEnrollment';
import { MessageCircle, Sparkles, Users, Building, Package, UserPlus } from 'lucide-react';

export const EnrollmentDemoPage: React.FC = () => {
  const { openEnrollment } = useGlobalConversationalEnrollment();

  const demoScenarios = [
    {
      title: 'Patient Portal Integration',
      description: 'Add AI enrollment to patient portals',
      type: 'patient' as const,
      icon: Users,
      example: 'Perfect for healthcare platforms where patients need to complete intake forms'
    },
    {
      title: 'B2B Onboarding',
      description: 'Streamline business client onboarding',
      type: 'treatment_center' as const,
      icon: Building,
      example: 'Ideal for complex regulatory forms and compliance documentation'
    },
    {
      title: 'E-commerce Registration',
      description: 'Convert visitors to customers faster',
      type: 'customer' as const,
      icon: UserPlus,
      example: 'Reduce cart abandonment with conversational account setup'
    },
    {
      title: 'Vendor Onboarding',
      description: 'Simplify supplier registration',
      type: 'manufacturer' as const,
      icon: Package,
      example: 'Handle complex product catalogs and compliance requirements'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-3">
            <MessageCircle className="h-8 w-8 text-primary" />
            Conversational Enrollment System
            <Badge variant="default" className="text-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </CardTitle>
          <p className="text-lg text-muted-foreground mt-2">
            Transform complex forms into natural conversations. Reduce completion time by 40% 
            and increase conversion rates with AI-guided enrollment.
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="integration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integration">Integration Examples</TabsTrigger>
          <TabsTrigger value="launchers">Launcher Variants</TabsTrigger>
          <TabsTrigger value="scenarios">Use Cases</TabsTrigger>
          <TabsTrigger value="management">Management Hub</TabsTrigger>
        </TabsList>

        {/* Integration Examples */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Methods</CardTitle>
              <p className="text-muted-foreground">
                Multiple ways to integrate conversational enrollment into your application
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Floating Action Button Demo */}
              <div className="space-y-3">
                <h3 className="font-semibold">1. Floating Action Button</h3>
                <p className="text-sm text-muted-foreground">
                  Always accessible floating button in bottom-right corner (currently active on this page)
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <code className="text-sm">
                    {'<AppLayoutWithEnrollment showFloatingLauncher={true} />'}
                  </code>
                </div>
              </div>

              <Separator />

              {/* Inline Integration Demo */}
              <div className="space-y-3">
                <h3 className="font-semibold">2. Inline Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Embed enrollment options directly in your page content
                </p>
                <EnrollmentLauncher variant="inline" />
              </div>

              <Separator />

              {/* Menu Integration Demo */}
              <div className="space-y-3">
                <h3 className="font-semibold">3. Menu Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Add as dropdown menu in navigation or toolbar
                </p>
                <div className="flex gap-4">
                  <EnrollmentLauncher variant="menu" size="sm" />
                  <EnrollmentLauncher variant="menu" size="md" />
                  <EnrollmentLauncher variant="menu" size="lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Launcher Variants */}
        <TabsContent value="launchers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Floating Button</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fixed position, always accessible
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative h-32 bg-muted rounded-lg overflow-hidden">
                  <div className="absolute bottom-2 right-2">
                    <Button size="sm" className="rounded-full">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Best for: Global access across all pages
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dropdown Menu</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Integrated with existing UI
                </p>
              </CardHeader>
              <CardContent>
                <EnrollmentLauncher variant="menu" />
                <p className="text-xs text-muted-foreground mt-2">
                  Best for: Navigation bars, toolbars
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inline Cards</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Embedded in page content
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-12 bg-muted rounded flex items-center px-3 text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    Patient Enrollment
                  </div>
                  <div className="h-12 bg-muted rounded flex items-center px-3 text-sm">
                    <Building className="h-4 w-4 mr-2" />
                    Treatment Center
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Best for: Landing pages, dashboards
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Use Cases */}
        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demoScenarios.map((scenario) => (
              <Card key={scenario.type} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <scenario.icon className="h-5 w-5 text-primary" />
                    </div>
                    {scenario.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {scenario.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{scenario.example}</p>
                  <Button 
                    onClick={() => openEnrollment(scenario.type)}
                    className="w-full"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Try {scenario.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Management Hub */}
        <TabsContent value="management">
          <UniversalEnrollmentHub />
        </TabsContent>
      </Tabs>
    </div>
  );
};