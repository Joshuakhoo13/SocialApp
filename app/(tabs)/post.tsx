import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
} from 'react-native';

import { SafeScreenView } from '@/components/safe-screen-view';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { usePost } from '@/contexts/post-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PostScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { submitPost } = usePost();
  const router = useRouter();
  const isDark = colorScheme === 'dark';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow access to your photo library to select images for posting.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Missing title', 'Please enter a title for your post.');
      return;
    }

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsSubmitting(true);
    const { error } = await submitPost({
      title: trimmedTitle,
      description: description.trim() || undefined,
      imageUri: imageUri || undefined,
    });
    setIsSubmitting(false);

    if (error) {
      Alert.alert('Failed to post', error.message);
      return;
    }

    setTitle('');
    setDescription('');
    setImageUri(null);

    router.navigate('/(tabs)');
  };

  const inputBg = isDark ? colors.surfaceElevated : colors.surface ?? '#f5f5f5';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <SafeScreenView style={styles.container} extraTopPadding={0}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <ThemedText type="header">Create Post</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Share something with your feed
          </ThemedText>

          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: inputBg,
                borderColor,
              },
            ]}
            placeholder="Title"
            placeholderTextColor={colors.icon}
            value={title}
            onChangeText={setTitle}
            editable={true}
          />

          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
              {
                color: colors.text,
                backgroundColor: inputBg,
                borderColor,
              },
            ]}
            placeholder="Description (optional)"
            placeholderTextColor={colors.icon}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={true}
          />

          <Pressable
            style={({ pressed }) => [
              styles.pickButton,
              { borderColor: colors.tint },
              pressed && styles.buttonPressed,
            ]}
            onPress={pickImage}>
            <ThemedText style={[styles.pickButtonText, { color: colors.tint }]}>
              {imageUri ? 'Image selected ✓' : 'Choose from Gallery (optional)'}
            </ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.postButton,
              { backgroundColor: colors.tint },
              pressed && styles.buttonPressed,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handlePost}
            disabled={isSubmitting}>
            <ThemedText
              style={[
                styles.postButtonText,
                { color: isDark ? colors.background : '#fff' },
              ]}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreenView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  subtitle: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    fontSize: 15,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  descriptionInput: {
    height: 120,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  pickButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 2,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
  },
  pickButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  postButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
