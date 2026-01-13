-- Add missing demo stages to production_stage enum
ALTER TYPE production_stage ADD VALUE IF NOT EXISTS 'demo_scheduled';
ALTER TYPE production_stage ADD VALUE IF NOT EXISTS 'demo_prep';
ALTER TYPE production_stage ADD VALUE IF NOT EXISTS 'demo_live';
ALTER TYPE production_stage ADD VALUE IF NOT EXISTS 'demo_followup';
ALTER TYPE production_stage ADD VALUE IF NOT EXISTS 'demo_closed';