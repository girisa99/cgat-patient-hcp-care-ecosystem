/**
 * Storage Helper Utilities
 * Upload images to Supabase storage and get public URLs
 */

import { supabase } from '@/integrations/supabase/client';

const BUCKET_NAME = 'document-processing';

/**
 * Upload a base64 image to Supabase storage and return the public URL
 * @param base64Data - The base64 encoded image data (with or without data URI prefix)
 * @param userId - The user's ID for path organization
 * @param documentId - The document ID for path organization
 * @param filename - Optional filename (defaults to timestamp)
 * @returns Object with imageUrl and thumbnailUrl, or null on failure
 */
export async function uploadDocumentImage(
  base64Data: string,
  userId: string,
  documentId: string,
  filename?: string
): Promise<{ imageUrl: string; thumbnailUrl: string } | null> {
  try {
    // Extract mime type and actual base64 content
    let mimeType = 'image/png';
    let base64Content = base64Data;
    
    if (base64Data.startsWith('data:')) {
      const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Content = matches[2];
      }
    }
    
    // Convert base64 to Uint8Array
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Determine file extension
    const extension = mimeType.split('/')[1] || 'png';
    const finalFilename = filename || `document_${Date.now()}.${extension}`;
    
    // Path: {user_id}/{document_id}/{filename}
    const filePath = `${userId}/${documentId}/${finalFilename}`;
    const thumbnailPath = `${userId}/${documentId}/thumb_${finalFilename}`;
    
    // Upload main image
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, bytes, {
        contentType: mimeType,
        upsert: true
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }
    
    // For now, use the same image as thumbnail (can be enhanced with actual resizing)
    // In production, you'd generate a smaller version server-side
    const { error: thumbUploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(thumbnailPath, bytes, {
        contentType: mimeType,
        upsert: true
      });
    
    if (thumbUploadError) {
      console.warn('Thumbnail upload failed, using main image URL:', thumbUploadError);
    }
    
    // Get public URLs
    const { data: imageUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    const { data: thumbnailUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(thumbUploadError ? filePath : thumbnailPath);
    
    return {
      imageUrl: imageUrlData.publicUrl,
      thumbnailUrl: thumbnailUrlData.publicUrl
    };
  } catch (error) {
    console.error('Storage upload failed:', error);
    return null;
  }
}

/**
 * Generate a thumbnail from a base64 image by resizing it
 * Uses canvas to resize the image client-side
 * @param base64Data - The base64 encoded image data
 * @param maxSize - Maximum dimension (width or height) for the thumbnail
 * @returns Resized base64 image or null on failure
 */
export async function generateThumbnail(
  base64Data: string,
  maxSize: number = 200
): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      
      img.onerror = () => resolve(null);
      img.src = base64Data;
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      resolve(null);
    }
  });
}

/**
 * Delete a document's images from storage
 * @param userId - The user's ID
 * @param documentId - The document ID
 */
export async function deleteDocumentImages(
  userId: string,
  documentId: string
): Promise<boolean> {
  try {
    const folderPath = `${userId}/${documentId}/`;
    
    // List all files in the document folder
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`${userId}/${documentId}`);
    
    if (listError) {
      console.error('List error:', listError);
      return false;
    }
    
    if (!files || files.length === 0) {
      return true; // Nothing to delete
    }
    
    // Delete all files in the folder
    const filesToDelete = files.map(file => `${folderPath}${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filesToDelete);
    
    if (deleteError) {
      console.error('Delete error:', deleteError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Delete document images failed:', error);
    return false;
  }
}
