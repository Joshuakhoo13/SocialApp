import { memo } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { PostData } from '@/contexts/post-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

type FeedPostCardProps = {
  post: PostData;
  imageWidth?: number;
};

export const FeedPostCard = memo(function FeedPostCard({
  post,
  imageWidth,
}: FeedPostCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const isDark = colorScheme === 'dark';

  const surfaceColor = isDark ? colors.surfaceElevated : colors.surface ?? '#f8f9fa';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: surfaceColor,
          borderColor,
        },
      ]}>
      <ThemedText type="caption" style={[styles.username, { color: colors.textSecondary }]}>
        @{post.author_username ?? 'anonymous'}
      </ThemedText>
      <ThemedText type="subheader" style={styles.title}>
        {post.title}
      </ThemedText>
      {post.description ? (
        <ThemedText type="body" style={[styles.description, { color: colors.textSecondary }]}>
          {post.description}
        </ThemedText>
      ) : null}
      {post.image_url ? (
        <Image
          source={{ uri: post.image_url }}
          style={[
            styles.image,
            imageWidth ? { width: imageWidth, height: imageWidth } : undefined,
          ]}
          contentFit="cover"
          transition={0}
          cachePolicy="disk"
          onError={() => {}}
        />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  username: {
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  title: {
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  image: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
});
