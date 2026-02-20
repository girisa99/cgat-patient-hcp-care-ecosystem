/**
 * SubscriberProductSetup — Guided wizard for subscriber product onboarding
 * 
 * Reuses existing dynamicMarketingRegistryService CRUD methods.
 * Saves to: marketing_products, marketing_audiences, marketing_brand_assets,
 * product_knowledge_registry — all with user_id scoping.
 * 
 * Tier-gated: Free/Starter = read-only, Pro = 3 products, Business = 10, Enterprise = unlimited
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { dynamicMarketingRegistryService } from '@/services/marketing/dynamicMarketingRegistryService';
import type { MarketingProduct, MarketingAudience } from '@/services/marketing/dynamicMarketingRegistryService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Package, Users, Palette, Brain, Plus, Trash2, Edit2, Save, X, Loader2, Lock, Globe, ChevronRight
} from 'lucide-react';
import { INDUSTRY_VERTICALS } from '@/constants/industryVerticals';

// ─── TIER LIMITS ────────────────────────────────────────────────────────────

const TIER_PRODUCT_LIMITS: Record<string, number> = {
  free: 0,
  starter: 0,
  professional: 3,
  business: 10,
  enterprise: -1, // unlimited
};

interface SubscriberProductSetupProps {
  userTier?: string;
  /** When true, hides header and internal tabs (Products/Audiences only, no Knowledge/Brand) */
  embedded?: boolean;
}

export const SubscriberProductSetup: React.FC<SubscriberProductSetupProps> = ({
  userTier = 'free',
  embedded = false,
}) => {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<'products' | 'audiences' | 'knowledge' | 'brand'>('products');

  const productLimit = TIER_PRODUCT_LIMITS[userTier] ?? 0;
  const canEdit = productLimit !== 0;
  const isUnlimited = productLimit === -1;

  // ─── DATA QUERIES ─────────────────────────────────────────────────────────

  const { data: userId } = useQuery({
    queryKey: ['current-user-id'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id ?? null;
    },
  });

  const { data: myProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['subscriber-products', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('marketing_products')
        .select('*')
        .eq('user_id', userId)
        .eq('is_system_default', false)
        .order('sort_order');
      return (data ?? []) as MarketingProduct[];
    },
    enabled: !!userId,
  });

  const { data: systemProducts = [] } = useQuery({
    queryKey: ['system-products'],
    queryFn: () => dynamicMarketingRegistryService.getProducts({ systemOnly: true }),
  });

  const { data: myAudiences = [], isLoading: audiencesLoading } = useQuery({
    queryKey: ['subscriber-audiences', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('marketing_audiences')
        .select('*')
        .eq('user_id', userId)
        .eq('is_system_default', false)
        .order('sort_order');
      return (data ?? []) as MarketingAudience[];
    },
    enabled: !!userId,
  });

  // ─── PRODUCT FORM ─────────────────────────────────────────────────────────

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MarketingProduct | null>(null);
  const [productForm, setProductForm] = useState({
    name: '', tagline: '', description: '', category: '', features: '',
    primary_color: '#6366f1', secondary_color: '#8b5cf6',
    content_vertical: '', business_city: '', business_state: '', business_zipcode: '', business_country: 'US',
  });

  const resetProductForm = () => {
    setProductForm({ name: '', tagline: '', description: '', category: '', features: '', primary_color: '#6366f1', secondary_color: '#8b5cf6', content_vertical: '', business_city: '', business_state: '', business_zipcode: '', business_country: 'US' });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const createProductMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      return dynamicMarketingRegistryService.createProduct({
        user_id: userId,
        name: productForm.name,
        tagline: productForm.tagline || null,
        description: productForm.description || null,
        icon: 'Package',
        category: productForm.category || 'CUSTOM',
        features: productForm.features.split(',').map(f => f.trim()).filter(Boolean),
        primary_color: productForm.primary_color,
        secondary_color: productForm.secondary_color,
        is_system_default: false,
        is_active: true,
        sort_order: myProducts.length,
        content_vertical: productForm.content_vertical || null,
        business_city: productForm.business_city || null,
        business_state: productForm.business_state || null,
        business_zipcode: productForm.business_zipcode || null,
        business_country: productForm.business_country || 'US',
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-products'] });
      toast.success('Product created');
      resetProductForm();
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });

  const updateProductMutation = useMutation({
    mutationFn: async () => {
      if (!editingProduct) throw new Error('No product selected');
      return dynamicMarketingRegistryService.updateProduct(editingProduct.id, {
        name: productForm.name,
        tagline: productForm.tagline || null,
        description: productForm.description || null,
        category: productForm.category || 'CUSTOM',
        features: productForm.features.split(',').map(f => f.trim()).filter(Boolean),
        primary_color: productForm.primary_color,
        secondary_color: productForm.secondary_color,
        content_vertical: productForm.content_vertical || null,
        business_city: productForm.business_city || null,
        business_state: productForm.business_state || null,
        business_zipcode: productForm.business_zipcode || null,
        business_country: productForm.business_country || 'US',
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-products'] });
      toast.success('Product updated');
      resetProductForm();
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => dynamicMarketingRegistryService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-products'] });
      toast.success('Product deleted');
    },
  });

  const startEditProduct = (product: MarketingProduct) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      tagline: product.tagline ?? '',
      description: product.description ?? '',
      category: product.category,
      features: product.features.join(', '),
      primary_color: product.primary_color ?? '#6366f1',
      secondary_color: product.secondary_color ?? '#8b5cf6',
      content_vertical: (product as any).content_vertical ?? '',
      business_city: (product as any).business_city ?? '',
      business_state: (product as any).business_state ?? '',
      business_zipcode: (product as any).business_zipcode ?? '',
      business_country: (product as any).business_country ?? 'US',
    });
    setShowProductForm(true);
  };

  // ─── AUDIENCE FORM ────────────────────────────────────────────────────────

  const [showAudienceForm, setShowAudienceForm] = useState(false);
  const [audienceForm, setAudienceForm] = useState({
    label: '', description: '', industry: '', pain_points: '', messaging_angles: '',
  });

  const createAudienceMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      return dynamicMarketingRegistryService.createAudience({
        user_id: userId,
        label: audienceForm.label,
        description: audienceForm.description || null,
        industry: audienceForm.industry || null,
        pain_points: audienceForm.pain_points.split(',').map(p => p.trim()).filter(Boolean),
        messaging_angles: audienceForm.messaging_angles.split(',').map(a => a.trim()).filter(Boolean),
        is_system_default: false,
        is_active: true,
        sort_order: myAudiences.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-audiences'] });
      toast.success('Audience created');
      setShowAudienceForm(false);
      setAudienceForm({ label: '', description: '', industry: '', pain_points: '', messaging_angles: '' });
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });

  // ─── KNOWLEDGE FORM ───────────────────────────────────────────────────────

  const [knowledgeForm, setKnowledgeForm] = useState({
    product_id: '',
    value_proposition: '',
    positioning_statement: '',
    pain_points: '',
    key_benefits: '',
    website_url: '',
  });

  const saveKnowledgeMutation = useMutation({
    mutationFn: async () => {
      if (!knowledgeForm.product_id) throw new Error('Select a product');
      const { error } = await supabase
        .from('product_knowledge_registry')
        .upsert({
          product_id: knowledgeForm.product_id,
          value_proposition: knowledgeForm.value_proposition || null,
          positioning_statement: knowledgeForm.positioning_statement || null,
          pain_points: knowledgeForm.pain_points.split(',').map(p => p.trim()).filter(Boolean),
          key_benefits: knowledgeForm.key_benefits.split(',').map(b => b.trim()).filter(Boolean),
          website_url: knowledgeForm.website_url || null,
          is_current: true,
          status: 'active',
        }, { onConflict: 'product_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_knowledge'] });
      toast.success('Product knowledge saved');
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });

  // ─── RENDER ───────────────────────────────────────────────────────────────

  const atLimit = !isUnlimited && myProducts.length >= productLimit;

  return (
    <div className="space-y-6">
      {/* Header - hidden in embedded mode */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Products & Services</h2>
            <p className="text-muted-foreground">
              Add your products so Genie AI can generate tailored content for your brand.
            </p>
          </div>
          <Badge variant={canEdit ? 'default' : 'secondary'} className="text-xs">
            {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
          </Badge>
        </div>
      )}

      {!canEdit && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 py-4">
            <Lock className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-medium">Upgrade to Pro to add your own products</p>
              <p className="text-sm text-muted-foreground">
                Free & Starter plans can view Genie's default products. Pro+ can add custom products.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as any)}>
        {!embedded && (
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="products" className="gap-1.5">
              <Package className="w-4 h-4" /> Products
            </TabsTrigger>
            <TabsTrigger value="audiences" className="gap-1.5">
              <Users className="w-4 h-4" /> Audiences
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-1.5">
              <Brain className="w-4 h-4" /> Knowledge
            </TabsTrigger>
            <TabsTrigger value="brand" className="gap-1.5">
              <Palette className="w-4 h-4" /> Brand
            </TabsTrigger>
          </TabsList>
        )}
        {embedded && (
          <TabsList className="grid grid-cols-2 w-full max-w-sm">
            <TabsTrigger value="products" className="gap-1.5">
              <Package className="w-4 h-4" /> Products
            </TabsTrigger>
            <TabsTrigger value="audiences" className="gap-1.5">
              <Users className="w-4 h-4" /> Audiences
            </TabsTrigger>
          </TabsList>
        )}

        {/* ── PRODUCTS TAB ─────────────────────────────────────────────────── */}
        <TabsContent value="products" className="space-y-4 mt-4">
          {/* System defaults (read-only) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4" /> Genie Default Products
              </CardTitle>
              <CardDescription>System products available to everyone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {systemProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.primary_color ?? '#6366f1' }} />
                    <span className="truncate">{p.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom products */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Your Products</CardTitle>
                  <CardDescription>
                    {isUnlimited ? 'Unlimited products' : `${myProducts.length} / ${productLimit} products`}
                  </CardDescription>
                </div>
                {canEdit && !atLimit && (
                  <Button size="sm" onClick={() => { resetProductForm(); setShowProductForm(true); }} className="gap-1.5">
                    <Plus className="w-4 h-4" /> Add Product
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : myProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {canEdit ? 'No custom products yet. Click "Add Product" to start.' : 'Upgrade to Pro to add your own products.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {myProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: product.primary_color ?? '#6366f1' }} />
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.tagline}</p>
                        </div>
                      </div>
                      {canEdit && (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => startEditProduct(product)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteProductMutation.mutate(product.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Product Form */}
              {showProductForm && canEdit && (
                <Card className="mt-4 border-primary/30">
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Product Name *</Label>
                        <Input value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="My SaaS Product" />
                      </div>
                      <div>
                        <Label>Tagline</Label>
                        <Input value={productForm.tagline} onChange={e => setProductForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Your catchy tagline" />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} placeholder="What does your product do?" rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Category</Label>
                        <Input value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} placeholder="SaaS, E-Commerce, etc." />
                      </div>
                      <div>
                        <Label>Features (comma-separated)</Label>
                        <Input value={productForm.features} onChange={e => setProductForm(f => ({ ...f, features: e.target.value }))} placeholder="Dashboard, API, Analytics" />
                      </div>
                    </div>
                    {/* Industry Vertical */}
                    <div>
                      <Label>Industry / Content Vertical</Label>
                      <select
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        value={productForm.content_vertical}
                        onChange={e => setProductForm(f => ({ ...f, content_vertical: e.target.value }))}
                      >
                        <option value="">Select industry...</option>
                        {INDUSTRY_VERTICALS.map(v => (
                          <option key={v.value} value={v.value}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Location */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <Label>City</Label>
                        <Input value={productForm.business_city} onChange={e => setProductForm(f => ({ ...f, business_city: e.target.value }))} placeholder="San Francisco" />
                      </div>
                      <div>
                        <Label>State / Province</Label>
                        <Input value={productForm.business_state} onChange={e => setProductForm(f => ({ ...f, business_state: e.target.value }))} placeholder="CA" />
                      </div>
                      <div>
                        <Label>Zipcode</Label>
                        <Input value={productForm.business_zipcode} onChange={e => setProductForm(f => ({ ...f, business_zipcode: e.target.value }))} placeholder="94105" />
                      </div>
                      <div>
                        <Label>Country</Label>
                        <Input value={productForm.business_country} onChange={e => setProductForm(f => ({ ...f, business_country: e.target.value }))} placeholder="US" />
                      </div>
                    </div>
                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Primary Color</Label>
                        <Input type="color" value={productForm.primary_color} onChange={e => setProductForm(f => ({ ...f, primary_color: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Secondary Color</Label>
                        <Input type="color" value={productForm.secondary_color} onChange={e => setProductForm(f => ({ ...f, secondary_color: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={resetProductForm}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                      <Button
                        onClick={() => editingProduct ? updateProductMutation.mutate() : createProductMutation.mutate()}
                        disabled={!productForm.name || createProductMutation.isPending || updateProductMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {editingProduct ? 'Update' : 'Save'} Product
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AUDIENCES TAB ────────────────────────────────────────────────── */}
        <TabsContent value="audiences" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Your Target Audiences</CardTitle>
                  <CardDescription>Define who your products are for</CardDescription>
                </div>
                {canEdit && (
                  <Button size="sm" onClick={() => setShowAudienceForm(true)} className="gap-1.5">
                    <Plus className="w-4 h-4" /> Add Audience
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {audiencesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : myAudiences.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {canEdit ? 'No custom audiences yet.' : 'Upgrade to Pro to define target audiences.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {myAudiences.map(audience => (
                    <div key={audience.id} className="p-3 rounded-lg border bg-card">
                      <p className="font-medium text-sm">{audience.label}</p>
                      <p className="text-xs text-muted-foreground">{audience.industry} — {audience.description}</p>
                      {audience.pain_points.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {audience.pain_points.slice(0, 3).map((pp, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">{pp}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {showAudienceForm && canEdit && (
                <Card className="mt-4 border-primary/30">
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Audience Name *</Label>
                        <Input value={audienceForm.label} onChange={e => setAudienceForm(f => ({ ...f, label: e.target.value }))} placeholder="Small Business Owners" />
                      </div>
                      <div>
                        <Label>Industry</Label>
                        <Input value={audienceForm.industry} onChange={e => setAudienceForm(f => ({ ...f, industry: e.target.value }))} placeholder="Healthcare, SaaS, etc." />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={audienceForm.description} onChange={e => setAudienceForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                    </div>
                    <div>
                      <Label>Pain Points (comma-separated)</Label>
                      <Input value={audienceForm.pain_points} onChange={e => setAudienceForm(f => ({ ...f, pain_points: e.target.value }))} placeholder="Time, cost, complexity" />
                    </div>
                    <div>
                      <Label>Messaging Angles (comma-separated)</Label>
                      <Input value={audienceForm.messaging_angles} onChange={e => setAudienceForm(f => ({ ...f, messaging_angles: e.target.value }))} placeholder="ROI, ease of use, automation" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setShowAudienceForm(false)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                      <Button onClick={() => createAudienceMutation.mutate()} disabled={!audienceForm.label || createAudienceMutation.isPending}>
                        <Save className="w-4 h-4 mr-1" /> Save Audience
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── KNOWLEDGE TAB ────────────────────────────────────────────────── */}
        <TabsContent value="knowledge" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Product Knowledge</CardTitle>
              <CardDescription>Enrich AI generation with deep product knowledge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Select Product</Label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={knowledgeForm.product_id}
                  onChange={e => setKnowledgeForm(f => ({ ...f, product_id: e.target.value }))}
                >
                  <option value="">Choose a product...</option>
                  {myProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Value Proposition</Label>
                <Textarea value={knowledgeForm.value_proposition} onChange={e => setKnowledgeForm(f => ({ ...f, value_proposition: e.target.value }))} placeholder="What unique value does your product deliver?" rows={2} />
              </div>
              <div>
                <Label>Positioning Statement</Label>
                <Textarea value={knowledgeForm.positioning_statement} onChange={e => setKnowledgeForm(f => ({ ...f, positioning_statement: e.target.value }))} placeholder="For [audience], [product] is the [category] that [benefit]." rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Pain Points (comma-separated)</Label>
                  <Input value={knowledgeForm.pain_points} onChange={e => setKnowledgeForm(f => ({ ...f, pain_points: e.target.value }))} />
                </div>
                <div>
                  <Label>Key Benefits (comma-separated)</Label>
                  <Input value={knowledgeForm.key_benefits} onChange={e => setKnowledgeForm(f => ({ ...f, key_benefits: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Website URL</Label>
                <Input value={knowledgeForm.website_url} onChange={e => setKnowledgeForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://yourproduct.com" />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => saveKnowledgeMutation.mutate()}
                  disabled={!knowledgeForm.product_id || saveKnowledgeMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-1" /> Save Knowledge
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── BRAND TAB ────────────────────────────────────────────────────── */}
        <TabsContent value="brand" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Brand Assets</CardTitle>
              <CardDescription>Upload logos, screenshots, and brand materials for your products</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-6">
                Brand asset uploads coming soon. For now, set brand colors in the Products tab.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriberProductSetup;
