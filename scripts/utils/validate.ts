/**
 * Validation utilities for post import.
 * - title: trimmed, max 25 chars (truncate)
 * - description: trimmed if present
 * - image: must start with http:// or https://
 */

export interface RawPost {
  title: string;
  author: string;
  description?: string;
  image?: string;
}

export interface ValidatedPost {
  title: string;
  author_id: string;
  description: string | null;
  image_url: string | null;
}

const MAX_TITLE_LENGTH = 25;

/**
 * Validates and transforms a raw post. Returns null if invalid.
 */
export function validatePost(
  raw: RawPost,
  authorId: string | null
): ValidatedPost | null {
  if (!authorId) return null;

  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title) return null;

  const validTitle = title.length > MAX_TITLE_LENGTH
    ? title.slice(0, MAX_TITLE_LENGTH)
    : title;

  const description = raw.description != null && typeof raw.description === 'string'
    ? raw.description.trim() || null
    : null;

  let imageUrl: string | null = null;
  if (raw.image != null && typeof raw.image === 'string') {
    const url = raw.image.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      imageUrl = url;
    }
  }

  return {
    title: validTitle,
    author_id: authorId,
    description,
    image_url: imageUrl,
  };
}
