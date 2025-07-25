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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Users,
  HelpCircle,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  Info
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
  const [canvasName, setCanvasName] = useState(initialName);
  const [tagline, setTagline] = useState(initialTagline);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogo || null);
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor);
  const [accentColor, setAccentColor] = useState(initialAccentColor);
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
      name: 'Medical Professional',
      description: 'Designed for medical organizations and healthcare providers',
      tagline: 'Advanced Medical Intelligence',
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      accentColor: '#0ea5e9'
    },
    {
      id: 'pharma',
      name: 'Pharmaceutical',
      description: 'Optimized for pharmaceutical companies and research',
      tagline: 'Next-Generation Treatment Solutions',
      primaryColor: '#6366f1',
      secondaryColor: '#4f46e5',
      accentColor: '#ec4899'
    },
    {
      id: 'clinical',
      name: 'Clinical Research',
      description: 'Perfect for clinical trials and research institutions',
      tagline: 'Evidence-Based Healthcare AI',
      primaryColor: '#f59e0b',
      secondaryColor: '#d97706',
      accentColor: '#7c3aed'
    },
    {
      id: 'patient',
      name: 'Patient Care',
      description: 'Focused on patient engagement and care coordination',
      tagline: 'Personalized Patient Experience',
      primaryColor: '#ef4444',
      secondaryColor: '#dc2626',
      accentColor: '#0891b2'
    },
    {
      id: 'insurance',
      name: 'Insurance & Benefits',
      description: 'Designed for insurance companies and benefit management',
      tagline: 'Smart Insurance Solutions',
      primaryColor: '#8b5cf6',
      secondaryColor: '#7c3aed',
      accentColor: '#06b6d4'
    },
    {
      id: 'telehealth',
      name: 'Telehealth',
      description: 'Optimized for remote healthcare and telemedicine',
      tagline: 'Connected Healthcare Everywhere',
      primaryColor: '#06b6d4',
      secondaryColor: '#0891b2',
      accentColor: '#10b981'
    },
    {
      id: 'minimal',
      name: 'Minimal Clean',
      description: 'Clean and minimal design for modern applications',
      tagline: 'Simple. Smart. Effective.',
      primaryColor: '#64748b',
      secondaryColor: '#475569',
      accentColor: '#0f172a'
    }
  ]);
  
  const [customColorPalettes] = useState([
    { name: 'Ocean Blue', colors: ['#0ea5e9', '#0284c7', '#0369a1'] },
    { name: 'Forest Green', colors: ['#10b981', '#059669', '#047857'] },
    { name: 'Sunset Orange', colors: ['#f59e0b', '#d97706', '#b45309'] },
    { name: 'Royal Purple', colors: ['#8b5cf6', '#7c3aed', '#6d28d9'] },
    { name: 'Rose Pink', colors: ['#ec4899', '#db2777', '#be185d'] },
    { name: 'Slate Gray', colors: ['#64748b', '#475569', '#334155'] }
  ]);
  
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Load saved templates from database on component mount
  useEffect(() => {
    const loadSavedTemplates = async () => {
      try {
        const { data: savedTemplates, error } = await supabase
          .from('agent_templates')
          .select('*')
          .eq('template_type', 'canvas')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (savedTemplates && savedTemplates.length > 0) {
          const formattedTemplates = savedTemplates.map(template => ({
            id: `saved-${template.id}`,
            name: template.name,
            description: template.description || '',
            tagline: template.tagline || '',
            primaryColor: template.primary_color,
            secondaryColor: template.secondary_color,
            accentColor: template.accent_color,
            logo: template.logo_url || undefined
          }));
          
          // Add saved templates to the existing default templates
          setTemplates(prev => [...prev, ...formattedTemplates]);
        }
      } catch (error) {
        console.error('Failed to load saved templates:', error);
      }
    };
    
    loadSavedTemplates();
  }, []);

  // Handle canvas name change with parent callback
  const handleCanvasNameChange = (name: string) => {
    setCanvasName(name);
    onNameChange?.(name);
  };

  // Handle tagline change with parent callback
  const handleTaglineChange = (newTagline: string) => {
    setTagline(newTagline);
    onTaglineChange?.(newTagline);
  };

  // Handle primary color change with parent callback
  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
    onPrimaryColorChange?.(color);
  };

  // Handle secondary color change with parent callback
  const handleSecondaryColorChange = (color: string) => {
    setSecondaryColor(color);
    onSecondaryColorChange?.(color);
  };

  // Handle accent color change with parent callback
  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
    onAccentColorChange?.(color);
  };

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
        const result = reader.result as string;
        setLogoPreview(result);
        // Notify parent with file and preview URL
        onLogoChange?.(file, result);
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
      if (!canvasName?.trim()) {
        toast({
          title: "Canvas Name Required",
          description: "Please enter a name for your canvas template before saving.",
          variant: "destructive"
        });
        return;
      }

      let logoUrl = logoPreview; // Use existing logo preview URL
      
      // Upload logo if it's a new file
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
      
      // Save template data to agent_templates table
      const { data: newTemplate, error } = await supabase
        .from('agent_templates')
        .insert({
          name: canvasName,
          description: `Custom canvas template: ${canvasName}`,
          tagline,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          accent_color: accentColor,
          logo_url: logoUrl,
          template_type: 'canvas',
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add the new template to the templates list
      if (newTemplate) {
        const customTemplate: CanvasTemplate = {
          id: `saved-${newTemplate.id}`,
          name: newTemplate.name,
          description: newTemplate.description || '',
          tagline: newTemplate.tagline || '',
          primaryColor: newTemplate.primary_color,
          secondaryColor: newTemplate.secondary_color,
          accentColor: newTemplate.accent_color,
          logo: newTemplate.logo_url || undefined
        };
        
        setTemplates(prev => [...prev, customTemplate]);
        setSelectedTemplate(customTemplate.id);
      }
      
      toast({
        title: "Canvas Template Saved",
        description: `Your "${canvasName}" template has been saved successfully and added to your template library.`
      });
      
      // Don't reset form - keep user's work intact
      
    } catch (error: any) {
      console.error('Save template error:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTemplateSelect = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setSelectedTemplate(id);
      
      // Update colors and tagline
      setPrimaryColor(template.primaryColor);
      onPrimaryColorChange?.(template.primaryColor);
      
      setSecondaryColor(template.secondaryColor);
      onSecondaryColorChange?.(template.secondaryColor);
      
      setAccentColor(template.accentColor);
      onAccentColorChange?.(template.accentColor);
      
      setTagline(template.tagline);
      onTaglineChange?.(template.tagline);
      
      // Only reset logo if template has a specific logo, otherwise preserve user's logo
      if (template.logo) {
        setLogo(null);
        setLogoPreview(template.logo);
        onLogoChange?.(null, template.logo);
        toast({
          title: "Template Applied",
          description: `Applied ${template.name} template. Colors, tagline, and logo updated.`
        });
      } else {
        // Keep existing logo when switching to templates without logos
        toast({
          title: "Template Applied", 
          description: `Applied ${template.name} template. Colors and tagline updated, logo preserved.`
        });
      }
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      // Check if template is from database (saved templates)
      if (templateId.startsWith('saved-')) {
        const dbId = templateId.replace('saved-', '');
        const { error } = await supabase
          .from('agent_templates')
          .delete()
          .eq('id', dbId);
          
        if (error) throw error;
      }
      
      // Remove from local templates array
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      
      // If deleted template was selected, reset to default
      if (selectedTemplate === templateId) {
        const defaultTemplate = templates.find(t => t.isDefault);
        if (defaultTemplate) {
          handleTemplateSelect(defaultTemplate.id);
        } else {
          setSelectedTemplate('');
        }
      }
      
      toast({
        title: "Template Deleted",
        description: "Template has been successfully removed."
      });
      
    } catch (error: any) {
      console.error('Delete template error:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateCustomTemplate = () => {
    // Simplified duplicate check - only check name
    const duplicateExists = templates.some(template => 
      template.name.toLowerCase() === (canvasName || 'Custom Template').toLowerCase()
    );
    
    if (duplicateExists) {
      toast({
        title: "Duplicate Template Name",
        description: "A template with this name already exists. Please choose a different canvas name.",
        variant: "destructive"
      });
      return;
    }
    
    // Create template using current canvas settings
    const customTemplate: CanvasTemplate = {
      id: `custom-${Date.now()}`,
      name: canvasName || 'Custom Template',
      description: `Custom template: ${canvasName || 'Unnamed'}`,
      tagline: tagline || 'Custom Tagline',
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
      accentColor: accentColor,
      logo: logoPreview || undefined
    };
    
    setTemplates(prev => [...prev, customTemplate]);
    setSelectedTemplate(customTemplate.id);
    
    toast({
      title: "Custom Template Created",
      description: `New custom template "${customTemplate.name}" has been created using your current settings.`
    });
  };

  const handleColorPaletteSelect = (colors: string[]) => {
    setPrimaryColor(colors[0]);
    setSecondaryColor(colors[1]);
    setAccentColor(colors[2]);
    
    onPrimaryColorChange?.(colors[0]);
    onSecondaryColorChange?.(colors[1]);
    onAccentColorChange?.(colors[2]);
    
    toast({
      title: "Color Palette Applied",
      description: "New color scheme has been applied to your canvas."
    });
  };

  const handleExportTemplate = () => {
    const templateData = {
      name: canvasName || 'Exported Canvas',
      tagline,
      primaryColor,
      secondaryColor,
      accentColor,
      logoUrl: logoPreview,
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

  const handlePreviewAction = (action: string) => {
    toast({
      title: `${action} Clicked`,
      description: `This is a preview of the ${action.toLowerCase()} button functionality.`,
    });
  };

  const validateHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const handleColorInputChange = (colorType: 'primary' | 'secondary' | 'accent', value: string) => {
    if (validateHexColor(value) || value === '') {
      switch (colorType) {
        case 'primary':
          handlePrimaryColorChange(value);
          break;
        case 'secondary':
          handleSecondaryColorChange(value);
          break;
        case 'accent':
          handleAccentColorChange(value);
          break;
      }
    }
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
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Canvas Name</strong> is the display name for your agent's interface theme/branding, 
                  while <strong>Agent Name</strong> is the actual name of your AI agent. Think of Canvas Name 
                  as your "brand theme" that can be reused across multiple agents.
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="canvas-name" className="flex items-center gap-2">
                  Canvas Name
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Label>
                <Input
                  id="canvas-name"
                  value={canvasName}
                  onChange={(e) => handleCanvasNameChange(e.target.value)}
                  placeholder="My Healthcare Canvas Theme"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This is the theme name for your agent's interface (different from the agent name)
                </p>
              </div>
              
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={tagline}
                  onChange={(e) => handleTaglineChange(e.target.value)}
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
                          onLogoChange?.(null, '');
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
              <div className="flex items-center justify-between mb-4">
                <Label>Custom Colors</Label>
                <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Palette className="h-4 w-4 mr-2" />
                      Color Palettes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Choose Color Palette</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {customColorPalettes.map((palette, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                            onClick={() => {
                              handleColorPaletteSelect(palette.colors);
                              setShowColorPicker(false);
                            }}
                          >
                            <div className="flex gap-1">
                              {palette.colors.map((color, colorIndex) => (
                                <div
                                  key={colorIndex}
                                  className="w-8 h-8 rounded-md border"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <span className="font-medium">{palette.name}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      className="w-10 h-10 rounded-md border cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => handleColorInputChange('primary', e.target.value)}
                      className="flex-1"
                      placeholder="#3b82f6"
                    />
                  </div>
                  {!validateHexColor(primaryColor) && primaryColor && (
                    <p className="text-xs text-destructive mt-1">Invalid hex color</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="secondary-color"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => handleSecondaryColorChange(e.target.value)}
                      className="w-10 h-10 rounded-md border cursor-pointer"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => handleColorInputChange('secondary', e.target.value)}
                      className="flex-1"
                      placeholder="#8b5cf6"
                    />
                  </div>
                  {!validateHexColor(secondaryColor) && secondaryColor && (
                    <p className="text-xs text-destructive mt-1">Invalid hex color</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="accent-color"
                      type="color"
                      value={accentColor}
                      onChange={(e) => handleAccentColorChange(e.target.value)}
                      className="w-10 h-10 rounded-md border cursor-pointer"
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => handleColorInputChange('accent', e.target.value)}
                      className="flex-1"
                      placeholder="#06b6d4"
                    />
                  </div>
                  {!validateHexColor(accentColor) && accentColor && (
                    <p className="text-xs text-destructive mt-1">Invalid hex color</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label>Color Preview</Label>
                <div className="flex gap-2 mt-2">
                  <div className="h-10 flex-1 rounded border" style={{ backgroundColor: primaryColor }}>
                    <span className="text-xs text-white/80 p-1">Primary</span>
                  </div>
                  <div className="h-10 flex-1 rounded border" style={{ backgroundColor: secondaryColor }}>
                    <span className="text-xs text-white/80 p-1">Secondary</span>
                  </div>
                  <div className="h-10 flex-1 rounded border" style={{ backgroundColor: accentColor }}>
                    <span className="text-xs text-white/80 p-1">Accent</span>
                  </div>
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
                Choose from multiple pre-configured canvas templates for different use cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-64">
                <div className="grid grid-cols-1 gap-3 pr-4">
                  {templates.map(template => (
                    <div 
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 transition-all hover:shadow-md ${selectedTemplate === template.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'hover:border-primary/50'}`}
                    >
                      <div 
                        className="w-10 h-10 rounded-md shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${template.primaryColor}, ${template.secondaryColor})` }}
                        onClick={() => handleTemplateSelect(template.id)}
                      ></div>
                      <div className="flex-1" onClick={() => handleTemplateSelect(template.id)}>
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        <p className="text-xs font-medium mt-1" style={{ color: template.primaryColor }}>
                          {template.tagline}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {template.isDefault && (
                          <Badge variant="outline" className="text-xs">Default</Badge>
                        )}
                        {selectedTemplate === template.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        {/* Delete button for non-default templates */}
                        {!template.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground z-10 relative"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleDeleteTemplate(template.id);
                            }}
                            title="Delete template"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setSelectedTemplate('');
                  // Reset to default colors and values
                  const defaultTemplate = templates.find(t => t.isDefault);
                  if (defaultTemplate) {
                    handleTemplateSelect(defaultTemplate.id);
                  }
                  toast({
                    title: "Template Reset",
                    description: "Canvas has been reset to default template."
                  });
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={handleCreateCustomTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Custom Template
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Canvas Preview
                <div className="flex gap-1 ml-auto">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewMode === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('tablet')}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Interactive preview of how your agent canvas will appear to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`mx-auto transition-all duration-300 ${
                previewMode === 'desktop' ? 'max-w-full' : 
                previewMode === 'tablet' ? 'max-w-md' : 'max-w-sm'
              }`}>
                <div 
                  className="border rounded-lg p-6 transition-all duration-300"
                  style={{ background: `linear-gradient(to bottom, ${primaryColor}10, ${secondaryColor}05)` }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    {logoPreview && (
                      <img 
                        src={logoPreview} 
                        alt="Logo" 
                        className={`object-contain ${previewMode === 'mobile' ? 'w-8 h-8' : 'w-12 h-12'}`} 
                      />
                    )}
                    <div className="flex-1">
                      <h3 
                        className={`font-bold ${previewMode === 'mobile' ? 'text-base' : 'text-lg'}`}
                        style={{ color: primaryColor }}
                      >
                        {canvasName || "Agent Canvas"}
                      </h3>
                      <p className={`text-muted-foreground ${previewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                        {tagline || "Your healthcare AI partner"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Bot className={`${previewMode === 'mobile' ? 'h-4 w-4' : 'h-5 w-5'}`} style={{ color: primaryColor }} />
                      <span className={`font-medium ${previewMode === 'mobile' ? 'text-sm' : ''}`}>
                        Virtual Healthcare Assistant
                      </span>
                    </div>
                    
                    <div className="bg-background p-4 rounded-lg border">
                      <p className={`mb-2 ${previewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                        Sample agent interaction:
                      </p>
                      <div className="flex gap-2 items-start mb-3">
                        <div className={`rounded-full bg-muted flex items-center justify-center ${previewMode === 'mobile' ? 'w-6 h-6' : 'w-8 h-8'}`}>
                          <Bot className={`${previewMode === 'mobile' ? 'h-3 w-3' : 'h-4 w-4'}`} />
                        </div>
                        <div className={`bg-muted p-3 rounded-lg flex-1 ${previewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                          Hello! I'm your healthcare assistant. How can I help you today?
                        </div>
                      </div>
                      <div className="flex gap-2 items-start">
                        <div className={`rounded-full bg-muted flex items-center justify-center ${previewMode === 'mobile' ? 'w-6 h-6' : 'w-8 h-8'}`}>
                          <Users className={`${previewMode === 'mobile' ? 'h-3 w-3' : 'h-4 w-4'}`} />
                        </div>
                        <div 
                          className={`p-3 rounded-lg flex-1 ${previewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}
                          style={{ backgroundColor: `${primaryColor}20` }}
                        >
                          I need information about the latest treatment options.
                        </div>
                      </div>
                    </div>
                    
                    <div className={`flex gap-2 ${previewMode === 'mobile' ? 'flex-col' : ''}`}>
                       <Button 
                        size={previewMode === 'mobile' ? 'sm' : 'default'}
                        style={{ 
                          backgroundColor: primaryColor,
                          color: 'white',
                          border: 'none'
                        }}
                        onClick={() => handlePreviewAction('Primary')}
                        className="hover:opacity-90 transition-opacity text-white shadow-sm"
                      >
                        Primary Action
                      </Button>
                      <Button 
                        variant="outline" 
                        size={previewMode === 'mobile' ? 'sm' : 'default'}
                        style={{ 
                          borderColor: secondaryColor, 
                          color: secondaryColor,
                          backgroundColor: 'transparent'
                        }}
                        onClick={() => handlePreviewAction('Secondary')}
                        className="hover:opacity-80 transition-all shadow-sm"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${secondaryColor}15`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        Secondary Action
                      </Button>
                      <Button 
                        variant="ghost" 
                        size={previewMode === 'mobile' ? 'sm' : 'default'}
                        style={{ 
                          color: accentColor,
                          backgroundColor: 'transparent'
                        }}
                        onClick={() => handlePreviewAction('Accent')}
                        className="hover:opacity-80 transition-all shadow-sm"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${accentColor}15`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        Accent Action
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <Eye className="h-3 w-3 inline mr-1" />
                  Preview Mode: {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)} 
                  • Click buttons to test interactions • Responsive design preview
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};