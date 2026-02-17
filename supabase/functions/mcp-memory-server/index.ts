import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface McpMemoryConfig {
  storage_type: 'memory' | 'distributed'
  compression?: boolean
  encryption?: boolean
  max_memory_mb?: number
  ttl_seconds?: number
  partitions?: string[] // For different data types/modules
  replication?: {
    enabled: boolean
    replicas: number
  }
}

// In-memory storage with TTL and compression
const memoryStore = new Map<string, {
  data: any
  compressed?: boolean
  expires: number
  partition: string
  metadata?: Record<string, any>
}>()

const partitionStats = new Map<string, {
  size: number
  count: number
  last_access: number
}>()

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, config, key, data, partition, query } = await req.json()
    const memoryConfig: McpMemoryConfig = config || {
      storage_type: 'memory',
      compression: false,
      max_memory_mb: 100,
      ttl_seconds: 3600,
      partitions: ['default']
    }

    console.log(`MCP Memory Server - Action: ${action}, Partition: ${partition || 'default'}`)

    switch (action) {
      case 'store':
        const storeResult = await storeData(key, data, partition || 'default', memoryConfig)
        return new Response(JSON.stringify({ success: true, data: storeResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'retrieve':
        const retrieveResult = await retrieveData(key, partition || 'default', memoryConfig)
        return new Response(JSON.stringify({ success: true, data: retrieveResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'query':
        const queryResult = await queryData(query, partition || 'default', memoryConfig)
        return new Response(JSON.stringify({ success: true, data: queryResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'delete':
        const deleteResult = await deleteData(key, partition || 'default')
        return new Response(JSON.stringify({ success: true, data: deleteResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'clear_partition':
        const clearResult = await clearPartition(partition || 'default')
        return new Response(JSON.stringify({ success: true, data: clearResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'get_stats':
        const stats = getMemoryStats(memoryConfig)
        return new Response(JSON.stringify({ success: true, data: stats }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'compress_data':
        const compressResult = await compressPartition(partition || 'default', memoryConfig)
        return new Response(JSON.stringify({ success: true, data: compressResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'backup_partition':
        const backupResult = await backupPartition(partition || 'default')
        return new Response(JSON.stringify({ success: true, data: backupResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    console.error('MCP Memory Server Error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function storeData(key: string, data: any, partition: string, config: McpMemoryConfig) {
  // Clean expired entries first
  cleanExpiredEntries()
  
  // Check memory limits
  if (config.max_memory_mb && getMemoryUsageMB() > config.max_memory_mb) {
    await evictOldestEntries(partition, config.max_memory_mb * 0.8) // Keep 80% of limit
  }

  const fullKey = `${partition}:${key}`
  const expires = Date.now() + ((config.ttl_seconds || 3600) * 1000)
  
  let processedData = data
  let compressed = false

  // Apply compression if enabled
  if (config.compression && JSON.stringify(data).length > 1024) {
    try {
      processedData = await compressData(data)
      compressed = true
    } catch (e) {
      console.warn('Compression failed, storing uncompressed:', e)
    }
  }

  const entry = {
    data: processedData,
    compressed,
    expires,
    partition,
    metadata: {
      stored_at: new Date().toISOString(),
      size_bytes: JSON.stringify(data).length,
      access_count: 0
    }
  }

  memoryStore.set(fullKey, entry)
  updatePartitionStats(partition, JSON.stringify(data).length, 1)

  return {
    key: fullKey,
    stored: true,
    compressed,
    expires: new Date(expires).toISOString(),
    size_bytes: entry.metadata.size_bytes
  }
}

async function retrieveData(key: string, partition: string, config: McpMemoryConfig) {
  const fullKey = `${partition}:${key}`
  const entry = memoryStore.get(fullKey)

  if (!entry) {
    return null
  }

  if (entry.expires < Date.now()) {
    memoryStore.delete(fullKey)
    return null
  }

  // Update access statistics
  if (entry.metadata) {
    entry.metadata.access_count = (entry.metadata.access_count || 0) + 1
    entry.metadata.last_accessed = new Date().toISOString()
  }
  
  updatePartitionStats(partition, 0, 0, Date.now())

  let data = entry.data
  if (entry.compressed) {
    try {
      data = await decompressData(entry.data)
    } catch (e) {
      console.error('Decompression failed:', e)
      return null
    }
  }

  return {
    data,
    metadata: entry.metadata,
    partition: entry.partition
  }
}

async function queryData(query: any, partition: string, config: McpMemoryConfig) {
  const results = []
  const partitionPrefix = `${partition}:`

  for (const [key, entry] of memoryStore.entries()) {
    if (!key.startsWith(partitionPrefix)) continue
    if (entry.expires < Date.now()) continue

    let data = entry.data
    if (entry.compressed) {
      try {
        data = await decompressData(entry.data)
      } catch (e) {
        continue
      }
    }

    // Simple query matching (can be enhanced)
    if (matchesQuery(data, query)) {
      results.push({
        key: key.replace(partitionPrefix, ''),
        data,
        metadata: entry.metadata
      })
    }
  }

  return results
}

function matchesQuery(data: any, query: any): boolean {
  if (!query || typeof query !== 'object') return true

  for (const [field, value] of Object.entries(query)) {
    if (data[field] !== value) {
      return false
    }
  }

  return true
}

async function deleteData(key: string, partition: string) {
  const fullKey = `${partition}:${key}`
  const existed = memoryStore.has(fullKey)
  
  if (existed) {
    const entry = memoryStore.get(fullKey)
    memoryStore.delete(fullKey)
    updatePartitionStats(partition, -(entry?.metadata?.size_bytes || 0), -1)
  }

  return { deleted: existed, key: fullKey }
}

async function clearPartition(partition: string) {
  let deleted = 0
  const partitionPrefix = `${partition}:`

  for (const key of memoryStore.keys()) {
    if (key.startsWith(partitionPrefix)) {
      memoryStore.delete(key)
      deleted++
    }
  }

  partitionStats.delete(partition)
  return { partition, deleted_count: deleted }
}

function getMemoryStats(config: McpMemoryConfig) {
  cleanExpiredEntries()

  const totalEntries = memoryStore.size
  const memoryUsageMB = getMemoryUsageMB()
  const partitionStatsData = Object.fromEntries(partitionStats.entries())

  return {
    total_entries: totalEntries,
    memory_usage_mb: memoryUsageMB,
    max_memory_mb: config.max_memory_mb || 100,
    partitions: partitionStatsData,
    config: config
  }
}

function getMemoryUsageMB(): number {
  let totalSize = 0
  for (const entry of memoryStore.values()) {
    totalSize += JSON.stringify(entry).length
  }
  return totalSize / (1024 * 1024)
}

function cleanExpiredEntries() {
  const now = Date.now()
  const expiredKeys = []

  for (const [key, entry] of memoryStore.entries()) {
    if (entry.expires < now) {
      expiredKeys.push(key)
    }
  }

  for (const key of expiredKeys) {
    memoryStore.delete(key)
  }
}

async function evictOldestEntries(partition: string, targetSizeMB: number) {
  const partitionPrefix = `${partition}:`
  const entries: Array<[string, { data: any; compressed?: boolean; expires: number; partition: string; metadata?: Record<string, any> }]> = []

  for (const [key, entry] of memoryStore.entries()) {
    if (key.startsWith(partitionPrefix)) {
      entries.push([key, entry])
    }
  }

  // Sort by last access time (oldest first)
  entries.sort((a, b) => {
    const aTime = a[1].metadata?.last_accessed || a[1].metadata?.stored_at || 0
    const bTime = b[1].metadata?.last_accessed || b[1].metadata?.stored_at || 0
    return new Date(aTime as string).getTime() - new Date(bTime as string).getTime()
  })

  // Remove oldest entries until under target size
  let currentSize = getMemoryUsageMB()
  for (const [key] of entries) {
    if (currentSize <= targetSizeMB) break
    memoryStore.delete(key as string)
    currentSize = getMemoryUsageMB()
  }
}

async function compressData(data: any): Promise<string> {
  // Simple compression using gzip (in real implementation, use proper compression)
  const jsonString = JSON.stringify(data)
  return btoa(jsonString) // Basic encoding as placeholder
}

async function decompressData(compressedData: string): Promise<any> {
  // Decompress data
  const jsonString = atob(compressedData)
  return JSON.parse(jsonString)
}

async function compressPartition(partition: string, config: McpMemoryConfig) {
  if (!config.compression) {
    return { message: 'Compression not enabled' }
  }

  let compressed = 0
  const partitionPrefix = `${partition}:`

  for (const [key, entry] of memoryStore.entries()) {
    if (key.startsWith(partitionPrefix) && !entry.compressed) {
      try {
        const compressedData = await compressData(entry.data)
        entry.data = compressedData
        entry.compressed = true
        compressed++
      } catch (e) {
        console.warn(`Failed to compress ${key}:`, e)
      }
    }
  }

  return { partition, compressed_entries: compressed }
}

async function backupPartition(partition: string) {
  const backup: Record<string, any> = {}
  const partitionPrefix = `${partition}:`

  for (const [key, entry] of memoryStore.entries()) {
    if (key.startsWith(partitionPrefix)) {
      backup[key] = {
        ...entry,
        data: entry.compressed ? entry.data : await compressData(entry.data)
      }
    }
  }

  return {
    partition,
    backup_size: Object.keys(backup).length,
    backup_data: backup,
    created_at: new Date().toISOString()
  }
}

function updatePartitionStats(partition: string, sizeDelta: number, countDelta: number, accessTime?: number) {
  let stats = partitionStats.get(partition) || { size: 0, count: 0, last_access: Date.now() }
  
  stats.size += sizeDelta
  stats.count += countDelta
  if (accessTime) stats.last_access = accessTime
  
  partitionStats.set(partition, stats)
}