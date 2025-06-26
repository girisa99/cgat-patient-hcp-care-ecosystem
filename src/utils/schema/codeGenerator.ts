
/**
 * Code Generation Utilities
 * Focused on generating boilerplate code for modules
 */

import { AutoModuleConfig } from './types';

/**
 * Generates boilerplate hook code
 */
export const generateHookCode = (config: AutoModuleConfig): string => {
  return `/**
 * Auto-generated hook for ${config.moduleName}
 * Generated from table: ${config.tableName}
 * Confidence: ${(config.confidence * 100).toFixed(0)}%
 */

import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';
import { ModuleConfig } from '@/utils/moduleValidation';

const ${config.moduleName.toLowerCase()}Config: ModuleConfig = {
  tableName: '${config.tableName}',
  moduleName: '${config.moduleName}',
  requiredFields: [${config.requiredFields.map(f => `'${f}'`).join(', ')}],
  optionalFields: [${config.optionalFields?.map(f => `'${f}'`).join(', ') || ''}],
};

export const use${config.moduleName} = () => {
  return useTypeSafeModuleTemplate(${config.moduleName.toLowerCase()}Config);
};
`;
};

/**
 * Generates boilerplate component code
 */
export const generateComponentCode = (config: AutoModuleConfig): string => {
  const customColumns = config.suggestedCustomColumns || [];
  
  return `/**
 * Auto-generated component for ${config.moduleName}
 * Generated from table: ${config.tableName}
 * Confidence: ${(config.confidence * 100).toFixed(0)}%
 */

import React from 'react';
import { ExtensibleModuleTemplate } from '@/templates/components/ExtensibleModuleTemplate';
import { use${config.moduleName} } from '@/hooks/use${config.moduleName}';
import { StatusBadge } from '@/components/shared/StatusBadge';

export const ${config.moduleName}Module = () => {
  const { items, isLoading, createItem, updateItem } = use${config.moduleName}();

  const customColumns = [
    ${customColumns.map(col => `{
      key: '${col.key}',
      header: '${col.header}',
      render: (item: any) => ${generateColumnRender(col)}
    }`).join(',\n    ')}
  ];

  return (
    <ExtensibleModuleTemplate
      config={{
        tableName: '${config.tableName}',
        moduleName: '${config.moduleName}',
        requiredFields: [${config.requiredFields.map(f => `'${f}'`).join(', ')}]
      }}
      data={items}
      isLoading={isLoading}
      customColumns={customColumns}
      onAdd={() => {
        // TODO: Implement add functionality
        console.log('Add new ${config.moduleName.toLowerCase()}');
      }}
      onEdit={(item) => {
        // TODO: Implement edit functionality
        console.log('Edit ${config.moduleName.toLowerCase()}:', item);
      }}
    />
  );
};
`;
};

/**
 * Generates column render code based on column type
 */
const generateColumnRender = (column: { key: string; type: string }): string => {
  switch (column.type) {
    case 'status':
      return `<StatusBadge status={item.${column.key}} />`;
    case 'date':
      return `item.${column.key} ? new Date(item.${column.key}).toLocaleDateString() : 'N/A'`;
    case 'boolean':
      return `item.${column.key} ? 'Yes' : 'No'`;
    default:
      return `<span className="font-medium">{item.${column.key} || 'N/A'}</span>`;
  }
};
