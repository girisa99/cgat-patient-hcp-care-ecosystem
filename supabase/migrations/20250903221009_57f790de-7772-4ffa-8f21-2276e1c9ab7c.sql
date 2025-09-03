-- Add missing business tool nodes and workflow builder components
-- This migration ensures we have the complete set of 87-89 nodes as expected

-- Insert missing Business Tools category nodes
INSERT INTO workflow_builder_nodes (id, type, category, label, description, is_active, configuration, created_at, updated_at) VALUES
-- CRM & Customer Management
(gen_random_uuid(), 'salesforce_crm', 'business_tools', 'Salesforce CRM', 'Salesforce customer relationship management integration', true, '{"inputs": [{"name": "operation", "type": "string", "required": true}, {"name": "data", "type": "object", "required": true}], "outputs": [{"name": "result", "type": "object"}], "settings": {"api_version": "v54.0", "timeout": 30000}}', now(), now()),
(gen_random_uuid(), 'hubspot_crm', 'business_tools', 'HubSpot CRM', 'HubSpot customer relationship management integration', true, '{"inputs": [{"name": "operation", "type": "string", "required": true}, {"name": "contact_data", "type": "object", "required": true}], "outputs": [{"name": "contact_result", "type": "object"}], "settings": {"api_version": "v3", "timeout": 30000}}', now(), now()),
(gen_random_uuid(), 'pipedrive_crm', 'business_tools', 'Pipedrive CRM', 'Pipedrive sales pipeline management', true, '{"inputs": [{"name": "deal_data", "type": "object", "required": true}], "outputs": [{"name": "deal_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'zendesk_crm', 'business_tools', 'Zendesk CRM', 'Zendesk customer support and CRM integration', true, '{"inputs": [{"name": "ticket_data", "type": "object", "required": true}], "outputs": [{"name": "ticket_result", "type": "object"}]}', now(), now()),

-- Project Management
(gen_random_uuid(), 'asana_project', 'business_tools', 'Asana Project Management', 'Asana project and task management integration', true, '{"inputs": [{"name": "project_data", "type": "object", "required": true}], "outputs": [{"name": "project_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'trello_board', 'business_tools', 'Trello Board Management', 'Trello kanban board and card management', true, '{"inputs": [{"name": "board_data", "type": "object", "required": true}], "outputs": [{"name": "board_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'monday_project', 'business_tools', 'Monday.com Project', 'Monday.com work management platform integration', true, '{"inputs": [{"name": "item_data", "type": "object", "required": true}], "outputs": [{"name": "item_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'jira_issue', 'business_tools', 'Jira Issue Management', 'Atlassian Jira issue and project tracking', true, '{"inputs": [{"name": "issue_data", "type": "object", "required": true}], "outputs": [{"name": "issue_result", "type": "object"}]}', now(), now()),

-- Communication & Collaboration
(gen_random_uuid(), 'slack_message', 'business_tools', 'Slack Messaging', 'Slack team communication and messaging', true, '{"inputs": [{"name": "channel", "type": "string", "required": true}, {"name": "message", "type": "string", "required": true}], "outputs": [{"name": "message_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'microsoft_teams', 'business_tools', 'Microsoft Teams', 'Microsoft Teams collaboration and communication', true, '{"inputs": [{"name": "team_data", "type": "object", "required": true}], "outputs": [{"name": "team_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'zoom_meeting', 'business_tools', 'Zoom Meeting', 'Zoom video conferencing and meeting management', true, '{"inputs": [{"name": "meeting_data", "type": "object", "required": true}], "outputs": [{"name": "meeting_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'discord_bot', 'business_tools', 'Discord Bot', 'Discord community and bot management', true, '{"inputs": [{"name": "guild_data", "type": "object", "required": true}], "outputs": [{"name": "guild_result", "type": "object"}]}', now(), now()),

-- Marketing & Analytics
(gen_random_uuid(), 'google_analytics', 'business_tools', 'Google Analytics', 'Google Analytics data collection and analysis', true, '{"inputs": [{"name": "query_data", "type": "object", "required": true}], "outputs": [{"name": "analytics_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'facebook_ads', 'business_tools', 'Facebook Ads Manager', 'Facebook advertising campaign management', true, '{"inputs": [{"name": "campaign_data", "type": "object", "required": true}], "outputs": [{"name": "campaign_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'google_ads', 'business_tools', 'Google Ads', 'Google Ads campaign and keyword management', true, '{"inputs": [{"name": "ad_data", "type": "object", "required": true}], "outputs": [{"name": "ad_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'mailchimp_campaign', 'business_tools', 'Mailchimp Campaign', 'Mailchimp email marketing and automation', true, '{"inputs": [{"name": "email_data", "type": "object", "required": true}], "outputs": [{"name": "email_result", "type": "object"}]}', now(), now()),

-- E-commerce & Payments
(gen_random_uuid(), 'shopify_store', 'business_tools', 'Shopify Store Management', 'Shopify e-commerce store and product management', true, '{"inputs": [{"name": "product_data", "type": "object", "required": true}], "outputs": [{"name": "product_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'woocommerce_product', 'business_tools', 'WooCommerce Product', 'WooCommerce WordPress e-commerce integration', true, '{"inputs": [{"name": "product_data", "type": "object", "required": true}], "outputs": [{"name": "product_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'stripe_payment', 'business_tools', 'Stripe Payment Processing', 'Stripe online payment processing and billing', true, '{"inputs": [{"name": "payment_data", "type": "object", "required": true}], "outputs": [{"name": "payment_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'paypal_transaction', 'business_tools', 'PayPal Transaction', 'PayPal payment processing and transaction management', true, '{"inputs": [{"name": "transaction_data", "type": "object", "required": true}], "outputs": [{"name": "transaction_result", "type": "object"}]}', now(), now()),

-- Document & File Management
(gen_random_uuid(), 'google_drive', 'business_tools', 'Google Drive', 'Google Drive file storage and document management', true, '{"inputs": [{"name": "file_data", "type": "object", "required": true}], "outputs": [{"name": "file_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'dropbox_file', 'business_tools', 'Dropbox File Management', 'Dropbox cloud file storage and sharing', true, '{"inputs": [{"name": "file_data", "type": "object", "required": true}], "outputs": [{"name": "file_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'onedrive_document', 'business_tools', 'OneDrive Document', 'Microsoft OneDrive document storage and collaboration', true, '{"inputs": [{"name": "document_data", "type": "object", "required": true}], "outputs": [{"name": "document_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'box_storage', 'business_tools', 'Box Cloud Storage', 'Box enterprise file storage and collaboration', true, '{"inputs": [{"name": "storage_data", "type": "object", "required": true}], "outputs": [{"name": "storage_result", "type": "object"}]}', now(), now()),

-- HR & Workforce Management
(gen_random_uuid(), 'workday_hr', 'business_tools', 'Workday HR Management', 'Workday human resources and workforce management', true, '{"inputs": [{"name": "employee_data", "type": "object", "required": true}], "outputs": [{"name": "employee_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'bamboohr_employee', 'business_tools', 'BambooHR Employee', 'BambooHR human resources information system', true, '{"inputs": [{"name": "hr_data", "type": "object", "required": true}], "outputs": [{"name": "hr_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'adp_payroll', 'business_tools', 'ADP Payroll', 'ADP payroll and workforce management system', true, '{"inputs": [{"name": "payroll_data", "type": "object", "required": true}], "outputs": [{"name": "payroll_result", "type": "object"}]}', now(), now()),

-- Accounting & Finance
(gen_random_uuid(), 'quickbooks_accounting', 'business_tools', 'QuickBooks Accounting', 'QuickBooks financial and accounting management', true, '{"inputs": [{"name": "transaction_data", "type": "object", "required": true}], "outputs": [{"name": "transaction_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'xero_finance', 'business_tools', 'Xero Financial Management', 'Xero cloud-based accounting software', true, '{"inputs": [{"name": "financial_data", "type": "object", "required": true}], "outputs": [{"name": "financial_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'sage_accounting', 'business_tools', 'Sage Accounting', 'Sage business accounting and financial management', true, '{"inputs": [{"name": "account_data", "type": "object", "required": true}], "outputs": [{"name": "account_result", "type": "object"}]}', now(), now()),

-- Social Media Management
(gen_random_uuid(), 'hootsuite_social', 'business_tools', 'Hootsuite Social Media', 'Hootsuite social media management and scheduling', true, '{"inputs": [{"name": "post_data", "type": "object", "required": true}], "outputs": [{"name": "post_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'buffer_scheduler', 'business_tools', 'Buffer Post Scheduler', 'Buffer social media post scheduling and analytics', true, '{"inputs": [{"name": "schedule_data", "type": "object", "required": true}], "outputs": [{"name": "schedule_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'sprout_social', 'business_tools', 'Sprout Social', 'Sprout Social media management and engagement', true, '{"inputs": [{"name": "social_data", "type": "object", "required": true}], "outputs": [{"name": "social_result", "type": "object"}]}', now(), now()),

-- Additional Healthcare-Specific Business Tools
(gen_random_uuid(), 'epic_ehr', 'business_tools', 'Epic EHR Integration', 'Epic Electronic Health Records system integration', true, '{"inputs": [{"name": "patient_data", "type": "object", "required": true}], "outputs": [{"name": "ehr_result", "type": "object"}], "settings": {"fhir_version": "R4", "security_level": "high"}}', now(), now()),
(gen_random_uuid(), 'cerner_emr', 'business_tools', 'Cerner EMR Integration', 'Cerner Electronic Medical Records system', true, '{"inputs": [{"name": "medical_data", "type": "object", "required": true}], "outputs": [{"name": "emr_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'allscripts_ehr', 'business_tools', 'Allscripts EHR', 'Allscripts healthcare information system', true, '{"inputs": [{"name": "clinical_data", "type": "object", "required": true}], "outputs": [{"name": "clinical_result", "type": "object"}]}', now(), now()),
(gen_random_uuid(), 'athenahealth_practice', 'business_tools', 'athenahealth Practice', 'athenahealth practice management system', true, '{"inputs": [{"name": "practice_data", "type": "object", "required": true}], "outputs": [{"name": "practice_result", "type": "object"}]}', now(), now());

-- Update workflow_builder_categories to ensure all categories are present
INSERT INTO workflow_builder_categories (name, description, color, icon, is_active, sort_order, created_at, updated_at) VALUES
('business_tools', 'Business and enterprise tool integrations', '#10B981', 'Building', true, 5, now(), now()),
('healthcare_systems', 'Healthcare and medical system integrations', '#DC2626', 'Activity', true, 6, now(), now()),
('communication', 'Communication and messaging platforms', '#3B82F6', 'MessageSquare', true, 7, now(), now()),
('data_analytics', 'Data analysis and reporting tools', '#8B5CF6', 'BarChart', true, 8, now(), now()),
('automation', 'Process automation and workflow tools', '#F59E0B', 'Zap', true, 9, now(), now()),
('security', 'Security and compliance tools', '#EF4444', 'Shield', true, 10, now(), now()),
('finance', 'Financial and accounting systems', '#059669', 'DollarSign', true, 11, now(), now()),
('hr_management', 'Human resources and workforce management', '#7C3AED', 'Users', true, 12, now(), now()),
('document_management', 'Document storage and management systems', '#0891B2', 'FileText', true, 13, now(), now()),
('social_media', 'Social media and marketing platforms', '#DB2777', 'Share2', true, 14, now(), now()),
('e_commerce', 'E-commerce and retail platforms', '#DC2626', 'ShoppingCart', true, 15, now(), now()),
('project_management', 'Project and task management tools', '#16A34A', 'CheckSquare', true, 16, now(), now()),
('crm_systems', 'Customer relationship management systems', '#2563EB', 'Contact', true, 17, now(), now()),
('development_tools', 'Software development and DevOps tools', '#1F2937', 'Code', true, 18, now(), now())
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  is_active = EXCLUDED.is_active,
  updated_at = now();