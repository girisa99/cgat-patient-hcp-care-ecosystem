import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DataIntegrationConfig {
  operation: 'import' | 'export' | 'update' | 'import_from_api' | 'sync_to_api' | 'bulk_update' | 'auto_map_fields'
  tableName: string
  data?: any
  mapping?: Record<string, string>
  apiEndpoint?: string
  headers?: Record<string, string>
  filters?: Record<string, any>
  format?: 'json' | 'csv'
  mcpType?: 'database' | 'api' | 'memory'
  autoMapFields?: boolean
}

// Field mapping definitions for enrollment data
const ENROLLMENT_FIELD_MAPPINGS = {
  // Patient Info mappings
  patient_info: {
    'firstName': 'first_name',
    'lastName': 'last_name', 
    'dateOfBirth': 'date_of_birth',
    'email': 'email',
    'phone': 'phone_number',
    'ssn': 'social_security_number',
    'address': 'address_line_1',
    'city': 'city',
    'state': 'state',
    'zip': 'zip_code'
  },

  // Insurance mappings
  insurance: {
    'insuranceProvider': 'primary_insurance_provider',
    'policyNumber': 'policy_number',
    'groupNumber': 'group_number',
    'subscriberId': 'subscriber_id',
    'relationshipToSubscriber': 'relationship_to_subscriber'
  },

  // Provider mappings
  provider: {
    'providerName': 'provider_name', 
    'npiNumber': 'npi_number',
    'practiceName': 'practice_name',
    'providerPhone': 'provider_phone',
    'providerAddress': 'provider_address'
  },

  // Clinical mappings
  clinical: {
    'primaryDiagnosis': 'primary_diagnosis',
    'secondaryDiagnosis': 'secondary_diagnosis',
    'treatmentType': 'treatment_type',
    'medicationAllergies': 'medication_allergies',
    'currentMedications': 'current_medications'
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const config: DataIntegrationConfig = await req.json()
    console.log(`Data Integration - Operation: ${config.operation}, Table: ${config.tableName}`)

    switch (config.operation) {
      case 'auto_map_fields':
        const mappingResult = await autoMapFields(config.data, config.tableName)
        return new Response(JSON.stringify({ 
          success: true, 
          data: mappingResult 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'import':
        const importResult = await importData(supabase, config)
        return new Response(JSON.stringify({ 
          success: true, 
          data: importResult 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'import_from_api':
        const apiImportResult = await importFromAPI(supabase, config)
        return new Response(JSON.stringify({
          success: true,
          data: apiImportResult
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'export':
        const exportResult = await exportData(supabase, config)
        return new Response(JSON.stringify({
          success: true,
          data: exportResult.data,
          count: exportResult.count
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'update':
        const updateResult = await updateRecord(supabase, config)
        return new Response(JSON.stringify({
          success: true,
          data: updateResult
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'bulk_update':
        const bulkResult = await bulkUpdate(supabase, config)
        return new Response(JSON.stringify({
          success: true,
          data: bulkResult
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'sync_to_api':
        const syncResult = await syncToAPI(supabase, config)
        return new Response(JSON.stringify({
          success: true,
          data: syncResult
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        throw new Error(`Unknown operation: ${config.operation}`)
    }
  } catch (error) {
    console.error('Data Integration Error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function autoMapFields(data: any, tableName: string) {
  // Auto-detect fields and suggest mappings
  const sampleRecord = Array.isArray(data) ? data[0] : data
  const sourceFields = Object.keys(sampleRecord)
  
  // Get enrollment section from table name
  const section = getEnrollmentSection(tableName) as keyof typeof ENROLLMENT_FIELD_MAPPINGS
  const sectionMappings = ENROLLMENT_FIELD_MAPPINGS[section] || {}
  
  const suggestions = sourceFields.map(field => {
    // Find best match from predefined mappings
    const exactMatch = sectionMappings[field as keyof typeof sectionMappings]
    if (exactMatch) {
      return { sourceField: field, targetField: exactMatch, confidence: 1.0, reason: 'exact_match' }
    }
    
    // Fuzzy matching
    const fuzzyMatch = findFuzzyMatch(field, Object.values(sectionMappings))
    if (fuzzyMatch.score > 0.7) {
      return { 
        sourceField: field, 
        targetField: fuzzyMatch.field, 
        confidence: fuzzyMatch.score, 
        reason: 'fuzzy_match' 
      }
    }
    
    // Default mapping (camelCase to snake_case)
    const snakeCase = field.replace(/([A-Z])/g, '_$1').toLowerCase()
    return { 
      sourceField: field, 
      targetField: snakeCase, 
      confidence: 0.5, 
      reason: 'snake_case_conversion' 
    }
  })
  
  return {
    tableName,
    section,
    sourceFields,
    suggestions,
    autoMappingAvailable: suggestions.some(s => s.confidence >= 0.8)
  }
}

async function importData(supabase: any, config: DataIntegrationConfig) {
  const records = Array.isArray(config.data) ? config.data : [config.data]  
  let success = 0
  let errors = 0
  const details: Array<{ row: number; error: string }> = []
  
  for (let i = 0; i < records.length; i++) {
    try {
      let recordData = records[i]
      
      // Apply field mapping if provided
      if (config.mapping) {
        recordData = transformData(recordData, config.mapping)
      }
      
      // Auto-map fields if enabled
      if (config.autoMapFields) {
        const section = getEnrollmentSection(config.tableName) as keyof typeof ENROLLMENT_FIELD_MAPPINGS
        const sectionMappings = ENROLLMENT_FIELD_MAPPINGS[section] || {}
        recordData = transformData(recordData, sectionMappings)
      }
      
      // Insert into database
      const { error } = await supabase
        .from(config.tableName)
        .insert(recordData)
      
      if (error) throw error
      success++
    } catch (error) {
      errors++
      details.push({ row: i + 1, error: error instanceof Error ? error.message : String(error) })
    }
  }
  
  return { success, errors, details }
}

async function importFromAPI(supabase: any, config: DataIntegrationConfig) {
  // Fetch data from external API
  const response = await fetch(config.apiEndpoint!, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers
    }
  })
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }
  
  const apiData = await response.json()
  
  // Import the fetched data
  return importData(supabase, {
    ...config,
    data: apiData
  })
}

async function exportData(supabase: any, config: DataIntegrationConfig) {
  let query = supabase.from(config.tableName).select('*')
  
  // Apply filters if provided
  if (config.filters) {
    Object.entries(config.filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }
  
  const { data, error } = await query
  if (error) throw error
  
  if (config.format === 'csv') {
    const csvData = convertToCSV(data)
    return { data: csvData, count: data.length }
  }
  
  return { data, count: data.length }
}

async function updateRecord(supabase: any, config: DataIntegrationConfig) {
  const { id, updates } = config.data
  
  const { data, error } = await supabase
    .from(config.tableName)
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data
}

async function bulkUpdate(supabase: any, config: DataIntegrationConfig) {
  const updates = config.data
  let success = 0
  let errors = 0
  const details: Array<{ row: number; error: string }> = []
  
  for (let i = 0; i < updates.length; i++) {
    try {
      const { id, data: updateData } = updates[i]
      
      const { error } = await supabase
        .from(config.tableName)
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
      success++
    } catch (error) {
      errors++
      details.push({ row: i + 1, error: error instanceof Error ? error.message : String(error) })
    }
  }
  
  return { success, errors, details }
}

async function syncToAPI(supabase: any, config: DataIntegrationConfig) {
  // Get data from database
  let query = supabase.from(config.tableName).select('*')
  
  if (config.filters) {
    Object.entries(config.filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }
  
  const { data, error } = await query
  if (error) throw error
  
  // Send to external API
  const response = await fetch(config.apiEndpoint!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers
    },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    throw new Error(`API sync failed: ${response.status} ${response.statusText}`)
  }
  
  return { count: data.length, synced: true }
}

// Utility functions
function transformData(data: any, mapping: Record<string, string>): any {
  const transformed: any = {}
  Object.entries(data).forEach(([key, value]) => {
    const mappedKey = mapping[key] || key
    transformed[mappedKey] = value
  })
  return transformed
}

function getEnrollmentSection(tableName: string): string {
  if (tableName.includes('patient_info')) return 'patient_info'
  if (tableName.includes('insurance')) return 'insurance'
  if (tableName.includes('provider')) return 'provider'
  if (tableName.includes('clinical')) return 'clinical'
  return 'patient_info' // default
}

function findFuzzyMatch(sourceField: string, targetFields: string[]) {
  let bestMatch = { field: '', score: 0 }
  
  for (const targetField of targetFields) {
    const score = calculateSimilarity(sourceField.toLowerCase(), targetField.toLowerCase())
    if (score > bestMatch.score) {
      bestMatch = { field: targetField, score }
    }
  }
  
  return bestMatch
}

function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null))
  
  for (let i = 0; i <= len1; i++) matrix[0][i] = i
  for (let j = 0; j <= len2; j++) matrix[j][0] = j
  
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + cost // substitution
      )
    }
  }
  
  const distance = matrix[len2][len1]
  return 1 - distance / Math.max(len1, len2)
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')
  
  const csvRows = data.map(row =>
    headers.map(header => {
      const value = row[header]
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    }).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}