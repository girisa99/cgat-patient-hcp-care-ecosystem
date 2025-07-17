import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Palette,
  Upload,
  Download,
  Save,
  ImageIcon,
  Type,
  Check,
  Move,
  Image as ImageLucide,
  EyeIcon,
  Bot,
  Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  logo?: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  isDefault?: boolean;
}

interface EnhancedAgentCanvasProps {
  initialName?: string;
  initialTagline?: string;
  initialPrimaryColor?: string;
  initialSecondaryColor?: string;
  initialAccentColor?: string;
  initialLogo?: string;
  onNameChange?: (name: string) => void;
  onTaglineChange?: (tagline: string) => void;
  onPrimaryColorChange?: (color: string) => void;
  onSecondaryColorChange?: (color: string) => void;
  onAccentColorChange?: (color: string) => void;
  onLogoChange?: (file: File | null, url: string) => void;
}

export const EnhancedAgentCanvas: React.FC<EnhancedAgentCanvasProps> = ({
  initialName = '',
  initialTagline = '',
  initialPrimaryColor = '#3b82f6',
  initialSecondaryColor = '#8b5cf6',
  initialAccentColor = '#06b6d4',
  initialLogo = '',
  onNameChange,
  onTaglineChange,
  onPrimaryColorChange,
  onSecondaryColorChange,
  onAccentColorChange,
  onLogoChange
}) => {
  const [canvasName, setCanvasName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6');
  const [accentColor, setAccentColor] = useState('#06b6d4');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [templates, setTemplates] = useState<CanvasTemplate[]>([
    {
      id: 'default',
      name: 'Default Canvas',
      description: 'Standard canvas with default settings',
      tagline: 'Intelligent Healthcare Solutions',
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#06b6d4',
      isDefault: true
    },
    {
      id: 'medical',
      name: 'Medical Canvas',
      description: 'Designed for medical organizations',
      tagline: 'Advanced Medical Intelligence',
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      accentColor: '#0ea5e9'
    },
    {
      id: 'pharma',
      name: 'Pharmaceutical Canvas',
      description: 'Optimized for pharmaceutical companies',
      tagline: 'Next-Generation Treatment Solutions',
      primaryColor: '#6366f1',
      secondaryColor: '#4f46e5',
      accentColor: '#ec4899'
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleNewLogo(file);
  };

  const handleNewLogo = (file?: File | null) => {
    if (file) {
      setLogo(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      toast({
        title: "Logo Added",
        description: "Logo has been uploaded and added to your canvas."
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleNewLogo(e.dataTransfer.files[0]);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      let logoUrl = null;
      
      // Upload logo if available
      if (logo) {
        const fileName = `canvas-logos/${Date.now()}-${logo.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from('agent-assets')
          .upload(fileName, logo);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase
          .storage
          .from('agent-assets')
          .getPublicUrl(fileName);
          
        logoUrl = data.publicUrl;
      }
      
      // Save template data (using api_integration_registry as storage)
      const { error } = await supabase
        .from('api_integration_registry')
        .insert({
          name: canvasName || 'Unnamed Canvas',
          description: 'Custom canvas template',
          category: 'canvas_template',
          type: 'template',
          direction: 'bidirectional',
          purpose: 'Canvas white-labeling template',
          contact_info: {
            logo_url: logoUrl,
            tagline,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            accent_color: accentColor
          }
        });
        
      if (error) throw error;
      
      toast({
        title: "Canvas Template Saved",
        description: "Your canvas template has been saved successfully."
      });
      
      // Reset form
      setCanvasName('');
      setLogo(null);
      setLogoPreview(null);
      
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleTemplateSelect = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setSelectedTemplate(id);
      setPrimaryColor(template.primaryColor);
      setSecondaryColor(template.secondaryColor);
      setAccentColor(template.accentColor);
      setTagline(template.tagline);
      
      if (template.logo) {
        setLogoPreview(template.logo);
      } else {
        setLogoPreview(null);
        setLogo(null);
      }
      
      toast({
        title: "Template Applied",
        description: `Applied ${template.name} template to your canvas.`
      });
    }
  };

  const handleExportTemplate = () => {
    const templateData = {
      name: canvasName || 'Exported Canvas',
      tagline,
      primaryColor,
      secondaryColor,
      accentColor,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(templateData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${canvasName || 'canvas-template'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template Exported",
      description: "Canvas template has been exported as JSON file."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agent Canvas</h3>
          <p className="text-sm text-muted-foreground">
            Customize and white-label your agent canvas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleSaveTemplate}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Canvas Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Canvas Configuration</CardTitle>
              <CardDescription>
                Configure the appearance and branding of your agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="canvas-name">Canvas Name</Label>
                <Input
                  id="canvas-name"
                  value={canvasName}
                  onChange={(e) => setCanvasName(e.target.value)}
                  placeholder="My Canvas Template"
                />
              </div>
              
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Your healthcare AI partner"
                />
                <p className="text-xs text-muted-foreground mt-1">Short tagline to appear with your logo</p>
              </div>
              
              <div>
                <Label>Logo</Label>
                <div 
                  ref={dropZoneRef}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${isDragging ? 'border-primary bg-primary/10' : 'border-border'}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  {logoPreview ? (
                    <div className="relative w-32 h-32 mx-auto">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-full h-full object-contain"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogo(null);
                          setLogoPreview(null);
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 2MB</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Color Scheme</CardTitle>
              <CardDescription>
                Define the color palette for your branded agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-md border cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="secondary-color"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-md border cursor-pointer"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="accent-color"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-md border cursor-pointer"
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Color Preview</Label>
                <div className="flex gap-2 mt-2">
                  <div className="h-10 flex-1 rounded" style={{ backgroundColor: primaryColor }}></div>
                  <div className="h-10 flex-1 rounded" style={{ backgroundColor: secondaryColor }}></div>
                  <div className="h-10 flex-1 rounded" style={{ backgroundColor: accentColor }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Template Selection and Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Selection</CardTitle>
              <CardDescription>
                Choose from pre-defined canvas templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {templates.map(template => (
                  <div 
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 ${selectedTemplate === template.id ? 'border-primary bg-primary/5' : ''}`}
                  >
                    <div 
                      className="w-8 h-8 rounded"
                      style={{ background: `linear-gradient(135deg, ${template.primaryColor}, ${template.secondaryColor})` }}
                    ></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </div>
                    {template.isDefault && (
                      <Badge variant="outline" className="text-xs">Default</Badge>
                    )}
                    {selectedTemplate === template.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Canvas Preview</CardTitle>
              <CardDescription>
                See how your agent canvas will appear to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="border rounded-lg p-6"
                style={{ background: `linear-gradient(to bottom, ${primaryColor}10, ${secondaryColor}05)` }}
              >
                <div className="flex items-center gap-3 mb-6">
                  {logoPreview && (
                    <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: primaryColor }}>
                      {canvasName || "Agent Canvas"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{tagline || "Your healthcare AI partner"}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" style={{ color: primaryColor }} />
                    <span className="font-medium">Virtual Healthcare Assistant</span>
                  </div>
                  
                  <div className="bg-background p-4 rounded-lg border">
                    <p className="text-sm mb-2">Sample agent interaction:</p>
                    <div className="flex gap-2 items-start mb-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted p-3 rounded-lg text-sm flex-1">
                        Hello! I'm your healthcare assistant. How can I help you today?
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="bg-primary/10 p-3 rounded-lg text-sm flex-1">
                        I need information about the latest treatment options.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button style={{ backgroundColor: primaryColor }}>
                      Primary Action
                    </Button>
                    <Button variant="outline" style={{ borderColor: secondaryColor, color: secondaryColor }}>
                      Secondary Action
                    </Button>
                    <Button variant="ghost" style={{ color: accentColor }}>
                      Accent Action
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};