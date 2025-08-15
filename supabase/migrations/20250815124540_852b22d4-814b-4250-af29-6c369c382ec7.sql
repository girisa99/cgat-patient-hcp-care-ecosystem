-- Add journey stage tracking to agent conversations
-- This extends existing conversations with journey context

-- Add journey-related columns to agent_conversations table
ALTER TABLE public.agent_conversations 
ADD COLUMN IF NOT EXISTS current_journey_stage_id TEXT,
ADD COLUMN IF NOT EXISTS journey_context JSONB DEFAULT '{"stages": [], "current_stage": 0, "progress": {}}'::jsonb,
ADD COLUMN IF NOT EXISTS journey_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS journey_completed_at TIMESTAMP WITH TIME ZONE;

-- Create table to track journey stage transitions in conversations
CREATE TABLE IF NOT EXISTS public.journey_stage_transitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  from_stage_id TEXT,
  to_stage_id TEXT NOT NULL,
  transition_reason TEXT,
  transition_data JSONB DEFAULT '{}'::jsonb,
  triggered_by TEXT DEFAULT 'system'::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT fk_journey_transitions_conversation
    FOREIGN KEY (conversation_id) 
    REFERENCES public.agent_conversations(id) 
    ON DELETE CASCADE
);

-- Enable RLS on journey_stage_transitions
ALTER TABLE public.journey_stage_transitions ENABLE ROW LEVEL SECURITY;

-- Create policies for journey_stage_transitions
CREATE POLICY "Users can view their conversation journey transitions"
ON public.journey_stage_transitions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.agent_conversations ac 
    WHERE ac.id = journey_stage_transitions.conversation_id 
    AND ac.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert journey transitions"
ON public.journey_stage_transitions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their conversation journey transitions"
ON public.journey_stage_transitions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.agent_conversations ac 
    WHERE ac.id = journey_stage_transitions.conversation_id 
    AND ac.user_id = auth.uid()
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_journey_transitions_conversation_id 
ON public.journey_stage_transitions(conversation_id);

CREATE INDEX IF NOT EXISTS idx_journey_transitions_created_at 
ON public.journey_stage_transitions(created_at);

-- Create function to initialize journey for conversation
CREATE OR REPLACE FUNCTION public.initialize_conversation_journey(
  p_conversation_id UUID,
  p_agent_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  agent_journey_stages JSONB;
  journey_context JSONB;
  first_stage_id TEXT;
BEGIN
  -- Get journey stages from agent's deployment or template
  SELECT 
    COALESCE(
      a.deployment_config->'journey_stages_snapshot'->'stages',
      at.journey_stages,
      '[]'::jsonb
    ) INTO agent_journey_stages
  FROM agents a
  LEFT JOIN agent_templates at ON a.template_id = at.id
  WHERE a.id = p_agent_id;
  
  -- If no stages found, return empty context
  IF agent_journey_stages IS NULL OR jsonb_array_length(agent_journey_stages) = 0 THEN
    RETURN '{"stages": [], "current_stage": 0, "progress": {}}'::jsonb;
  END IF;
  
  -- Get first stage ID
  first_stage_id := agent_journey_stages->0->>'id';
  
  -- Build journey context
  journey_context := jsonb_build_object(
    'stages', agent_journey_stages,
    'current_stage', 0,
    'current_stage_id', first_stage_id,
    'progress', jsonb_build_object(),
    'initialized_at', now()
  );
  
  -- Update conversation with journey context
  UPDATE agent_conversations 
  SET 
    journey_context = journey_context,
    current_journey_stage_id = first_stage_id,
    journey_started_at = now()
  WHERE id = p_conversation_id;
  
  -- Log initial transition
  INSERT INTO journey_stage_transitions (
    conversation_id,
    from_stage_id,
    to_stage_id,
    transition_reason,
    triggered_by
  ) VALUES (
    p_conversation_id,
    NULL,
    first_stage_id,
    'conversation_started',
    'system'
  );
  
  RETURN journey_context;
END;
$$;

-- Create function to progress journey stage
CREATE OR REPLACE FUNCTION public.progress_journey_stage(
  p_conversation_id UUID,
  p_next_stage_id TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT 'natural_progression',
  p_transition_data JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_context JSONB;
  current_stage_index INTEGER;
  next_stage_index INTEGER;
  stages_array JSONB;
  current_stage_id TEXT;
  calculated_next_stage_id TEXT;
  updated_context JSONB;
BEGIN
  -- Get current journey context
  SELECT journey_context, current_journey_stage_id 
  INTO current_context, current_stage_id
  FROM agent_conversations 
  WHERE id = p_conversation_id;
  
  IF current_context IS NULL THEN
    RAISE EXCEPTION 'Journey not initialized for conversation';
  END IF;
  
  stages_array := current_context->'stages';
  current_stage_index := (current_context->>'current_stage')::integer;
  
  -- Determine next stage
  IF p_next_stage_id IS NOT NULL THEN
    calculated_next_stage_id := p_next_stage_id;
    -- Find index of specified stage
    FOR i IN 0..(jsonb_array_length(stages_array) - 1) LOOP
      IF stages_array->i->>'id' = p_next_stage_id THEN
        next_stage_index := i;
        EXIT;
      END IF;
    END LOOP;
  ELSE
    -- Progress to next stage in sequence
    next_stage_index := current_stage_index + 1;
    IF next_stage_index >= jsonb_array_length(stages_array) THEN
      -- Journey complete
      UPDATE agent_conversations 
      SET journey_completed_at = now()
      WHERE id = p_conversation_id;
      
      RETURN jsonb_build_object('status', 'journey_completed');
    END IF;
    calculated_next_stage_id := stages_array->next_stage_index->>'id';
  END IF;
  
  -- Update journey context
  updated_context := jsonb_set(
    jsonb_set(
      current_context,
      '{current_stage}',
      to_jsonb(next_stage_index)
    ),
    '{current_stage_id}',
    to_jsonb(calculated_next_stage_id)
  );
  
  -- Update conversation
  UPDATE agent_conversations 
  SET 
    journey_context = updated_context,
    current_journey_stage_id = calculated_next_stage_id
  WHERE id = p_conversation_id;
  
  -- Log transition
  INSERT INTO journey_stage_transitions (
    conversation_id,
    from_stage_id,
    to_stage_id,
    transition_reason,
    transition_data,
    triggered_by
  ) VALUES (
    p_conversation_id,
    current_stage_id,
    calculated_next_stage_id,
    p_reason,
    p_transition_data,
    'system'
  );
  
  RETURN jsonb_build_object(
    'status', 'stage_progressed',
    'from_stage', current_stage_id,
    'to_stage', calculated_next_stage_id,
    'stage_index', next_stage_index
  );
END;
$$;