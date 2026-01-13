-- Add genie_demo to event_category enum
ALTER TYPE event_category ADD VALUE IF NOT EXISTS 'genie_demo';

-- Add demo_stage column to shows table for tracking demo-specific stages
-- This allows genie_demo category to use demo-specific stages
ALTER TABLE public.shows 
ADD COLUMN IF NOT EXISTS demo_stage production_stage;