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
import { Mail, Server, Key, Shield, Clock } from 'lucide-react';

const emailConfigSchema = z.object({
  // SMTP Configuration
  smtp_host: z.string().min(1, 'SMTP host is required'),
  smtp_port: z.number().min(1).max(65535).default(587),
  smtp_secure: z.enum(['none', 'tls', 'ssl']).default('tls'),
  smtp_username: z.string().min(1, 'Username is required'),
  smtp_password: z.string().min(1, 'Password is required'),
  
  // Email Settings
  from_email: z.string().email('Must be a valid email address'),
  from_name: z.string().min(1, 'From name is required'),
  reply_to: z.string().email('Must be a valid email address').optional(),
  
  // Content Settings
  email_format: z.enum(['html', 'text', 'both']).default('html'),
  template_engine: z.enum(['none', 'handlebars', 'mustache']).default('handlebars'),
  
  // Advanced Settings
  rate_limit: z.number().min(1).max(1000).default(100),
  retry_attempts: z.number().min(0).max(10).default(3),
  timeout: z.number().min(1000).max(60000).default(30000),
  track_opens: z.boolean().default(false),
  track_clicks: z.boolean().default(false),
});

interface EmailConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const EmailConfig: React.FC<EmailConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form: parentForm
}) => {
  const form = useForm({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: {
      smtp_host: configuration?.smtp_host || '',
      smtp_port: configuration?.smtp_port || 587,
      smtp_secure: configuration?.smtp_secure || 'tls',
      smtp_username: configuration?.smtp_username || '',
      smtp_password: configuration?.smtp_password || '',
      from_email: configuration?.from_email || '',
      from_name: configuration?.from_name || '',
      reply_to: configuration?.reply_to || '',
      email_format: configuration?.email_format || 'html',
      template_engine: configuration?.template_engine || 'handlebars',
      rate_limit: configuration?.rate_limit || 100,
      retry_attempts: configuration?.retry_attempts || 3,
      timeout: configuration?.timeout || 30000,
      track_opens: configuration?.track_opens || false,
      track_clicks: configuration?.track_clicks || false,
    },
  });

  const onSubmit = (data: z.infer<typeof emailConfigSchema>) => {
    onChange(data);
  };

  // Watch form changes and update parent
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onChange(value);
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  const popularProviders = [
    { name: 'Gmail', host: 'smtp.gmail.com', port: 587, secure: 'tls' },
    { name: 'Outlook', host: 'smtp-mail.outlook.com', port: 587, secure: 'tls' },
    { name: 'Yahoo', host: 'smtp.mail.yahoo.com', port: 587, secure: 'tls' },
    { name: 'SendGrid', host: 'smtp.sendgrid.net', port: 587, secure: 'tls' },
    { name: 'Mailgun', host: 'smtp.mailgun.org', port: 587, secure: 'tls' },
    { name: 'AWS SES', host: 'email-smtp.us-east-1.amazonaws.com', port: 587, secure: 'tls' },
  ];

  const setProvider = (provider: typeof popularProviders[0]) => {
    form.setValue('smtp_host', provider.host);
    form.setValue('smtp_port', provider.port);
    form.setValue('smtp_secure', provider.secure as any);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            SMTP Configuration
          </CardTitle>
          <CardDescription>
            Configure your email server settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Popular Providers</label>
              <div className="flex flex-wrap gap-2">
                {popularProviders.map((provider) => (
                  <Badge
                    key={provider.name}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setProvider(provider)}
                  >
                    {provider.name}
                  </Badge>
                ))}
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="smtp_host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Host *</FormLabel>
                      <FormControl>
                        <Input placeholder="smtp.gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="smtp_port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="587" 
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
                    name="smtp_secure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Security</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="tls">TLS</SelectItem>
                            <SelectItem value="ssl">SSL</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="smtp_username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username *</FormLabel>
                        <FormControl>
                          <Input placeholder="your-email@gmail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="smtp_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          Use app password for Gmail/Outlook
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="from_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="noreply@yoursite.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="from_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reply_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reply To</FormLabel>
                    <FormControl>
                      <Input placeholder="support@yoursite.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave empty to use from_email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email_format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="text">Plain Text</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="template_engine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Engine</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="handlebars">Handlebars</SelectItem>
                          <SelectItem value="mustache">Mustache</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="rate_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Limit (per hour)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="1000"
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
                          max="10"
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
                  name="timeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeout (ms)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1000" 
                          max="60000"
                          step="1000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Track Email Opens</FormLabel>
                  <FormDescription>
                    Track when recipients open emails
                  </FormDescription>
                </div>
                <FormField
                  control={form.control}
                  name="track_opens"
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

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Track Link Clicks</FormLabel>
                  <FormDescription>
                    Track when recipients click links
                  </FormDescription>
                </div>
                <FormField
                  control={form.control}
                  name="track_clicks"
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
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};