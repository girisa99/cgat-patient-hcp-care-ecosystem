-- Add missing Genie Demo show types to show_type enum
ALTER TYPE show_type ADD VALUE IF NOT EXISTS 'genie_studio_full';
ALTER TYPE show_type ADD VALUE IF NOT EXISTS 'genie_spark_demo';
ALTER TYPE show_type ADD VALUE IF NOT EXISTS 'genie_arc_demo';
ALTER TYPE show_type ADD VALUE IF NOT EXISTS 'genie_mind_demo';
ALTER TYPE show_type ADD VALUE IF NOT EXISTS 'genie_vibe_demo';
ALTER TYPE show_type ADD VALUE IF NOT EXISTS 'genie_suite_overview';