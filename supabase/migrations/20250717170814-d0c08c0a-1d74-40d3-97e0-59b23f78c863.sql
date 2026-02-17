-- Insert a GraphQL API service for testing GraphQL count
INSERT INTO public.api_integration_registry (
  name, 
  description, 
  type, 
  direction, 
  category, 
  purpose, 
  status
) VALUES (
  'Healthcare GraphQL API',
  'GraphQL endpoint for comprehensive healthcare data queries and mutations',
  'internal',
  'bidirectional',
  'healthcare',
  'data_exchange',
  'active'
);