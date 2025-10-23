-- Update status constraints to include 'active' status
-- Run this after the main schema is created

-- 1) Update journey_milestones status constraint
ALTER TABLE journey_milestones
DROP CONSTRAINT IF EXISTS journey_milestones_status_check;

ALTER TABLE journey_milestones
ADD CONSTRAINT journey_milestones_status_check
CHECK (status IN ('pending', 'in-progress', 'completed', 'overdue', 'cancelled', 'deleted', 'archived', 'active'));

-- 2) Update journey_goals status constraint  
ALTER TABLE journey_goals
DROP CONSTRAINT IF EXISTS journey_goals_status_check;

ALTER TABLE journey_goals
ADD CONSTRAINT journey_goals_status_check
CHECK (status IN ('not-started', 'in-progress', 'completed', 'cancelled', 'deleted', 'archived', 'active'));

-- 3) Update default values to use 'active' instead of 'pending'/'not-started'
ALTER TABLE journey_milestones 
ALTER COLUMN status SET DEFAULT 'active';

ALTER TABLE journey_goals 
ALTER COLUMN status SET DEFAULT 'active';
