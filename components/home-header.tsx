import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getUserProfile } from '@/lib/users';

const GREETINGS = [
  "What's new?",
  "Good to see you",
  "Hey there",
  "Welcome back",
];

function getGreeting(username: string | null): string {
  if (username) {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, @${username}`;
    if (hour < 18) return `Hey @${username}`;
    return `Good evening, @${username}`;
  }
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
}

export function HomeHeader() {
  const { session } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  useEffect(() => {
    if (session?.user?.id) {
      getUserProfile(session.user.id).then(({ username: u }) => setUsername(u));
    }
  }, [session?.user?.id]);

  const greeting = getGreeting(username);

  return (
    <View style={styles.container}>
      <Animated.Text
        entering={FadeIn.duration(400)}
        style={[styles.greeting, { color: colors.text }]}>
        {greeting}
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(100).duration(400)}
        style={[styles.subtitle, { color: colors.textSecondary }]}>
        See what's going on!
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: Spacing.xs,
    letterSpacing: 0.2,
  },
});
