import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, LAYOUT } from '@/constants/theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
  backgroundColor?: string;
}

/**
 * Screen - Consistent wrapper for all screens
 * Handles safe area, background color, and default padding
 */
export function Screen({
  children,
  style,
  padding = true,
  backgroundColor = COLORS.bg,
}: ScreenProps) {
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor },
        padding && styles.padding,
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: LAYOUT.screenPadding,
  },
});
