import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';

type Props = {
  children: React.ReactNode;
};

export function AuthGate({ children }: Props) {
  const { authState } = useAuth();

  return (
    <View style={styles.container}>
      {children}
      {authState === 'loading' && (
        <ThemedView style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 9999,
  },
  loadingText: {
    opacity: 0.8,
  },
});
