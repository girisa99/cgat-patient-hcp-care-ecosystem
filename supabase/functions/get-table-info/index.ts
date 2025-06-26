
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tableName } = await req.json()

    // Return known schema information for key tables
    const columns = getTableColumns(tableName);

    return new Response(
      JSON.stringify({ columns }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function getTableColumns(tableName: string) {
  switch (tableName) {
    case 'profiles':
      return [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
        { column_name: 'first_name', data_type: 'character varying', is_nullable: 'YES' },
        { column_name: 'last_name', data_type: 'character varying', is_nullable: 'YES' },
        { column_name: 'email', data_type: 'character varying', is_nullable: 'YES' },
        { column_name: 'facility_id', data_type: 'uuid', is_nullable: 'YES' },
        { column_name: 'phone', data_type: 'character varying', is_nullable: 'YES' },
        { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES' },
        { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'YES' }
      ];
    case 'facilities':
      return [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
        { column_name: 'name', data_type: 'character varying', is_nullable: 'NO' },
        { column_name: 'facility_type', data_type: 'facility_type_enum', is_nullable: 'NO' },
        { column_name: 'address', data_type: 'text', is_nullable: 'YES' },
        { column_name: 'phone', data_type: 'character varying', is_nullable: 'YES' },
        { column_name: 'email', data_type: 'character varying', is_nullable: 'YES' },
        { column_name: 'is_active', data_type: 'boolean', is_nullable: 'YES' },
        { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES' }
      ];
    case 'external_api_registry':
      return [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
        { column_name: 'external_name', data_type: 'character varying', is_nullable: 'NO' },
        { column_name: 'external_description', data_type: 'text', is_nullable: 'YES' },
        { column_name: 'version', data_type: 'character varying', is_nullable: 'NO' },
        { column_name: 'status', data_type: 'character varying', is_nullable: 'NO' },
        { column_name: 'base_url', data_type: 'text', is_nullable: 'YES' },
        { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
        { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'NO' }
      ];
    default:
      return [];
  }
}
