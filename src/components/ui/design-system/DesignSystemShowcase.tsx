
import React from 'react';
import { Typography } from './Typography';
import { ColorPalette } from './ColorPalette';
import { SpacingSystem } from './Spacing';
import { ThemeToggle } from './ThemeToggle';
import { Grid, GridItem } from '../layout/Grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export const DesignSystemShowcase: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="mb-2">
            Design System Showcase
          </Typography>
          <Typography variant="body1" color="secondary">
            A comprehensive overview of our design system components and patterns
          </Typography>
        </div>
        <ThemeToggle />
      </div>

      {/* Typography Section */}
      <Card>
        <CardHeader>
          <CardTitle>Typography Scale</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Typography variant="h1">Heading 1 - Main Page Title</Typography>
          <Typography variant="h2">Heading 2 - Section Title</Typography>
          <Typography variant="h3">Heading 3 - Subsection</Typography>
          <Typography variant="h4">Heading 4 - Component Title</Typography>
          <Typography variant="h5">Heading 5 - Small Title</Typography>
          <Typography variant="h6">Heading 6 - Micro Title</Typography>
          <Typography variant="body1">Body 1 - Primary body text for readability</Typography>
          <Typography variant="body2">Body 2 - Secondary body text</Typography>
          <Typography variant="caption">Caption - Small descriptive text</Typography>
          <Typography variant="overline">Overline - Labels and categories</Typography>
        </CardContent>
      </Card>

      {/* Components Grid */}
      <Grid cols={2} gap="lg" responsive={{ mobile: 1, tablet: 2 }}>
        {/* Color System */}
        <GridItem>
          <ColorPalette />
        </GridItem>

        {/* Spacing System */}
        <GridItem>
          <SpacingSystem />
        </GridItem>
      </Grid>

      {/* Component Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Component Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <Grid cols={3} gap="md" responsive={{ mobile: 1, tablet: 2, laptop: 3 }}>
            {/* Buttons */}
            <GridItem>
              <div className="space-y-3">
                <Typography variant="h6">Buttons</Typography>
                <div className="space-y-2">
                  <Button className="w-full">Primary Button</Button>
                  <Button variant="secondary" className="w-full">Secondary</Button>
                  <Button variant="outline" className="w-full">Outline</Button>
                  <Button variant="ghost" className="w-full">Ghost</Button>
                </div>
              </div>
            </GridItem>

            {/* Badges */}
            <GridItem>
              <div className="space-y-3">
                <Typography variant="h6">Badges</Typography>
                <div className="space-y-2">
                  <div><Badge>Default</Badge></div>
                  <div><Badge variant="secondary">Secondary</Badge></div>
                  <div><Badge variant="destructive">Error</Badge></div>
                  <div><Badge variant="outline">Outline</Badge></div>
                </div>
              </div>
            </GridItem>

            {/* Alerts */}
            <GridItem>
              <div className="space-y-3">
                <Typography variant="h6">Status Colors</Typography>
                <div className="space-y-2">
                  <Alert className="p-2">
                    <Info className="h-3 w-3" />
                    <AlertDescription className="text-xs">Info message</AlertDescription>
                  </Alert>
                  <Alert className="p-2 border-green-200 bg-green-50">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <AlertDescription className="text-xs text-green-800">Success</AlertDescription>
                  </Alert>
                  <Alert className="p-2 border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-3 w-3 text-yellow-600" />
                    <AlertDescription className="text-xs text-yellow-800">Warning</AlertDescription>
                  </Alert>
                  <Alert className="p-2 border-red-200 bg-red-50">
                    <XCircle className="h-3 w-3 text-red-600" />
                    <AlertDescription className="text-xs text-red-800">Error</AlertDescription>
                  </Alert>
                </div>
              </div>
            </GridItem>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};
