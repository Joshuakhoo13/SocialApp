import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { SafeScreenView } from '@/components/safe-screen-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createUserProfile } from '@/lib/users';
import { router } from 'expo-router';

export default function UsernameSetupScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { session } = useAuth();

  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    if (!session?.user?.id) {
      Alert.alert('Error', 'Session expired. Please sign in again.');
      return;
    }

    setIsLoading(true);
    const { error } = await createUserProfile(session.user.id, trimmed);
    setIsLoading(false);

    if (error) {
      Alert.alert(error.code === 'USERNAME_TAKEN' ? 'Username taken' : 'Error', error.message);
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <SafeScreenView style={styles.container} extraTopPadding={0}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              Choose a username
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Your username must be unique and will be visible to others.
            </ThemedText>

            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  borderColor: colorScheme === 'dark' ? '#444' : '#e0e0e0',
                },
              ]}
              placeholder="Username"
              placeholderTextColor={colors.icon}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              autoFocus
            />

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.tint },
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={colorScheme === 'dark' ? colors.background : '#fff'} />
              ) : (
                <ThemedText
                  style={[
                    styles.primaryButtonText,
                    { color: colorScheme === 'dark' ? colors.background : '#fff' },
                  ]}>
                  Continue
                </ThemedText>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreenView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingVertical: 48,
  },
  content: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  title: { marginBottom: 8 },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.8,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '600' },
  buttonPressed: { opacity: 0.8 },
  buttonDisabled: { opacity: 0.6 },
});
