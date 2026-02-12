import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useEffect, useState } from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { PostCard } from '@/components/post-card';
import { PostCardSkeleton } from '@/components/post-card-skeleton';
import { SafeScreenView } from '@/components/safe-screen-view';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import { usePost } from '@/contexts/post-context';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getUserProfile } from '@/lib/users';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { session, signOut } = useAuth();
  const { userPosts, loading } = usePost();
  const colors = Colors[colorScheme ?? 'dark'];
  const isDark = colorScheme === 'dark';
  const [username, setUsername] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const imageWidth = width - Spacing.lg * 2 - Spacing.lg * 2;

  const surfaceColor = isDark ? colors.surfaceElevated : colors.surface ?? '#f8f9fa';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const accentMuted = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(10,126,164,0.12)';

  useEffect(() => {
    if (session?.user?.id) {
      getUserProfile(session.user.id).then(({ username: u }) => setUsername(u));
    }
  }, [session?.user?.id]);

  const handleSignOut = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    signOut();
  };

  return (
    <SafeScreenView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <ThemedText type="header">Profile</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your profile and settings
        </ThemedText>

        <Animated.View
          entering={FadeInDown.delay(50).springify().damping(15)}
          style={[
            styles.profileCard,
            {
              backgroundColor: surfaceColor,
              borderColor,
            },
          ]}>
          <View style={styles.profileRow}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: accentMuted }]}>
              <ThemedText type="subheader" style={{ color: colors.tint }}>
                {username ? username.charAt(0).toUpperCase() : '?'}
              </ThemedText>
            </View>
            <View style={styles.profileInfo}>
              {username ? (
                <ThemedText type="subheader" style={styles.username}>
                  @{username}
                </ThemedText>
              ) : (
                <ThemedText type="body" style={[styles.username, { color: colors.textSecondary }]}>
                  Loading...
                </ThemedText>
              )}
              {session?.user?.email && (
                <ThemedText
                  type="caption"
                  style={[styles.email, { color: colors.textSecondary }]}
                  numberOfLines={1}>
                  {session.user.email}
                </ThemedText>
              )}
            </View>
          </View>
        </Animated.View>

        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            {
              backgroundColor: surfaceColor,
              borderColor,
            },
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSignOut}>
          <ThemedText style={[styles.signOutText, { color: colors.tint }]}>
            Sign Out
          </ThemedText>
        </Pressable>

        <View style={styles.sectionHeader}>
          <ThemedText type="subheader" style={styles.sectionTitle}>
            Your Posts
          </ThemedText>
          {!loading && userPosts.length > 0 && (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={[styles.postCountBadge, { backgroundColor: accentMuted }]}>
              <ThemedText type="caption" style={{ color: colors.tint, fontWeight: '600' }}>
                {userPosts.length}
              </ThemedText>
            </Animated.View>
          )}
        </View>

        {loading ? (
          <View style={styles.skeletonWrap}>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </View>
        ) : userPosts.length === 0 ? (
          <Animated.View
            entering={FadeIn.delay(100)}
            style={[styles.emptyCard, { backgroundColor: surfaceColor, borderColor }]}>
            <IconSymbol
              name="square.and.pencil"
              size={32}
              color={colors.textMuted}
              style={styles.emptyIcon}
            />
            <ThemedText style={[styles.emptyState, { color: colors.textSecondary }]}>
              No posts yet
            </ThemedText>
            <ThemedText style={[styles.emptyHint, { color: colors.textMuted }]}>
              Go to the Post tab to create one!
            </ThemedText>
          </Animated.View>
        ) : (
          userPosts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              imageWidth={imageWidth}
              index={index}
            />
          ))
        )}
      </ScrollView>
    </SafeScreenView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    fontSize: 15,
  },
  profileCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    marginBottom: Spacing.xs,
  },
  email: {
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: 0,
  },
  postCountBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  skeletonWrap: {
    marginTop: Spacing.sm,
  },
  emptyCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: Spacing.md,
  },
  emptyState: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emptyHint: {
    fontSize: 14,
    lineHeight: 20,
  },
  signOutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
