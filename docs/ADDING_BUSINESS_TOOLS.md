# Adding Business Layer Tools to Agent Studio

## Overview
Your Agent Studio uses a flexible node system where you can add both technical and business layer tools. Each tool/node represents a specific capability that agents can use in their workflows.

## System Architecture

### 1. Database Structure
- `workflow_node_categories` - Organizes tools into categories
- `workflow_node_types` - Individual tools with configuration, schemas, and capabilities

### 2. Component Flow
```
Node Palette → Drag & Drop → Agent Canvas → Configuration → Execution
```

## Adding New Business Tools

### Step 1: Create or Use Category
First, create a category for your business tools:

```sql
INSERT INTO workflow_node_categories (
  name, display_name, description, icon, color, order_index, is_active
) VALUES (
  'healthcare_compliance',  -- Internal name
  'Healthcare & Compliance', -- Display name
  'Healthcare data validation and compliance tools',
  'shield',  -- Lucide icon name
  '#dc2626', -- Color (HSL format)
  100,       -- Sort order
  true
);
```

### Step 2: Add Individual Tools
For each business tool (like NPI validation, CMS integration, etc.):

```sql
INSERT INTO workflow_node_types (
  category_id, type_key, display_name, description,
  icon, color, capabilities, requirements,
  default_config, input_schema, output_schema,
  is_draggable, is_configurable, order_index, is_active
) VALUES (
  -- Category reference
  (SELECT id FROM workflow_node_categories WHERE name = 'healthcare_compliance'),
  
  -- Tool identification
  'npi_validator',           -- Unique key
  'NPI Validator',           -- Display name
  'Validate National Provider Identifier numbers',
  
  -- Visual
  'user-check',              -- Icon
  '#dc2626',                 -- Color
  
  -- Functionality (JSONB arrays)
  '["npi_validation", "provider_lookup", "taxonomy_codes"]'::jsonb,
  '{"api_access": true, "npi_format": "10_digits"}',
  
  -- Configuration schemas (JSONB)
  '{"validation_mode": "full", "include_taxonomy": true}',
  '{"npi_number": {"type": "string", "pattern": "^[0-9]{10}$", "required": true}}',
  '{"is_valid": {"type": "boolean"}, "provider_info": {"type": "object"}}',
  
  -- Settings
  true,  -- draggable
  true,  -- configurable
  1,     -- order
  true   -- active
);
```

## Examples Added

### 1. NPI Validator
- **Purpose**: Validate healthcare provider identities
- **API Integration**: NPPES (National Plan and Provider Enumeration System)
- **Use Cases**: Provider verification, compliance checking

### 2. CMS Data Integration
- **Purpose**: Access Medicare/Medicaid datasets
- **API Integration**: Centers for Medicare & Medicaid Services APIs
- **Use Cases**: Payment data, quality measures, provider databases

### 3. FDA Integration
- **Purpose**: Drug/device approvals and safety data
- **API Integration**: FDA databases (Orange Book, device clearances)
- **Use Cases**: Pharmaceutical compliance, safety monitoring

### 4. ICD Codes Lookup
- **Purpose**: Medical diagnosis and procedure codes
- **Integration**: ICD-10/ICD-11 databases
- **Use Cases**: Clinical coding, billing accuracy

### 5. HIPAA Compliance Checker
- **Purpose**: Validate data handling for HIPAA compliance
- **Features**: PHI scanning, encryption validation, audit trails
- **Use Cases**: Compliance monitoring, risk assessment

### 6. Clinical Decision Support
- **Purpose**: Evidence-based medical recommendations
- **Integration**: Medical knowledge bases
- **Use Cases**: Drug interactions, diagnostic assistance

## Implementation Patterns

### For API Validation Tools:
1. **Input Schema**: Define required parameters (IDs, codes, etc.)
2. **Output Schema**: Standardize response format (validation results, data)
3. **Error Handling**: Include compliance and error states
4. **Caching**: Enable result caching for performance

### For Internal Application Exposure:
1. **Authentication**: Define access requirements
2. **Rate Limiting**: Prevent API abuse
3. **Data Transformation**: Standardize internal data formats
4. **Audit Logging**: Track usage for compliance

## Agent Integration Workflow

### 1. Agent Creation
When users create agents, they can:
- Browse the Healthcare & Compliance category
- Drag tools onto their agent canvas
- Configure tool parameters
- Connect tools in workflows

### 2. Runtime Execution
During agent execution:
- Tools validate input parameters
- API calls are made with proper authentication
- Results are cached and logged
- Outputs flow to next workflow step

### 3. Monitoring & Compliance
- All tool usage is logged
- Compliance reports are generated
- Performance metrics are tracked
- Error rates are monitored

## Best Practices

### 1. Naming Conventions
- Categories: `snake_case` (e.g., `healthcare_compliance`)
- Tools: `snake_case` (e.g., `npi_validator`)
- Display names: `Title Case` (e.g., `NPI Validator`)

### 2. Schema Design
- Use JSON Schema for validation
- Include required/optional field markers
- Provide clear field descriptions
- Define data types explicitly

### 3. Error Handling
- Include error states in output schema
- Provide meaningful error messages
- Log errors for debugging
- Implement retry logic where appropriate

### 4. Security
- Store API keys in Supabase secrets
- Implement proper authentication
- Validate all inputs
- Log access for audit trails

## Next Steps

1. **Add More Categories**: Create categories for other business domains
2. **Implement Connectors**: Build actual API integrations
3. **Create Templates**: Pre-built agent templates with common tool combinations
4. **Add Monitoring**: Real-time tool usage and performance dashboards
5. **Build Testing**: Automated testing for tool integrations

This system provides a scalable foundation for adding any business layer tools your agents might need!