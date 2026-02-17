import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle, Phone, Instagram, Globe, Plus, Trash2 } from 'lucide-react';

interface ChannelDeploymentConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const ChannelDeploymentConfig: React.FC<ChannelDeploymentConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderEmailChannel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-500" />
          Email Channel Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="emailProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Provider *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select email provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="gmail">📧 Gmail</SelectItem>
                  <SelectItem value="outlook">🏢 Outlook/Office365</SelectItem>
                  <SelectItem value="sendgrid">📨 SendGrid</SelectItem>
                  <SelectItem value="ses">☁️ Amazon SES</SelectItem>
                  <SelectItem value="mailgun">🎯 Mailgun</SelectItem>
                  <SelectItem value="smtp">📤 SMTP</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="incomingServer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incoming Server</FormLabel>
                <FormControl>
                  <Input placeholder="imap.gmail.com" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="incomingPort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incoming Port</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="993" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username/Email *</FormLabel>
              <FormControl>
                <Input placeholder="your-email@domain.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password/App Password *</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="enableSSL"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>SSL Enabled</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="autoReply"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Auto Reply</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="markAsRead"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Mark as Read</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="pollInterval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poll Interval (seconds)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="30" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderWhatsAppChannel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-500" />
          WhatsApp Channel Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="whatsappProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Provider *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select WhatsApp provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="twilio">📞 Twilio WhatsApp</SelectItem>
                  <SelectItem value="meta">🔵 Meta WhatsApp Business API</SelectItem>
                  <SelectItem value="360dialog">💬 360Dialog</SelectItem>
                  <SelectItem value="messagebird">🐦 MessageBird</SelectItem>
                  <SelectItem value="infobip">📡 Infobip</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number ID *</FormLabel>
              <FormControl>
                <Input placeholder="Enter WhatsApp Phone Number ID" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accessToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access Token *</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter access token" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="webhookUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Webhook URL</FormLabel>
              <FormControl>
                <Input placeholder="https://your-app.com/webhook/whatsapp" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="verifyToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verify Token</FormLabel>
              <FormControl>
                <Input placeholder="webhook-verify-token" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="enableReadReceipts"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Read Receipts</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableTyping"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Typing Indicator</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableMedia"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Media Support</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderSMSChannel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-purple-500" />
          SMS Messaging Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="smsProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SMS Provider *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select SMS provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="twilio">📞 Twilio</SelectItem>
                  <SelectItem value="vonage">📱 Vonage (Nexmo)</SelectItem>
                  <SelectItem value="aws-sns">☁️ AWS SNS</SelectItem>
                  <SelectItem value="textmagic">✨ TextMagic</SelectItem>
                  <SelectItem value="clicksend">📤 ClickSend</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="accountSid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account SID/ID *</FormLabel>
                <FormControl>
                  <Input placeholder="Account identifier" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="authToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auth Token/Key *</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="fromNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From Number *</FormLabel>
              <FormControl>
                <Input placeholder="+1234567890" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableDeliveryReports"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Delivery Reports</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableIncoming"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Incoming SMS</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderInstagramChannel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5 text-pink-500" />
          Instagram Channel Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="instagramType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Instagram type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="business">🏢 Instagram Business</SelectItem>
                  <SelectItem value="messaging">💬 Instagram Messaging API</SelectItem>
                  <SelectItem value="basic-display">📸 Basic Display API</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pageId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Page ID *</FormLabel>
              <FormControl>
                <Input placeholder="Instagram Business Account Page ID" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accessToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access Token *</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Page access token" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appSecret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>App Secret</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Facebook App Secret" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableStoryReplies"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Story Replies</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableMentions"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Mention Responses</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderWebChatChannel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          Web Chat Channel Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="chatWidget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chat Widget Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chat widget" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="embedded">💻 Embedded Widget</SelectItem>
                  <SelectItem value="popup">🔄 Popup Window</SelectItem>
                  <SelectItem value="fullscreen">📱 Fullscreen</SelectItem>
                  <SelectItem value="custom">🛠️ Custom Implementation</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="websiteUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL *</FormLabel>
                <FormControl>
                  <Input placeholder="https://yourwebsite.com" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowedOrigins"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allowed Origins</FormLabel>
                <FormControl>
                  <Input placeholder="*.yourwebsite.com" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="welcomeMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Welcome Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Hi! How can I help you today?"
                  rows={2}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="enableTyping"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Typing Indicator</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableFileUpload"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>File Upload</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableEmojis"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Emoji Support</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableHistory"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Chat History</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="customCSS"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom CSS</FormLabel>
              <FormControl>
                <Textarea
                  placeholder=".chat-widget { /* Custom styles */ }"
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  // Main render logic based on node type
  switch (nodeType) {
    case 'email_channel':
      return renderEmailChannel();
    case 'whatsapp_channel':
      return renderWhatsAppChannel();
    case 'sms_messaging':
      return renderSMSChannel();
    case 'instagram_channel':
      return renderInstagramChannel();
    case 'web_chat_channel':
      return renderWebChatChannel();
    case 'voice_call_channel':
    default:
      return renderWebChatChannel(); // Default fallback
  }
};