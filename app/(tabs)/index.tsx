import { useIsFocused, useNavigation } from '@react-navigation/native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { FeedPostCard } from '@/components/feed-post-card';
import { HomeHeader } from '@/components/home-header';
import { PostCardSkeleton } from '@/components/post-card-skeleton';
import { SafeScreenView } from '@/components/safe-screen-view';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import type { PostData } from '@/contexts/post-context';
import { usePost } from '@/contexts/post-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const { posts, loading, loadingMore, hasMore, loadMore, refreshPosts } = usePost();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlashListRef<PostData>>(null);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const colorScheme = useColorScheme();

  useEffect(() => {
    const unsubscribe = (navigation as { addListener: (e: string, cb: () => void) => () => void })
      .addListener('tabPress', () => {
        if (isFocused) {
          listRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
      });
    return unsubscribe;
  }, [navigation, isFocused]);
  const colors = Colors[colorScheme ?? 'dark'];

  const imageWidth = width - 24 * 2 - 24 * 2;

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshPosts();
    setRefreshing(false);
  }, [refreshPosts]);

  const renderItem = useCallback(
    ({ item: post }: { item: PostData }) => (
      <FeedPostCard post={post} imageWidth={imageWidth} />
    ),
    [imageWidth]
  );

  const handleEndReached = useCallback(() => {
    if (hasMore && !loadingMore) loadMore();
  }, [hasMore, loadingMore, loadMore]);

  const ListHeaderComponent = useCallback(
    () => (
      <View style={styles.headerWrap}>
        <HomeHeader />
      </View>
    ),
    []
  );

  const ListFooterComponent = useCallback(
    () =>
      loadingMore ? (
        <ActivityIndicator size="small" color={colors.tint} style={styles.footerLoader} />
      ) : null,
    [loadingMore, colors.tint]
  );

  const ListEmptyComponent = useCallback(
    () =>
      loading ? (
        <View style={styles.skeletonWrap}>
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </View>
      ) : (
        <ThemedText style={[styles.emptyState, { color: colors.textSecondary }]}>
          No posts yet. Go to the Post tab to create one!
        </ThemedText>
      ),
    [loading, colors.textSecondary]
  );

  return (
    <SafeScreenView style={styles.container}>
      <FlashList
        ref={listRef}
        data={posts}
        renderItem={renderItem}
        drawDistance={400}
        keyExtractor={(item) => item.id}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeScreenView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  headerWrap: {
    paddingBottom: Spacing.md,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.lg,
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
  },
  skeletonWrap: {
    paddingTop: Spacing.sm,
  },
  emptyState: {
    marginTop: Spacing.xl,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
});
