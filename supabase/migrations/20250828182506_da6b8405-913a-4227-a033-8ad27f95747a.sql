-- Create missing categories for workflow organization
INSERT INTO workflow_node_categories (name, display_name, description, icon, color, order_index, is_active) VALUES
('automation_workflow', 'Automation & Workflow', 'Workflow automation, scheduling, triggers, and process orchestration nodes', 'workflow', '#059669', 15, true),
('data_integration', 'Data & Integration', 'Data connectors, ETL processes, database operations, and API integrations', 'database', '#0ea5e9', 16, true),
('human_oversight', 'Human Oversight', 'Human approval gates, review processes, escalation, and manual intervention nodes', 'users', '#f59e0b', 17, true),
('development_testing', 'Development & Testing', 'Testing frameworks, validation, debugging, and quality assurance nodes', 'bug', '#ef4444', 18, true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active;