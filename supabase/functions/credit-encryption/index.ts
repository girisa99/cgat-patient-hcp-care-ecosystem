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

/**
 * Derive a stable AES-256-GCM key from a server-side secret using PBKDF2.
 *
 * IMPORTANT: Set ENCRYPTION_SECRET in Supabase Edge Function secrets.
 * The key is NEVER sent to the client or stored alongside ciphertext.
 */
async function getDerivedKey(): Promise<CryptoKey> {
  const secret = Deno.env.get('ENCRYPTION_SECRET')
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is not configured')
  }

  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  // Use a fixed salt for domain separation (not secret, just prevents rainbow tables)
  const salt = encoder.encode('genie-suite-credit-encryption-v1')

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function encryptData(data: string): Promise<string> {
  const key = await getDerivedKey()
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  )

  // Store only IV + ciphertext (key is derived from the server secret, never stored here)
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encryptedBuffer), iv.length)

  return btoa(String.fromCharCode(...combined))
}

async function decryptData(encryptedData: string): Promise<string> {
  const key = await getDerivedKey()
  const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)))

  const iv = combined.slice(0, 12)       // 12 bytes for AES-GCM
  const ciphertext = combined.slice(12)

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )

  return new TextDecoder().decode(decryptedBuffer)
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestData: EncryptionRequest = await req.json()
    const { action, data, creditApplicationId } = requestData

    if (!data || typeof data !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid data parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be "encrypt" or "decrypt"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Credit encryption error:', error instanceof Error ? error.message : String(error))

    return new Response(
      JSON.stringify({ error: 'Encryption operation failed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
