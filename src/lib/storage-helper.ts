import { supabase } from '@/integrations/supabase/client';
import { logger } from "@/lib/logger";

export type StorageBucket = 'product-images' | 'student-listings' | 'avatars' | 'supplier-logos';

interface UploadOptions {
  bucket: StorageBucket;
  file: File;
  path?: string;
  userId?: string;
}

interface UploadResult {
  url: string | null;
  path: string | null;
  error: Error | null;
}

/**
 * Upload a file to Supabase Storage
 * @param options Upload configuration
 * @returns Object containing the public URL, file path, and any error
 */
export async function uploadFile({
  bucket,
  file,
  path,
  userId,
}: UploadOptions): Promise<UploadResult> {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);

    // Create the file path
    let filePath: string;
    if (path) {
      filePath = path;
    } else if (userId) {
      filePath = `${userId}/${timestamp}-${randomString}.${fileExt}`;
    } else {
      filePath = `${timestamp}-${randomString}.${fileExt}`;
    }

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      logger.error('Upload error:', error);
      return { url: null, path: null, error };
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrl, path: data.path, error: null };
  } catch (error) {
    logger.error('Upload exception:', error);
    return {
      url: null,
      path: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Upload multiple files to Supabase Storage
 * @param options Upload configuration for multiple files
 * @returns Array of upload results
 */
export async function uploadMultipleFiles({
  bucket,
  files,
  userId,
}: {
  bucket: StorageBucket;
  files: File[];
  userId?: string;
}): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) =>
    uploadFile({ bucket, file, userId })
  );
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from Supabase Storage
 * @param bucket Storage bucket name
 * @param path File path to delete
 * @returns Error if deletion failed, null otherwise
 */
export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<Error | null> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      logger.error('Delete error:', error);
      return error;
    }

    return null;
  } catch (error) {
    logger.error('Delete exception:', error);
    return error instanceof Error ? error : new Error('Unknown error');
  }
}

/**
 * Delete multiple files from Supabase Storage
 * @param bucket Storage bucket name
 * @param paths Array of file paths to delete
 * @returns Error if deletion failed, null otherwise
 */
export async function deleteMultipleFiles(
  bucket: StorageBucket,
  paths: string[]
): Promise<Error | null> {
  try {
    const { error } = await supabase.storage.from(bucket).remove(paths);

    if (error) {
      logger.error('Delete error:', error);
      return error;
    }

    return null;
  } catch (error) {
    logger.error('Delete exception:', error);
    return error instanceof Error ? error : new Error('Unknown error');
  }
}

/**
 * Get the public URL for a file
 * @param bucket Storage bucket name
 * @param path File path
 * @returns Public URL
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Update a file (delete old one and upload new one)
 * @param options Upload configuration with old file path
 * @returns Upload result
 */
export async function updateFile({
  bucket,
  file,
  oldPath,
  userId,
}: UploadOptions & { oldPath: string }): Promise<UploadResult> {
  // Delete the old file if it exists
  if (oldPath) {
    await deleteFile(bucket, oldPath);
  }

  // Upload the new file
  return uploadFile({ bucket, file, userId });
}

/**
 * Validate file size and type
 * @param file File to validate
 * @param maxSizeMB Maximum file size in MB
 * @param allowedTypes Allowed MIME types
 * @returns Error message if invalid, null if valid
 */
export function validateFile(
  file: File,
  maxSizeMB: number = 5,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
): string | null {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`;
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`;
  }

  return null;
}

/**
 * Extract file path from a Supabase public URL
 * @param url Public URL
 * @param bucket Bucket name
 * @returns File path
 */
export function extractPathFromUrl(url: string, bucket: StorageBucket): string | null {
  try {
    const regex = new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`);
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
