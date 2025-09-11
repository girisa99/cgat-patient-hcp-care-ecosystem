/**
 * STRUCTURED ENROLLMENT FORM
 * Step-by-step questionnaire with real-time updates and live progress tracking
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, ArrowRight, ArrowLeft, Users, FileText, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface StructuredEnrollmentFormProps {
  sessionId?: string;
  userId?: string;
  tenantId?: string;
  onSectionComplete?: (sectionId: string, data: any) => void;
  onFormComplete?: (formData: any) => void;
}

interface FormSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  fields: FormField[];
  required: boolean;
}

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  value?: any;
}

const enrollmentSections: FormSection[] = [
  {
    id: 'personal_info',
    title: 'Personal Information',
    description: 'Basic demographic and contact details',
    icon: <Users className="h-5 w-5" />,
    status: 'pending',
    required: true,
    fields: [
      { id: 'first_name', type: 'text', label: 'First Name', required: true },
      { id: 'last_name', type: 'text', label: 'Last Name', required: true },
      { id: 'email', type: 'email', label: 'Email Address', required: true },
      { id: 'phone', type: 'phone', label: 'Phone Number', required: true },
      { id: 'date_of_birth', type: 'text', label: 'Date of Birth (MM/DD/YYYY)', required: true },
      { id: 'address', type: 'textarea', label: 'Home Address', required: true }
    ]
  },
  {
    id: 'medical_history',
    title: 'Medical History',
    description: 'Health background and current conditions',
    icon: <FileText className="h-5 w-5" />,
    status: 'pending',
    required: true,
    fields: [
      { id: 'primary_condition', type: 'text', label: 'Primary Medical Condition', required: true },
      { id: 'medications', type: 'textarea', label: 'Current Medications', required: false },
      { id: 'allergies', type: 'textarea', label: 'Known Allergies', required: false },
      { id: 'previous_treatments', type: 'textarea', label: 'Previous Treatments', required: false },
      { id: 'emergency_contact', type: 'text', label: 'Emergency Contact Name', required: true },
      { id: 'emergency_phone', type: 'phone', label: 'Emergency Contact Phone', required: true }
    ]
  },
  {
    id: 'insurance_info',
    title: 'Insurance Information',
    description: 'Coverage details and payment information',
    icon: <Shield className="h-5 w-5" />,
    status: 'pending',
    required: true,
    fields: [
      { id: 'insurance_provider', type: 'text', label: 'Insurance Provider', required: true },
      { id: 'policy_number', type: 'text', label: 'Policy Number', required: true },
      { id: 'group_number', type: 'text', label: 'Group Number', required: false },
      { id: 'subscriber_name', type: 'text', label: 'Subscriber Name', required: true },
      { id: 'subscriber_dob', type: 'text', label: 'Subscriber Date of Birth', required: true }
    ]
  }
];

export const StructuredEnrollmentForm: React.FC<StructuredEnrollmentFormProps> = ({
  sessionId = 'default_session',
  userId,
  tenantId,
  onSectionComplete,
  onFormComplete
}) => {
  const [sections, setSections] = useState<FormSection[]>(enrollmentSections);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [realtimeUsers, setRealtimeUsers] = useState<any[]>([]);

  console.log('🔥 StructuredEnrollmentForm initialized', { sessionId, userId, tenantId });

  // Real-time updates setup
  useEffect(() => {
    console.log('📡 Setting up real-time channels for structured form');
    
    // Channel for form progress updates
    const progressChannel = supabase
      .channel(`enrollment_progress_${sessionId}`)
      .on('broadcast', { event: 'section_update' }, (payload) => {
        console.log('📨 Received section update:', payload);
        handleRealtimeSectionUpdate(payload.payload);
      })
      .on('broadcast', { event: 'field_update' }, (payload) => {
        console.log('📝 Received field update:', payload);
        handleRealtimeFieldUpdate(payload.payload);
      })
      .subscribe();

    // Channel for user presence tracking
    const presenceChannel = supabase
      .channel(`enrollment_presence_${sessionId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        console.log('👥 Presence sync:', state);
        setRealtimeUsers(Object.values(state).flat());
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('✅ User joined:', key, newPresences);
        toast.success(`User ${newPresences[0]?.user_name || 'Unknown'} joined the enrollment session`);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('❌ User left:', key, leftPresences);
        toast.info(`User ${leftPresences[0]?.user_name || 'Unknown'} left the enrollment session`);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const trackStatus = await presenceChannel.track({
            user_id: userId || 'anonymous',
            user_name: userId || 'Anonymous User',
            current_section: sections[currentSectionIdx]?.id,
            joined_at: new Date().toISOString()
          });
          console.log('🎯 Presence tracking status:', trackStatus);
        }
      });

    return () => {
      console.log('🧹 Cleaning up real-time channels');
      supabase.removeChannel(progressChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [sessionId, userId, currentSectionIdx]);

  const handleRealtimeSectionUpdate = (payload: any) => {
    console.log('🔄 Processing realtime section update:', payload);
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === payload.sectionId 
          ? { ...section, status: payload.status }
          : section
      )
    );
  };

  const handleRealtimeFieldUpdate = (payload: any) => {
    console.log('🔄 Processing realtime field update:', payload);
    setFormData(prevData => ({
      ...prevData,
      [payload.fieldId]: payload.value
    }));
  };

  const broadcastSectionUpdate = async (sectionId: string, status: FormSection['status']) => {
    console.log('📤 Broadcasting section update:', { sectionId, status });
    const channel = supabase.channel(`enrollment_progress_${sessionId}`);
    await channel.send({
      type: 'broadcast',
      event: 'section_update',
      payload: { sectionId, status, userId, timestamp: new Date().toISOString() }
    });
  };

  const broadcastFieldUpdate = async (fieldId: string, value: any) => {
    console.log('📤 Broadcasting field update:', { fieldId, value });
    const channel = supabase.channel(`enrollment_progress_${sessionId}`);
    await channel.send({
      type: 'broadcast',
      event: 'field_update',
      payload: { fieldId, value, userId, timestamp: new Date().toISOString() }
    });
  };

  const handleFieldChange = async (fieldId: string, value: any) => {
    console.log('📝 Field changed:', { fieldId, value });
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    await broadcastFieldUpdate(fieldId, value);
  };

  const handleSectionComplete = async () => {
    const currentSection = sections[currentSectionIdx];
    console.log('✅ Completing section:', currentSection.id);
    
    setIsSubmitting(true);
    
    // Mark section as completed
    setSections(prev => 
      prev.map((section, idx) => 
        idx === currentSectionIdx 
          ? { ...section, status: 'completed' }
          : section
      )
    );

    // Broadcast section completion
    await broadcastSectionUpdate(currentSection.id, 'completed');
    
    // Call section completion callback
    onSectionComplete?.(currentSection.id, formData);
    
    toast.success(`✅ ${currentSection.title} completed!`);
    
    setIsSubmitting(false);
    
    // Move to next section or complete form
    if (currentSectionIdx < sections.length - 1) {
      setCurrentSectionIdx(prev => prev + 1);
      // Mark next section as in progress
      setSections(prev => 
        prev.map((section, idx) => 
          idx === currentSectionIdx + 1 
            ? { ...section, status: 'in_progress' }
            : section
        )
      );
      await broadcastSectionUpdate(sections[currentSectionIdx + 1].id, 'in_progress');
    } else {
      // All sections completed
      console.log('🎉 All sections completed, finalizing enrollment');
      onFormComplete?.(formData);
      toast.success('🎉 Enrollment completed successfully!');
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIdx > 0) {
      setCurrentSectionIdx(prev => prev - 1);
    }
  };

  const calculateProgress = () => {
    const completedSections = sections.filter(s => s.status === 'completed').length;
    return (completedSections / sections.length) * 100;
  };

  const currentSection = sections[currentSectionIdx];
  const progress = calculateProgress();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">📋 Structured Enrollment</h2>
            <p className="text-slate-600">Complete each section step by step</p>
          </div>
          <div className="flex items-center gap-2">
            {realtimeUsers.length > 1 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                👥 {realtimeUsers.length} users active
              </Badge>
            )}
            <Badge variant="outline">
              Session: {sessionId}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Progress</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      {/* Section Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section, idx) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`relative cursor-pointer transition-all duration-200 ${
              idx === currentSectionIdx 
                ? 'ring-2 ring-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50' 
                : section.status === 'completed'
                ? 'bg-green-50 border-green-200'
                : 'hover:shadow-md'
            }`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {section.icon}
                    <CardTitle className="text-sm">{section.title}</CardTitle>
                  </div>
                  {section.status === 'completed' && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  {section.status === 'in_progress' && (
                    <Clock className="h-4 w-4 text-teal-600" />
                  )}
                  {section.status === 'pending' && (
                    <AlertCircle className="h-4 w-4 text-slate-400" />
                  )}
                </div>
                <p className="text-xs text-slate-600">{section.description}</p>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Current Section Form */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/30 border-2 border-teal-200/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                {currentSection.icon}
                <div>
                  <CardTitle className="text-xl text-slate-800">
                    {currentSection.title}
                  </CardTitle>
                  <p className="text-slate-600">{currentSection.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSection.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="text-sm font-medium text-slate-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.id}
                        placeholder={field.placeholder}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="bg-white/80 border-slate-200 focus:border-teal-500"
                      />
                    ) : (
                      <Input
                        id={field.id}
                        type={field.type === 'phone' ? 'tel' : field.type}
                        placeholder={field.placeholder}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="bg-white/80 border-slate-200 focus:border-teal-500"
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Section Navigation */}
              <div className="flex justify-between items-center pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevSection}
                  disabled={currentSectionIdx === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-slate-600">
                    Section {currentSectionIdx + 1} of {sections.length}
                  </p>
                </div>
                
                <Button
                  onClick={handleSectionComplete}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  {isSubmitting ? 'Saving...' : 
                    currentSectionIdx === sections.length - 1 ? 'Complete Enrollment' : 'Next Section'
                  }
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Live Activity Feed */}
      {realtimeUsers.length > 1 && (
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              👥 Live Activity
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {realtimeUsers.length} active users
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {realtimeUsers.map((user, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">{user.user_name}</span>
                  <span className="text-slate-500">
                    working on {sections.find(s => s.id === user.current_section)?.title || 'Unknown Section'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};