# Genie Vibe - Cloud Storage Integration Architecture

> **Document Version**: 1.0  
> **Last Updated**: 2025-01-14  
> **Status**: Design Phase  

---

## Overview

This document defines the architecture for integrating external cloud storage providers (Google Drive, Microsoft OneDrive, Apple iCloud, AWS S3, Dropbox) with Genie Vibe Studio, enabling users to import media directly from their existing cloud storage.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER'S CLOUD STORAGE                               │
├──────────────┬──────────────┬──────────────┬──────────────┬────────────────────┤
│ Google Drive │  OneDrive    │   iCloud     │   AWS S3     │     Dropbox        │
│   (OAuth)    │  (MS Graph)  │  (CloudKit)  │   (SDK)      │     (OAuth)        │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────────┘
       │              │              │              │                │
       └──────────────┴──────────────┴──────────────┴────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND - CLOUD FILE PICKER                            │
│                     src/components/cloud/CloudFilePicker.tsx                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Provider Selector          Search                      View Toggle     │   │
│  │  [GDrive ▼] [OneDrive] [iCloud] [S3]    [🔍 Search...]  [Grid] [List]  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  📁 My Videos                                                           │   │
│  │  ├── 📹 interview_raw.mp4          1.2 GB    Jan 10, 2025   [Select]   │   │
│  │  ├── 📹 product_demo.mov           450 MB    Jan 8, 2025    [Select]   │   │
│  │  ├── 📁 B-Roll/                    12 files                 [Open]     │   │
│  │  └── 🖼️ thumbnails/                25 files                 [Open]     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Selected: 3 files (1.8 GB)         [Cancel]  [Import to Vibe Studio]  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      EDGE FUNCTION: cloud-storage-import                        │
│                  supabase/functions/cloud-storage-import/index.ts               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        PROVIDER ADAPTERS                                │   │
│  │                                                                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │   │
│  │  │ Google   │ │ OneDrive │ │ iCloud   │ │ AWS S3   │ │ Dropbox  │     │   │
│  │  │ Adapter  │ │ Adapter  │ │ Adapter  │ │ Adapter  │ │ Adapter  │     │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘     │   │
│  │       │            │            │            │            │            │   │
│  │       └────────────┴────────────┴────────────┴────────────┘            │   │
│  │                              │                                          │   │
│  │                              ▼                                          │   │
│  │                    ┌──────────────────┐                                 │   │
│  │                    │ Unified Provider │                                 │   │
│  │                    │    Interface     │                                 │   │
│  │                    └──────────────────┘                                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Features:                                                                      │
│  • OAuth token management (encrypt, refresh, store)                            │
│  • File listing with pagination                                                 │
│  • Thumbnail fetching                                                           │
│  • Download with progress (SSE streaming)                                      │
│  • Parallel downloads (up to 3 concurrent)                                     │
│  • Resume interrupted downloads                                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            SUPABASE STORAGE                                     │
│                         Bucket: vibe-cloud-imports                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Structure:                                                                     │
│  vibe-cloud-imports/                                                            │
│  └── {user_id}/                                                                 │
│      └── {import_session_id}/                                                   │
│          ├── interview_raw.mp4                                                  │
│          ├── product_demo.mov                                                   │
│          └── thumbnails/                                                        │
│              ├── interview_raw_thumb.jpg                                        │
│              └── product_demo_thumb.jpg                                         │
│                                                                                 │
│  Policies:                                                                      │
│  • 24-hour TTL (auto-cleanup via cron)                                         │
│  • RLS: user_id = auth.uid()                                                   │
│  • Max file size: 5GB per file                                                 │
│  • Max total per user: 20GB                                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         GENIE VIBE STUDIO                                       │
│                       Timeline Editor / Library                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Imported files appear in Library with:                                         │
│  • Cloud provider badge (Google, OneDrive, etc.)                               │
│  • Original filename                                                            │
│  • Duration / dimensions                                                        │
│  • Thumbnail preview                                                            │
│  • Option to "Keep in Library" (moves to permanent storage)                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Frontend: CloudFilePicker

**Location**: `src/components/cloud/CloudFilePicker.tsx`

```tsx
interface CloudFilePickerProps {
  onFilesSelected: (files: CloudFile[]) => void;
  onClose: () => void;
  allowedTypes?: ('video' | 'image' | 'audio')[];
  maxFiles?: number;
  maxTotalSize?: number; // bytes
}

interface CloudFile {
  id: string;
  provider: CloudProvider;
  name: string;
  mimeType: string;
  size: number;
  thumbnailUrl?: string;
  createdAt: string;
  path: string;
}
```

**Features**:
- Tab-based provider switching
- OAuth connect/disconnect per provider
- Folder navigation with breadcrumbs
- Multi-select with shift+click
- Search within current folder
- Grid/list view toggle
- Selection summary with total size
- Drag selection

### 2. Edge Function: cloud-storage-import

**Location**: `supabase/functions/cloud-storage-import/index.ts`

**Endpoints**:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/connect` | Initiate OAuth flow, return auth URL |
| POST | `/callback` | Handle OAuth callback, store tokens |
| GET | `/list` | List files/folders from provider |
| POST | `/import` | Download files to Supabase storage |
| GET | `/progress/:jobId` | SSE stream for download progress |
| DELETE | `/disconnect` | Revoke tokens, remove connection |

### 3. Provider Adapters

Each provider implements a common interface:

```typescript
interface CloudProviderAdapter {
  // Auth
  getAuthUrl(state: string): string;
  exchangeCodeForTokens(code: string): Promise<OAuthTokens>;
  refreshTokens(refreshToken: string): Promise<OAuthTokens>;
  
  // File operations
  listFiles(folderId?: string, pageToken?: string): Promise<FileListResponse>;
  getFile(fileId: string): Promise<FileMetadata>;
  downloadFile(fileId: string): Promise<ReadableStream>;
  getThumbnail(fileId: string): Promise<string>; // URL or base64
  
  // Search
  searchFiles(query: string): Promise<FileListResponse>;
}
```

#### Google Drive Adapter

```typescript
// OAuth Config
const GOOGLE_CONFIG = {
  clientId: Deno.env.get('GOOGLE_CLIENT_ID'),
  clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
  scopes: [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  ],
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

// List files (videos/images only)
const listFiles = async (folderId = 'root', pageToken?: string) => {
  const query = `(mimeType contains 'video/' or mimeType contains 'image/' or mimeType contains 'audio/') and '${folderId}' in parents and trashed = false`;
  
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?` +
    `q=${encodeURIComponent(query)}&` +
    `fields=nextPageToken,files(id,name,mimeType,size,thumbnailLink,createdTime,videoMediaMetadata)&` +
    `pageSize=50&` +
    `pageToken=${pageToken || ''}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  
  return response.json();
};
```

#### OneDrive Adapter

```typescript
// OAuth Config
const ONEDRIVE_CONFIG = {
  clientId: Deno.env.get('MICROSOFT_CLIENT_ID'),
  clientSecret: Deno.env.get('MICROSOFT_CLIENT_SECRET'),
  scopes: ['Files.Read', 'Files.Read.All', 'User.Read'],
  authEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
};

// List files
const listFiles = async (folderId = 'root', skipToken?: string) => {
  const endpoint = folderId === 'root' 
    ? 'https://graph.microsoft.com/v1.0/me/drive/root/children'
    : `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`;
  
  const response = await fetch(
    `${endpoint}?$filter=file ne null&$select=id,name,file,size,thumbnails,createdDateTime,video`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  
  return response.json();
};
```

---

## Database Schema

```sql
-- Cloud provider OAuth connections
CREATE TABLE cloud_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('google_drive', 'onedrive', 'icloud', 'aws_s3', 'dropbox')),
  
  -- Encrypted tokens (use pgcrypto or Vault)
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Account info for display
  account_email TEXT,
  account_name TEXT,
  account_avatar_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  error_message TEXT, -- Last error if any
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, provider)
);

-- Import jobs for tracking progress
CREATE TABLE cloud_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  connection_id UUID REFERENCES cloud_connections(id),
  
  -- Job details
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'downloading', 'processing', 'completed', 'failed', 'cancelled')),
  total_files INTEGER NOT NULL,
  completed_files INTEGER DEFAULT 0,
  total_bytes BIGINT,
  downloaded_bytes BIGINT DEFAULT 0,
  
  -- Error tracking
  failed_files JSONB DEFAULT '[]'::jsonb, -- [{fileId, error}]
  error_message TEXT,
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Individual imported files
CREATE TABLE cloud_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  job_id UUID REFERENCES cloud_import_jobs(id),
  connection_id UUID REFERENCES cloud_connections(id),
  
  -- Source info
  source_provider TEXT NOT NULL,
  source_file_id TEXT NOT NULL,
  source_file_path TEXT,
  
  -- File metadata
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('video', 'image', 'audio')),
  mime_type TEXT,
  file_size_bytes BIGINT,
  duration_seconds NUMERIC,
  width INTEGER,
  height INTEGER,
  
  -- Storage location
  storage_bucket TEXT DEFAULT 'vibe-cloud-imports',
  storage_path TEXT,
  thumbnail_path TEXT,
  
  -- Status
  import_status TEXT DEFAULT 'pending' CHECK (import_status IN ('pending', 'downloading', 'ready', 'failed', 'expired')),
  error_message TEXT,
  
  -- Lifecycle
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_cloud_connections_user ON cloud_connections(user_id);
CREATE INDEX idx_cloud_imports_user ON cloud_imports(user_id);
CREATE INDEX idx_cloud_imports_job ON cloud_imports(job_id);
CREATE INDEX idx_cloud_imports_expires ON cloud_imports(expires_at) WHERE import_status = 'ready';

-- RLS Policies
ALTER TABLE cloud_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own connections" ON cloud_connections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own import jobs" ON cloud_import_jobs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own imports" ON cloud_imports
  FOR ALL USING (auth.uid() = user_id);

-- Cleanup function (run via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_imports()
RETURNS void AS $$
BEGIN
  -- Mark expired imports
  UPDATE cloud_imports 
  SET import_status = 'expired' 
  WHERE expires_at < now() AND import_status = 'ready';
  
  -- Delete old expired records (older than 7 days)
  DELETE FROM cloud_imports 
  WHERE import_status = 'expired' AND expires_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Storage Bucket Configuration

```sql
-- Create the imports bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vibe-cloud-imports',
  'vibe-cloud-imports',
  false, -- Private bucket
  5368709120, -- 5GB max per file
  ARRAY[
    'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo',
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'
  ]
);

-- RLS policies for the bucket
CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'vibe-cloud-imports' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'vibe-cloud-imports' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'vibe-cloud-imports' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## Security Considerations

### Token Encryption

```typescript
// Use Supabase Vault for production
// Or pgcrypto for simpler setup

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = Deno.env.get('TOKEN_ENCRYPTION_KEY'); // 32 bytes

function encryptToken(token: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptToken(encrypted: string): string {
  const [ivHex, authTagHex, data] = encrypted.split(':');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(ivHex, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### Rate Limiting

```typescript
// Per-user rate limits
const RATE_LIMITS = {
  list: { requests: 60, window: 60 }, // 60 req/min
  import: { requests: 10, window: 60 }, // 10 imports/min
  download: { concurrent: 3 }, // 3 parallel downloads
};
```

---

## Error Handling

| Error | Cause | User Message | Recovery |
|-------|-------|--------------|----------|
| `TOKEN_EXPIRED` | Access token expired | "Please reconnect your {provider} account" | Trigger re-auth flow |
| `QUOTA_EXCEEDED` | Provider API quota hit | "Too many requests. Please try again in a few minutes." | Exponential backoff |
| `FILE_TOO_LARGE` | File > 5GB | "File exceeds 5GB limit. Please select smaller files." | Skip file |
| `STORAGE_FULL` | User hit 20GB limit | "Storage limit reached. Delete some imports to continue." | Show cleanup UI |
| `NETWORK_ERROR` | Download interrupted | "Download interrupted. Resuming..." | Auto-resume with range headers |

---

## Progress Streaming (SSE)

```typescript
// Server-Sent Events for real-time progress
const stream = new ReadableStream({
  start(controller) {
    const encoder = new TextEncoder();
    
    const sendProgress = (data: ImportProgress) => {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };
    
    // Progress updates
    sendProgress({ 
      type: 'progress',
      jobId: 'xxx',
      file: 'video.mp4',
      fileProgress: 45,
      overallProgress: 30,
      downloadedBytes: 150000000,
      totalBytes: 500000000,
      speed: '15 MB/s',
      eta: '00:02:30'
    });
    
    // Completion
    sendProgress({
      type: 'complete',
      jobId: 'xxx',
      files: [
        { id: 'xxx', name: 'video.mp4', url: 'https://...' }
      ]
    });
  }
});

return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  }
});
```

---

## Testing Checklist

- [ ] OAuth flow for each provider
- [ ] Token refresh before expiry
- [ ] Large file download (> 1GB)
- [ ] Parallel downloads
- [ ] Download interruption & resume
- [ ] Storage quota enforcement
- [ ] File type validation
- [ ] Thumbnail generation
- [ ] Progress SSE streaming
- [ ] Cleanup cron job
- [ ] Error recovery
- [ ] Rate limiting

---

## Future Enhancements

1. **Bi-directional Sync**: Export back to cloud storage
2. **Folder Watching**: Auto-import new files from watched folders
3. **Smart Suggestions**: AI recommends which files to import based on project
4. **Collaborative Folders**: Share cloud folders with team members

---

*Last updated: 2025-01-14*
