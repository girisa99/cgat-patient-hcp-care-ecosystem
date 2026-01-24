# Supabase Realtime WebSocket Subscriptions Guide

## Overview

This document outlines the Supabase Realtime architecture used for WebSocket-based real-time updates, collaborative editing, and live data synchronization across the Genie AI ecosystem.

---

## Architecture Components

### 1. Core Files

| File | Purpose |
|------|---------|
| `src/utils/realtime/RealtimeManager.ts` | Main orchestrator for all realtime connections |
| `src/utils/realtime/RealtimeChannelManager.ts` | Manages individual Postgres subscriptions |
| `src/utils/realtime/RealtimeTypes.ts` | TypeScript types for config and events |

### 2. Subscription Types

```typescript
// Available subscription types
type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface RealtimeSubscription {
  table: string;
  schema?: string;        // defaults to 'public'
  event?: RealtimeEvent;  // defaults to '*'
  filter?: string;        // e.g., 'user_id=eq.123'
}
```

---

## Implementation Patterns

### Basic Table Subscription

```typescript
import { supabase } from '@/integrations/supabase/client';

// Subscribe to all changes on a table
const channel = supabase
  .channel('table-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'agent_conversations'
    },
    (payload) => {
      console.log('Change received:', payload);
      // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      // payload.new: new row data
      // payload.old: old row data (for UPDATE/DELETE)
    }
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

### Filtered Subscription (User-Scoped)

```typescript
// Subscribe only to current user's data
const channel = supabase
  .channel('user-conversations')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'agent_conversations',
      filter: `user_id=eq.${userId}`
    },
    handleChange
  )
  .subscribe();
```

### Multi-Table Subscription

```typescript
// Subscribe to multiple tables on same channel
const channel = supabase
  .channel('dashboard-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'agents'
  }, handleAgentChange)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'agent_conversations'
  }, handleConversationChange)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications'
  }, handleNewNotification)
  .subscribe();
```

---

## React Hook Pattern

### useRealtimeSubscription Hook

```typescript
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptions {
  table: string;
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onChange?: (payload: any) => void;
}

export function useRealtimeSubscription({
  table,
  schema = 'public',
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channelName = `realtime-${table}-${Date.now()}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event, schema, table, filter },
        (payload) => {
          onChange?.(payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload);
              break;
            case 'UPDATE':
              onUpdate?.(payload);
              break;
            case 'DELETE':
              onDelete?.(payload);
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime ${table} subscription:`, status);
      });

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [table, schema, event, filter]);

  return channelRef.current;
}
```

### Usage in Components

```tsx
function ConversationList({ agentId }: { agentId: string }) {
  const [conversations, setConversations] = useState([]);
  
  // Subscribe to realtime updates
  useRealtimeSubscription({
    table: 'agent_conversations',
    filter: `agent_id=eq.${agentId}`,
    onInsert: (payload) => {
      setConversations(prev => [payload.new, ...prev]);
    },
    onUpdate: (payload) => {
      setConversations(prev => 
        prev.map(c => c.id === payload.new.id ? payload.new : c)
      );
    },
    onDelete: (payload) => {
      setConversations(prev => 
        prev.filter(c => c.id !== payload.old.id)
      );
    }
  });

  return <div>{/* render conversations */}</div>;
}
```

---

## Voice/VAD Integration

### Supported VAD Providers (No Deepgram Required)

| Provider | VAD Confidence | TTS | STT | Notes |
|----------|---------------|-----|-----|-------|
| **OpenAI Realtime** | 99% | ✅ | ✅ | `server_vad` mode, primary for live voice |
| **ElevenLabs Scribe** | 98% | ✅ | ✅ | Real-time transcription with VAD |
| **Azure Speech** | 97% | ✅ | ✅ | Built-in silence detection, Neural TTS |
| **Google Speech** | 96% | ✅ | ✅ | Streaming VAD, 120+ languages |

### VAD Configuration Example

```typescript
// OpenAI Realtime VAD (Primary)
const openaiRealtimeConfig = {
  model: 'gpt-4o-realtime-preview',
  turn_detection: {
    type: 'server_vad',
    threshold: 0.5,
    prefix_padding_ms: 300,
    silence_duration_ms: 500
  }
};

// Azure Speech VAD (Fallback)
const azureSpeechConfig = {
  speechRecognitionLanguage: 'en-US',
  enableDictation: true,
  silenceTimeoutMs: 2000,
  initialSilenceTimeoutMs: 5000
};

// ElevenLabs Scribe VAD
const elevenLabsConfig = {
  model_id: 'scribe_v1',
  language_code: 'en',
  diarize: true,
  tag_audio_events: true
};
```

---

## Broadcast Channels (Non-Database)

For ephemeral data not stored in database:

```typescript
// Typing indicators, cursor positions, etc.
const presenceChannel = supabase.channel('room-presence');

// Broadcast to all subscribers
presenceChannel.send({
  type: 'broadcast',
  event: 'cursor-move',
  payload: { x: 100, y: 200, userId: 'user-123' }
});

// Listen for broadcasts
presenceChannel.on('broadcast', { event: 'cursor-move' }, (payload) => {
  updateCursorPosition(payload.payload);
});
```

---

## Presence Tracking

Track online users in real-time:

```typescript
const presenceChannel = supabase.channel('online-users');

// Track current user
presenceChannel.on('presence', { event: 'sync' }, () => {
  const state = presenceChannel.presenceState();
  console.log('Online users:', Object.keys(state).length);
});

presenceChannel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
  console.log('User joined:', newPresences);
});

presenceChannel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
  console.log('User left:', leftPresences);
});

// Subscribe and track
presenceChannel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await presenceChannel.track({
      user_id: currentUser.id,
      online_at: new Date().toISOString()
    });
  }
});
```

---

## Error Handling & Reconnection

```typescript
const channel = supabase
  .channel('resilient-channel')
  .on('postgres_changes', config, handleChange)
  .subscribe((status, err) => {
    switch (status) {
      case 'SUBSCRIBED':
        console.log('✅ Connected');
        break;
      case 'CHANNEL_ERROR':
        console.error('❌ Channel error:', err);
        // Implement retry logic
        setTimeout(() => channel.subscribe(), 5000);
        break;
      case 'TIMED_OUT':
        console.warn('⏱️ Connection timed out');
        break;
      case 'CLOSED':
        console.log('🔌 Channel closed');
        break;
    }
  });
```

---

## Best Practices

### 1. Channel Naming
```typescript
// Use descriptive, unique channel names
const channelName = `${table}-${userId}-${Date.now()}`;
```

### 2. Cleanup on Unmount
```typescript
useEffect(() => {
  const channel = supabase.channel('my-channel').subscribe();
  return () => { channel.unsubscribe(); };
}, []);
```

### 3. Debounce High-Frequency Updates
```typescript
import { debounce } from 'lodash';

const debouncedHandler = debounce((payload) => {
  // Handle update
}, 100);

channel.on('postgres_changes', config, debouncedHandler);
```

### 4. Filter at Database Level
```typescript
// ✅ Good: Filter in subscription
filter: `user_id=eq.${userId}`

// ❌ Bad: Filter in handler (wastes bandwidth)
.on('postgres_changes', { event: '*', table: 'data' }, (p) => {
  if (p.new.user_id === userId) { /* handle */ }
});
```

---

## Related Documentation

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- `docs/GENIE_UNIVERSAL_SERVICE_ARCHITECTURE.md` - Overall architecture
- `docs/Ops_Runbook_Genie.md` - Operational monitoring

---

**Last Updated:** 2025-01-24  
**Maintainer:** Genie AI Team  
**Status:** Active - Production Ready
