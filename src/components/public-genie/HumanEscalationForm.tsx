/**
 * HUMAN ESCALATION FORM
 * Allows public users to request human assistance after using AI
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, MessageSquare, Clock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface HumanEscalationFormProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  contextType: 'technology' | 'healthcare';
}

export const HumanEscalationForm: React.FC<HumanEscalationFormProps> = ({
  isOpen,
  onClose,
  conversationId,
  contextType
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    urgency: 'medium',
    category: '',
    subject: '',
    message: '',
    preferredContact: 'email',
    availabilityTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const categories = contextType === 'technology' ? [
    'AI/ML Implementation',
    'Technical Integration',
    'Product Demo Request',
    'Partnership Discussion',
    'Platform Features',
    'API Documentation',
    'Custom Solutions',
    'Other Technical'
  ] : [
    'Clinical Information',
    'Treatment Options',
    'Insurance & Reimbursement',
    'Patient Assistance Programs',
    'Clinical Trials',
    'Provider Network',
    'Regulatory Questions',
    'Other Healthcare'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consentGiven) {
      toast({
        title: "Consent Required",
        description: "Please confirm your consent to be contacted.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save escalation request (for demo, use localStorage)
      const escalationData = {
        conversation_id: conversationId,
        contact_form_data: {
          ...formData,
          submittedAt: new Date().toISOString(),
          contextType,
          source: 'public_genie'
        },
        status: 'pending',
        priority: formData.urgency
      };

      // For demo, save to localStorage
      const existingRequests = JSON.parse(localStorage.getItem('escalation_requests') || '[]');
      existingRequests.push(escalationData);
      localStorage.setItem('escalation_requests', JSON.stringify(existingRequests));

      // Log analytics event (simplified)
      const analyticsData = {
        conversation_id: conversationId,
        event_type: 'human_escalation_requested',
        event_data: {
          category: formData.category,
          urgency: formData.urgency,
          contextType
        },
        timestamp: new Date().toISOString()
      };
      
      const existingAnalytics = JSON.parse(localStorage.getItem('public_analytics') || '[]');
      existingAnalytics.push(analyticsData);
      localStorage.setItem('public_analytics', JSON.stringify(existingAnalytics));

      setSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "Thank you! A human expert will contact you within 24-48 hours.",
      });
    } catch (error) {
      console.error('Error submitting escalation request:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-500" />
              Request Submitted
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your request has been submitted successfully. A human expert will contact you within 24-48 hours.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Response within 24-48 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-500" />
                  <span>Contact via {formData.preferredContact}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  <span>Priority: {formData.urgency}</span>
                </div>
              </CardContent>
            </Card>

            <Button onClick={onClose} className="w-full">
              Continue with AI Assistant
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <DialogTitle>Connect with Human Expert</DialogTitle>
            <Badge variant={contextType === 'technology' ? 'default' : 'secondary'}>
              {contextType}
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact Information</CardTitle>
              <CardDescription>
                How should our experts reach you?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name *</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name *</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Email Address *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Company/Organization</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Request Details</CardTitle>
              <CardDescription>
                Tell us how we can help you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Urgency</label>
                  <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General inquiry</SelectItem>
                      <SelectItem value="medium">Medium - Business need</SelectItem>
                      <SelectItem value="high">High - Urgent assistance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Subject *</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Brief description of your request"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Message *</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Please provide detailed information about your request..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Preferences */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Preferred Contact Method</label>
                <Select value={formData.preferredContact} onValueChange={(value) => handleInputChange('preferredContact', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="both">Either Email or Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Best Time to Contact</label>
                <Input
                  value={formData.availabilityTime}
                  onChange={(e) => handleInputChange('availabilityTime', e.target.value)}
                  placeholder="e.g., Weekday mornings, EST"
                />
              </div>
            </CardContent>
          </Card>

          {/* Consent */}
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="consent" 
              checked={consentGiven}
              onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
            />
            <label htmlFor="consent" className="text-sm leading-relaxed">
              I consent to being contacted by the GENIE AI team regarding my request. I understand that my information will be used solely for this purpose and will be handled according to the privacy policy.
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !consentGiven}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};