/**
 * Code Generation Utilities
 */

export const generateHookCode = (config: any): string => {
  return `import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const use${config.moduleName} = () => {
  const {
    data: ${config.moduleName.toLowerCase()},
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['${config.tableName}'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('${config.tableName}')
        .select('*');

      if (error) throw error;
      return data || [];
    }
  });

  return {
    ${config.moduleName.toLowerCase()}: ${config.moduleName.toLowerCase()} || [],
    isLoading,
    error,
    refetch
  };
};`;
};

export const generateComponentCode = (config: any): string => {
  return `import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { use${config.moduleName} } from '@/hooks/use${config.moduleName}';

const ${config.moduleName}Module = () => {
  const { ${config.moduleName.toLowerCase()}, isLoading } = use${config.moduleName}();

  if (isLoading) {
    return <div>Loading ${config.moduleName.toLowerCase()}...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>${config.moduleName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {${config.moduleName.toLowerCase()}.map((item: any) => (
            <div key={item.id} className="p-2 border rounded">
              {JSON.stringify(item)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ${config.moduleName}Module;`;
};