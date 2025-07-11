
-- Create developer notifications table
CREATE TABLE public.developer_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new_api', 'beta_launch', 'documentation_update', 'breaking_change', 'feature_update')),
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create developer notification preferences table
CREATE TABLE public.developer_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  new_apis BOOLEAN NOT NULL DEFAULT TRUE,
  beta_launches BOOLEAN NOT NULL DEFAULT TRUE,
  documentation_updates BOOLEAN NOT NULL DEFAULT FALSE,
  breaking_changes BOOLEAN NOT NULL DEFAULT TRUE,
  feature_updates BOOLEAN NOT NULL DEFAULT TRUE,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create API change tracking table
CREATE TABLE public.api_change_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  api_name TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.developer_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_change_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for developer_notifications
CREATE POLICY "Users can view their own notifications"
  ON public.developer_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.developer_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policies for developer_notification_preferences
CREATE POLICY "Users can manage their own preferences"
  ON public.developer_notification_preferences
  FOR ALL
  USING (auth.uid() = user_id);

-- Create RLS policies for api_change_tracking (admin only)
CREATE POLICY "Admins can manage API change tracking"
  ON public.api_change_tracking
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'superAdmin'
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_developer_notification_preferences_updated_at
  BEFORE UPDATE ON public.developer_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
