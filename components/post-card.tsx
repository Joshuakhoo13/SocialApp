import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useCallback } from 'react';
import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import type { PostData } from '@/contexts/post-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PostCardProps = {
  post: PostData;
  imageWidth?: number;
  index?: number;
  onPress?: () => void;
  disableEnteringAnimation?: boolean;
};

export function PostCard({
  post,
  imageWidth,
  index = 0,
  onPress,
  disableEnteringAnimation = false,
}: PostCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const isDark = colorScheme === 'dark';

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  const surfaceColor = isDark ? colors.surfaceElevated : colors.surface ?? '#f8f9fa';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  const content = (
    <>
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
          transition={200}
          onError={() => console.warn('Image failed to load:', post.image_url)}
        />
      ) : null}
    </>
  );

  const baseCardStyle = [
    styles.card,
    {
      backgroundColor: surfaceColor,
      borderColor,
    },
  ];

  const entering = disableEnteringAnimation ? undefined : FadeInDown.delay(index * 50).springify().damping(15);

  if (onPress) {
    return (
      <AnimatedPressable
        entering={entering}
        style={({ pressed }) => [baseCardStyle, animatedStyle, pressed && Shadows.sm]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        {content}
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View entering={entering} style={baseCardStyle}>
      {content}
    </Animated.View>
  );
}

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
