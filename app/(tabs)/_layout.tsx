import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function TabIcon({
  name,
  focused,
  color,
  inactiveColor,
}: {
  name: 'house.fill' | 'square.and.pencil' | 'person.fill';
  focused: boolean;
  color: string;
  inactiveColor: string;
}) {
  return (
    <IconSymbol
      size={focused ? 26 : 24}
      name={name}
      color={focused ? color : inactiveColor}
    />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'dark'];
  const isDark = colorScheme === 'dark';

  const tabBarBg = isDark ? colors.surfaceElevated : colors.surface ?? '#fff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopWidth: 1,
          borderTopColor: borderColor,
          ...Shadows.sm,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="house.fill"
              focused={focused}
              color={color}
              inactiveColor={colors.tabIconDefault}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="square.and.pencil"
              focused={focused}
              color={color}
              inactiveColor={colors.tabIconDefault}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="person.fill"
              focused={focused}
              color={color}
              inactiveColor={colors.tabIconDefault}
            />
          ),
        }}
      />
    </Tabs>
  );
}
