import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Globe, Key, Database, FileText, User, Settings } from 'lucide-react';

const wordpressConfigSchema = z.object({
  // Connection Settings
  site_url: z.string().url('Must be a valid URL'),
  username: z.string().min(1, 'Username is required'),
  application_password: z.string().min(1, 'Application password is required'),
  
  // Content Settings
  post_types: z.array(z.string()).default(['post', 'page']),
  post_status: z.enum(['draft', 'publish', 'private', 'pending']).default('draft'),
  author_id: z.string().optional(),
  
  // Advanced Settings
  custom_fields: z.boolean().default(false),
  featured_media: z.boolean().default(false),
  taxonomies: z.array(z.string()).default(['category', 'post_tag']),
  
  // API Settings
  api_version: z.enum(['v2', 'v1']).default('v2'),
  timeout: z.number().min(1000).max(30000).default(10000),
  retry_attempts: z.number().min(0).max(5).default(3),
});

interface WordPressConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const WordPressConfig: React.FC<WordPressConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form: parentForm
}) => {
  const form = useForm({
    resolver: zodResolver(wordpressConfigSchema),
    defaultValues: {
      site_url: configuration?.site_url || '',
      username: configuration?.username || '',
      application_password: configuration?.application_password || '',
      post_types: configuration?.post_types || ['post', 'page'],
      post_status: configuration?.post_status || 'draft',
      author_id: configuration?.author_id || '',
      custom_fields: configuration?.custom_fields || false,
      featured_media: configuration?.featured_media || false,
      taxonomies: configuration?.taxonomies || ['category', 'post_tag'],
      api_version: configuration?.api_version || 'v2',
      timeout: configuration?.timeout || 10000,
      retry_attempts: configuration?.retry_attempts || 3,
    },
  });

  const onSubmit = (data: z.infer<typeof wordpressConfigSchema>) => {
    onChange(data);
  };

  // Watch form changes and update parent
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onChange(value);
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  const commonPostTypes = [
    'post', 'page', 'attachment', 'revision', 'nav_menu_item',
    'custom_css', 'customize_changeset', 'oembed_cache', 'user_request',
    'wp_block', 'wp_template', 'wp_template_part', 'wp_global_styles',
    'wp_navigation', 'product', 'shop_order', 'shop_coupon'
  ];

  const commonTaxonomies = [
    'category', 'post_tag', 'nav_menu', 'link_category', 'post_format',
    'product_cat', 'product_tag', 'product_shipping_class'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            WordPress Connection
          </CardTitle>
          <CardDescription>
            Configure connection to your WordPress site using REST API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="site_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site URL *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://yoursite.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Full URL to your WordPress site (including https://)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="application_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Password *</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="xxxx xxxx xxxx xxxx" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Generate in WP Admin → Users → Application Passwords
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="post_types"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Types</FormLabel>
                    <FormDescription>
                      Select which post types to work with
                    </FormDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonPostTypes.map((type) => (
                        <Badge
                          key={type}
                          variant={field.value.includes(type) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newValue = field.value.includes(type)
                              ? field.value.filter(t => t !== type)
                              : [...field.value, type];
                            field.onChange(newValue);
                          }}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="post_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Post Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="publish">Publish</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="pending">Pending Review</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Author ID</FormLabel>
                      <FormControl>
                        <Input placeholder="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Leave empty to use current user
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="taxonomies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxonomies</FormLabel>
                    <FormDescription>
                      Select taxonomies to include in operations
                    </FormDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonTaxonomies.map((taxonomy) => (
                        <Badge
                          key={taxonomy}
                          variant={field.value.includes(taxonomy) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newValue = field.value.includes(taxonomy)
                              ? field.value.filter(t => t !== taxonomy)
                              : [...field.value, taxonomy];
                            field.onChange(newValue);
                          }}
                        >
                          {taxonomy}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Custom Fields</FormLabel>
                  <FormDescription>
                    Include custom fields in operations
                  </FormDescription>
                </div>
                <FormField
                  control={form.control}
                  name="custom_fields"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Featured Media</FormLabel>
                  <FormDescription>
                    Handle featured images/media
                  </FormDescription>
                </div>
                <FormField
                  control={form.control}
                  name="featured_media"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="api_version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Version</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="v2">v2 (Recommended)</SelectItem>
                          <SelectItem value="v1">v1 (Legacy)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeout (ms)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1000" 
                          max="30000" 
                          step="1000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="retry_attempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retry Attempts</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="5"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};