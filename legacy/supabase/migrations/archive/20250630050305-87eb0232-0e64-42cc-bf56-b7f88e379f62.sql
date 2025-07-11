
-- Part 1: Add the new enum values in separate statements
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'financeTeam';
COMMIT;

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'contractTeam';
COMMIT;

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'workflowManager';
COMMIT;
