/**
 * GENIE FEATURE DEPLOYMENT BUILDER
 * Generate deployment configuration based on selected features
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Code,
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  Copy,
  FileCode,
  Database,
  Server,
} from 'lucide-react';
import { GenieFeature, GENIE_FEATURE_CATALOG } from '@/types/genie-features';
import { useToast } from '@/hooks/use-toast';

interface GenieFeatureDeploymentBuilderProps {
  selectedFeatures: string[];
  brandName: string;
  domain?: string;
}

export const GenieFeatureDeploymentBuilder: React.FC<GenieFeatureDeploymentBuilderProps> = ({
  selectedFeatures,
  brandName,
  domain,
}) => {
  const { toast } = useToast();
  const [generatedCode, setGeneratedCode] = useState<{
    frontend: string;
    backend: string;
    database: string;
    config: string;
  }>({
    frontend: '',
    backend: '',
    database: '',
    config: '',
  });

  useEffect(() => {
    generateDeploymentCode();
  }, [selectedFeatures]);

  const generateDeploymentCode = () => {
    const features = selectedFeatures
      .map(id => GENIE_FEATURE_CATALOG.find(f => f.id === id))
      .filter(Boolean) as GenieFeature[];

    // Frontend code generation
    const frontendImports: string[] = [];
    const frontendComponents: string[] = [];
    const frontendConfig: string[] = [];

    if (selectedFeatures.includes('split_screen_conversation')) {
      frontendImports.push("import { SplitScreenConversation } from '@/components/genie/SplitScreenConversation';");
      frontendComponents.push('<SplitScreenConversation />');
    }

    if (selectedFeatures.includes('patient_onboarding')) {
      frontendImports.push("import { PatientEnrollmentWithWhatsApp } from '@/components/patient-enrollment/PatientEnrollmentWithWhatsApp';");
      frontendComponents.push('<PatientEnrollmentWithWhatsApp onComplete={handleComplete} />');
    }

    if (selectedFeatures.includes('streaming_responses')) {
      frontendConfig.push('streaming: true');
    }

    const frontendCode = `// Generated Frontend Configuration for ${brandName}
${frontendImports.join('\n')}

export const GenieConfiguration = {
  brandName: "${brandName}",
  domain: "${domain || 'your-domain.com'}",
  features: {
    ${frontendConfig.join(',\n    ')}
  },
  enabledComponents: [
    ${frontendComponents.map(c => `'${c}'`).join(',\n    ')}
  ]
};

// Main Component
export const CustomGenie = () => {
  const handleComplete = (data: any) => {
    console.log('Completed:', data);
  };

  return (
    <div className="genie-container">
      {/* Your Genie components will be rendered here */}
      ${frontendComponents.join('\n      ')}
    </div>
  );
};`;

    // Backend Edge Function code
    const backendFeatures: string[] = [];
    if (selectedFeatures.includes('multi_model_intelligence')) {
      backendFeatures.push('AI_PROCESSOR: true');
    }
    if (selectedFeatures.includes('rate_limiting')) {
      backendFeatures.push('RATE_LIMITER: true');
    }
    if (selectedFeatures.includes('advanced_rag')) {
      backendFeatures.push('RAG_ENABLED: true');
    }

    const backendCode = `// Generated Edge Function Configuration for ${brandName}
// File: supabase/functions/genie-${brandName.toLowerCase().replace(/\s+/g, '-')}/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const features = {
      ${backendFeatures.join(',\n      ')}
    };

    // Your custom logic based on enabled features
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${LOVABLE_API_KEY}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: ${selectedFeatures.includes('streaming_responses')},
      }),
    });

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": response.headers.get("Content-Type") || "text/event-stream" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});`;

    // Database migrations
    const databaseSchemas: string[] = [];
    if (selectedFeatures.includes('conversation_management')) {
      databaseSchemas.push(`
-- Conversations table
CREATE TABLE IF NOT EXISTS genie_conversations_${brandName.toLowerCase().replace(/\s+/g, '_')} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  conversation_data JSONB NOT NULL DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE genie_conversations_${brandName.toLowerCase().replace(/\s+/g, '_')} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON genie_conversations_${brandName.toLowerCase().replace(/\s+/g, '_')}
  FOR SELECT
  USING (auth.uid() = user_id);`);
    }

    if (selectedFeatures.includes('analytics')) {
      databaseSchemas.push(`
-- Analytics table
CREATE TABLE IF NOT EXISTS genie_analytics_${brandName.toLowerCase().replace(/\s+/g, '_')} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
    }

    const databaseCode = `-- Generated Database Schema for ${brandName}
${databaseSchemas.join('\n')}`;

    // Configuration file
    const configCode = `# Generated Configuration for ${brandName}
# File: genie-config-${brandName.toLowerCase().replace(/\s+/g, '-')}.yml

brand:
  name: ${brandName}
  domain: ${domain || 'your-domain.com'}

features:
${features.map(f => `  - ${f.id}: true  # ${f.name}`).join('\n')}

deployment:
  type: ${selectedFeatures.includes('whatsapp_integration') ? 'hybrid' : 'web'}
  channels:
${selectedFeatures.includes('whatsapp_integration') ? '    - whatsapp\n' : ''}    - web
${selectedFeatures.includes('voice_conversation') ? '    - voice\n' : ''}
security:
  hipaa_compliant: ${selectedFeatures.includes('hipaa_compliance')}
  encryption: ${selectedFeatures.includes('advanced_security')}
  rate_limiting: ${selectedFeatures.includes('rate_limiting')}`;

    setGeneratedCode({
      frontend: frontendCode,
      backend: backendCode,
      database: databaseCode,
      config: configCode,
    });
  };

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied to clipboard',
      description: `${type} code copied successfully`,
    });
  };

  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Deployment Code Generator
          </CardTitle>
          <CardDescription>
            Generated code based on {selectedFeatures.length} selected features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your deployment configuration is ready. Review and deploy the generated code below.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs defaultValue="frontend">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="frontend">
            <FileCode className="h-4 w-4 mr-2" />
            Frontend
          </TabsTrigger>
          <TabsTrigger value="backend">
            <Server className="h-4 w-4 mr-2" />
            Backend
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Database
          </TabsTrigger>
          <TabsTrigger value="config">
            <Code className="h-4 w-4 mr-2" />
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="frontend">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Frontend Component</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(generatedCode.frontend, 'Frontend')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(generatedCode.frontend, `${brandName}-frontend.tsx`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{generatedCode.frontend}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backend">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Edge Function</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(generatedCode.backend, 'Backend')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(generatedCode.backend, `index.ts`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{generatedCode.backend}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Database Schema</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(generatedCode.database, 'Database')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(generatedCode.database, `schema.sql`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{generatedCode.database}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Configuration File</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(generatedCode.config, 'Config')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(generatedCode.config, `config.yml`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{generatedCode.config}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Frontend Deployment</h4>
            <p className="text-sm text-muted-foreground">
              Copy the frontend code and integrate it into your React application
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">2. Backend Deployment</h4>
            <p className="text-sm text-muted-foreground">
              Create the edge function in your Supabase project under supabase/functions/
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">3. Database Setup</h4>
            <p className="text-sm text-muted-foreground">
              Run the generated SQL schema in your Supabase SQL editor
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">4. Configuration</h4>
            <p className="text-sm text-muted-foreground">
              Save the configuration file for reference and team documentation
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
