
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/DatabaseAuthProvider';
import { toast } from 'sonner';

interface NotificationRequest {
  type: 'sms' | 'voice' | 'email' | 'whatsapp';
  to: string;
  message: string;
  subject?: string;
}

export const useTwilioNotifications = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const sendNotificationMutation = useMutation({
    mutationFn: async (notification: NotificationRequest) => {
      const { data, error } = await supabase.functions.invoke('twilio-notifications', {
        body: {
          ...notification,
          userId: user?.id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      toast.success(`${variables.type.toUpperCase()} notification sent successfully`);
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['userActivityLogs'] });
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
    },
    onError: (error: any) => {
      console.error('Error sending notification:', error);
      toast.error(`Failed to send notification: ${error.message}`);
    },
  });

  const sendSMS = (to: string, message: string) => {
    sendNotificationMutation.mutate({ type: 'sms', to, message });
  };

  const sendWhatsApp = (to: string, message: string) => {
    sendNotificationMutation.mutate({ type: 'whatsapp', to, message });
  };

  const sendVoiceCall = (to: string, message: string) => {
    sendNotificationMutation.mutate({ type: 'voice', to, message });
  };

  const sendEmail = (to: string, message: string, subject?: string) => {
    sendNotificationMutation.mutate({ type: 'email', to, message, subject });
  };

  return {
    sendSMS,
    sendWhatsApp,
    sendVoiceCall,
    sendEmail,
    isLoading: sendNotificationMutation.isPending,
  };
};
