/**
 * SUBSCRIBER ADMIN DASHBOARD
 * 
 * Unified admin hub accessible from Genie Cast.
 * Shows: Product Setup, Knowledge Base (with uploads), Brand Assets (with uploads),
 * Workspaces, Team, Whitelabel — all in one place.
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft, Package, Brain, Palette, Users2, UserPlus, Paintbrush,
  Upload, FileText, Image, Globe, Link2, Camera, Trash2, Loader2,
  File, X, Plus, Save
} from 'lucide-react';
import { SubscriberProductSetup } from './SubscriberProductSetup';
import { WorkspaceManagement } from './WorkspaceManagement';
import { TeamInviteManagement } from './TeamInviteManagement';
import { WhitelabelConfiguration } from './WhitelabelConfiguration';

interface SubscriberAdminDashboardProps {
  userTier?: string;
}

// ─── KNOWLEDGE UPLOAD SECTION ──────────────────────────────────────────────

const KnowledgeUploadSection: React.FC = () => {
  const queryClient = useQueryClient();
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [urls, setUrls] = useState<string[]>([]);
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { data: knowledgeEntries = [], isLoading } = useQuery({
    queryKey: ['subscriber-knowledge-uploads'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from('knowledge_base')
        .select('id, name, content_type, created_at, metadata')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const handleFileDrop = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadFiles(prev => [...prev, ...files]);
  }, []);

  const removeFile = (idx: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const addUrl = () => {
    if (urlInput.trim() && !urls.includes(urlInput.trim())) {
      setUrls(prev => [...prev, urlInput.trim()]);
      setUrlInput('');
    }
  };

  const removeUrl = (idx: number) => {
    setUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      setIsUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const results: string[] = [];

      // Upload files to knowledge_base
      for (const file of uploadFiles) {
        const contentType = file.type.startsWith('image/') ? 'image'
          : file.type === 'application/pdf' ? 'pdf'
          : file.type.includes('document') ? 'document'
          : 'file';

        // Upload to storage first
        const filePath = `knowledge/${user.id}/${Date.now()}_${file.name}`;
        const { error: storageError } = await supabase.storage
          .from('brand-assets')
          .upload(filePath, file, { upsert: true });

        if (storageError) {
          console.error('Storage upload error:', storageError);
          results.push(`❌ ${file.name}: ${storageError.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('brand-assets')
          .getPublicUrl(filePath);

        // Save reference to knowledge_base
        const { error: dbError } = await supabase
          .from('knowledge_base')
          .insert({
            created_by: user.id,
            name: file.name,
            category: industry || 'general',
            source_type: 'upload',
            content_type: contentType,
            raw_content: `File uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: file.type,
            healthcare_tags: industry ? [industry] : [],
            metadata: {
              file_url: urlData?.publicUrl,
              description: description || null,
              uploaded_at: new Date().toISOString(),
            },
          });

        if (dbError) {
          results.push(`❌ ${file.name}: ${dbError.message}`);
        } else {
          results.push(`✅ ${file.name}`);
        }
      }

      // Save URLs
      for (const url of urls) {
        const { error } = await supabase
          .from('knowledge_base')
          .insert({
            created_by: user.id,
            name: new URL(url).hostname,
            category: industry || 'general',
            source_type: 'url',
            content_type: 'url',
            raw_content: url,
            source_url: url,
            healthcare_tags: industry ? [industry] : [],
            metadata: {
              source_url: url,
              description: description || null,
              uploaded_at: new Date().toISOString(),
            },
          });

        if (error) {
          results.push(`❌ ${url}: ${error.message}`);
        } else {
          results.push(`✅ ${url}`);
        }
      }

      return results;
    },
    onSuccess: (results) => {
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ['subscriber-knowledge-uploads'] });
      setUploadFiles([]);
      setUrls([]);
      setDescription('');
      const successCount = results.filter(r => r.startsWith('✅')).length;
      toast.success(`${successCount} item(s) uploaded to knowledge base`);
    },
    onError: (err) => {
      setIsUploading(false);
      toast.error(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('knowledge_base').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-knowledge-uploads'] });
      toast.success('Knowledge entry removed');
    },
  });

  const hasContent = uploadFiles.length > 0 || urls.length > 0;

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload Knowledge Assets
          </CardTitle>
          <CardDescription>
            Add documents, PDFs, images, screenshots, and URLs to enrich AI-generated content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Industry Tag */}
          <div>
            <Label>Industry / Category Tag</Label>
            <Input
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              placeholder="e.g. Healthcare, SaaS, Finance, E-Commerce..."
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of what these assets contain..."
              rows={2}
            />
          </div>

          {/* File Upload */}
          <div>
            <Label className="mb-2 block">Documents, PDFs, Images & Screenshots</Label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors">
              <input
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg,.webp,.gif,.svg"
                onChange={handleFileDrop}
              />
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click to upload or drag & drop</p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOC, TXT, CSV, PNG, JPG, WebP, SVG
              </p>
            </label>
          </div>

          {/* Uploaded files list */}
          {uploadFiles.length > 0 && (
            <div className="space-y-1">
              {uploadFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    {file.type.startsWith('image/') ? (
                      <Image className="w-4 h-4 text-blue-500 shrink-0" />
                    ) : file.type === 'application/pdf' ? (
                      <FileText className="w-4 h-4 text-red-500 shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={() => removeFile(idx)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* URL Input */}
          <div>
            <Label className="mb-2 block">Website URLs</Label>
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://yourcompany.com/about"
                onKeyDown={e => e.key === 'Enter' && addUrl()}
              />
              <Button variant="outline" size="sm" onClick={addUrl} disabled={!urlInput.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* URLs list */}
          {urls.length > 0 && (
            <div className="space-y-1">
              {urls.map((url, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Link2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="truncate">{url}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={() => removeUrl(idx)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {hasContent && (
            <Button
              className="w-full gap-2"
              onClick={() => uploadMutation.mutate()}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload {uploadFiles.length + urls.length} item(s) to Knowledge Base
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Existing Entries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Uploaded Knowledge Assets</CardTitle>
          <CardDescription>{knowledgeEntries.length} entries</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : knowledgeEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No knowledge assets uploaded yet.</p>
          ) : (
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {knowledgeEntries.map((entry: any) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3 min-w-0">
                      {entry.content_type === 'url' ? <Globe className="w-4 h-4 text-green-500 shrink-0" /> :
                       entry.content_type === 'image' ? <Image className="w-4 h-4 text-blue-500 shrink-0" /> :
                       entry.content_type === 'pdf' ? <FileText className="w-4 h-4 text-red-500 shrink-0" /> :
                       <File className="w-4 h-4 text-muted-foreground shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.content_type} • {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => deleteMutation.mutate(entry.id)}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ─── BRAND ASSETS SECTION ──────────────────────────────────────────────────

const BrandAssetsSection: React.FC = () => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['subscriber-brand-assets'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from('marketing_brand_assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, assetType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const filePath = `brands/${user.id}/${assetType}_${Date.now()}_${file.name}`;
      const { error: storageErr } = await supabase.storage
        .from('brand-assets')
        .upload(filePath, file, { upsert: true });

      if (storageErr) throw storageErr;

      const { data: urlData } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(filePath);

      const { error: dbErr } = await supabase
        .from('marketing_brand_assets')
        .insert({
          user_id: user.id,
          asset_type: assetType,
          asset_url: urlData?.publicUrl || '',
          file_name: file.name,
          metadata: { file_size: file.size, file_type: file.type },
        });

      if (dbErr) throw dbErr;

      queryClient.invalidateQueries({ queryKey: ['subscriber-brand-assets'] });
      toast.success(`${assetType} uploaded`);
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteAsset = async (id: string) => {
    const { error } = await supabase.from('marketing_brand_assets').delete().eq('id', id);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['subscriber-brand-assets'] });
      toast.success('Asset removed');
    }
  };

  const uploadCard = (label: string, type: string, icon: React.ReactNode, accept: string) => (
    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
      <input type="file" className="hidden" accept={accept} onChange={e => handleUpload(e, type)} disabled={isUploading} />
      {icon}
      <p className="text-sm font-medium mt-2">{label}</p>
      <p className="text-xs text-muted-foreground">Click to upload</p>
    </label>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="w-4 h-4" /> Upload Brand Assets
          </CardTitle>
          <CardDescription>
            Logos, icons, screenshots, and other visual assets for your brand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {uploadCard('Logo', 'logo', <Image className="w-8 h-8 text-blue-500" />, '.png,.jpg,.svg,.webp')}
            {uploadCard('Icon / Favicon', 'icon', <Paintbrush className="w-8 h-8 text-purple-500" />, '.png,.svg,.ico')}
            {uploadCard('Screenshot', 'screenshot', <Camera className="w-8 h-8 text-green-500" />, '.png,.jpg,.webp')}
            {uploadCard('Other Asset', 'other', <File className="w-8 h-8 text-muted-foreground" />, '.png,.jpg,.svg,.webp,.pdf')}
          </div>
          {isUploading && (
            <div className="flex items-center justify-center py-4 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Assets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Your Brand Assets</CardTitle>
          <CardDescription>{assets.length} assets uploaded</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : assets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No brand assets uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {assets.map((asset: any) => (
                <div key={asset.id} className="relative group rounded-lg border overflow-hidden">
                  {asset.asset_url && (
                    <img
                      src={asset.asset_url}
                      alt={asset.file_name || asset.asset_type}
                      className="w-full h-24 object-contain bg-muted p-2"
                    />
                  )}
                  <div className="p-2">
                    <Badge variant="outline" className="text-[10px]">{asset.asset_type}</Badge>
                    <p className="text-xs text-muted-foreground truncate mt-1">{asset.file_name}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteAsset(asset.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────

export const SubscriberAdminDashboard: React.FC<SubscriberAdminDashboardProps> = ({
  userTier = 'professional',
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/genie-cast')}
          className="gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cast
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-lg font-bold">Admin Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="products" className="gap-1.5 text-xs">
            <Package className="w-3.5 h-3.5" /> Products
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-1.5 text-xs">
            <Brain className="w-3.5 h-3.5" /> Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="brand" className="gap-1.5 text-xs">
            <Palette className="w-3.5 h-3.5" /> Brand Assets
          </TabsTrigger>
          <TabsTrigger value="workspaces" className="gap-1.5 text-xs">
            <Users2 className="w-3.5 h-3.5" /> Workspaces
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs">
            <UserPlus className="w-3.5 h-3.5" /> Team
          </TabsTrigger>
          <TabsTrigger value="whitelabel" className="gap-1.5 text-xs">
            <Paintbrush className="w-3.5 h-3.5" /> Whitelabel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <SubscriberProductSetup userTier={userTier} />
        </TabsContent>

        <TabsContent value="knowledge" className="mt-4">
          <KnowledgeUploadSection />
        </TabsContent>

        <TabsContent value="brand" className="mt-4">
          <BrandAssetsSection />
        </TabsContent>

        <TabsContent value="workspaces" className="mt-4">
          <WorkspaceManagement />
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <TeamInviteManagement />
        </TabsContent>

        <TabsContent value="whitelabel" className="mt-4">
          <WhitelabelConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriberAdminDashboard;
