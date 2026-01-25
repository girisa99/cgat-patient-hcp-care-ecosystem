/**
 * SUPPORT TICKET CREATOR
 * Unified component for both AI chatbot and formal ticket submission
 * Links tickets to user accounts automatically
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  FileText, 
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const TICKET_CATEGORIES = [
  'Account & Billing',
  'Technical Issue',
  'Feature Request',
  'Content Generation',
  'Integration Help',
  'Other',
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-green-500/20 text-green-400' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500/20 text-red-400' },
];

const SupportTicketCreator: React.FC = () => {
  const { toast } = useToast();
  const { genieUser, isAuthenticated } = useGenieStudioAuth();
  
  const [activeTab, setActiveTab] = useState<'chat' | 'ticket'>('chat');
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Genie Support Assistant. How can I help you today? I can answer questions about your account, features, or help troubleshoot issues.",
      timestamp: new Date(),
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Ticket form state
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Technical Issue');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  // Send chat message
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Simulate AI response (in production, call your AI endpoint)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check for keywords that might need escalation
      const needsEscalation = 
        chatInput.toLowerCase().includes('bug') ||
        chatInput.toLowerCase().includes('error') ||
        chatInput.toLowerCase().includes('not working') ||
        chatInput.toLowerCase().includes('broken');

      const aiResponse: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: needsEscalation 
          ? "I understand you're experiencing a technical issue. I've noted the details. Would you like me to create a support ticket for our engineering team? You can also switch to the 'Submit Ticket' tab to provide more details."
          : "Thank you for your question! Based on what you've described, here are some suggestions that might help. If you need more assistance, you can always submit a formal support ticket.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);

      // Log chat interaction for the user
      if (genieUser) {
        await supabase.from('genie_support_tickets').insert({
          genie_studio_user_id: genieUser.id,
          user_email: genieUser.email,
          user_name: genieUser.display_name,
          subject: `Chat: ${chatInput.substring(0, 50)}...`,
          description: chatInput,
          category: 'other',
          priority: 'low',
          status: 'resolved',
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm having trouble processing your request. Please try again or submit a support ticket.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Submit formal ticket
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketTitle.trim() || !ticketDescription.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a title and description for your ticket',
        variant: 'destructive',
      });
      return;
    }

    if (!isAuthenticated || !genieUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to submit a support ticket',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingTicket(true);

    try {
      const { data, error } = await supabase
        .from('genie_support_tickets')
        .insert({
          genie_studio_user_id: genieUser.id,
          user_email: genieUser.email,
          user_name: genieUser.display_name,
          subject: ticketTitle,
          description: ticketDescription,
          category: 'technical' as const,
          priority: ticketPriority as 'low' | 'medium' | 'high' | 'urgent',
          status: 'open',
          user_tier: genieUser.current_subscription_tier,
        })
        .select()
        .single();

      if (error) throw error;

      setTicketSubmitted(true);
      setSubmittedTicketId(data?.id?.slice(0, 8) || null);
      
      toast({
        title: 'Ticket Submitted ✓',
        description: `Your ticket #${data?.id?.slice(0, 8)} has been created. We'll get back to you soon!`,
      });

      // Reset form
      setTicketTitle('');
      setTicketDescription('');
      setTicketPriority('medium');
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit ticket',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Genie Support
        </CardTitle>
        <CardDescription>
          Get help via AI chat or submit a formal support ticket
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'ticket')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat" className="gap-2">
              <Bot className="h-4 w-4" />
              Ask Genie
            </TabsTrigger>
            <TabsTrigger value="ticket" className="gap-2">
              <FileText className="h-4 w-4" />
              Submit Ticket
            </TabsTrigger>
          </TabsList>
          
          {/* AI Chat Tab */}
          <TabsContent value="chat" className="mt-4">
            <div className="space-y-4">
              {/* Chat Messages */}
              <div className="h-80 overflow-y-auto border rounded-lg p-4 space-y-4 bg-muted/30">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-background border rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Genie is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type your question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isChatLoading}
                />
                <Button onClick={handleSendMessage} disabled={isChatLoading || !chatInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Can't find what you need? Switch to <button 
                  onClick={() => setActiveTab('ticket')} 
                  className="text-primary hover:underline"
                >
                  Submit Ticket
                </button> for detailed support.
              </p>
            </div>
          </TabsContent>
          
          {/* Formal Ticket Tab */}
          <TabsContent value="ticket" className="mt-4">
            {ticketSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">Ticket Submitted!</h3>
                  <p className="text-muted-foreground">
                    Ticket #{submittedTicketId} has been created
                  </p>
                </div>
                <Button variant="outline" onClick={() => setTicketSubmitted(false)}>
                  Submit Another Ticket
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                {!isAuthenticated && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Sign in to submit and track your tickets</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="title">Subject</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of your issue"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={ticketCategory} onValueChange={setTicketCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TICKET_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={ticketPriority} onValueChange={setTicketPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <Badge className={opt.color}>{opt.label}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, and what you expected to happen."
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    rows={5}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmittingTicket || !isAuthenticated}
                >
                  {isSubmittingTicket ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SupportTicketCreator;
