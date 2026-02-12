import { Platform, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView, type ThemedViewProps } from '@/components/themed-view';

type SafeScreenViewProps = ThemedViewProps & {
  /** Extra padding between safe area and content. Default: 24 for screens with header. */
  extraTopPadding?: number;
  /** Apply safe area to bottom (e.g. above tab bar). Default: false */
  safeBottom?: boolean;
};

/**
 * Screen container that respects safe area insets on iOS.
 * Use as the root view for screens to push content below the status bar/notch.
 */
export function SafeScreenView({
  style,
  extraTopPadding = 24,
  safeBottom = false,
  ...props
}: SafeScreenViewProps) {
  const insets = useSafeAreaInsets();

  const effectiveTopPadding =
    Platform.OS === 'android' ? Math.min(extraTopPadding, 8) : extraTopPadding;

  const safeStyle: ViewStyle = {
    paddingTop: insets.top + effectiveTopPadding,
    ...(safeBottom && { paddingBottom: insets.bottom }),
  };

  return <ThemedView style={[style, safeStyle]} {...props} />;
}
