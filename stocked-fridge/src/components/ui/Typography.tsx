import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { COLORS, TYPOGRAPHY } from '@/constants/theme';

interface TypographyProps {
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
  numberOfLines?: number;
}

export function H1({ children, style, color = COLORS.text, numberOfLines }: TypographyProps) {
  return (
    <Text style={[styles.h1, { color }, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function H2({ children, style, color = COLORS.text, numberOfLines }: TypographyProps) {
  return (
    <Text style={[styles.h2, { color }, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function H3({ children, style, color = COLORS.text, numberOfLines }: TypographyProps) {
  return (
    <Text style={[styles.h3, { color }, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function Body({ children, style, color = COLORS.text, numberOfLines }: TypographyProps) {
  return (
    <Text style={[styles.body, { color }, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function BodyMuted({ children, style, numberOfLines }: TypographyProps) {
  return (
    <Text style={[styles.body, styles.muted, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function Caption({ children, style, color = COLORS.textMuted, numberOfLines }: TypographyProps) {
  return (
    <Text style={[styles.caption, { color }, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function Small({ children, style, color = COLORS.textLight, numberOfLines }: TypographyProps) {
  return (
    <Text style={[styles.small, { color }, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: TYPOGRAPHY.h1.fontSize,
    lineHeight: TYPOGRAPHY.h1.lineHeight,
    fontWeight: TYPOGRAPHY.h1.fontWeight,
    includeFontPadding: false,
  },
  h2: {
    fontSize: TYPOGRAPHY.h2.fontSize,
    lineHeight: TYPOGRAPHY.h2.lineHeight,
    fontWeight: TYPOGRAPHY.h2.fontWeight,
    includeFontPadding: false,
  },
  h3: {
    fontSize: TYPOGRAPHY.h3.fontSize,
    lineHeight: TYPOGRAPHY.h3.lineHeight,
    fontWeight: TYPOGRAPHY.h3.fontWeight,
    includeFontPadding: false,
  },
  body: {
    fontSize: TYPOGRAPHY.body.fontSize,
    lineHeight: TYPOGRAPHY.body.lineHeight,
    fontWeight: TYPOGRAPHY.body.fontWeight,
    includeFontPadding: false,
  },
  caption: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    lineHeight: TYPOGRAPHY.caption.lineHeight,
    fontWeight: TYPOGRAPHY.caption.fontWeight,
    includeFontPadding: false,
  },
  small: {
    fontSize: TYPOGRAPHY.small.fontSize,
    lineHeight: TYPOGRAPHY.small.lineHeight,
    fontWeight: TYPOGRAPHY.small.fontWeight,
    includeFontPadding: false,
  },
  muted: {
    color: COLORS.textMuted,
  },
});
