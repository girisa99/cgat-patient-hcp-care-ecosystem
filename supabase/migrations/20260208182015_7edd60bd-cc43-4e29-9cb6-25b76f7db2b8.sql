
-- ============================================
-- PERSISTENT RATE LIMITING (replaces in-memory)
-- ============================================

-- Rate limit entries table
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_ip TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_rate_limits_ip_endpoint ON public.api_rate_limits (client_ip, endpoint, window_end);

-- Auto-cleanup: delete expired windows (older than 5 min)
CREATE INDEX idx_rate_limits_expired ON public.api_rate_limits (window_end);

-- Enable RLS (public access for edge functions via service role)
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge functions use service role key)
CREATE POLICY "Service role full access on rate limits"
  ON public.api_rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- CHECK RATE LIMIT FUNCTION (called by edge functions)
-- ============================================
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_client_ip TEXT,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 20,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMP WITH TIME ZONE := now();
  v_window_end TIMESTAMP WITH TIME ZONE := v_now + (p_window_seconds || ' seconds')::INTERVAL;
  v_current_count INTEGER;
  v_existing_id UUID;
  v_existing_window_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Find active window for this IP + endpoint
  SELECT id, request_count, window_end
  INTO v_existing_id, v_current_count, v_existing_window_end
  FROM public.api_rate_limits
  WHERE client_ip = p_client_ip
    AND endpoint = p_endpoint
    AND window_end > v_now
  ORDER BY window_start DESC
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- Active window exists
    IF v_current_count >= p_max_requests THEN
      -- Rate limited
      RETURN json_build_object(
        'allowed', false,
        'remaining', 0,
        'reset_in_seconds', EXTRACT(EPOCH FROM (v_existing_window_end - v_now))::INTEGER
      );
    END IF;

    -- Increment counter
    UPDATE public.api_rate_limits
    SET request_count = request_count + 1
    WHERE id = v_existing_id;

    RETURN json_build_object(
      'allowed', true,
      'remaining', p_max_requests - v_current_count - 1,
      'reset_in_seconds', EXTRACT(EPOCH FROM (v_existing_window_end - v_now))::INTEGER
    );
  ELSE
    -- Create new window
    INSERT INTO public.api_rate_limits (client_ip, endpoint, request_count, window_start, window_end)
    VALUES (p_client_ip, p_endpoint, 1, v_now, v_window_end);

    RETURN json_build_object(
      'allowed', true,
      'remaining', p_max_requests - 1,
      'reset_in_seconds', p_window_seconds
    );
  END IF;
END;
$$;

-- ============================================
-- CLEANUP FUNCTION (run periodically)
-- ============================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.api_rate_limits WHERE window_end < now() - INTERVAL '5 minutes';
END;
$$;
