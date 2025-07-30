/**
 * Executes bulk operations in batches
 */

import { supabase } from '@/integrations/supabase/client';

export class BulkBatchExecutor {
  /**
   * Execute batch insert
   */
  async executeBatchInsert(tableName: string, data: any[]) {
    // Validate table name for security
    const validTables = ['facilities', 'modules', 'profiles', 'roles', 'user_roles'];
    if (!validTables.includes(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }
    
    // Use type assertion with validation for dynamic table access
    return await (supabase as any).from(tableName)
      .insert(data)
      .select();
  }

  /**
   * Execute batch update
   */
  async executeBatchUpdate(tableName: string, data: any[]) {
    // Validate table name for security
    const validTables = ['facilities', 'modules', 'profiles', 'roles', 'user_roles'];
    if (!validTables.includes(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }
    
    // For updates, we need to update each record individually
    // This is a limitation of Supabase's bulk update capabilities
    const results = [];
    
    for (const item of data) {
      const { id, ...updateData } = item;
      const result = await (supabase as any).from(tableName)
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
    // Validate table name for security
    const validTables = ['facilities', 'modules', 'profiles', 'roles', 'user_roles'];
    if (!validTables.includes(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }
    
    const ids = data.map(item => item.id || item);
    
    return await (supabase as any).from(tableName)
      .delete()
      .in('id', ids)
      .select();
  }

  /**
   * Execute batch upsert
   */
  async executeBatchUpsert(tableName: string, data: any[]) {
    // Validate table name for security
    const validTables = ['facilities', 'modules', 'profiles', 'roles', 'user_roles'];
    if (!validTables.includes(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }
    
    return await (supabase as any).from(tableName)
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