import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';

interface NotificationRequest {
  type: 'sms' | 'voice' | 'email';
  to: string;
  message: string;
  userId?: string;
  priority?: 'high' | 'normal' | 'low';
}

interface NotificationResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const useTwilioNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useMasterAuth();

  const sendNotification = async (request: NotificationRequest): Promise<NotificationResponse> => {
    if (!user?.id) {
      const errorMsg = 'Authentication required for notifications';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📱 Sending Twilio notification:', request.type, 'to', request.to);

      const { data, error: functionError } = await supabase.functions.invoke('twilio-notifications', {
        body: {
          ...request,
          userId: user.id,
          timestamp: new Date().toISOString()
        }
      });

      if (functionError) {
        console.error('❌ Twilio function error:', functionError);
        setError(functionError.message);
        return { success: false, error: functionError.message };
      }

      console.log('✅ Notification sent successfully:', data);
      return { success: true, messageId: data?.messageId };

    } catch (err: any) {
      console.error('💥 Exception sending notification:', err);
      const errorMsg = err.message || 'Failed to send notification';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const sendSMS = async (to: string, message: string, priority: 'high' | 'normal' | 'low' = 'normal') => {
    return sendNotification({ type: 'sms', to, message, priority, userId: user?.id });
  };

  const sendVoice = async (to: string, message: string, priority: 'high' | 'normal' | 'low' = 'normal') => {
    return sendNotification({ type: 'voice', to, message, priority, userId: user?.id });
  };

  const sendEmail = async (to: string, message: string, priority: 'high' | 'normal' | 'low' = 'normal') => {
    return sendNotification({ type: 'email', to, message, priority, userId: user?.id });
  };

  // Bulk notification sending
  const sendBulkNotifications = async (requests: NotificationRequest[]): Promise<NotificationResponse[]> => {
    if (!user?.id) {
      const errorMsg = 'Authentication required for bulk notifications';
      setError(errorMsg);
      return requests.map(() => ({ success: false, error: errorMsg }));
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📱 Sending bulk notifications:', requests.length, 'requests');

      const results = await Promise.allSettled(
        requests.map(request => sendNotification(request))
      );

      const responses = results.map(result => 
        result.status === 'fulfilled' 
          ? result.value 
          : { success: false, error: 'Request failed' }
      );

      console.log('✅ Bulk notifications completed:', responses.filter(r => r.success).length, 'successful');
      return responses;

    } catch (err: any) {
      console.error('💥 Exception sending bulk notifications:', err);
      const errorMsg = err.message || 'Failed to send bulk notifications';
      setError(errorMsg);
      return requests.map(() => ({ success: false, error: errorMsg }));
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sendNotification,
    sendSMS,
    sendVoice,
    sendEmail,
    sendBulkNotifications,
    isAuthenticated: !!user?.id,
    userId: user?.id
  };
};
