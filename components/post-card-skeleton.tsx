import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function PostCardSkeleton() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const skeletonColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceElevated ?? colors.surface }]}>
      <Animated.View style={[styles.line, styles.usernameLine, { backgroundColor: skeletonColor }, animatedStyle]} />
      <Animated.View style={[styles.line, styles.titleLine, { backgroundColor: skeletonColor }, animatedStyle]} />
      <Animated.View style={[styles.line, styles.descLine1, { backgroundColor: skeletonColor }, animatedStyle]} />
      <Animated.View style={[styles.line, styles.descLine2, { backgroundColor: skeletonColor }, animatedStyle]} />
      <Animated.View style={[styles.imagePlaceholder, { backgroundColor: skeletonColor }, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  line: {
    borderRadius: Radius.sm,
    height: 14,
  },
  usernameLine: {
    width: 100,
    marginBottom: Spacing.sm,
  },
  titleLine: {
    width: '75%',
    height: 18,
    marginBottom: Spacing.md,
  },
  descLine1: {
    width: '100%',
    marginBottom: Spacing.xs,
  },
  descLine2: {
    width: '60%',
    marginBottom: Spacing.lg,
  },
  imagePlaceholder: {
    height: 200,
    borderRadius: Radius.md,
  },
});
