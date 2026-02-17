/**
 * PAGE-SPECIFIC ENROLLMENT DEMO
 * Shows how enrollment adapts to different page contexts
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnrollmentLauncher } from '@/components/global/EnrollmentLauncher';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building, 
  Package, 
  UserPlus, 
  ArrowRight, 
  CheckCircle,
  MapPin,
  Eye
} from 'lucide-react';

export const PageSpecificEnrollmentDemo: React.FC = () => {
  const navigate = useNavigate();

  const pageExamples = [
    {
      path: '/patients',
      title: 'Patient Portal',
      description: 'Shows only Patient Enrollment option',
      moduleType: 'patient',
      icon: Users,
      color: 'bg-blue-500',
      expectedBehavior: 'Floating button shows only "Patient Enrollment" - no other options'
    },
    {
      path: '/patient-onboarding', 
      title: 'Patient Onboarding Page',
      description: 'Context-specific patient enrollment',
      moduleType: 'patient',
      icon: Users,
      color: 'bg-blue-500',
      expectedBehavior: 'AI greeting: "Welcome to patient onboarding! Let me help you..."'
    },
    {
      path: '/treatment-centers',
      title: 'Treatment Centers',
      description: 'Shows only Treatment Center Registration',
      moduleType: 'treatment_center',
      icon: Building,
      color: 'bg-green-500',
      expectedBehavior: 'Floating button shows only "Treatment Center Registration"'
    },
    {
      path: '/facilities',
      title: 'Facilities Management',
      description: 'Facility-specific onboarding process',
      moduleType: 'treatment_center',
      icon: Building,
      color: 'bg-green-500',
      expectedBehavior: 'AI greeting: "Let\'s complete your facility registration..."'
    },
    {
      path: '/order-management',
      title: 'Order Management',
      description: 'Shows Customer Registration for ordering',
      moduleType: 'customer',
      icon: UserPlus,
      color: 'bg-purple-500',
      expectedBehavior: 'AI greeting: "I see you want to place orders. Let me help you register..."'
    },
    {
      path: '/system-integration',
      title: 'System Integration',
      description: 'Shows Vendor/Manufacturer Registration',
      moduleType: 'manufacturer',
      icon: Package,
      color: 'bg-orange-500',
      expectedBehavior: 'AI greeting: "Let\'s get you registered as a vendor partner..."'
    }
  ];

  const generalPages = [
    {
      path: '/dashboard',
      title: 'Dashboard',
      description: 'Shows all enrollment options',
      expectedBehavior: 'No floating button (too generic) - use inline or menu components'
    },
    {
      path: '/enrollment-demo',
      title: 'Enrollment Demo Page',
      description: 'Full demonstration of all features',
      expectedBehavior: 'Shows all enrollment types for testing purposes'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-3">
            <MapPin className="h-6 w-6 text-primary" />
            Page-Aware Enrollment System
          </CardTitle>
          <p className="text-muted-foreground">
            The enrollment system automatically adapts to show only relevant options based on the current page context.
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="specific-pages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="specific-pages">Page-Specific Examples</TabsTrigger>
          <TabsTrigger value="current-demo">Current Page Demo</TabsTrigger>
          <TabsTrigger value="testing">Test Navigation</TabsTrigger>
        </TabsList>

        {/* Page-Specific Examples */}
        <TabsContent value="specific-pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page-Specific Enrollment Behavior</CardTitle>
              <p className="text-muted-foreground">
                Each page shows only the relevant enrollment option based on its context
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pageExamples.map((example) => (
                  <Card key={example.path} className="border-l-4" style={{ borderLeftColor: example.color.replace('bg-', '#') }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${example.color} text-white`}>
                          <example.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{example.title}</CardTitle>
                          <Badge variant="outline" className="text-xs mt-1">
                            {example.path}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {example.description}
                      </p>
                      
                      <div className="p-2 bg-muted rounded text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="font-medium">Expected Behavior:</span>
                        </div>
                        <p>{example.expectedBehavior}</p>
                      </div>

                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate(example.path)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Visit Page
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* General Pages */}
          <Card>
            <CardHeader>
              <CardTitle>General Pages Behavior</CardTitle>
              <p className="text-muted-foreground">
                These pages show different enrollment behavior
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generalPages.map((example) => (
                  <Card key={example.path}>
                    <CardHeader>
                      <CardTitle className="text-sm">{example.title}</CardTitle>
                      <Badge variant="outline" className="text-xs w-fit">
                        {example.path}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {example.description}
                      </p>
                      <div className="p-2 bg-muted rounded text-xs">
                        <p>{example.expectedBehavior}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(example.path)}
                      >
                        Visit {example.title}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Current Page Demo */}
        <TabsContent value="current-demo">
          <Card>
            <CardHeader>
              <CardTitle>Current Page: Enrollment Demo</CardTitle>
              <p className="text-muted-foreground">
                This page shows all enrollment options since it's a demo/testing page
              </p>
            </CardHeader>
            <CardContent>
              <EnrollmentLauncher variant="inline" showAllOptions={true} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Navigation */}
        <TabsContent value="testing">
          <Card>
            <CardHeader>
              <CardTitle>Test Page Navigation</CardTitle>
              <p className="text-muted-foreground">
                Use these buttons to quickly navigate and test the page-aware enrollment system
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {pageExamples.map((example) => (
                  <Button
                    key={example.path}
                    variant="outline"
                    size="sm"
                    className="h-auto p-3 flex flex-col items-center gap-2"
                    onClick={() => navigate(example.path)}
                  >
                    <example.icon className="h-4 w-4" />
                    <span className="text-xs text-center">{example.title}</span>
                  </Button>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">Testing Instructions:</h4>
                <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                  <li>Click any page button above to navigate</li>
                  <li>Check the floating button in the bottom-right corner</li>
                  <li>Notice how it shows only relevant enrollment options</li>
                  <li>Try starting a conversation to see contextual AI greetings</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};