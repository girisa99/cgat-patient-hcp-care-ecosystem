-- Add remaining nodes to reach 87-89 total (need ~16-18 more nodes)
INSERT INTO workflow_builder_nodes (type, category, label, description, configuration) VALUES

-- Additional Finance Tools
('freshbooks_accounting', 'finance', 'FreshBooks Accounting', 'FreshBooks cloud accounting software', '{"inputs": [{"name": "invoice_data", "type": "object", "required": true}], "outputs": [{"name": "invoice_result", "type": "object"}]}'),
('wave_accounting', 'finance', 'Wave Accounting', 'Wave free accounting software for small business', '{"inputs": [{"name": "transaction_data", "type": "object", "required": true}], "outputs": [{"name": "transaction_result", "type": "object"}]}'),
('plaid_banking', 'finance', 'Plaid Banking API', 'Plaid financial services API integration', '{"inputs": [{"name": "account_data", "type": "object", "required": true}], "outputs": [{"name": "account_result", "type": "object"}]}'),

-- Additional HR Management Tools  
('gusto_payroll', 'hr_management', 'Gusto Payroll', 'Gusto payroll and benefits platform', '{"inputs": [{"name": "payroll_data", "type": "object", "required": true}], "outputs": [{"name": "payroll_result", "type": "object"}]}'),
('kronos_workforce', 'hr_management', 'Kronos Workforce', 'Kronos workforce management system', '{"inputs": [{"name": "schedule_data", "type": "object", "required": true}], "outputs": [{"name": "schedule_result", "type": "object"}]}'),
('successfactors_hr', 'hr_management', 'SAP SuccessFactors', 'SAP SuccessFactors human capital management', '{"inputs": [{"name": "employee_data", "type": "object", "required": true}], "outputs": [{"name": "employee_result", "type": "object"}]}'),

-- Additional Document Management
('sharepoint_document', 'document_management', 'SharePoint Document', 'Microsoft SharePoint document collaboration', '{"inputs": [{"name": "document_data", "type": "object", "required": true}], "outputs": [{"name": "document_result", "type": "object"}]}'),
('confluence_wiki', 'document_management', 'Confluence Wiki', 'Atlassian Confluence knowledge management', '{"inputs": [{"name": "page_data", "type": "object", "required": true}], "outputs": [{"name": "page_result", "type": "object"}]}'),
('notion_workspace', 'document_management', 'Notion Workspace', 'Notion all-in-one workspace', '{"inputs": [{"name": "block_data", "type": "object", "required": true}], "outputs": [{"name": "block_result", "type": "object"}]}'),

-- Additional E-commerce
('magento_commerce', 'e_commerce', 'Magento Commerce', 'Magento e-commerce platform integration', '{"inputs": [{"name": "product_data", "type": "object", "required": true}], "outputs": [{"name": "product_result", "type": "object"}]}'),
('bigcommerce_store', 'e_commerce', 'BigCommerce Store', 'BigCommerce e-commerce platform', '{"inputs": [{"name": "store_data", "type": "object", "required": true}], "outputs": [{"name": "store_result", "type": "object"}]}'),
('square_pos', 'e_commerce', 'Square POS', 'Square point-of-sale system integration', '{"inputs": [{"name": "transaction_data", "type": "object", "required": true}], "outputs": [{"name": "transaction_result", "type": "object"}]}'),

-- Additional Project Management
('basecamp_project', 'project_management', 'Basecamp Project', 'Basecamp project management and collaboration', '{"inputs": [{"name": "project_data", "type": "object", "required": true}], "outputs": [{"name": "project_result", "type": "object"}]}'),
('clickup_task', 'project_management', 'ClickUp Task Management', 'ClickUp productivity and project management', '{"inputs": [{"name": "task_data", "type": "object", "required": true}], "outputs": [{"name": "task_result", "type": "object"}]}'),
('smartsheet_project', 'project_management', 'Smartsheet Project', 'Smartsheet work execution platform', '{"inputs": [{"name": "sheet_data", "type": "object", "required": true}], "outputs": [{"name": "sheet_result", "type": "object"}]}'),

-- Additional CRM Systems
('insightly_crm', 'crm_systems', 'Insightly CRM', 'Insightly customer relationship management', '{"inputs": [{"name": "contact_data", "type": "object", "required": true}], "outputs": [{"name": "contact_result", "type": "object"}]}'),
('copper_crm', 'crm_systems', 'Copper CRM', 'Copper Google Workspace CRM integration', '{"inputs": [{"name": "lead_data", "type": "object", "required": true}], "outputs": [{"name": "lead_result", "type": "object"}]}'),
('zoho_crm', 'crm_systems', 'Zoho CRM', 'Zoho customer relationship management suite', '{"inputs": [{"name": "deal_data", "type": "object", "required": true}], "outputs": [{"name": "deal_result", "type": "object"}]}'),

-- Additional Development Tools
('terraform_infrastructure', 'development_tools', 'Terraform Infrastructure', 'Terraform infrastructure as code', '{"inputs": [{"name": "config_data", "type": "object", "required": true}], "outputs": [{"name": "infrastructure_result", "type": "object"}]}'),
('ansible_automation', 'development_tools', 'Ansible Automation', 'Ansible IT automation platform', '{"inputs": [{"name": "playbook_data", "type": "object", "required": true}], "outputs": [{"name": "execution_result", "type": "object"}]}')

ON CONFLICT (type) DO NOTHING;