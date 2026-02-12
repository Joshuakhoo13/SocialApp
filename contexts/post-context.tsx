import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import {
  fetchFirstPage,
  fetchNextPage,
  PAGE_SIZE,
  type FeedCursor,
  type FeedPostRow,
} from '@/lib/feed-pagination';
import { createPost as createPostInDb, uploadImageToStorage } from '@/lib/posts';

export type PostData = {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  created_at?: string;
  author_id?: string;
  author_username?: string | null;
};

function mapFeedRowToPostData(row: FeedPostRow): PostData {
  const { user, ...rest } = row;
  return { ...rest, author_username: user?.username ?? null };
}

type PostContextType = {
  posts: PostData[];
  userPosts: PostData[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  submitPost: (input: {
    title: string;
    description?: string;
    imageUri?: string;
  }) => Promise<{ error: Error | null }>;
  refreshPosts: () => Promise<void>;
};

const PostContext = createContext<PostContextType | null>(null);

export function PostProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [cursor, setCursor] = useState<FeedCursor | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    const { data, cursor: nextCursor, error } = await fetchFirstPage();
    if (!error) {
      setPosts(data.map(mapFeedRowToPostData));
      setCursor(nextCursor);
      setHasMore(data.length >= PAGE_SIZE);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const { data, nextCursor, error } = await fetchNextPage(cursor);
    if (!error) {
      setPosts((prev) => [...prev, ...data.map(mapFeedRowToPostData)]);
      setCursor(nextCursor);
      setHasMore(data.length >= PAGE_SIZE);
    }
    setLoadingMore(false);
  }, [cursor, loadingMore, hasMore]);

  const refreshPosts = useCallback(() => loadFirstPage(), [loadFirstPage]);

  const submitPost = useCallback(
    async (input: {
      title: string;
      description?: string;
      imageUri?: string;
    }): Promise<{ error: Error | null }> => {
      const userId = session?.user?.id;
      if (!userId) {
        return { error: new Error('You must be signed in to post') };
      }

      const trimmedTitle = input.title.trim();
      if (!trimmedTitle) {
        return { error: new Error('Please enter a title for your post.') };
      }

      let imageUrl: string | undefined;

      if (input.imageUri) {
        const { publicUrl, error: uploadError } = await uploadImageToStorage(
          input.imageUri,
          userId
        );
        if (uploadError) {
          return { error: uploadError };
        }
        imageUrl = publicUrl;
      }

      const { error } = await createPostInDb(userId, {
        title: trimmedTitle,
        description: input.description?.trim() || undefined,
        image_url: imageUrl,
      });

      if (error) {
        return { error };
      }

      await loadFirstPage();
      return { error: null };
    },
    [session?.user?.id, loadFirstPage]
  );

  const userPosts = posts.filter(
    (p) => p.author_id === session?.user?.id
  );

  return (
    <PostContext.Provider
      value={{
        posts,
        userPosts,
        loading,
        loadingMore,
        hasMore,
        loadMore,
        submitPost,
        refreshPosts,
      }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePost() {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within PostProvider');
  }
  return context;
}
