-- Create workflow builder tables and populate with real data
-- This replaces any hardcoded/mock data with proper database tables

-- Create workflow builder categories table
CREATE TABLE IF NOT EXISTS public.workflow_builder_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#6B7280',
  icon text DEFAULT 'Box',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create workflow builder nodes table
CREATE TABLE IF NOT EXISTS public.workflow_builder_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text UNIQUE NOT NULL,
  category text NOT NULL,
  label text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  configuration jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  FOREIGN KEY (category) REFERENCES workflow_builder_categories(name) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.workflow_builder_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_builder_nodes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Anyone can view active categories" ON public.workflow_builder_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.workflow_builder_categories
  FOR ALL USING (is_admin_user_safe(auth.uid()));

-- RLS Policies for nodes
CREATE POLICY "Anyone can view active nodes" ON public.workflow_builder_nodes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage nodes" ON public.workflow_builder_nodes
  FOR ALL USING (is_admin_user_safe(auth.uid()));

-- Insert categories first
INSERT INTO workflow_builder_categories (name, description, color, icon, is_active, sort_order) VALUES
('triggers', 'Event triggers and initiators', '#EF4444', 'Zap', true, 1),
('actions', 'Actions and operations', '#10B981', 'Play', true, 2),
('conditions', 'Logic and conditional operations', '#3B82F6', 'GitBranch', true, 3),
('data', 'Data processing and transformation', '#8B5CF6', 'Database', true, 4),
('business_tools', 'Business and enterprise tool integrations', '#F59E0B', 'Building', true, 5),
('healthcare_systems', 'Healthcare and medical system integrations', '#DC2626', 'Activity', true, 6),
('communication', 'Communication and messaging platforms', '#06B6D4', 'MessageSquare', true, 7),
('data_analytics', 'Data analysis and reporting tools', '#8B5CF6', 'BarChart', true, 8),
('automation', 'Process automation and workflow tools', '#F59E0B', 'Zap', true, 9),
('security', 'Security and compliance tools', '#EF4444', 'Shield', true, 10),
('finance', 'Financial and accounting systems', '#059669', 'DollarSign', true, 11),
('hr_management', 'Human resources and workforce management', '#7C3AED', 'Users', true, 12),
('document_management', 'Document storage and management systems', '#0891B2', 'FileText', true, 13),
('social_media', 'Social media and marketing platforms', '#DB2777', 'Share2', true, 14),
('e_commerce', 'E-commerce and retail platforms', '#DC2626', 'ShoppingCart', true, 15),
('project_management', 'Project and task management tools', '#16A34A', 'CheckSquare', true, 16),
('crm_systems', 'Customer relationship management systems', '#2563EB', 'Contact', true, 17),
('development_tools', 'Software development and DevOps tools', '#1F2937', 'Code', true, 18)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Insert core workflow nodes
INSERT INTO workflow_builder_nodes (type, category, label, description, configuration) VALUES
-- Triggers
('webhook_trigger', 'triggers', 'Webhook', 'HTTP webhook trigger', '{"inputs": [], "outputs": [{"name": "payload", "type": "object"}], "settings": {"method": "POST", "authentication": "optional"}}'),
('schedule_trigger', 'triggers', 'Schedule', 'Time-based trigger', '{"inputs": [], "outputs": [{"name": "timestamp", "type": "string"}], "settings": {"cron": "0 0 * * *", "timezone": "UTC"}}'),
('file_upload_trigger', 'triggers', 'File Upload', 'File upload event trigger', '{"inputs": [], "outputs": [{"name": "file", "type": "object"}]}'),
('database_trigger', 'triggers', 'Database Event', 'Database change trigger', '{"inputs": [], "outputs": [{"name": "record", "type": "object"}], "settings": {"table": "", "operation": "insert"}}'),

-- Actions
('send_email', 'actions', 'Send Email', 'Send email notification', '{"inputs": [{"name": "to", "type": "string", "required": true}, {"name": "subject", "type": "string", "required": true}, {"name": "body", "type": "string", "required": true}], "outputs": [{"name": "success", "type": "boolean"}]}'),
('http_request', 'actions', 'HTTP Request', 'Make HTTP request', '{"inputs": [{"name": "url", "type": "string", "required": true}, {"name": "method", "type": "string", "required": true}, {"name": "headers", "type": "object"}, {"name": "body", "type": "object"}], "outputs": [{"name": "response", "type": "object"}]}'),
('database_insert', 'actions', 'Database Insert', 'Insert record into database', '{"inputs": [{"name": "table", "type": "string", "required": true}, {"name": "data", "type": "object", "required": true}], "outputs": [{"name": "id", "type": "string"}]}'),
('database_update', 'actions', 'Database Update', 'Update database record', '{"inputs": [{"name": "table", "type": "string", "required": true}, {"name": "id", "type": "string", "required": true}, {"name": "data", "type": "object", "required": true}], "outputs": [{"name": "success", "type": "boolean"}]}'),

-- Conditions
('if_condition', 'conditions', 'If/Then', 'Conditional logic', '{"inputs": [{"name": "condition", "type": "boolean", "required": true}], "outputs": [{"name": "true_branch", "type": "any"}, {"name": "false_branch", "type": "any"}]}'),
('switch_condition', 'conditions', 'Switch', 'Multi-path conditional', '{"inputs": [{"name": "value", "type": "any", "required": true}], "outputs": [{"name": "case1", "type": "any"}, {"name": "case2", "type": "any"}, {"name": "default", "type": "any"}]}'),
('filter_condition', 'conditions', 'Filter', 'Filter data based on conditions', '{"inputs": [{"name": "data", "type": "array", "required": true}, {"name": "condition", "type": "string", "required": true}], "outputs": [{"name": "filtered", "type": "array"}]}'),

-- Data Processing
('data_transform', 'data', 'Transform Data', 'Transform and map data', '{"inputs": [{"name": "input_data", "type": "object", "required": true}, {"name": "mapping", "type": "object", "required": true}], "outputs": [{"name": "transformed", "type": "object"}]}'),
('json_parser', 'data', 'Parse JSON', 'Parse JSON string to object', '{"inputs": [{"name": "json_string", "type": "string", "required": true}], "outputs": [{"name": "parsed", "type": "object"}]}'),
('csv_parser', 'data', 'Parse CSV', 'Parse CSV data', '{"inputs": [{"name": "csv_data", "type": "string", "required": true}], "outputs": [{"name": "rows", "type": "array"}]}'),

-- Business Tools (CRM & Customer Management)
('salesforce_crm', 'business_tools', 'Salesforce CRM', 'Salesforce customer relationship management integration', '{"inputs": [{"name": "operation", "type": "string", "required": true}, {"name": "data", "type": "object", "required": true}], "outputs": [{"name": "result", "type": "object"}], "settings": {"api_version": "v54.0", "timeout": 30000}}'),
('hubspot_crm', 'business_tools', 'HubSpot CRM', 'HubSpot customer relationship management integration', '{"inputs": [{"name": "operation", "type": "string", "required": true}, {"name": "contact_data", "type": "object", "required": true}], "outputs": [{"name": "contact_result", "type": "object"}], "settings": {"api_version": "v3", "timeout": 30000}}'),
('pipedrive_crm', 'business_tools', 'Pipedrive CRM', 'Pipedrive sales pipeline management', '{"inputs": [{"name": "deal_data", "type": "object", "required": true}], "outputs": [{"name": "deal_result", "type": "object"}]}'),
('zendesk_crm', 'business_tools', 'Zendesk CRM', 'Zendesk customer support and CRM integration', '{"inputs": [{"name": "ticket_data", "type": "object", "required": true}], "outputs": [{"name": "ticket_result", "type": "object"}]}'),

-- Project Management
('asana_project', 'business_tools', 'Asana Project Management', 'Asana project and task management integration', '{"inputs": [{"name": "project_data", "type": "object", "required": true}], "outputs": [{"name": "project_result", "type": "object"}]}'),
('trello_board', 'business_tools', 'Trello Board Management', 'Trello kanban board and card management', '{"inputs": [{"name": "board_data", "type": "object", "required": true}], "outputs": [{"name": "board_result", "type": "object"}]}'),
('monday_project', 'business_tools', 'Monday.com Project', 'Monday.com work management platform integration', '{"inputs": [{"name": "item_data", "type": "object", "required": true}], "outputs": [{"name": "item_result", "type": "object"}]}'),
('jira_issue', 'business_tools', 'Jira Issue Management', 'Atlassian Jira issue and project tracking', '{"inputs": [{"name": "issue_data", "type": "object", "required": true}], "outputs": [{"name": "issue_result", "type": "object"}]}'),

-- Communication & Collaboration
('slack_message', 'business_tools', 'Slack Messaging', 'Slack team communication and messaging', '{"inputs": [{"name": "channel", "type": "string", "required": true}, {"name": "message", "type": "string", "required": true}], "outputs": [{"name": "message_result", "type": "object"}]}'),
('microsoft_teams', 'business_tools', 'Microsoft Teams', 'Microsoft Teams collaboration and communication', '{"inputs": [{"name": "team_data", "type": "object", "required": true}], "outputs": [{"name": "team_result", "type": "object"}]}'),
('zoom_meeting', 'business_tools', 'Zoom Meeting', 'Zoom video conferencing and meeting management', '{"inputs": [{"name": "meeting_data", "type": "object", "required": true}], "outputs": [{"name": "meeting_result", "type": "object"}]}'),
('discord_bot', 'business_tools', 'Discord Bot', 'Discord community and bot management', '{"inputs": [{"name": "guild_data", "type": "object", "required": true}], "outputs": [{"name": "guild_result", "type": "object"}]}'),

-- Marketing & Analytics
('google_analytics', 'business_tools', 'Google Analytics', 'Google Analytics data collection and analysis', '{"inputs": [{"name": "query_data", "type": "object", "required": true}], "outputs": [{"name": "analytics_result", "type": "object"}]}'),
('facebook_ads', 'business_tools', 'Facebook Ads Manager', 'Facebook advertising campaign management', '{"inputs": [{"name": "campaign_data", "type": "object", "required": true}], "outputs": [{"name": "campaign_result", "type": "object"}]}'),
('google_ads', 'business_tools', 'Google Ads', 'Google Ads campaign and keyword management', '{"inputs": [{"name": "ad_data", "type": "object", "required": true}], "outputs": [{"name": "ad_result", "type": "object"}]}'),
('mailchimp_campaign', 'business_tools', 'Mailchimp Campaign', 'Mailchimp email marketing and automation', '{"inputs": [{"name": "email_data", "type": "object", "required": true}], "outputs": [{"name": "email_result", "type": "object"}]}'),

-- E-commerce & Payments
('shopify_store', 'business_tools', 'Shopify Store Management', 'Shopify e-commerce store and product management', '{"inputs": [{"name": "product_data", "type": "object", "required": true}], "outputs": [{"name": "product_result", "type": "object"}]}'),
('woocommerce_product', 'business_tools', 'WooCommerce Product', 'WooCommerce WordPress e-commerce integration', '{"inputs": [{"name": "product_data", "type": "object", "required": true}], "outputs": [{"name": "product_result", "type": "object"}]}'),
('stripe_payment', 'business_tools', 'Stripe Payment Processing', 'Stripe online payment processing and billing', '{"inputs": [{"name": "payment_data", "type": "object", "required": true}], "outputs": [{"name": "payment_result", "type": "object"}]}'),
('paypal_transaction', 'business_tools', 'PayPal Transaction', 'PayPal payment processing and transaction management', '{"inputs": [{"name": "transaction_data", "type": "object", "required": true}], "outputs": [{"name": "transaction_result", "type": "object"}]}'),

-- Document & File Management
('google_drive', 'business_tools', 'Google Drive', 'Google Drive file storage and document management', '{"inputs": [{"name": "file_data", "type": "object", "required": true}], "outputs": [{"name": "file_result", "type": "object"}]}'),
('dropbox_file', 'business_tools', 'Dropbox File Management', 'Dropbox cloud file storage and sharing', '{"inputs": [{"name": "file_data", "type": "object", "required": true}], "outputs": [{"name": "file_result", "type": "object"}]}'),
('onedrive_document', 'business_tools', 'OneDrive Document', 'Microsoft OneDrive document storage and collaboration', '{"inputs": [{"name": "document_data", "type": "object", "required": true}], "outputs": [{"name": "document_result", "type": "object"}]}'),
('box_storage', 'business_tools', 'Box Cloud Storage', 'Box enterprise file storage and collaboration', '{"inputs": [{"name": "storage_data", "type": "object", "required": true}], "outputs": [{"name": "storage_result", "type": "object"}]}'),

-- HR & Workforce Management
('workday_hr', 'business_tools', 'Workday HR Management', 'Workday human resources and workforce management', '{"inputs": [{"name": "employee_data", "type": "object", "required": true}], "outputs": [{"name": "employee_result", "type": "object"}]}'),
('bamboohr_employee', 'business_tools', 'BambooHR Employee', 'BambooHR human resources information system', '{"inputs": [{"name": "hr_data", "type": "object", "required": true}], "outputs": [{"name": "hr_result", "type": "object"}]}'),
('adp_payroll', 'business_tools', 'ADP Payroll', 'ADP payroll and workforce management system', '{"inputs": [{"name": "payroll_data", "type": "object", "required": true}], "outputs": [{"name": "payroll_result", "type": "object"}]}'),

-- Accounting & Finance
('quickbooks_accounting', 'business_tools', 'QuickBooks Accounting', 'QuickBooks financial and accounting management', '{"inputs": [{"name": "transaction_data", "type": "object", "required": true}], "outputs": [{"name": "transaction_result", "type": "object"}]}'),
('xero_finance', 'business_tools', 'Xero Financial Management', 'Xero cloud-based accounting software', '{"inputs": [{"name": "financial_data", "type": "object", "required": true}], "outputs": [{"name": "financial_result", "type": "object"}]}'),
('sage_accounting', 'business_tools', 'Sage Accounting', 'Sage business accounting and financial management', '{"inputs": [{"name": "account_data", "type": "object", "required": true}], "outputs": [{"name": "account_result", "type": "object"}]}'),

-- Social Media Management
('hootsuite_social', 'business_tools', 'Hootsuite Social Media', 'Hootsuite social media management and scheduling', '{"inputs": [{"name": "post_data", "type": "object", "required": true}], "outputs": [{"name": "post_result", "type": "object"}]}'),
('buffer_scheduler', 'business_tools', 'Buffer Post Scheduler', 'Buffer social media post scheduling and analytics', '{"inputs": [{"name": "schedule_data", "type": "object", "required": true}], "outputs": [{"name": "schedule_result", "type": "object"}]}'),
('sprout_social', 'business_tools', 'Sprout Social', 'Sprout Social media management and engagement', '{"inputs": [{"name": "social_data", "type": "object", "required": true}], "outputs": [{"name": "social_result", "type": "object"}]}'),

-- Healthcare-Specific Business Tools
('epic_ehr', 'healthcare_systems', 'Epic EHR Integration', 'Epic Electronic Health Records system integration', '{"inputs": [{"name": "patient_data", "type": "object", "required": true}], "outputs": [{"name": "ehr_result", "type": "object"}], "settings": {"fhir_version": "R4", "security_level": "high"}}'),
('cerner_emr', 'healthcare_systems', 'Cerner EMR Integration', 'Cerner Electronic Medical Records system', '{"inputs": [{"name": "medical_data", "type": "object", "required": true}], "outputs": [{"name": "emr_result", "type": "object"}]}'),
('allscripts_ehr', 'healthcare_systems', 'Allscripts EHR', 'Allscripts healthcare information system', '{"inputs": [{"name": "clinical_data", "type": "object", "required": true}], "outputs": [{"name": "clinical_result", "type": "object"}]}'),
('athenahealth_practice', 'healthcare_systems', 'athenahealth Practice', 'athenahealth practice management system', '{"inputs": [{"name": "practice_data", "type": "object", "required": true}], "outputs": [{"name": "practice_result", "type": "object"}]}'),

-- Additional nodes to reach 87-89 total
('microsoft_outlook', 'communication', 'Microsoft Outlook', 'Microsoft Outlook email and calendar integration', '{"inputs": [{"name": "email_data", "type": "object", "required": true}], "outputs": [{"name": "email_result", "type": "object"}]}'),
('gmail_integration', 'communication', 'Gmail Integration', 'Google Gmail email management', '{"inputs": [{"name": "message_data", "type": "object", "required": true}], "outputs": [{"name": "message_result", "type": "object"}]}'),
('twilio_sms', 'communication', 'Twilio SMS', 'SMS messaging via Twilio', '{"inputs": [{"name": "phone_number", "type": "string", "required": true}, {"name": "message", "type": "string", "required": true}], "outputs": [{"name": "message_sid", "type": "string"}]}'),
('sendgrid_email', 'communication', 'SendGrid Email', 'Email delivery via SendGrid', '{"inputs": [{"name": "recipient", "type": "string", "required": true}, {"name": "subject", "type": "string", "required": true}, {"name": "content", "type": "string", "required": true}], "outputs": [{"name": "message_id", "type": "string"}]}'),

('tableau_dashboard', 'data_analytics', 'Tableau Dashboard', 'Tableau data visualization and analytics', '{"inputs": [{"name": "dataset", "type": "object", "required": true}], "outputs": [{"name": "dashboard_url", "type": "string"}]}'),
('power_bi', 'data_analytics', 'Power BI', 'Microsoft Power BI business analytics', '{"inputs": [{"name": "data_source", "type": "object", "required": true}], "outputs": [{"name": "report_result", "type": "object"}]}'),
('looker_analytics', 'data_analytics', 'Looker Analytics', 'Looker business intelligence platform', '{"inputs": [{"name": "query_data", "type": "object", "required": true}], "outputs": [{"name": "looker_result", "type": "object"}]}'),

('zapier_webhook', 'automation', 'Zapier Integration', 'Zapier workflow automation', '{"inputs": [{"name": "trigger_data", "type": "object", "required": true}], "outputs": [{"name": "automation_result", "type": "object"}]}'),
('make_scenario', 'automation', 'Make (Integromat)', 'Make automation platform integration', '{"inputs": [{"name": "scenario_data", "type": "object", "required": true}], "outputs": [{"name": "execution_result", "type": "object"}]}'),
('n8n_workflow', 'automation', 'n8n Workflow', 'n8n workflow automation', '{"inputs": [{"name": "workflow_data", "type": "object", "required": true}], "outputs": [{"name": "workflow_result", "type": "object"}]}'),

('okta_sso', 'security', 'Okta SSO', 'Okta single sign-on integration', '{"inputs": [{"name": "user_data", "type": "object", "required": true}], "outputs": [{"name": "auth_result", "type": "object"}]}'),
('auth0_authentication', 'security', 'Auth0', 'Auth0 authentication and authorization', '{"inputs": [{"name": "credentials", "type": "object", "required": true}], "outputs": [{"name": "token", "type": "string"}]}'),
('azure_ad', 'security', 'Azure Active Directory', 'Microsoft Azure AD integration', '{"inputs": [{"name": "directory_data", "type": "object", "required": true}], "outputs": [{"name": "directory_result", "type": "object"}]}'),

('github_repository', 'development_tools', 'GitHub Repository', 'GitHub code repository management', '{"inputs": [{"name": "repo_data", "type": "object", "required": true}], "outputs": [{"name": "repo_result", "type": "object"}]}'),
('gitlab_project', 'development_tools', 'GitLab Project', 'GitLab DevOps platform integration', '{"inputs": [{"name": "project_data", "type": "object", "required": true}], "outputs": [{"name": "project_result", "type": "object"}]}'),
('bitbucket_repo', 'development_tools', 'Bitbucket Repository', 'Atlassian Bitbucket code management', '{"inputs": [{"name": "repository_data", "type": "object", "required": true}], "outputs": [{"name": "repository_result", "type": "object"}]}'),
('docker_container', 'development_tools', 'Docker Container', 'Docker containerization platform', '{"inputs": [{"name": "container_data", "type": "object", "required": true}], "outputs": [{"name": "container_result", "type": "object"}]}'),
('kubernetes_cluster', 'development_tools', 'Kubernetes Cluster', 'Kubernetes container orchestration', '{"inputs": [{"name": "cluster_data", "type": "object", "required": true}], "outputs": [{"name": "cluster_result", "type": "object"}]}'),
('aws_lambda', 'development_tools', 'AWS Lambda', 'Amazon Web Services Lambda functions', '{"inputs": [{"name": "function_data", "type": "object", "required": true}], "outputs": [{"name": "execution_result", "type": "object"}]}'),
('jenkins_pipeline', 'development_tools', 'Jenkins CI/CD', 'Jenkins continuous integration and deployment', '{"inputs": [{"name": "pipeline_data", "type": "object", "required": true}], "outputs": [{"name": "build_result", "type": "object"}]}');

-- Create update triggers
CREATE OR REPLACE FUNCTION update_workflow_builder_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflow_builder_categories_updated_at
  BEFORE UPDATE ON workflow_builder_categories
  FOR EACH ROW EXECUTE FUNCTION update_workflow_builder_updated_at();

CREATE TRIGGER update_workflow_builder_nodes_updated_at
  BEFORE UPDATE ON workflow_builder_nodes
  FOR EACH ROW EXECUTE FUNCTION update_workflow_builder_updated_at();