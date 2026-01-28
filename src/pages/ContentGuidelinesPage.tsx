/**
 * CONTENT GUIDELINES PAGE
 * Detailed guidelines for content creation and uploads
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GlobalComplianceFooter } from '@/components/compliance/GlobalComplianceFooter';
import { Shield, CheckCircle, XCircle, AlertTriangle, Image, Video, FileText, Mic } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ContentGuidelinesPage: React.FC = () => {
  const imageGuidelines = {
    allowed: [
      'Professional photography and stock images',
      'Original artwork and illustrations',
      'Screenshots with proper attribution',
      'Product photos for legitimate business use',
      'Educational diagrams and infographics',
    ],
    prohibited: [
      'Pornographic or sexually explicit imagery',
      'Gore, violence, or disturbing content',
      'Deepfakes or manipulated media intended to deceive',
      'Images of minors in inappropriate contexts',
      'Copyrighted images without license',
    ],
  };

  const videoGuidelines = {
    allowed: [
      'Professional presentations and tutorials',
      'Marketing and promotional content',
      'Educational and training videos',
      'Original creative content',
      'Licensed stock footage',
    ],
    prohibited: [
      'Adult or sexually explicit content',
      'Violence, abuse, or harmful activities',
      'Harassment or targeted attacks',
      'Misinformation or fake news',
      'Content violating others privacy',
    ],
  };

  const audioGuidelines = {
    allowed: [
      'Original voice recordings and narration',
      'Licensed music and sound effects',
      'Podcasts and professional audio content',
      'Text-to-speech for legitimate purposes',
      'Background music with proper licensing',
    ],
    prohibited: [
      'Voice cloning without consent',
      'Harassing or threatening audio',
      'Copyrighted music without license',
      'Misleading audio impersonations',
      'Audio promoting illegal activities',
    ],
  };

  const renderGuidelines = (guidelines: { allowed: string[]; prohibited: string[] }) => (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-green-600 mb-3 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Allowed
        </h4>
        <ul className="space-y-2">
          {guidelines.allowed.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-medium text-destructive mb-3 flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          Prohibited
        </h4>
        <ul className="space-y-2">
          {guidelines.prohibited.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Content Guidelines
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Alert className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            All content uploaded or generated on Genie Studio must comply with these guidelines. 
            Violations may result in content removal and account suspension.
          </AlertDescription>
        </Alert>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>General Principles</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-4">
            <p>
              Our platform is designed to empower creators while maintaining a safe and respectful 
              environment. All content should:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Be original or properly licensed</li>
              <li>Respect the rights and dignity of others</li>
              <li>Not promote harm, violence, or illegal activities</li>
              <li>Be appropriate for a professional environment</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </CardContent>
        </Card>

        <Tabs defaultValue="images" className="mb-8">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Image Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderGuidelines(imageGuidelines)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderGuidelines(videoGuidelines)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Audio Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderGuidelines(audioGuidelines)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Documents uploaded to our platform should contain only legitimate business, 
                  educational, or personal content. Do not upload documents containing:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    Malware, viruses, or malicious code
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    Personal information of others without consent
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    Confidential or classified information
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    Instructions for illegal activities
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Reporting Violations</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              If you encounter content that violates these guidelines, please report it immediately. 
              We take all reports seriously and will investigate promptly. Reports can be submitted 
              via the report button on any content or by emailing abuse@geniestudio.com.
            </p>
          </CardContent>
        </Card>
      </div>

      <GlobalComplianceFooter variant="minimal" />
    </div>
  );
};

export default ContentGuidelinesPage;
