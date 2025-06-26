
/**
 * Manages Supabase real-time channels
 */

import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { RealtimeConfig } from './RealtimeTypes';

export class RealtimeChannelManager {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Creates and registers a new real-time channel
   */
  createChannel(config: RealtimeConfig, eventHandler: (config: RealtimeConfig, payload: any) => void): RealtimeChannel {
    const channelName = `realtime_${config.tableName}`;
    
    if (this.channels.has(channelName)) {
      console.log(`⚠️ Channel already exists for ${config.tableName}`);
      return this.channels.get(channelName)!;
    }

    console.log(`🔗 Creating real-time channel for ${config.moduleName} (${config.tableName})`);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: config.tableName
        },
        (payload) => eventHandler(config, payload)
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Get a channel by table name
   */
  getChannel(tableName: string): RealtimeChannel | undefined {
    const channelName = `realtime_${tableName}`;
    return this.channels.get(channelName);
  }

  /**
   * Remove a channel
   */
  removeChannel(tableName: string): boolean {
    const channelName = `realtime_${tableName}`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      return true;
    }
    
    return false;
  }

  /**
   * Get all active channels
   */
  getAllChannels(): RealtimeChannel[] {
    return Array.from(this.channels.values());
  }

  /**
   * Cleanup all channels
   */
  cleanup() {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  /**
   * Get channel statistics
   */
  getStats() {
    return {
      totalChannels: this.channels.size,
      channelNames: Array.from(this.channels.keys())
    };
  }
}
