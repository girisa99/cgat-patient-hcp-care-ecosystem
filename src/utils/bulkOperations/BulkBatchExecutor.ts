
/**
 * Executes bulk operations in batches
 */

import { supabase } from '@/integrations/supabase/client';

export class BulkBatchExecutor {
  /**
   * Execute batch insert
   */
  async executeBatchInsert(tableName: string, data: any[]) {
    // Use type assertion to handle dynamic table names
    return await (supabase.from as any)(tableName)
      .insert(data)
      .select();
  }

  /**
   * Execute batch update
   */
  async executeBatchUpdate(tableName: string, data: any[]) {
    // For updates, we need to update each record individually
    // This is a limitation of Supabase's bulk update capabilities
    const results = [];
    
    for (const item of data) {
      const { id, ...updateData } = item;
      const result = await (supabase.from as any)(tableName)
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (result.data) {
        results.push(...result.data);
      }
    }

    return { data: results };
  }

  /**
   * Execute batch delete
   */
  async executeBatchDelete(tableName: string, data: any[]) {
    const ids = data.map(item => item.id || item);
    
    return await (supabase.from as any)(tableName)
      .delete()
      .in('id', ids)
      .select();
  }

  /**
   * Execute batch upsert
   */
  async executeBatchUpsert(tableName: string, data: any[]) {
    return await (supabase.from as any)(tableName)
      .upsert(data)
      .select();
  }

  /**
   * Execute a single batch operation based on type
   */
  async executeBatch(operation: 'insert' | 'update' | 'delete' | 'upsert', tableName: string, batch: any[]) {
    switch (operation) {
      case 'insert':
        return await this.executeBatchInsert(tableName, batch);
      case 'update':
        return await this.executeBatchUpdate(tableName, batch);
      case 'delete':
        return await this.executeBatchDelete(tableName, batch);
      case 'upsert':
        return await this.executeBatchUpsert(tableName, batch);
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }
}
