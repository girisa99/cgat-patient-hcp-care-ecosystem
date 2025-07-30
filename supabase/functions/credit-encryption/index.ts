import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EncryptionRequest {
  action: 'encrypt' | 'decrypt'
  data: string
  creditApplicationId?: string
}

// Simple encryption using built-in crypto API
// In production, use proper encryption service like AWS KMS, HashiCorp Vault, etc.
async function encryptData(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  
  // Generate a random key for encryption
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  )
  
  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer
  )
  
  // Export the key for storage
  const exportedKey = await crypto.subtle.exportKey('raw', key)
  
  // Combine key, IV, and encrypted data
  const combined = new Uint8Array(exportedKey.byteLength + iv.length + encryptedBuffer.byteLength)
  combined.set(new Uint8Array(exportedKey), 0)
  combined.set(iv, exportedKey.byteLength)
  combined.set(new Uint8Array(encryptedBuffer), exportedKey.byteLength + iv.length)
  
  // Return as base64 string
  return btoa(String.fromCharCode(...combined))
}

async function decryptData(encryptedData: string): Promise<string> {
  try {
    // Decode from base64
    const combined = new Uint8Array(atob(encryptedData).split('').map(char => char.charCodeAt(0)))
    
    // Extract key, IV, and encrypted data
    const keyData = combined.slice(0, 32) // 256 bits = 32 bytes
    const iv = combined.slice(32, 44) // 12 bytes for GCM
    const encryptedBuffer = combined.slice(44)
    
    // Import the key
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['decrypt']
    )
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedBuffer
    )
    
    // Return as string
    const decoder = new TextDecoder()
    return decoder.decode(decryptedBuffer)
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    const requestData: EncryptionRequest = await req.json()
    const { action, data, creditApplicationId } = requestData

    let result: string

    if (action === 'encrypt') {
      result = await encryptData(data)
      
      // Log encryption activity for audit
      if (creditApplicationId) {
        await supabase.rpc('log_credit_application_audit', {
          p_credit_application_id: creditApplicationId,
          p_action_type: 'data_encrypted',
          p_additional_context: {
            field_type: 'sensitive_data',
            encryption_timestamp: new Date().toISOString()
          }
        })
      }
    } else if (action === 'decrypt') {
      result = await decryptData(data)
      
      // Log decryption activity for audit
      if (creditApplicationId) {
        await supabase.rpc('log_credit_application_audit', {
          p_credit_application_id: creditApplicationId,
          p_action_type: 'data_accessed',
          p_additional_context: {
            field_type: 'sensitive_data',
            access_timestamp: new Date().toISOString()
          }
        })
      }
    } else {
      throw new Error('Invalid action. Must be "encrypt" or "decrypt"')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        result,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Credit encryption error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})