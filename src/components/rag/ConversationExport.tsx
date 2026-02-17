import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Download, Mail, FileText, Shield, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ConversationExportProps {
  conversation: {
    id: string;
    title: string;
    session_id: string;
    conversation_data: any[];
    healthcare_context: any;
    created_at: string;
  };
}

export const ConversationExport: React.FC<ConversationExportProps> = ({ conversation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportType, setExportType] = useState<'email' | 'pdf' | 'json' | 'compliance_report'>('email');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-conversation', {
        body: {
          conversationId: conversation.id,
          exportType,
          recipientEmail: exportType === 'email' ? recipientEmail : undefined
        }
      });

      if (error) throw error;

      toast({
        title: "Export Successful",
        description: `Conversation exported as ${exportType}${exportType === 'email' ? ` to ${recipientEmail}` : ''}`,
      });

      setIsOpen(false);
      setRecipientEmail('');
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || 'Failed to export conversation',
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getExportIcon = () => {
    switch (exportType) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'compliance_report': return <Shield className="h-4 w-4" />;
      default: return <Download className="h-4 w-4" />;
    }
  };

  const messageCount = conversation.conversation_data?.length || 0;
  const healthcareType = conversation.healthcare_context?.treatment_type || 'General Healthcare';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Conversation
          </DialogTitle>
          <DialogDescription>
            Export your healthcare conversation for compliance, sharing, or record-keeping.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Title:</span>
              <span className="font-medium">{conversation.title || 'Healthcare Consultation'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Messages:</span>
              <Badge variant="secondary">{messageCount}</Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="outline">{healthcareType}</Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Date:</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(conversation.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div>
            <Label htmlFor="export-type">Export Format</Label>
            <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email (with JSON attachment)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    JSON Download
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Report
                  </div>
                </SelectItem>
                <SelectItem value="compliance_report">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Compliance Report
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {exportType === 'email' && (
            <div>
              <Label htmlFor="recipient-email">Recipient Email</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="healthcare@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Conversation will be sent as a secure email with JSON attachment
              </p>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-200">
              <Shield className="h-4 w-4" />
              HIPAA Compliance
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              All exports are HIPAA compliant and include audit trails for regulatory compliance.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting || (exportType === 'email' && !recipientEmail)}
          >
            {isExporting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {getExportIcon()}
                Export {exportType === 'email' ? 'via Email' : 'Conversation'}
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};