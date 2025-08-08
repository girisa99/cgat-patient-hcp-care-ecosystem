-- 1) Create enum types safely if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'voice_connector_type') THEN
    CREATE TYPE public.voice_connector_type AS ENUM ('SIP','API','Webhook','Database','CRM','Cloud');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'voice_health_status') THEN
    CREATE TYPE public.voice_health_status AS ENUM ('healthy','warning','error','unknown');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'voice_transfer_status') THEN
    CREATE TYPE public.voice_transfer_status AS ENUM ('waiting','assigned','completed','cancelled');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'voice_event_type') THEN
    CREATE TYPE public.voice_event_type AS ENUM ('call_started','call_ended','transfer','queue_join','queue_leave','agent_login','agent_logout');
  END IF;
END $$;

-- 2) Create tables if not exist
CREATE TABLE IF NOT EXISTS public.voice_connectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  connector_type public.voice_connector_type NOT NULL,
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  endpoints text[] NOT NULL DEFAULT '{}'::text[],
  features text[] NOT NULL DEFAULT '{}'::text[],
  is_active boolean NOT NULL DEFAULT true,
  health_status public.voice_health_status NOT NULL DEFAULT 'unknown',
  last_tested_at timestamptz NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT voice_connectors_created_by_fk FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.voice_transfer_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NULL,
  live_agent_id uuid NULL,
  requested_by uuid NOT NULL,
  customer_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  priority integer NOT NULL DEFAULT 1,
  status public.voice_transfer_status NOT NULL DEFAULT 'waiting',
  created_at timestamptz NOT NULL DEFAULT now(),
  assigned_at timestamptz NULL,
  completed_at timestamptz NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT voice_transfer_queue_agent_fk FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL,
  CONSTRAINT voice_transfer_queue_live_agent_fk FOREIGN KEY (live_agent_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT voice_transfer_queue_requested_by_fk FOREIGN KEY (requested_by) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.voice_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type public.voice_event_type NOT NULL,
  agent_id uuid NULL,
  live_agent_id uuid NULL,
  connector_id uuid NULL,
  call_duration integer NULL,
  queue_wait_time integer NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT voice_analytics_events_agent_fk FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL,
  CONSTRAINT voice_analytics_events_live_agent_fk FOREIGN KEY (live_agent_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT voice_analytics_events_connector_fk FOREIGN KEY (connector_id) REFERENCES public.voice_connectors(id) ON DELETE SET NULL
);

-- 3) Triggers for updated_at and requested_by
-- updated_at triggers
DROP TRIGGER IF EXISTS trg_voice_connectors_updated_at ON public.voice_connectors;
CREATE TRIGGER trg_voice_connectors_updated_at
BEFORE UPDATE ON public.voice_connectors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_voice_transfer_queue_updated_at ON public.voice_transfer_queue;
CREATE TRIGGER trg_voice_transfer_queue_updated_at
BEFORE UPDATE ON public.voice_transfer_queue
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- requested_by auto-set trigger
CREATE OR REPLACE FUNCTION public.set_requested_by()
RETURNS trigger AS $$
BEGIN
  IF NEW.requested_by IS NULL THEN
    NEW.requested_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

DROP TRIGGER IF EXISTS trg_voice_transfer_queue_set_requested_by ON public.voice_transfer_queue;
CREATE TRIGGER trg_voice_transfer_queue_set_requested_by
BEFORE INSERT ON public.voice_transfer_queue
FOR EACH ROW EXECUTE FUNCTION public.set_requested_by();

-- 4) Indexes
CREATE INDEX IF NOT EXISTS idx_voice_connectors_created_by ON public.voice_connectors (created_by);
CREATE INDEX IF NOT EXISTS idx_voice_connectors_is_active ON public.voice_connectors (is_active);
CREATE INDEX IF NOT EXISTS idx_voice_transfer_queue_status ON public.voice_transfer_queue (status);
CREATE INDEX IF NOT EXISTS idx_voice_transfer_queue_priority ON public.voice_transfer_queue (priority DESC);
CREATE INDEX IF NOT EXISTS idx_voice_transfer_queue_requested_by ON public.voice_transfer_queue (requested_by);
CREATE INDEX IF NOT EXISTS idx_voice_transfer_queue_live_agent ON public.voice_transfer_queue (live_agent_id);
CREATE INDEX IF NOT EXISTS idx_voice_analytics_events_created_at ON public.voice_analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_analytics_events_event_type ON public.voice_analytics_events (event_type);

-- 5) Enable Row Level Security
ALTER TABLE public.voice_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_transfer_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_analytics_events ENABLE ROW LEVEL SECURITY;

-- voice_connectors policies
DROP POLICY IF EXISTS vc_select ON public.voice_connectors;
CREATE POLICY vc_select ON public.voice_connectors
FOR SELECT USING (created_by = auth.uid() OR public.is_admin_user_safe(auth.uid()));

DROP POLICY IF EXISTS vc_insert ON public.voice_connectors;
CREATE POLICY vc_insert ON public.voice_connectors
FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS vc_update ON public.voice_connectors;
CREATE POLICY vc_update ON public.voice_connectors
FOR UPDATE USING (created_by = auth.uid() OR public.is_admin_user_safe(auth.uid()));

DROP POLICY IF EXISTS vc_delete ON public.voice_connectors;
CREATE POLICY vc_delete ON public.voice_connectors
FOR DELETE USING (created_by = auth.uid() OR public.is_admin_user_safe(auth.uid()));

-- voice_transfer_queue policies
DROP POLICY IF EXISTS vtq_select ON public.voice_transfer_queue;
CREATE POLICY vtq_select ON public.voice_transfer_queue
FOR SELECT USING (
  requested_by = auth.uid() OR live_agent_id = auth.uid() OR public.is_admin_user_safe(auth.uid())
);

DROP POLICY IF EXISTS vtq_insert ON public.voice_transfer_queue;
CREATE POLICY vtq_insert ON public.voice_transfer_queue
FOR INSERT WITH CHECK (requested_by = auth.uid());

DROP POLICY IF EXISTS vtq_update ON public.voice_transfer_queue;
CREATE POLICY vtq_update ON public.voice_transfer_queue
FOR UPDATE USING (
  requested_by = auth.uid() OR live_agent_id = auth.uid() OR public.is_admin_user_safe(auth.uid())
);

DROP POLICY IF EXISTS vtq_delete ON public.voice_transfer_queue;
CREATE POLICY vtq_delete ON public.voice_transfer_queue
FOR DELETE USING (requested_by = auth.uid() OR public.is_admin_user_safe(auth.uid()));

-- voice_analytics_events policies
DROP POLICY IF EXISTS vae_select ON public.voice_analytics_events;
CREATE POLICY vae_select ON public.voice_analytics_events
FOR SELECT USING (auth.uid() IS NOT NULL OR public.is_admin_user_safe(auth.uid()));

DROP POLICY IF EXISTS vae_insert ON public.voice_analytics_events;
CREATE POLICY vae_insert ON public.voice_analytics_events
FOR INSERT WITH CHECK (true);

-- 6) Realtime setup
ALTER TABLE public.voice_transfer_queue REPLICA IDENTITY FULL;
ALTER TABLE public.voice_analytics_events REPLICA IDENTITY FULL;

-- Add to realtime publication (will no-op if already present)
DO $$ BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_transfer_queue';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_analytics_events';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
