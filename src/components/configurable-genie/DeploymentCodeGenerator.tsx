/**
 * DEPLOYMENT CODE GENERATOR
 * Generates embed codes and deployment instructions for configurable Genie
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Copy, 
  Download, 
  ExternalLink, 
  Globe, 
  Smartphone, 
  Monitor,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { GenieBrandConfig } from '@/hooks/useGenieBrandConfig';

interface DeploymentCodeGeneratorProps {
  config: GenieBrandConfig;
  onClose: () => void;
}

export const DeploymentCodeGenerator: React.FC<DeploymentCodeGeneratorProps> = ({
  config,
  onClose
}) => {
  const [domain, setDomain] = useState('');
  const [embedType, setEmbedType] = useState(config.deployment_config.embedType);
  const [position, setPosition] = useState(config.deployment_config.position);
  const [customizations, setCustomizations] = useState({
    width: '400px',
    height: '600px',
    borderRadius: '12px',
    zIndex: '9999'
  });

  // Generate base embed code
  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const configId = config.id;
    
    return `<!-- GENIE AI Configurable Widget -->
<script>
  (function() {
    window.genieConfig = {
      configId: '${configId}',
      embedType: '${embedType}',
      position: '${position}',
      domain: '${domain}',
      customizations: ${JSON.stringify(customizations, null, 6)}
    };

    // Load the GENIE widget script
    var script = document.createElement('script');
    script.src = '${baseUrl}/genie-embed.js';
    script.async = true;
    script.onload = function() {
      if (window.GenieWidget) {
        window.GenieWidget.init(window.genieConfig);
      }
    };
    document.head.appendChild(script);

    // Load styles
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '${baseUrl}/genie-embed.css';
    document.head.appendChild(link);
  })();
</script>
<!-- End GENIE AI Widget -->`;
  };

  // Generate React component code
  const generateReactCode = () => {
    return `import React from 'react';
import { ConfigurableGenieWidget } from '@your-package/genie-widget';

export const MyGenieWidget = () => {
  return (
    <ConfigurableGenieWidget
      configId="${config.id}"
      embedType="${embedType}"
      position="${position}"
      domain="${domain}"
      className="my-genie-widget"
    />
  );
};`;
  };

  // Generate WordPress shortcode
  const generateWordPressCode = () => {
    return `[genie_ai config_id="${config.id}" embed_type="${embedType}" position="${position}" domain="${domain}"]`;
  };

  // Generate API integration code
  const generateAPICode = () => {
    return `// Initialize GENIE with configuration
const genie = new GenieAPI({
  configId: '${config.id}',
  domain: '${domain}',
  embedType: '${embedType}'
});

// Start conversation
await genie.startConversation({
  welcomeMessage: '${config.welcome_message}',
  systemPrompt: '${config.system_prompt}',
  models: ${JSON.stringify(config.model_config.defaultModels, null, 2)},
  ragEnabled: ${config.rag_config.enabled}
});

// Send message
const response = await genie.sendMessage('Hello, GENIE!');
console.log(response);`;
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Code copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  // Download as file
  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const CodeBlock = ({ title, code, filename, language = 'html' }: { 
    title: string; 
    code: string; 
    filename: string; 
    language?: string; 
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          {title}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(code)}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadAsFile(code, filename)}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{code}</code>
          </pre>
          <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
            {language}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Deploy Configuration</h1>
            <p className="text-muted-foreground mt-1">
              Generate embed codes for {config.brand_name}
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Deployment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Target Domain</Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="https://yourdomain.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="embed_type">Embed Type</Label>
              <Select value={embedType} onValueChange={(value) => setEmbedType(value as typeof embedType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popup">Popup</SelectItem>
                  <SelectItem value="inline">Inline</SelectItem>
                  <SelectItem value="fullscreen">Fullscreen</SelectItem>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select value={position} onValueChange={(value) => setPosition(value as typeof position)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline">
              <Smartphone className="h-3 w-3 mr-1" />
              {config.model_config.defaultModels.length} Models
            </Badge>
            <Badge variant="outline">
              <Globe className="h-3 w-3 mr-1" />
              {config.rag_config.enabled ? 'RAG Enabled' : 'RAG Disabled'}
            </Badge>
            <Badge variant="outline">
              <Monitor className="h-3 w-3 mr-1" />
              {config.mcp_config.enabled ? 'MCP Enabled' : 'MCP Disabled'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Code Generation Tabs */}
      <Tabs defaultValue="html" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="html">HTML/JS</TabsTrigger>
          <TabsTrigger value="react">React</TabsTrigger>
          <TabsTrigger value="wordpress">WordPress</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="html" className="space-y-6">
          <CodeBlock
            title="HTML Embed Code"
            code={generateEmbedCode()}
            filename={`genie-embed-${config.brand_name.toLowerCase().replace(/\s+/g, '-')}.html`}
            language="html"
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Installation Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-semibold">Copy the embed code</h4>
                  <p className="text-sm text-muted-foreground">Copy the HTML code above</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-semibold">Paste before closing &lt;/body&gt; tag</h4>
                  <p className="text-sm text-muted-foreground">Add the code to your website's HTML, just before the closing body tag</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-semibold">Test the widget</h4>
                  <p className="text-sm text-muted-foreground">Refresh your page and interact with the GENIE widget</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="react" className="space-y-6">
          <CodeBlock
            title="React Component"
            code={generateReactCode()}
            filename={`GenieWidget.tsx`}
            language="tsx"
          />
        </TabsContent>

        <TabsContent value="wordpress" className="space-y-6">
          <CodeBlock
            title="WordPress Shortcode"
            code={generateWordPressCode()}
            filename={`genie-shortcode.txt`}
            language="text"
          />
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <CodeBlock
            title="API Integration"
            code={generateAPICode()}
            filename={`genie-api-integration.js`}
            language="javascript"
          />
        </TabsContent>
      </Tabs>

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Security Notice</h3>
              <p className="text-sm text-amber-800 mt-1">
                Ensure your domain is configured correctly to prevent unauthorized usage. 
                The widget will only work on domains you specify in the configuration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};