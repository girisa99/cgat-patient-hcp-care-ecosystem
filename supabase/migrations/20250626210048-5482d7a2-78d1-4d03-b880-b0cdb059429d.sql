
-- Enable real-time sync for audit_logs table to ensure proper real-time updates
ALTER TABLE public.audit_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;

-- Enable real-time for profiles table for complete audit coverage
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
