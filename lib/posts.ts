import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'post-photos';

function randomId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Uint8Array(byteNumbers).buffer;
}

/**
 * Uploads an image from a local URI to Supabase Storage and returns the public URL.
 * Uses expo-file-system for reliable file reading (fetch+blob returns empty on RN).
 */
export async function uploadImageToStorage(
  localUri: string,
  userId: string
): Promise<{ publicUrl: string; error: Error | null }> {
  try {
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: 'base64',
    });

    if (!base64) {
      return { publicUrl: '', error: new Error('Could not read image file') };
    }

    const ext = localUri.split('.').pop()?.toLowerCase() || 'jpg';
    const validExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    const mimeType = `image/${validExt === 'jpg' ? 'jpeg' : validExt}`;
    const arrayBuffer = base64ToArrayBuffer(base64);

    const filePath = `${userId}/${randomId()}.${validExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, arrayBuffer, {
        contentType: mimeType,
      });

    if (error) {
      return { publicUrl: '', error: new Error(error.message) };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return { publicUrl, error: null };
  } catch (err) {
    return {
      publicUrl: '',
      error: err instanceof Error ? err : new Error('Failed to upload image'),
    };
  }
}

export type CreatePostInput = {
  title: string;
  description?: string;
  image_url?: string;
};

/**
 * Creates a post in the database.
 */
export async function createPost(
  userId: string,
  input: CreatePostInput
): Promise<{ data: { id: string } | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('post')
    .insert({
      author_id: userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      image_url: input.image_url || null,
    })
    .select('id')
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }
  return { data: { id: data.id }, error: null };
}
