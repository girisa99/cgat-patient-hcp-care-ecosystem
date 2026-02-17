import React from 'react';

export interface ConnectorBrand {
  id: string;
  name: string;
  logoUrl: string;
  category: string;
  type: 'database' | 'api' | 'messaging' | 'file_system' | 'external_service' | 'ai_model';
  description: string;
  baseUrl?: string;
  commonEndpoints?: string[];
  authTypes: ('api_key' | 'bearer' | 'oauth' | 'custom')[];
}

export const CONNECTOR_BRANDS: ConnectorBrand[] = [
  // Databases
  {
    id: 'oracle',
    name: 'Oracle Database',
    logoUrl: 'https://logos-world.net/wp-content/uploads/2020/09/Oracle-Logo.png',
    category: 'Database',
    type: 'database',
    description: 'Enterprise database management system',
    commonEndpoints: ['/query', '/execute', '/procedure'],
    authTypes: ['bearer', 'custom']
  },
  {
    id: 'mysql',
    name: 'MySQL',
    logoUrl: 'https://labs.mysql.com/common/logos/mysql-logo.svg',
    category: 'Database',
    type: 'database',
    description: 'Open-source relational database',
    commonEndpoints: ['/query', '/connection'],
    authTypes: ['bearer', 'custom']
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg',
    category: 'Database',
    type: 'database',
    description: 'Advanced open-source database',
    commonEndpoints: ['/query', '/transaction'],
    authTypes: ['bearer', 'custom']
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    logoUrl: 'https://webassets.mongodb.com/_com_assets/cms/mongodb_logo1-76twgcu2dm.png',
    category: 'Database',
    type: 'database',
    description: 'NoSQL document database',
    baseUrl: 'https://cloud.mongodb.com/api',
    commonEndpoints: ['/collections', '/documents', '/aggregation'],
    authTypes: ['api_key', 'bearer']
  },

  // Cloud Services
  {
    id: 'aws',
    name: 'Amazon Web Services',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    category: 'Cloud',
    type: 'external_service',
    description: 'Comprehensive cloud computing platform',
    baseUrl: 'https://aws.amazon.com/api',
    commonEndpoints: ['/ec2', '/s3', '/lambda', '/rds'],
    authTypes: ['api_key', 'bearer']
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg',
    category: 'Cloud',
    type: 'external_service',
    description: 'Microsoft cloud computing platform',
    baseUrl: 'https://management.azure.com',
    commonEndpoints: ['/subscriptions', '/resourceGroups', '/virtualMachines'],
    authTypes: ['oauth', 'bearer']
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg',
    category: 'Cloud',
    type: 'external_service',
    description: 'Google cloud computing services',
    baseUrl: 'https://googleapis.com',
    commonEndpoints: ['/compute/v1', '/storage/v1', '/bigquery/v2'],
    authTypes: ['oauth', 'api_key']
  },

  // Business Applications
  {
    id: 'salesforce',
    name: 'Salesforce',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
    category: 'CRM',
    type: 'external_service',
    description: 'Customer relationship management platform',
    baseUrl: 'https://salesforce.com/services/data',
    commonEndpoints: ['/sobjects', '/query', '/chatter'],
    authTypes: ['oauth', 'bearer']
  },
  {
    id: 'sap',
    name: 'SAP',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg',
    category: 'ERP',
    type: 'external_service',
    description: 'Enterprise resource planning software',
    baseUrl: 'https://api.sap.com',
    commonEndpoints: ['/odata', '/rest', '/soap'],
    authTypes: ['oauth', 'bearer', 'custom']
  },
  {
    id: 'microsoft365',
    name: 'Microsoft 365',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    category: 'Productivity',
    type: 'external_service',
    description: 'Microsoft productivity suite',
    baseUrl: 'https://graph.microsoft.com',
    commonEndpoints: ['/users', '/groups', '/sites', '/teams'],
    authTypes: ['oauth']
  },

  // Communication & Messaging
  {
    id: 'slack',
    name: 'Slack',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
    category: 'Communication',
    type: 'messaging',
    description: 'Team collaboration platform',
    baseUrl: 'https://slack.com/api',
    commonEndpoints: ['/chat.postMessage', '/users.list', '/channels.list'],
    authTypes: ['bearer', 'oauth']
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg',
    category: 'Communication',
    type: 'messaging',
    description: 'Microsoft team collaboration tool',
    baseUrl: 'https://graph.microsoft.com/v1.0/teams',
    commonEndpoints: ['/messages', '/channels', '/members'],
    authTypes: ['oauth']
  },
  {
    id: 'twilio',
    name: 'Twilio',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Twilio-logo-red.svg',
    category: 'Communication',
    type: 'messaging',
    description: 'Cloud communication platform',
    baseUrl: 'https://api.twilio.com',
    commonEndpoints: ['/Messages', '/Calls', '/Voice'],
    authTypes: ['api_key']
  },

  // Automation
  {
    id: 'zapier',
    name: 'Zapier',
    logoUrl: 'https://cdn.zapier.com/storage/learn_uploads/61d7f79b26eb30cb5c5a2e5dc4048bb3.png',
    category: 'Automation',
    type: 'external_service',
    description: 'Workflow automation platform',
    baseUrl: 'https://hooks.zapier.com',
    commonEndpoints: ['/hooks', '/triggers'],
    authTypes: ['api_key']
  },
  {
    id: 'ifttt',
    name: 'IFTTT',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/IFTTT_Logo.svg',
    category: 'Automation',
    type: 'external_service',
    description: 'If This Then That automation',
    baseUrl: 'https://connect.ifttt.com/v1',
    commonEndpoints: ['/triggers', '/actions'],
    authTypes: ['api_key']
  },

  // Healthcare Specific
  {
    id: 'epic',
    name: 'Epic FHIR',
    logoUrl: 'https://www.epic.com/images/epic-logo.png',
    category: 'Healthcare',
    type: 'api',
    description: 'Electronic health records system',
    baseUrl: 'https://fhir.epic.com',
    commonEndpoints: ['/Patient', '/Observation', '/Encounter'],
    authTypes: ['oauth', 'bearer']
  },
  {
    id: 'cerner',
    name: 'Cerner SMART on FHIR',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Cerner_Logo.svg',
    category: 'Healthcare',
    type: 'api',
    description: 'Healthcare information system',
    baseUrl: 'https://fhir-open.cerner.com',
    commonEndpoints: ['/Patient', '/Condition', '/MedicationRequest'],
    authTypes: ['oauth', 'bearer']
  },

  // AI/ML Services
  {
    id: 'openai',
    name: 'OpenAI',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    category: 'AI/ML',
    type: 'ai_model',
    description: 'Artificial intelligence models and APIs',
    baseUrl: 'https://api.openai.com/v1',
    commonEndpoints: ['/chat/completions', '/completions', '/embeddings'],
    authTypes: ['bearer']
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_logo.svg',
    category: 'AI/ML',
    type: 'ai_model',
    description: 'Claude AI assistant and models',
    baseUrl: 'https://api.anthropic.com/v1',
    commonEndpoints: ['/messages', '/completions'],
    authTypes: ['api_key']
  },

  // Payment & Financial
  {
    id: 'stripe',
    name: 'Stripe',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
    category: 'Payment',
    type: 'api',
    description: 'Online payment processing',
    baseUrl: 'https://api.stripe.com/v1',
    commonEndpoints: ['/charges', '/customers', '/subscriptions'],
    authTypes: ['bearer']
  },
  {
    id: 'paypal',
    name: 'PayPal',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
    category: 'Payment',
    type: 'api',
    description: 'Digital payment platform',
    baseUrl: 'https://api.paypal.com/v1',
    commonEndpoints: ['/payments', '/orders', '/billing'],
    authTypes: ['oauth', 'bearer']
  }
];

export const searchConnectorBrands = (query: string): ConnectorBrand[] => {
  if (!query.trim()) return CONNECTOR_BRANDS;
  
  const lowercaseQuery = query.toLowerCase();
  return CONNECTOR_BRANDS.filter(brand => 
    brand.name.toLowerCase().includes(lowercaseQuery) ||
    brand.category.toLowerCase().includes(lowercaseQuery) ||
    brand.description.toLowerCase().includes(lowercaseQuery) ||
    brand.type.toLowerCase().includes(lowercaseQuery)
  );
};

export const getConnectorBrandById = (id: string): ConnectorBrand | undefined => {
  return CONNECTOR_BRANDS.find(brand => brand.id === id);
};

export const getConnectorBrandsByCategory = (category: string): ConnectorBrand[] => {
  return CONNECTOR_BRANDS.filter(brand => brand.category.toLowerCase() === category.toLowerCase());
};

export const getConnectorBrandsByType = (type: ConnectorBrand['type']): ConnectorBrand[] => {
  return CONNECTOR_BRANDS.filter(brand => brand.type === type);
};